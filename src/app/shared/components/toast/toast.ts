import { Component, inject } from '@angular/core';
import { ToastService } from './toast.service';

@Component({
  selector: 'app-toast',
  imports: [],
  template: `
    <div class="fixed top-4 right-4 z-50 flex flex-col gap-3 max-w-md w-full pointer-events-none" role="alert" aria-live="assertive">
      @for (toast of toastService.toasts(); track toast.id) {
        <div
          class="flex items-center gap-3 p-4 rounded-xl border backdrop-blur-md shadow-2xl transition-all duration-300 transform translate-y-0 opacity-100 pointer-events-auto cursor-pointer"
          [class.bg-emerald-950/80]="toast.type === 'success'"
          [class.border-emerald-800/50]="toast.type === 'success'"
          [class.text-emerald-200]="toast.type === 'success'"

          [class.bg-rose-950/80]="toast.type === 'error'"
          [class.border-rose-800/50]="toast.type === 'error'"
          [class.text-rose-200]="toast.type === 'error'"

          [class.bg-amber-950/80]="toast.type === 'warning'"
          [class.border-amber-800/50]="toast.type === 'warning'"
          [class.text-amber-200]="toast.type === 'warning'"

          [class.bg-indigo-950/80]="toast.type === 'info'"
          [class.border-indigo-800/50]="toast.type === 'info'"
          [class.text-indigo-200]="toast.type === 'info'"
          (click)="toastService.remove(toast.id)"
        >
          <!-- Icon -->
          @switch (toast.type) {
            @case ('success') {
              <svg class="h-6 w-6 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            @case ('error') {
              <svg class="h-6 w-6 text-rose-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            @case ('warning') {
              <svg class="h-6 w-6 text-amber-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            }
            @case ('info') {
              <svg class="h-6 w-6 text-indigo-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          }

          <!-- Content -->
          <div class="flex-1 text-sm font-medium">
            {{ toast.message }}
          </div>

          <!-- Close button -->
          <button class="text-current opacity-60 hover:opacity-100 transition-opacity p-0.5" aria-label="Close">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      }
    </div>
  `,
})
export class ToastComponent {
  public readonly toastService = inject(ToastService);
}
