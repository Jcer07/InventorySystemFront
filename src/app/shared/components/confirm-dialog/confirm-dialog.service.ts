import { Service, signal } from '@angular/core';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  resolve: (value: boolean) => void;
}

@Service()
export class ConfirmDialogService {
  private readonly activeDialogSignal = signal<ConfirmDialogData | null>(null);
  public readonly activeDialog = this.activeDialogSignal.asReadonly();

  /**
   * Opens a confirmation dialog and returns a Promise that resolves to true (confirmed) or false (cancelled).
   */
  public confirm(
    title: string,
    message: string,
    options?: { confirmText?: string; cancelText?: string }
  ): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      this.activeDialogSignal.set({
        title,
        message,
        confirmText: options?.confirmText,
        cancelText: options?.cancelText,
        resolve: (value: boolean) => {
          this.activeDialogSignal.set(null);
          resolve(value);
        },
      });
    });
  }
}
