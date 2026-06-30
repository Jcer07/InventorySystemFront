import { Service, signal, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';

export interface User {
  userId: string;
  email: string;
  role: string;
}

@Service()
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly userSignal = signal<User | null>(null);
  public readonly currentUser = this.userSignal.asReadonly();

  public get isAuthenticated(): boolean {
    return this.userSignal() !== null;
  }

  /**
   * Authenticates a user with the C# backend.
   * On success, the backend sets HttpOnly cookies.
   */
  public login(credentials: { email: string; password: string }): Observable<User> {
    return this.http.post<User>('/api/auth/login', credentials).pipe(
      tap(user => this.userSignal.set(user))
    );
  }

  /**
   * Logs out the user and clears backend sessions and cookies.
   */
  public logout(): Observable<void> {
    return this.http.post<void>('/api/auth/logout', {}).pipe(
      tap(() => this.userSignal.set(null))
    );
  }

  /**
   * Verifies the user's active session.
   * If the access token is expired, attempts to silently refresh it.
   */
  public checkStatus(): Observable<boolean> {
    return this.http.get<User>('/api/auth/me').pipe(
      map(user => {
        this.userSignal.set(user);
        return true;
      }),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // Access token expired, attempt to refresh the session using the refresh token cookie
          return this.http.post<User>('/api/auth/refresh', {}).pipe(
            map(user => {
              this.userSignal.set(user);
              return true;
            }),
            catchError(() => {
              this.userSignal.set(null);
              return of(false);
            })
          );
        }

        this.userSignal.set(null);
        return of(false);
      })
    );
  }
}
