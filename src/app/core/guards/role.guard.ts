import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '@core/services/auth.service';
import { ToastService } from '@shared/components/toast/toast.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const toast = inject(ToastService);

  if (authService.isAdminOrManager()) {
    return true;
  }

  toast.error('Acceso denegado. No tienes permisos para ingresar a esta sección.');
  void router.navigate(['/dashboard']);
  return false;
};
