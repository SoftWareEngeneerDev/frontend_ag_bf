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

  private isRefreshing = false;
  private refreshDone$ = new BehaviorSubject<string | null>(null);

  constructor(private auth: AuthService, private router: Router) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const isPublic = this.isPublicRoute(req.url);
    if (isPublic) return next.handle(req);

    const token   = this.auth.getToken();
    const authReq = token ? this.addToken(req, token) : req;

    return next.handle(authReq).pipe(
      catchError((err: HttpErrorResponse) => {
        if (err.status === 401) {
          return this.handle401(req, next);
        }
        return throwError(() => err);
      })
    );
  }

  private addToken(req: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
    return req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }

  private handle401(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (this.isRefreshing) {
      return this.refreshDone$.pipe(
        filter(token => token !== null),
        take(1),
        switchMap(token => next.handle(this.addToken(req, token!)))
      );
    }

    this.isRefreshing = true;
    this.refreshDone$.next(null);

    return this.auth.refreshToken().pipe(
      switchMap(({ token }) => {
        this.isRefreshing = false;
        this.refreshDone$.next(token);
        return next.handle(this.addToken(req, token));
      }),
      catchError(err => {
        this.isRefreshing = false;
        this.refreshDone$.next(null);
        this.auth.clearSession();
        this.router.navigate(['/auth/login']);
        return throwError(() => err);
      })
    );
  }

  private isPublicRoute(url: string): boolean {
    const publicRoutes = [
      '/auth/register',
      '/auth/login',
      '/auth/verify-otp',
      '/auth/resend-otp',
      '/auth/forgot-password',
      '/auth/reset-password',
      '/auth/refresh',
      '/auth/supplier-profile', // ← AJOUT : fournisseur pas encore connecté
      '/payments/webhooks/cinetpay',
    ];
    return publicRoutes.some(route => url.includes(route));
  }
}