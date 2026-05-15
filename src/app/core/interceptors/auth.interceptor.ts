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
    // Routes publiques : withCredentials pour que le browser envoie les cookies
    if (isPublic) return next.handle(req.clone({ withCredentials: true }));

    const authReq = this.buildRequest(req);

    return next.handle(authReq).pipe(
      catchError((err: HttpErrorResponse) => {
        if (err.status === 401) return this.handle401(req, next);
        return throwError(() => err);
      })
    );
  }

  // Construit la requête avec withCredentials + Bearer uniquement en mode démo
  private buildRequest(req: HttpRequest<unknown>): HttpRequest<unknown> {
    const demoToken = this.auth.getToken(); // non-null uniquement pour mock-demo-*
    if (demoToken) {
      return req.clone({
        withCredentials: true,
        setHeaders: { Authorization: `Bearer ${demoToken}` },
      });
    }
    // Mode réel : le cookie httpOnly est envoyé automatiquement par le navigateur
    return req.clone({ withCredentials: true });
  }

  private handle401(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (this.isRefreshing) {
      return this.refreshDone$.pipe(
        filter(t => t !== null),
        take(1),
        switchMap(() => next.handle(this.buildRequest(req)))
      );
    }

    this.isRefreshing = true;
    this.refreshDone$.next(null);

    return this.auth.refreshToken().pipe(
      switchMap(({ token }) => {
        this.isRefreshing = false;
        this.refreshDone$.next(token);
        // Relancer la requête originale — le nouveau cookie est posé par le backend
        return next.handle(this.buildRequest(req));
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