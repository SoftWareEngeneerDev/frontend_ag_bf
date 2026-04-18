import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {
  step  = 1;
  phone = '';

  // Champs étape 3
  newPassword     = '';
  confirmPassword = '';

  // État
  loading      = false;
  errorMessage = '';
  otpCode      = ''; // On garde le code OTP vérifié pour l'étape 3

  constructor(
    private router: Router,
    private auth: AuthService,
  ) {}

  // ── Étape 1 : POST /auth/forgot-password ─────────────────────
  sendCode(): void {
    if (!this.phone) return;

    this.errorMessage = '';
    this.loading = true;

    this.auth.forgotPassword(this.phone).subscribe({
      next: () => {
        this.loading = false;
        this.step = 2; // Passer à l'OTP
      },
      error: (err) => {
        this.loading = false;
        // Le backend retourne toujours 200 même si le numéro n'existe pas
        // (sécurité anti-énumération) — on passe quand même à l'étape 2
        this.step = 2;
      }
    });
  }

  // ── Étape 2 : OTP vérifié ─────────────────────────────────────
  // L'OTP component émet le code validé
  onVerified(code: string): void {
    this.otpCode = code; // On garde le code pour l'étape 3
    this.step = 3;
  }

  // ── Étape 3 : POST /auth/reset-password ──────────────────────
  resetPassword(): void {
    if (!this.newPassword || this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'Les mots de passe ne correspondent pas.';
      return;
    }
    if (this.newPassword.length < 8) {
      this.errorMessage = 'Le mot de passe doit contenir au moins 8 caractères.';
      return;
    }

    this.errorMessage = '';
    this.loading = true;

    this.auth.resetPassword(this.phone, this.otpCode, this.newPassword).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/auth/login']);
      },
      error: (err) => {
        this.loading = false;
        const msg = err?.error?.error?.message;
        this.errorMessage = msg || 'Une erreur est survenue. Réessayez.';
      }
    });
  }

  goLogin(): void { this.router.navigate(['/auth/login']); }
}