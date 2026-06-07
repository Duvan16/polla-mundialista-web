import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../models';

interface LoginDto {
  email: string;
  password: string;
}

interface RegisterDto {
  email: string;
  password: string;
  displayName: string;
}

const STORAGE_KEY = 'polla_user';

/**
 * Manages authentication state for the app. Persists the logged-in user (with
 * JWT tokens) to localStorage so the session survives page refreshes.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  // Seeded from localStorage on construction so auth state is available before any route guard runs.
  private readonly _user = signal<User | null>(this.loadFromStorage());

  readonly user = this._user.asReadonly();
  readonly isAuthenticated = computed(() => this._user() !== null);
  readonly isAdmin = computed(() => this._user()?.role === 'Admin');
  /** The current access token, or null when logged out. Read by the JWT interceptor. */
  readonly token = computed(() => this._user()?.accessToken ?? null);

  constructor(private http: HttpClient, private router: Router) {}

  /** Posts credentials and stores the returned User (with tokens) on success. Returns the User. */
  login(dto: LoginDto): Observable<User> {
    return this.http.post<User>(`${environment.apiUrl}/auth/login`, dto).pipe(
      tap(user => this.setUser(user))
    );
  }

  /** Registers a new account and stores the returned User (with tokens) on success. Returns the User. */
  register(dto: RegisterDto): Observable<User> {
    return this.http.post<User>(`${environment.apiUrl}/auth/register`, dto).pipe(
      tap(user => this.setUser(user))
    );
  }

  /** Exchanges a refresh token for a new access token. Called by the JWT interceptor on 401. */
  refresh(refreshToken: string): Observable<User> {
    return this.http.post<User>(`${environment.apiUrl}/auth/refresh`, { refreshToken }).pipe(
      tap(user => this.setUser(user))
    );
  }

  /** Clears local auth state, navigates to /login, and best-effort revokes the refresh token server-side. */
  logout(): void {
    const refreshToken = this._user()?.refreshToken;
    this._user.set(null);
    localStorage.removeItem(STORAGE_KEY);
    this.router.navigate(['/auth/login']);
    if (refreshToken) {
      // Fire-and-forget: server revocation failure should not block the local logout.
      this.http.post(`${environment.apiUrl}/auth/logout`, { refreshToken }).subscribe({ error: () => {} });
    }
  }

  private setUser(user: User): void {
    this._user.set(user);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  }

  private loadFromStorage(): User | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  }
}
