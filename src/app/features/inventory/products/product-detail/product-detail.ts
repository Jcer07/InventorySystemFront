import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProductService, Product } from '../../services/product.service';
import { StockService, StockMovement } from '../../services/stock.service';
import { I18nService } from '../../../../core/services/i18n.service';
import { ToastService } from '../../../../shared/components/toast/toast.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-product-detail',
  imports: [RouterLink, DatePipe],
  templateUrl: './product-detail.html',
})
export class ProductDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly productService = inject(ProductService);
  private readonly stockService = inject(StockService);
  protected readonly i18n = inject(I18nService);
  private readonly toast = inject(ToastService);

  protected readonly product = signal<Product | null>(null);
  protected readonly movements = signal<StockMovement[]>([]);
  protected readonly isLoadingProduct = signal(true);
  protected readonly isLoadingMovements = signal(true);

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
}
