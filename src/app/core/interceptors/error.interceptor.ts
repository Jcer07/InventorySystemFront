import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../../shared/components/toast/toast.service';
import { ErrorMapperService } from '../../shared/utils/error-mapper';

export interface DomainError {
  code: string;
  message: string;
}

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const toastService = inject(ToastService);
  const errorMapper = inject(ErrorMapperService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      switch (error.status) {
        case 401:
          router.navigate(['/auth/login']);
          break;
        case 403:
          toastService.error(errorMapper.map('Common.Forbidden'));
          break;
        case 400: {
          const domainError = error.error as DomainError;
          const code = domainError?.code || 'Common.UnexpectedError';
          toastService.error(errorMapper.map(code));
          break;
        }
        default:
          toastService.error(errorMapper.map('Common.UnexpectedError'));
      }

      return throwError(() => error);
    })
  );
};
