import { Component, computed, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { I18nService } from '@core/services/i18n.service';
import { AuthService } from '@core/services/auth.service';
import { Product, ProductService } from '@features/inventory/services/product.service';
import { StockMovement, StockService } from '@features/inventory/services/stock.service';
import { DatePipe } from '@angular/common';

declare const Chart: any;

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, DatePipe],
  templateUrl: './dashboard.html',
})
export class DashboardComponent implements OnInit, OnDestroy {
  protected readonly i18nService = inject(I18nService);
  protected readonly authService = inject(AuthService);
  private readonly productService = inject(ProductService);
  private readonly stockService = inject(StockService);

  // States
  protected readonly products = signal<Product[]>([]);
  protected readonly movements = signal<StockMovement[]>([]);
  protected readonly isLoading = signal(true);

  protected readonly currentUser = this.authService.currentUser();

  // Chart instances
  private categoryChartInstance: any;
  private movementChartInstance: any;

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

  public ngOnDestroy(): void {
    if (this.categoryChartInstance) {
      this.categoryChartInstance.destroy();
    }
    if (this.movementChartInstance) {
      this.movementChartInstance.destroy();
    }
  }

  private loadStats(): void {
    this.isLoading.set(true);

    // Fetch all products (page 1, size 1000 to cover full inventory statistics)
    this.productService.getAll(1, 1000).subscribe({
      next: (pagedProds) => {
        this.products.set(pagedProds.items);

        this.stockService.getMovements().subscribe({
          next: (movs) => {
            this.movements.set(movs);
            this.isLoading.set(false);
            
            // Wait for DOM canvas rendering
            setTimeout(() => this.initCharts(), 50);
          },
          error: () => this.isLoading.set(false),
        });
      },
      error: () => this.isLoading.set(false),
    });
  }

  private initCharts(): void {
    // 1. Doughnut Chart: Group stock by category
    const categoryData: { [key: string]: number } = {};
    this.products().forEach(p => {
      const cat = p.categoryName || 'Sin Categoría';
      categoryData[cat] = (categoryData[cat] || 0) + p.stock;
    });

    const catLabels = Object.keys(categoryData);
    const catValues = Object.values(categoryData);

    const ctxCat = document.getElementById('categoryChart') as HTMLCanvasElement;
    if (ctxCat && catLabels.length > 0) {
      if (this.categoryChartInstance) {
        this.categoryChartInstance.destroy();
      }
      this.categoryChartInstance = new Chart(ctxCat, {
        type: 'doughnut',
        data: {
          labels: catLabels,
          datasets: [{
            data: catValues,
            backgroundColor: [
              '#6366f1', // indigo
              '#a855f7', // purple
              '#3b82f6', // blue
              '#10b981', // emerald
              '#f59e0b', // amber
              '#ef4444', // red
            ],
            borderColor: '#0f172a',
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                color: '#94a3b8',
                font: { size: 10, family: 'Arial' }
              }
            }
          }
        }
      });
    }

    // 2. Bar Chart: Last 10 adjustments
    const recentMovsForChart = [...this.movements()].slice(0, 10).reverse();
    const movLabels = recentMovsForChart.map(m => new Date(m.createdAt).toLocaleDateString());
    const movValues = recentMovsForChart.map(m => m.isEntry ? m.quantity : -m.quantity);
    const movBackgrounds = recentMovsForChart.map(m => m.isEntry ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)');
    const movBorders = recentMovsForChart.map(m => m.isEntry ? '#10b981' : '#ef4444');

    const ctxMov = document.getElementById('movementChart') as HTMLCanvasElement;
    if (ctxMov && recentMovsForChart.length > 0) {
      if (this.movementChartInstance) {
        this.movementChartInstance.destroy();
      }
      this.movementChartInstance = new Chart(ctxMov, {
        type: 'bar',
        data: {
          labels: movLabels,
          datasets: [{
            label: 'Ajuste',
            data: movValues,
            backgroundColor: movBackgrounds,
            borderColor: movBorders,
            borderWidth: 1.5,
            borderRadius: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              grid: { color: 'rgba(51, 65, 85, 0.1)' },
              ticks: { color: '#94a3b8' }
            },
            x: {
              grid: { display: false },
              ticks: { color: '#94a3b8', font: { size: 9 } }
            }
          },
          plugins: {
            legend: { display: false }
          }
        }
      });
    }
  }
}
