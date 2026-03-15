import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class GuestGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): boolean {
    if (!this.auth.isLoggedIn()) return true;
    const routes: Record<string, string> = {
      ADMIN: '/admin', SUPPLIER: '/supplier', MEMBER: '/member'
    };
    this.router.navigate([routes[this.auth.currentUser()?.role || ''] || '/']);
    return false;
  }
}
