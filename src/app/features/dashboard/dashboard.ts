import { Component, inject } from '@angular/core';
import { I18nService } from '../../core/services/i18n.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../shared/components/toast/toast.service';
import { ConfirmDialogService } from '../../shared/components/confirm-dialog/confirm-dialog.service';

@Component({
  selector: 'app-dashboard',
  imports: [],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col gap-2">
        <h1
          class="text-3xl font-extrabold tracking-tight text-slate-100 bg-linear-to-r from-slate-100 to-slate-300 bg-clip-text"
        >
          {{ i18n.t('Dashboard.Title') }}
        </h1>
        <p class="text-slate-400 text-sm">
          Bienvenido de nuevo,
          <span class="text-indigo-400 font-semibold">{{ auth.currentUser()?.email }}</span
          >.
        </p>
      </div>

      <!-- Quick Metrics Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          class="bg-slate-900/40 border border-slate-800 backdrop-blur-sm p-6 rounded-2xl flex flex-col gap-2 shadow-lg"
        >
          <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">{{
            i18n.t('Dashboard.TotalProducts')
          }}</span>
          <span class="text-3xl font-extrabold text-indigo-400">0</span>
        </div>
        <div
          class="bg-slate-900/40 border border-slate-800 backdrop-blur-sm p-6 rounded-2xl flex flex-col gap-2 shadow-lg"
        >
          <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">{{
            i18n.t('Dashboard.LowStock')
          }}</span>
          <span class="text-3xl font-extrabold text-amber-500">0</span>
        </div>
        <div
          class="bg-slate-900/40 border border-slate-800 backdrop-blur-sm p-6 rounded-2xl flex flex-col gap-2 shadow-lg"
        >
          <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">{{
            i18n.t('Stock.History')
          }}</span>
          <span class="text-3xl font-extrabold text-purple-400">0</span>
        </div>
      </div>

      <div class="flex gap-4">
        <button (click)="showInfo()">show info</button>
      </div>
    </div>
  `,
})
export class DashboardComponent {
  protected readonly i18n = inject(I18nService);
  protected readonly auth = inject(AuthService);
  private readonly toastService = inject(ToastService);
  private readonly dialogService = inject(ConfirmDialogService);

  protected async showInfo() {
    const response = await this.dialogService.confirm('Información', 'Soy un dialogo de confirmación', { confirmText: 'Ok', cancelText: 'Cancelar' });

    if(response){
      this.toastService.success('Confirmado');
    } else {
      this.toastService.info('Cancelado');
    }
  }
}
