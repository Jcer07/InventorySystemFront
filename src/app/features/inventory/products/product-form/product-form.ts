import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { form, FormField, FormRoot, min, required } from '@angular/forms/signals';
import { CreateProduct, ProductService } from '@features/inventory/services/product.service';
import { CatalogService, Category, Supplier, Unit } from '@features/inventory/services/catalog.service';
import { I18nService } from '@core/services/i18n.service';
import { ToastService } from '@shared/components/toast/toast.service';

@Component({
  selector: 'app-product-form',
  imports: [FormRoot, FormField, RouterLink],
  templateUrl: './product-form.html',
})
export class ProductFormComponent implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly catalogService = inject(CatalogService);
  protected readonly i18n = inject(I18nService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  // Catalog Signals
  protected readonly categories = signal<Category[]>([]);
  protected readonly units = signal<Unit[]>([]);
  protected readonly suppliers = signal<Supplier[]>([]);
  protected readonly isLoadingCatalogs = signal(true);

  protected readonly isSubmitting = signal(false);

  // Form Model
  protected readonly model = signal({
    name: '',
    sku: '',
    description: '',
    minStock: 0,
    categoryId: '',
    unitId: '',
    supplierId: '',
  });

  // Form validation setup
  protected readonly productForm = form(this.model, (p) => {
    required(p.name);
    required(p.sku);
    required(p.minStock);
    min(p.minStock, 0);
    required(p.categoryId);
    required(p.unitId);
  });

  public ngOnInit(): void {
    this.loadCatalogs();
  }

  protected loadCatalogs(): void {
    this.isLoadingCatalogs.set(true);

    // load categories, units and suppliers in parallel
    this.catalogService.getCategories().subscribe((cats) => this.categories.set(cats));
    this.catalogService.getUnits().subscribe((uns) => this.units.set(uns));
    this.catalogService.getSuppliers().subscribe((sups) => {
      this.suppliers.set(sups);
      this.isLoadingCatalogs.set(false);
    });
  }

  public onSubmit(event: Event): void {
    event.preventDefault();

    this.productForm().markAsTouched();

    if (this.productForm().invalid()) {
      this.toast.warning('Por favor complete todos los campos obligatorios.');
      return;
    }

    this.isSubmitting.set(true);
    const data = this.model();

    // Ensure types and empty values are mapped properly for API
    const payload: CreateProduct = {
      name: data.name,
      sku: data.sku,
      description: data.description || null,
      minStock: Number(data.minStock),
      categoryId: Number(data.categoryId),
      unitId: Number(data.unitId),
      supplierId: data.supplierId || null,
    };

    this.productService.create(payload).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.toast.success('Producto creado exitosamente.');
        void this.router.navigate(['/inventory/products']);
      },
      error: () => {
        this.isSubmitting.set(false);
      },
    });
  }
}
