import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { ProductService, Product } from '@features/inventory/services/product.service';
import { CatalogService, Category } from '@features/inventory/services/catalog.service';
import { I18nService } from '@core/services/i18n.service';
import { ToastService } from '@shared/components/toast/toast.service';
import { ConfirmDialogService } from '@shared/components/confirm-dialog/confirm-dialog.service';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-product-list',
  imports: [RouterLink],
  templateUrl: './product-list.html',
})
export class ProductListComponent implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly catalogService = inject(CatalogService);
  protected readonly i18n = inject(I18nService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly confirmService = inject(ConfirmDialogService);
  protected readonly authService = inject(AuthService);

  protected readonly products = signal<Product[]>([]);
  protected readonly categories = signal<Category[]>([]);
  protected readonly isLoading = signal(true);

  // Pagination states
  protected readonly pageNumber = signal(1);
  protected readonly pageSize = signal(10);
  protected readonly totalCount = signal(0);
  protected readonly totalPages = signal(0);
  protected readonly hasNextPage = signal(false);
  protected readonly hasPreviousPage = signal(false);

  // Filters
  protected readonly searchQuery = signal('');
  protected readonly selectedCategoryId = signal<number | null>(null);
  protected readonly filterLowStock = signal(false);

  // Check if current user is admin or manager
  protected readonly isAdminOrManager = computed(() => {
    const role = this.authService.currentUser()?.role;
    return role === 'Admin' || role === 'Manager';
  });

  public ngOnInit(): void {
    this.loadCategories();
    this.loadProducts();
  }

  private loadCategories(): void {
    // Fetch categories (cached)
    this.catalogService.getCategoriesCached(true).subscribe({
      next: (cats) => this.categories.set(cats),
      error: () => this.toast.error(this.i18n.t('Common.UnexpectedError')),
    });
  }

  protected loadProducts(): void {
    this.isLoading.set(true);

    this.productService.getAll(
      this.pageNumber(),
      this.pageSize(),
      this.searchQuery(),
      this.selectedCategoryId(),
      this.filterLowStock()
    ).subscribe({
      next: (pagedList) => {
        this.products.set(pagedList.items);
        this.totalCount.set(pagedList.totalCount);
        this.totalPages.set(pagedList.totalPages);
        this.hasNextPage.set(pagedList.hasNextPage);
        this.hasPreviousPage.set(pagedList.hasPreviousPage);
        this.isLoading.set(false);
      },
      error: () => {
        this.toast.error(this.i18n.t('Common.UnexpectedError'));
        this.isLoading.set(false);
      },
    });
  }

  private searchTimeout: any;
  protected onSearchChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const val = input.value;
    
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    
    this.searchTimeout = setTimeout(() => {
      this.searchQuery.set(val);
      this.pageNumber.set(1);
      this.loadProducts();
    }, 400);
  }

  protected onCategoryChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const val = select.value;
    this.selectedCategoryId.set(val ? Number(val) : null);
    this.pageNumber.set(1);
    this.loadProducts();
  }

  protected toggleLowStockFilter(): void {
    this.filterLowStock.update((val) => !val);
    this.pageNumber.set(1);
    this.loadProducts();
  }

  protected onPageChange(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.pageNumber.set(page);
    this.loadProducts();
  }

  protected navigateToAdjustStock(productId: string): void {
    this.router.navigate(['/inventory/stock'], { queryParams: { productId } });
  }

  protected async deleteProduct(id: string): Promise<void> {
    const confirmed = await this.confirmService.confirm(
      'Eliminar Producto',
      '¿Estás seguro de que deseas eliminar este producto? Esta acción realizará un borrado lógico del producto en el catálogo.'
    );

    if (confirmed) {
      this.productService.delete(id).subscribe({
        next: () => {
          this.toast.success('Producto eliminado con éxito.');
          this.loadProducts();
        },
        error: () => this.toast.error(this.i18n.t('Common.UnexpectedError')),
      });
    }
  }

  // Report downloads
  protected downloadTechnicalSheet(id: string): void {
    window.open(`/api/reports/products/${id}/pdf`, '_blank');
  }

  protected downloadLowStockReport(): void {
    window.open('/api/reports/low-stock/pdf', '_blank');
  }

  protected exportCsv(): void {
    window.open('/api/reports/products/csv', '_blank');
  }
}
