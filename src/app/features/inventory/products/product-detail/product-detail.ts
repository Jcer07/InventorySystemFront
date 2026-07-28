import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductService, Product } from '@features/inventory/services/product.service';
import { StockService, StockMovement } from '@features/inventory/services/stock.service';
import { I18nService } from '@core/services/i18n.service';
import { ToastService } from '@shared/components/toast/toast.service';
import { ConfirmDialogService } from '@shared/components/confirm-dialog/confirm-dialog.service';
import { AuthService } from '@core/services/auth.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-product-detail',
  imports: [RouterLink, DatePipe],
  templateUrl: './product-detail.html',
})
export class ProductDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly productService = inject(ProductService);
  private readonly stockService = inject(StockService);
  protected readonly i18n = inject(I18nService);
  private readonly toast = inject(ToastService);
  private readonly confirmService = inject(ConfirmDialogService);
  protected readonly authService = inject(AuthService);

  protected readonly product = signal<Product | null>(null);
  protected readonly movements = signal<StockMovement[]>([]);
  protected readonly isLoadingProduct = signal(true);
  protected readonly isLoadingMovements = signal(true);

  // Check role
  protected readonly isAdminOrManager = computed(() => {
    const role = this.authService.currentUser()?.role;
    return role === 'Admin' || role === 'Manager';
  });

  public ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadProduct(id);
      this.loadMovements(id);
    }
  }

  private loadProduct(id: string): void {
    this.isLoadingProduct.set(true);
    this.productService.getById(id).subscribe({
      next: (prod) => {
        this.product.set(prod);
        this.isLoadingProduct.set(false);
      },
      error: () => {
        this.toast.error(this.i18n.t('Product.NotFound'));
        this.isLoadingProduct.set(false);
      },
    });
  }

  private loadMovements(productId: string): void {
    this.isLoadingMovements.set(true);
    this.stockService.getMovements(productId).subscribe({
      next: (movs) => {
        this.movements.set(movs);
        this.isLoadingMovements.set(false);
      },
      error: () => {
        this.toast.error('Error al cargar el historial de movimientos.');
        this.isLoadingMovements.set(false);
      },
    });
  }

  protected async deleteProduct(): Promise<void> {
    const prod = this.product();
    if (!prod) return;

    const confirmed = await this.confirmService.confirm(
      'Eliminar Producto',
      '¿Estás seguro de que deseas eliminar este producto? Esta acción realizará un borrado lógico del producto en el catálogo.'
    );

    if (confirmed) {
      this.productService.delete(prod.id).subscribe({
        next: () => {
          this.toast.success('Producto eliminado con éxito.');
          void this.router.navigate(['/inventory/products']);
        },
        error: () => this.toast.error(this.i18n.t('Common.UnexpectedError')),
      });
    }
  }

  protected downloadTechnicalSheet(): void {
    const prod = this.product();
    if (prod) {
      window.open(`/api/reports/products/${prod.id}/pdf`, '_blank');
    }
  }
}
