import { Injectable } from '@angular/core';
import {
  HttpInterceptor, HttpRequest, HttpHandler,
  HttpEvent, HttpErrorResponse
} from '@angular/common/http';
import {
  Observable, throwError, BehaviorSubject, filter,
  take, switchMap, catchError
} from 'rxjs';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  // ── Gestion du refresh concurrent ────────────────────────────
  // Si plusieurs requêtes échouent en même temps (401),
  // on ne fait qu'UN SEUL appel refresh et on les met toutes en attente
  private isRefreshing = false;
  private refreshDone$ = new BehaviorSubject<string | null>(null);

  constructor(private auth: AuthService, private router: Router) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {

    // ── Ne pas ajouter le token sur les routes publiques ───────
    const isPublic = this.isPublicRoute(req.url);
    if (isPublic) return next.handle(req);

    // ── Ajouter le token JWT sur toutes les autres requêtes ────
    const token = this.auth.getToken();
    const authReq = token ? this.addToken(req, token) : req;

    return next.handle(authReq).pipe(
      catchError((err: HttpErrorResponse) => {

        // ── 401 : Token expiré → tenter le refresh ─────────────
        if (err.status === 401) {
          return this.handle401(req, next);
        }

        // ── Autres erreurs → propager normalement ─────────────
        return throwError(() => err);
      })
    );
  }

  // ── Ajouter le header Authorization ──────────────────────────
  private addToken(req: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
    return req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  // ── Gestion du 401 avec refresh ──────────────────────────────
  private handle401(
    req: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {

    if (this.isRefreshing) {
      // Un refresh est déjà en cours → attendre qu'il se termine
      return this.refreshDone$.pipe(
        filter(token => token !== null),
        take(1),
        switchMap(token => next.handle(this.addToken(req, token!)))
      );
    }

    // Démarrer le refresh
    this.isRefreshing = true;
    this.refreshDone$.next(null);

    return this.auth.refreshToken().pipe(
      switchMap(({ token }) => {
        // Refresh réussi → relancer la requête originale avec le nouveau token
        this.isRefreshing = false;
        this.refreshDone$.next(token);
        return next.handle(this.addToken(req, token));
      }),
      catchError(err => {
        // Refresh échoué → déconnecter
        this.isRefreshing = false;
        this.refreshDone$.next(null);
        this.auth.logout();
        this.router.navigate(['/auth/login']);
        return throwError(() => err);
      })
    );
  }

  // ── Routes publiques (pas de token requis) ───────────────────
  private isPublicRoute(url: string): boolean {
    const publicRoutes = [
      '/auth/register',
      '/auth/login',
      '/auth/verify-otp',
      '/auth/resend-otp',
      '/auth/forgot-password',
      '/auth/reset-password',
      '/auth/refresh',
      '/payments/webhooks/cinetpay',
    ];
    return publicRoutes.some(route => url.includes(route));
  }
}