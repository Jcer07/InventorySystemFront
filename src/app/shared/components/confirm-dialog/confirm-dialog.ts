import { Component, inject } from '@angular/core';
import { ConfirmDialogService } from './confirm-dialog.service';
import { I18nService } from '../../../core/services/i18n.service';

@Component({
  selector: 'app-confirm-dialog',
  imports: [],
  template: `
    @if (dialogService.activeDialog(); as dialog) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"></div>

        <!-- Modal Card -->
        <div class="relative bg-slate-900/90 border border-slate-800 rounded-2xl max-w-md w-full shadow-2xl p-6 overflow-hidden transform scale-100 transition-all duration-300">
          <div class="flex flex-col gap-4">
            <!-- Header -->
            <div class="flex items-center gap-3 border-b border-slate-800 pb-3">
              <svg class="h-6 w-6 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 class="text-lg font-bold text-slate-100">{{ dialog.title }}</h3>
            </div>

            <!-- Message -->
            <p class="text-sm text-slate-300 leading-relaxed">{{ dialog.message }}</p>

            <!-- Actions -->
            <div class="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                class="px-4 py-2 rounded-lg border border-slate-700 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-slate-100 transition-all duration-200 pointer-events-auto"
                (click)="dialog.resolve(false)"
              >
                {{ dialog.cancelText || i18n.t('Common.Cancel') }}
              </button>
              <button
                class="px-4 py-2 rounded-lg bg-linear-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-sm font-semibold text-white shadow-lg hover:shadow-indigo-500/20 transition-all duration-200 pointer-events-auto"
                (click)="dialog.resolve(true)"
              >
                {{ dialog.confirmText || i18n.t('Common.Confirm') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    }
  `,
})
export class ConfirmDialogComponent {
  public readonly dialogService = inject(ConfirmDialogService);
  protected readonly i18n = inject(I18nService);
}
