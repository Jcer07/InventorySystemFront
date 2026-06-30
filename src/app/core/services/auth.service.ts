import { Service, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError, delay } from 'rxjs';

export interface User {
  id: string;
  email: string;
  role: string;
}

@Service()
export class AuthService {
  private readonly userSignal = signal<User | null>(null);
  public readonly currentUser = this.userSignal.asReadonly();

  public get isAuthenticated(): boolean {
    return this.userSignal() !== null;
  }

  /**
   * Mock login. Accept only admin@example.com / password.
   * Emulates a delay and throws HttpErrorResponse on failure to test error interceptors.
   */
  public login(credentials: { email: string; password: string }): Observable<User> {
    if (credentials.email === 'admin@example.com' && credentials.password === 'password') {
      const mockUser: User = {
        id: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
        email: credentials.email,
        role: 'Admin',
      };

      localStorage.setItem('mock-auth-user', JSON.stringify(mockUser));
      this.userSignal.set(mockUser);

      return of(mockUser).pipe(delay(800));
    } else {
      const errorResponse = new HttpErrorResponse({
        error: {
          code: 'Auth.InvalidCredentials',
          message: 'Las credenciales son incorrectas.',
        },
        status: 400,
        statusText: 'Bad Request',
        url: '/api/auth/login',
      });
      return throwError(() => errorResponse).pipe(delay(800));
    }
  }

  /**
   * Mock logout. Clears the session state.
   */
  public logout(): Observable<void> {
    localStorage.removeItem('mock-auth-user');
    this.userSignal.set(null);
    return of(undefined).pipe(delay(500));
  }

  /**
   * Mock status check. Persists session state on refresh.
   */
  public checkStatus(): Observable<boolean> {
    const saved = localStorage.getItem('mock-auth-user');
    if (saved) {
      try {
        const user = JSON.parse(saved) as User;
        this.userSignal.set(user);
        return of(true);
      } catch {
        localStorage.removeItem('mock-auth-user');
      }
    }
    this.userSignal.set(null);
    return of(false);
  }
}
