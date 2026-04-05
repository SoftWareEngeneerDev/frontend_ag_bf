import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, map, throwError, catchError } from 'rxjs';
import { User, LoginDto, RegisterDto, AuthResponse, OtpDto } from '../models';
import { MockDataService } from './mock-data.service';

const API          = 'http://localhost:3000/api/v1';
const KEY_USER     = 'agbf_user';
const KEY_TOKEN    = 'agbf_token';
const KEY_REFRESH  = 'agbf_refresh';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _user    = signal<User | null>(null);
  private _loading = signal(false);

  readonly currentUser = this._user.asReadonly();
  readonly isLoading   = this._loading.asReadonly();
  readonly isLoggedIn  = computed(() => !!this._user());
  readonly userRole    = computed(() => this._user()?.role);
  readonly isMember    = computed(() => this._user()?.role === 'MEMBER');
  readonly isSupplier  = computed(() => this._user()?.role === 'SUPPLIER');
  readonly isAdmin     = computed(() => this._user()?.role === 'ADMIN');

  constructor(
    private http:   HttpClient,
    private router: Router,
    private mock:   MockDataService,
  ) {
    this.restoreSession();
  }

  // ── Session ────────────────────────────────────────────────────
  private restoreSession(): void {
    const stored = localStorage.getItem(KEY_USER);
    const token  = localStorage.getItem(KEY_TOKEN);
    if (stored && token) {
      try { this._user.set(JSON.parse(stored)); }
      catch { this.clearSession(); }
    }
  }

  private saveSession(user: User, token: string, refreshToken: string): void {
    localStorage.setItem(KEY_USER,    JSON.stringify(user));
    localStorage.setItem(KEY_TOKEN,   token);
    localStorage.setItem(KEY_REFRESH, refreshToken);
    this._user.set(user);
  }

  clearSession(): void {
    localStorage.removeItem(KEY_USER);
    localStorage.removeItem(KEY_TOKEN);
    localStorage.removeItem(KEY_REFRESH);
    this._user.set(null);
  }

  // ── Mapper backend → front ─────────────────────────────────────
  private mapBackendUser(backendUser: any): User {
    return {
      id:            backendUser.id,
      fullName:      backendUser.name,
      phone:         backendUser.phone,
      email:         backendUser.email,
      role:          backendUser.role,
      status:        backendUser.status,
      trustScore:    backendUser.trustScore ?? 100,
      city:          backendUser.city ?? 'Ouagadougou',
      referralCode:  backendUser.referralCode ?? '',
      totalSaved:    0,
      referralCount: 0,
      createdAt:     new Date(backendUser.createdAt ?? Date.now()),
      avatarUrl:     backendUser.avatarUrl,
    };
  }

  // ── Formater le téléphone ──────────────────────────────────────
  formatPhone(phone: string): string {
    const cleaned = phone.replace(/[\s\-\.]/g, '');
    if (cleaned.startsWith('+226')) return cleaned;
    if (cleaned.startsWith('226'))  return '+' + cleaned;
    if (cleaned.startsWith('0'))    return '+226' + cleaned.slice(1);
    return '+226' + cleaned;
  }

  // ══════════════════════════════════════════════════════════════
  // REGISTER — POST /auth/register
  // ══════════════════════════════════════════════════════════════
  register(dto: RegisterDto): Observable<{ phone: string }> {
    this._loading.set(true);

    const payload: any = {
      phone:    this.formatPhone(dto.phone),
      name:     dto.fullName,
      password: dto.password,
    };

    if (dto.email)        payload.email        = dto.email;
    if (dto.referralCode) payload.referralCode = dto.referralCode;
    if (dto.role)         payload.role         = dto.role;

    return this.http.post<any>(`${API}/auth/register`, payload).pipe(
      map(res => ({ phone: res.data?.phone ?? payload.phone })),
      tap(() => this._loading.set(false)),
      catchError(err => {
        this._loading.set(false);
        return throwError(() => err);
      })
    );
  }

  // ══════════════════════════════════════════════════════════════
  // VERIFY OTP — POST /auth/verify-otp
  // CORRECTION : gère le cas fournisseur (supplierPending: true)
  // ══════════════════════════════════════════════════════════════
  verifyOtp(dto: OtpDto): Observable<AuthResponse> {
    this._loading.set(true);

    const payload = {
      phone: this.formatPhone(dto.phone),
      code:  dto.otp,
      type:  'REGISTER',
    };

    return this.http.post<any>(`${API}/auth/verify-otp`, payload).pipe(
      map(res => {
        const data = res.data;

        // ── Cas fournisseur : compte SUSPENDED, pas de tokens ──
        // Le backend retourne { supplierPending: true }
        if (data?.supplierPending) {
          // Retourner une AuthResponse vide pour ne pas bloquer le front
          return {
            token:        '',
            refreshToken: '',
            user:         null as any,
            expiresIn:    0,
            supplierPending: true,
          } as any;
        }

        // ── Cas normal : membre avec tokens ────────────────────
        const user = this.mapBackendUser(data.user);
        return {
          token:        data.accessToken,
          refreshToken: data.refreshToken,
          user,
          expiresIn:    900,
        } as AuthResponse;
      }),
      tap(r => {
        // Sauvegarder la session uniquement si on a des tokens
        if (r.token && r.user) {
          this.saveSession(r.user, r.token, r.refreshToken);
        }
        this._loading.set(false);
      }),
      catchError(err => {
        this._loading.set(false);
        return throwError(() => err);
      })
    );
  }

  // ══════════════════════════════════════════════════════════════
  // LOGIN — POST /auth/login
  // ══════════════════════════════════════════════════════════════
  login(dto: LoginDto): Observable<AuthResponse> {
    this._loading.set(true);

    const isEmail = dto.phone.includes('@');
    const payload = isEmail
      ? { email: dto.phone, password: dto.password }
      : { phone: this.formatPhone(dto.phone), password: dto.password };

    return this.http.post<any>(`${API}/auth/login`, payload).pipe(
      map(res => {
        const data = res.data;
        if (data?.twoFactorRequired) throw { twoFactorRequired: true };
        const user = this.mapBackendUser(data.user);
        return {
          token:        data.accessToken,
          refreshToken: data.refreshToken,
          user,
          expiresIn:    900,
        } as AuthResponse;
      }),
      tap(r => {
        this.saveSession(r.user, r.token, r.refreshToken);
        this._loading.set(false);
      }),
      catchError(err => {
        this._loading.set(false);
        return throwError(() => err);
      })
    );
  }

  // ══════════════════════════════════════════════════════════════
  // LOGOUT
  // ══════════════════════════════════════════════════════════════
  logout(): void {
    const refreshToken = localStorage.getItem(KEY_REFRESH);
    this.http.post(`${API}/auth/logout`, { refreshToken }).subscribe({ error: () => {} });
    this.clearSession();
    this.router.navigate(['/']);
  }

  // ══════════════════════════════════════════════════════════════
  // REFRESH TOKEN
  // ══════════════════════════════════════════════════════════════
  refreshToken(): Observable<{ token: string }> {
    const refreshToken = localStorage.getItem(KEY_REFRESH);
    return this.http.post<any>(`${API}/auth/refresh`, { refreshToken }).pipe(
      map(res => ({ token: res.data.accessToken })),
      tap(r => localStorage.setItem(KEY_TOKEN, r.token)),
      catchError(err => {
        this.clearSession();
        this.router.navigate(['/auth/login']);
        return throwError(() => err);
      })
    );
  }

  // ══════════════════════════════════════════════════════════════
  // FORGOT PASSWORD
  // ══════════════════════════════════════════════════════════════
  forgotPassword(phone: string): Observable<void> {
    this._loading.set(true);
    return this.http.post<any>(`${API}/auth/forgot-password`, {
      phone: this.formatPhone(phone)
    }).pipe(
      map(() => void 0),
      tap(() => this._loading.set(false)),
      catchError(err => { this._loading.set(false); return throwError(() => err); })
    );
  }

  // ══════════════════════════════════════════════════════════════
  // RESET PASSWORD
  // ══════════════════════════════════════════════════════════════
  resetPassword(phone: string, code: string, newPassword: string): Observable<void> {
    this._loading.set(true);
    return this.http.post<any>(`${API}/auth/reset-password`, {
      phone: this.formatPhone(phone),
      code,
      newPassword,
    }).pipe(
      map(() => void 0),
      tap(() => this._loading.set(false)),
      catchError(err => { this._loading.set(false); return throwError(() => err); })
    );
  }

  // ══════════════════════════════════════════════════════════════
  // RESEND OTP
  // ══════════════════════════════════════════════════════════════
  resendOtp(phone: string, type: 'REGISTER' | 'RESET_PASSWORD' = 'REGISTER'): Observable<void> {
    return this.http.post<any>(`${API}/auth/resend-otp`, {
      phone: this.formatPhone(phone),
      type,
    }).pipe(
      map(() => void 0),
      catchError(err => throwError(() => err))
    );
  }

  // ── Utilitaires ────────────────────────────────────────────────
  getToken(): string | null { return localStorage.getItem(KEY_TOKEN); }
  isRole(role: string): boolean { return this._user()?.role === role; }

  // Demo login
  loginDemo(role: 'MEMBER' | 'SUPPLIER' | 'ADMIN'): void {
    const users  = { MEMBER: this.mock.memberUser, SUPPLIER: this.mock.supplierUser, ADMIN: this.mock.adminUser };
    const routes = { MEMBER: '/member', SUPPLIER: '/supplier', ADMIN: '/admin' };
    this.saveSession(users[role], 'mock-demo-' + Date.now(), 'mock-refresh-' + Date.now());
    this.router.navigate([routes[role]]);
  }
}