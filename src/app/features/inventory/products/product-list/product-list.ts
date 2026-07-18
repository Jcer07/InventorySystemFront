import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { ProductService, Product } from '../../services/product.service';
import { CatalogService, Category } from '../../services/catalog.service';
import { I18nService } from '../../../../core/services/i18n.service';
import { ToastService } from '../../../../shared/components/toast/toast.service';

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

  protected readonly products = signal<Product[]>([]);
  protected readonly categories = signal<Category[]>([]);
  protected readonly isLoading = signal(true);

  // Filters
  protected readonly searchQuery = signal('');
  protected readonly selectedCategoryId = signal<number | null>(null);
  protected readonly filterLowStock = signal(false);

  // Computed state
  protected readonly filteredProducts = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const catId = this.selectedCategoryId();
    const lowStock = this.filterLowStock();

    return this.products().filter((p) => {
      const matchesSearch =
        !query ||
        p.name.toLowerCase().includes(query) ||
        p.sku.toLowerCase().includes(query) ||
        (p.description && p.description.toLowerCase().includes(query));

      const matchesCategory = catId === null || p.categoryId === catId;
      const matchesLowStock = !lowStock || p.isLowStock;

      return matchesSearch && matchesCategory && matchesLowStock;
    });
  });

  public ngOnInit(): void {
    this.loadData();
  }

  protected loadData(): void {
    this.isLoading.set(true);

    // Fetch categories first
    this.catalogService.getCategories().subscribe({
      next: (cats) => this.categories.set(cats),
      error: () => this.toast.error(this.i18n.t('Common.UnexpectedError')),
    });

    // Fetch products
    this.productService.getAll().subscribe({
      next: (prods) => {
        this.products.set(prods);
        this.isLoading.set(false);
      },
      error: () => {
        this.toast.error(this.i18n.t('Common.UnexpectedError'));
        this.isLoading.set(false);
      },
    });
  }

  protected onSearchChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
  }

  protected onCategoryChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const val = select.value;
    this.selectedCategoryId.set(val ? Number(val) : null);
  }

  protected toggleLowStockFilter(): void {
    this.filterLowStock.update((val) => !val);
  }

  protected navigateToAdjustStock(productId: string): void {
    this.router.navigate(['/inventory/stock'], { queryParams: { productId } });
  }
}
