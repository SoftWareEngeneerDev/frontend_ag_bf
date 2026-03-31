import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  step = 1;
  form: FormGroup;
  pwStrength = 0;
  showPassword = false;
  errorMessage = '';

  get loading(): boolean { return this.auth.isLoading(); }
  steps = ['Infos', 'Vérification', 'Bienvenue'];

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
  ) {
    this.form = this.fb.group({
      fullName:        ['', Validators.required],
      phone:           ['', Validators.required],
      email:           [''],
      password:        ['', [Validators.required, Validators.minLength(8)]],
      referralCode:    [''],
      acceptTerms:     [false, Validators.requiredTrue],
    });
  }

  onPasswordChange(v: string): void {
    let s = 0;
    if (v.length >= 8)        s++;
    if (/[A-Z]/.test(v))      s++;
    if (/[0-9]/.test(v))      s++;
    if (/[!@#$%^&*]/.test(v)) s++;
    this.pwStrength = s;
  }

  get pwLabel(): string {
    return ['', 'Faible', 'Moyen', 'Fort', 'Très fort'][this.pwStrength] || '';
  }

  get pwColor(): string {
    return ['', '#FF4D6A', '#FFB347', '#F5A623', '#10D98B'][this.pwStrength] || '';
  }

  // ── Step 1 : Appel POST /auth/register ───────────────────────
  nextStep(): void {
    if (this.step === 1) {
      if (this.form.get('fullName')?.invalid || this.form.get('phone')?.invalid) {
        this.form.markAllAsTouched();
        return;
      }

      this.errorMessage = '';

      this.auth.register({
        fullName:        this.form.value.fullName,
        phone:           this.form.value.phone,
        email:           this.form.value.email || undefined,
        password:        this.form.value.password,
        confirmPassword: this.form.value.password,
        referralCode:    this.form.value.referralCode || undefined,
        acceptTerms:     this.form.value.acceptTerms,
      }).subscribe({
        next: () => {
          this.step = 2;
        },
        error: (err) => {
          const msg = err?.error?.error?.message;
          this.errorMessage = msg || 'Une erreur est survenue. Réessayez.';
        }
      });
    }
  }

  // ── Step 2 : Appel POST /auth/verify-otp ─────────────────────
  onOtpComplete(otp: string): void {
    this.errorMessage = '';

    this.auth.verifyOtp({
      phone: this.form.value.phone,
      otp,
    }).subscribe({
      next: () => {
        this.step = 3;
      },
      error: (err) => {
        const msg = err?.error?.error?.message;
        this.errorMessage = msg || 'Code OTP invalide ou expiré.';
      }
    });
  }

  goToDashboard(): void { this.router.navigate(['/member']); }

  get user() { return this.auth.currentUser(); }
}