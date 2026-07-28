import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CatalogService, Category, Unit, Supplier } from '@features/inventory/services/catalog.service';
import { I18nService } from '@core/services/i18n.service';
import { ToastService } from '@shared/components/toast/toast.service';
import { AuthService } from '@core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-settings',
  imports: [],
  templateUrl: './settings.html',
})
export class SettingsComponent implements OnInit {
  private readonly catalogService = inject(CatalogService);
  protected readonly i18n = inject(I18nService);
  private readonly toast = inject(ToastService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly activeTab = signal<'categories' | 'units' | 'suppliers'>('categories');
  protected readonly isLoading = signal(false);

  // Lists
  protected readonly categories = signal<Category[]>([]);
  protected readonly units = signal<Unit[]>([]);
  protected readonly suppliers = signal<Supplier[]>([]);

  // Authorization Check
  protected readonly isAdminOrManager = computed(() => {
    const role = this.authService.currentUser()?.role;
    return role === 'Admin' || role === 'Manager';
  });

  // Create Form models
  protected readonly newCategoryName = signal('');
  
  protected readonly newUnitName = signal('');
  protected readonly newUnitAbbrev = signal('');

  protected readonly newSupplierName = signal('');
  protected readonly newSupplierEmail = signal('');

  // Inline Edit states
  protected readonly editingCategoryId = signal<number | null>(null);
  protected readonly editingCategoryName = signal('');

  protected readonly editingUnitId = signal<number | null>(null);
  protected readonly editingUnitName = signal('');
  protected readonly editingUnitAbbrev = signal('');

  protected readonly editingSupplierId = signal<string | null>(null);
  protected readonly editingSupplierName = signal('');
  protected readonly editingSupplierEmail = signal('');

  public ngOnInit(): void {
    if (!this.authService.currentUser()) {
      void this.router.navigate(['/auth/login']);
      return;
    }
    this.loadAll();
  }

  protected loadAll(): void {
    this.isLoading.set(true);
    // Fetch all catalogs in parallel (no filter onlyActive, we want to see inactive ones too!)
    this.catalogService.getCategories(false).subscribe({
      next: (cats) => this.categories.set(cats),
    });
    this.catalogService.getUnits(false).subscribe({
      next: (uns) => this.units.set(uns),
    });
    this.catalogService.getSuppliers(false).subscribe({
      next: (sups) => {
        this.suppliers.set(sups);
        this.isLoading.set(false);
      },
      error: () => {
        this.toast.error(this.i18n.t('Common.UnexpectedError'));
        this.isLoading.set(false);
      }
    });
  }

  protected selectTab(tab: 'categories' | 'units' | 'suppliers'): void {
    this.activeTab.set(tab);
    // Cancel editing on tab change
    this.cancelEdit();
  }

  protected cancelEdit(): void {
    this.editingCategoryId.set(null);
    this.editingUnitId.set(null);
    this.editingSupplierId.set(null);
  }

  // ── Categories CRUD ──

  protected createCategory(): void {
    if (!this.isAdminOrManager()) return;
    const name = this.newCategoryName().trim();
    if (!name) {
      this.toast.warning('El nombre es obligatorio.');
      return;
    }

    this.catalogService.createCategory(name).subscribe({
      next: () => {
        this.toast.success('Categoría creada con éxito.');
        this.newCategoryName.set('');
        this.loadAll();
      },
      error: (err) => this.toast.error(err.error?.detail || 'Error al crear la categoría.')
    });
  }

  protected startEditCategory(cat: Category): void {
    if (!this.isAdminOrManager()) return;
    this.cancelEdit();
    this.editingCategoryId.set(cat.id);
    this.editingCategoryName.set(cat.name);
  }

  protected saveCategory(cat: Category): void {
    const newName = this.editingCategoryName().trim();
    if (!newName) {
      this.toast.warning('El nombre no puede estar vacío.');
      return;
    }

    this.catalogService.updateCategory(cat.id, { name: newName, isActive: cat.isActive }).subscribe({
      next: () => {
        this.toast.success('Categoría actualizada con éxito.');
        this.cancelEdit();
        this.loadAll();
      },
      error: () => this.toast.error('Error al actualizar la categoría.')
    });
  }

  protected toggleCategoryActive(cat: Category): void {
    if (!this.isAdminOrManager()) return;
    this.catalogService.updateCategory(cat.id, { name: cat.name, isActive: !cat.isActive }).subscribe({
      next: () => {
        this.toast.success(cat.isActive ? 'Categoría desactivada.' : 'Categoría activada.');
        this.loadAll();
      },
      error: () => this.toast.error('Error al cambiar el estado de la categoría.')
    });
  }

  // ── Units CRUD ──

  protected createUnit(): void {
    if (!this.isAdminOrManager()) return;
    const name = this.newUnitName().trim();
    const abbrev = this.newUnitAbbrev().trim();
    if (!name || !abbrev) {
      this.toast.warning('Todos los campos son obligatorios.');
      return;
    }

    this.catalogService.createUnit({ name, abbreviation: abbrev }).subscribe({
      next: () => {
        this.toast.success('Unidad creada con éxito.');
        this.newUnitName.set('');
        this.newUnitAbbrev.set('');
        this.loadAll();
      },
      error: (err) => this.toast.error(err.error?.detail || 'Error al crear la unidad.')
    });
  }

  protected startEditUnit(u: Unit): void {
    if (!this.isAdminOrManager()) return;
    this.cancelEdit();
    this.editingUnitId.set(u.id);
    this.editingUnitName.set(u.name);
    this.editingUnitAbbrev.set(u.abbreviation);
  }

  protected saveUnit(u: Unit): void {
    const newName = this.editingUnitName().trim();
    const newAbbrev = this.editingUnitAbbrev().trim();
    if (!newName || !newAbbrev) {
      this.toast.warning('Los campos no pueden estar vacíos.');
      return;
    }

    this.catalogService.updateUnit(u.id, { name: newName, abbreviation: newAbbrev, isActive: u.isActive }).subscribe({
      next: () => {
        this.toast.success('Unidad actualizada con éxito.');
        this.cancelEdit();
        this.loadAll();
      },
      error: () => this.toast.error('Error al actualizar la unidad de medida.')
    });
  }

  protected toggleUnitActive(u: Unit): void {
    if (!this.isAdminOrManager()) return;
    this.catalogService.updateUnit(u.id, { name: u.name, abbreviation: u.abbreviation, isActive: !u.isActive }).subscribe({
      next: () => {
        this.toast.success(u.isActive ? 'Unidad de medida desactivada.' : 'Unidad de medida activada.');
        this.loadAll();
      },
      error: () => this.toast.error('Error al cambiar el estado de la unidad.')
    });
  }

  // ── Suppliers CRUD ──

  protected createSupplier(): void {
    if (!this.isAdminOrManager()) return;
    const name = this.newSupplierName().trim();
    const email = this.newSupplierEmail().trim();
    if (!name || !email) {
      this.toast.warning('Todos los campos son obligatorios.');
      return;
    }

    this.catalogService.createSupplier({ name, contactEmail: email }).subscribe({
      next: () => {
        this.toast.success('Proveedor creado con éxito.');
        this.newSupplierName.set('');
        this.newSupplierEmail.set('');
        this.loadAll();
      },
      error: (err) => this.toast.error(err.error?.detail || 'Error al crear el proveedor.')
    });
  }

  protected startEditSupplier(s: Supplier): void {
    if (!this.isAdminOrManager()) return;
    this.cancelEdit();
    this.editingSupplierId.set(s.id);
    this.editingSupplierName.set(s.name);
    this.editingSupplierEmail.set(s.contactEmail);
  }

  protected saveSupplier(s: Supplier): void {
    const newName = this.editingSupplierName().trim();
    const newEmail = this.editingSupplierEmail().trim();
    if (!newName || !newEmail) {
      this.toast.warning('Los campos no pueden estar vacíos.');
      return;
    }

    this.catalogService.updateSupplier(s.id, { name: newName, contactEmail: newEmail, isActive: s.isActive }).subscribe({
      next: () => {
        this.toast.success('Proveedor actualizado con éxito.');
        this.cancelEdit();
        this.loadAll();
      },
      error: () => this.toast.error('Error al actualizar el proveedor.')
    });
  }

  protected toggleSupplierActive(s: Supplier): void {
    if (!this.isAdminOrManager()) return;
    this.catalogService.updateSupplier(s.id, { name: s.name, contactEmail: s.contactEmail, isActive: !s.isActive }).subscribe({
      next: () => {
        this.toast.success(s.isActive ? 'Proveedor desactivado.' : 'Proveedor activado.');
        this.loadAll();
      },
      error: () => this.toast.error('Error al cambiar el estado del proveedor.')
    });
  }
}
