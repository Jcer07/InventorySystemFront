import { Service, signal } from '@angular/core';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}

@Service()
export class ToastService {
  private readonly toastsSignal = signal<ToastMessage[]>([]);
  public readonly toasts = this.toastsSignal.asReadonly();

  public show(type: ToastMessage['type'], message: string, duration = 4000): void {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastMessage = { id, type, message, duration };

    this.toastsSignal.update(toasts => [...toasts, newToast]);

    setTimeout(() => {
      this.remove(id);
    }, duration);
  }

  public success(message: string, duration?: number): void {
    this.show('success', message, duration);
  }

  public error(message: string, duration?: number): void {
    this.show('error', message, duration);
  }

  public info(message: string, duration?: number): void {
    this.show('info', message, duration);
  }

  public warning(message: string, duration?: number): void {
    this.show('warning', message, duration);
  }

  public remove(id: string): void {
    this.toastsSignal.update(toasts => toasts.filter(t => t.id !== id));
  }
}
