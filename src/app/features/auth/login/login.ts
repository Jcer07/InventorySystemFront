import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { form, required, email, minLength, FormRoot, FormField } from '@angular/forms/signals';
import { AuthService } from '../../../core/services/auth.service';
import { I18nService } from '../../../core/services/i18n.service';
import { ToastService } from '../../../shared/components/toast/toast.service';

@Component({
  selector: 'app-login',
  imports: [FormRoot, FormField],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  protected readonly i18n = inject(I18nService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  protected readonly model = signal({
    email: '',
    password: '',
  });

  protected readonly loginForm = form(this.model, (p) => {
    required(p.email);
    email(p.email);
    required(p.password);
    minLength(p.password, 6);
  });

  protected readonly isSubmitting = signal(false);

  public onSubmit(event: Event): void {
    event.preventDefault();

    this.loginForm().markAsTouched();

    if (this.loginForm().invalid()) {
      return;
    }

    this.isSubmitting.set(true);
    const { email: emailVal, password: passwordVal } = this.model();

    this.auth.login({ email: emailVal, password: passwordVal }).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.toast.success(this.i18n.t('Auth.SigningIn'));
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.isSubmitting.set(false);
      },
    });
  }
}
