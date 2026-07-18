import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { I18nService } from '../../core/services/i18n.service';
import { AuthService } from '../../core/services/auth.service';
import { Product, ProductService } from '../inventory/services/product.service';
import { StockMovement, StockService } from '../inventory/services/stock.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, DatePipe],
  templateUrl: './dashboard.html',
})
export class DashboardComponent implements OnInit {
  protected readonly i18nService = inject(I18nService);
  protected readonly authService = inject(AuthService);
  private readonly productService = inject(ProductService);
  private readonly stockService = inject(StockService);

  // States
  protected readonly products = signal<Product[]>([]);
  protected readonly movements = signal<StockMovement[]>([]);
  protected readonly isLoading = signal(true);

  protected readonly currentUser = this.authService.currentUser();

  // Computeds
  protected readonly totalProducts = computed(() => this.products().length);
  protected readonly lowStockProducts = computed(
    () => this.products().filter((p) => p.isLowStock).length,
  );
  protected readonly totalMovements = computed(() => this.movements().length);
  protected readonly recentMovements = computed(() => this.movements().slice(0, 5));

  public ngOnInit(): void {
    this.loadStats();
  }

  private loadStats(): void {
    this.isLoading.set(true);

    this.productService.getAll().subscribe({
      next: (prods) => {
        this.products.set(prods);

        this.stockService.getMovements().subscribe({
          next: (movs) => {
            this.movements.set(movs);
            this.isLoading.set(false);
          },
          error: () => this.isLoading.set(false),
        });
      },
      error: () => this.isLoading.set(false),
    });
  }
}
