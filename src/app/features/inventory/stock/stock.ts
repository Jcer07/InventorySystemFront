import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { form, required, min, FormRoot, FormField } from '@angular/forms/signals';
import { ProductService, Product } from '@features/inventory/services/product.service';
import { StockService, StockMovement, AdjustStock } from '@features/inventory/services/stock.service';
import { AuthService } from '@core/services/auth.service';
import { I18nService } from '@core/services/i18n.service';
import { ToastService } from '@shared/components/toast/toast.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-stock',
  imports: [FormRoot, FormField, DatePipe],
  templateUrl: './stock.html',
})
export class StockComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly productService = inject(ProductService);
  private readonly stockService = inject(StockService);
  private readonly auth = inject(AuthService);
  protected readonly i18n = inject(I18nService);
  private readonly toast = inject(ToastService);

  protected readonly isAdminOrManager = computed(() => this.auth.isAdminOrManager());

  // States
  protected readonly products = signal<Product[]>([]);
  protected readonly movements = signal<StockMovement[]>([]);
  protected readonly isLoadingProducts = signal(true);
  protected readonly isLoadingMovements = signal(true);
  protected readonly isSubmitting = signal(false);

  // Search Filter for History
  protected readonly historySearchQuery = signal('');

  // Form Model
  protected readonly model = signal({
    productId: '',
    quantity: 1,
    isEntry: true,
    notes: '',
  });

  // Form Validation Setup
  protected readonly adjustForm = form(this.model, (p) => {
    required(p.productId);
    required(p.quantity);
    min(p.quantity, 1);
  });

  // Computed properties
  protected readonly filteredMovements = computed(() => {
    const query = this.historySearchQuery().toLowerCase().trim();
    const list = this.movements();

    if (!query) {
      return list;
    }

    return list.filter((m) =>
      m.productName.toLowerCase().includes(query) ||
      m.sku.toLowerCase().includes(query) ||
      (m.notes && m.notes.toLowerCase().includes(query))
    );
  });

  public ngOnInit(): void {
    this.loadProducts();
    this.loadMovements();

    // Pre-select product if provided in query params
    this.route.queryParams.subscribe((params) => {
      const pId = params['productId'];
      if (pId) {
        this.model.update((m) => ({ ...m, productId: pId }));
      }
    });
  }

  protected loadProducts(): void {
    this.isLoadingProducts.set(true);
    this.productService.getAll(1, 1000).subscribe({
      next: (prods) => {
        this.products.set(prods.items);
        this.isLoadingProducts.set(false);
      },
      error: () => {
        this.toast.error('Error al cargar la lista de productos.');
        this.isLoadingProducts.set(false);
      },
    });
  }

  protected loadMovements(): void {
    this.isLoadingMovements.set(true);
    this.stockService.getMovements().subscribe({
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

  protected onSearchChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.historySearchQuery.set(input.value);
  }

  protected selectMovementType(isEntry: boolean): void {
    this.model.update((m) => ({ ...m, isEntry }));
  }

  public onSubmit(event: Event): void {
    event.preventDefault();

    this.adjustForm().markAsTouched();

    if (this.adjustForm().invalid()) {
      this.toast.warning('Por favor complete todos los campos obligatorios con valores válidos.');
      return;
    }

    const currentUser = this.auth.currentUser();
    if (!currentUser) {
      this.toast.error('Sesión no válida. Inicie sesión de nuevo.');
      return;
    }

    if (!this.auth.isAdminOrManager()) {
      this.toast.error('No tienes permisos de escritura para registrar movimientos de stock.');
      return;
    }

    this.isSubmitting.set(true);
    const data = this.model();

    const payload: AdjustStock = {
      productId: data.productId,
      quantity: data.quantity,
      movementTypeId: data.isEntry ? 1 : 2, // 1 = Entrada, 2 = Salida
      notes: data.notes || null,
      userId: currentUser.userId,
    };

    this.stockService.adjustStock(payload).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.toast.success('Movimiento de stock registrado exitosamente.');

        // Reset form model (keep isEntry preference)
        this.model.set({
          productId: '',
          quantity: 1,
          isEntry: data.isEntry,
          notes: '',
        });

        // Refresh data
        this.loadProducts();
        this.loadMovements();
      },
      error: () => {
        this.isSubmitting.set(false);
      },
    });
  }
}
