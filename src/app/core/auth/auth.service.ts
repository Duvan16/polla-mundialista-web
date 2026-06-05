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

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly _user = signal<User | null>(this.loadFromStorage());

  readonly user = this._user.asReadonly();
  readonly isAuthenticated = computed(() => this._user() !== null);
  readonly isAdmin = computed(() => this._user()?.role === 'Admin');
  readonly token = computed(() => this._user()?.token ?? null);

  constructor(private http: HttpClient, private router: Router) {}

  login(dto: LoginDto): Observable<User> {
    return this.http.post<User>(`${environment.apiUrl}/auth/login`, dto).pipe(
      tap(user => this.setUser(user))
    );
  }

  register(dto: RegisterDto): Observable<User> {
    return this.http.post<User>(`${environment.apiUrl}/auth/register`, dto).pipe(
      tap(user => this.setUser(user))
    );
  }

  logout(): void {
    this._user.set(null);
    localStorage.removeItem(STORAGE_KEY);
    this.router.navigate(['/auth/login']);
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
