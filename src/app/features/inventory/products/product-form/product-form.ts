import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { form, FormField, FormRoot, min, required } from '@angular/forms/signals';
import { CreateProduct, ProductService } from '@features/inventory/services/product.service';
import { CatalogService, Category, Supplier, Unit } from '@features/inventory/services/catalog.service';
import { I18nService } from '@core/services/i18n.service';
import { ToastService } from '@shared/components/toast/toast.service';
import { AuthService } from '@core/services/auth.service';

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
  private readonly route = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);

  // Catalog Signals
  protected readonly categories = signal<Category[]>([]);
  protected readonly units = signal<Unit[]>([]);
  protected readonly suppliers = signal<Supplier[]>([]);
  protected readonly isLoadingCatalogs = signal(true);

  protected readonly isSubmitting = signal(false);
  protected readonly isEdit = signal(false);
  protected readonly productId = signal<string | null>(null);

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
    if (!this.authService.isAdminOrManager()) {
      this.toast.error('No tienes permisos de escritura para acceder a este formulario.');
      void this.router.navigate(['/inventory/products']);
      return;
    }

    this.loadCatalogs();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit.set(true);
      this.productId.set(id);
      this.loadProduct(id);
    }
  }

  protected loadCatalogs(): void {
    this.isLoadingCatalogs.set(true);

    // load only active categories, units, and suppliers
    this.catalogService.getCategoriesCached(true).subscribe((cats) => this.categories.set(cats));
    this.catalogService.getUnitsCached(true).subscribe((uns) => this.units.set(uns));
    this.catalogService.getSuppliersCached(true).subscribe((sups) => {
      this.suppliers.set(sups);
      this.isLoadingCatalogs.set(false);
    });
  }

  private loadProduct(id: string): void {
    this.productService.getById(id).subscribe({
      next: (product) => {
        this.model.set({
          name: product.name,
          sku: product.sku,
          description: product.description || '',
          minStock: product.minStock,
          categoryId: product.categoryId.toString(),
          unitId: product.unitId.toString(),
          supplierId: product.supplierId?.toString() || '',
        });
      },
      error: () => {
        this.toast.error('Error al cargar la información del producto.');
        void this.router.navigate(['/inventory/products']);
      },
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

    const id = this.productId();
    const saveObs = (this.isEdit() && id
      ? this.productService.update(id, payload)
      : this.productService.create(payload)) as any;

    saveObs.subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.toast.success(this.isEdit() ? 'Producto actualizado exitosamente.' : 'Producto creado exitosamente.');
        void this.router.navigate(['/inventory/products']);
      },
      error: () => {
        this.isSubmitting.set(false);
      },
    });
  }
}
