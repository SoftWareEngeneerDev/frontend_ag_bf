import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of, throwError, delay, tap } from 'rxjs';
import { User, LoginDto, RegisterDto, AuthResponse, OtpDto } from '../models';
import { MockDataService } from './mock-data.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _user = signal<User | null>(null);
  private _loading = signal(false);

  readonly currentUser  = this._user.asReadonly();
  readonly isLoading    = this._loading.asReadonly();
  readonly isLoggedIn   = computed(() => !!this._user());
  readonly userRole     = computed(() => this._user()?.role);
  readonly isMember     = computed(() => this._user()?.role === 'MEMBER');
  readonly isSupplier   = computed(() => this._user()?.role === 'SUPPLIER');
  readonly isAdmin      = computed(() => this._user()?.role === 'ADMIN');

  constructor(private router: Router, private mock: MockDataService) {
    this.restoreSession();
  }

  private restoreSession(): void {
    const stored = localStorage.getItem('agbf_user');
    const token  = localStorage.getItem('agbf_token');
    if (stored && token) {
      try { this._user.set(JSON.parse(stored)); }
      catch { this.clearSession(); }
    }
  }

  private saveSession(user: User, token: string): void {
    localStorage.setItem('agbf_user',  JSON.stringify(user));
    localStorage.setItem('agbf_token', token);
    this._user.set(user);
  }

  private clearSession(): void {
    localStorage.removeItem('agbf_user');
    localStorage.removeItem('agbf_token');
    this._user.set(null);
  }

  login(dto: LoginDto): Observable<AuthResponse> {
    this._loading.set(true);
    // Demo: accept any password for mock phones
    const userMap: Record<string, User> = {
      '+22676528609': this.mock.memberUser,
      '+22600000001': this.mock.adminUser,
      '+22600000002': this.mock.supplierUser,
    };
    const user = userMap[dto.phone] || this.mock.memberUser;
    const resp: AuthResponse = {
      token: 'mock-jwt-' + Date.now(),
      refreshToken: 'mock-refresh-' + Date.now(),
      user, expiresIn: 86400
    };
    return of(resp).pipe(
      delay(900),
      tap(r => {
        this.saveSession(r.user, r.token);
        this._loading.set(false);
      })
    );
  }

  register(dto: RegisterDto): Observable<{ phone: string }> {
    this._loading.set(true);
    return of({ phone: dto.phone }).pipe(
      delay(1000),
      tap(() => this._loading.set(false))
    );
  }

  verifyOtp(dto: OtpDto): Observable<AuthResponse> {
    this._loading.set(true);
    const user: User = { ...this.mock.memberUser, phone: dto.phone };
    const resp: AuthResponse = {
      token: 'mock-jwt-' + Date.now(),
      refreshToken: 'mock-refresh-' + Date.now(),
      user, expiresIn: 86400
    };
    return of(resp).pipe(
      delay(700),
      tap(r => {
        this.saveSession(r.user, r.token);
        this._loading.set(false);
      })
    );
  }

  logout(): void {
    this.clearSession();
    this.router.navigate(['/']);
  }

  getToken(): string | null { return localStorage.getItem('agbf_token'); }

  isRole(role: string): boolean { return this._user()?.role === role; }

  // Quick demo login helpers
  loginDemo(role: 'MEMBER' | 'SUPPLIER' | 'ADMIN'): void {
    const users = {
      MEMBER:   this.mock.memberUser,
      SUPPLIER: this.mock.supplierUser,
      ADMIN:    this.mock.adminUser,
    };
    const user = users[role];
    this.saveSession(user, 'mock-demo-' + Date.now());
    const routes = { MEMBER:'/member', SUPPLIER:'/supplier', ADMIN:'/admin' };
    this.router.navigate([routes[role]]);
  }
}
