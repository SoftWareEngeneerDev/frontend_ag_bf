import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';

const API = 'http://localhost:3000/api/v1';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  step         = 1;
  profileType: 'MEMBER' | 'SUPPLIER' = 'MEMBER';
  form:        FormGroup;
  companyForm: FormGroup;
  pwStrength   = 0;
  showPassword = false;
  errorMessage = '';
  otpPhone     = '';

  get loading(): boolean { return this.auth.isLoading(); }

  get steps(): string[] {
    return this.profileType === 'SUPPLIER'
      ? ['Profil', 'Infos', 'Entreprise', 'Vérification', 'Bienvenue']
      : ['Profil', 'Infos', 'Vérification', 'Bienvenue'];
  }

  @Output() switchToLogin = new EventEmitter<void>();

  constructor(
    private fb:     FormBuilder,
    private auth:   AuthService,
    private http:   HttpClient,
    private router: Router,
  ) {
    this.form = this.fb.group({
      fullName:     ['', Validators.required],
      phone:        ['', Validators.required],
      email:        [''],
      password:     ['', [Validators.required, Validators.minLength(8)]],
      referralCode: [''],
      acceptTerms:  [false, Validators.requiredTrue],
    });

    this.companyForm = this.fb.group({
      companyName: ['', Validators.required],
      taxId:       [''],
      siret:       [''],
      city:        ['Ouagadougou'],
      address:     [''],
    });
  }

  selectProfile(type: 'MEMBER' | 'SUPPLIER'): void {
    this.profileType = type;
    this.step        = 2;
  }

  onPasswordChange(v: string): void {
    let s = 0;
    if (v.length >= 8)        s++;
    if (/[A-Z]/.test(v))      s++;
    if (/[0-9]/.test(v))      s++;
    if (/[!@#$%^&*]/.test(v)) s++;
    this.pwStrength = s;
  }

  get pwLabel(): string { return ['', 'Faible', 'Moyen', 'Fort', 'Très fort'][this.pwStrength] || ''; }
  get pwColor(): string { return ['', '#FF4D6A', '#FFB347', '#F5A623', '#10D98B'][this.pwStrength] || ''; }

  // ── Step 2 : POST /auth/register ─────────────────────────────
  submitAccount(): void {
    if (this.form.get('fullName')?.invalid || this.form.get('phone')?.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (!this.form.value.acceptTerms) {
      this.errorMessage = 'Veuillez accepter les conditions d\'utilisation.';
      return;
    }

    this.errorMessage = '';
    // Sauvegarder le téléphone formaté pour l'OTP et le profil fournisseur
    this.otpPhone = this.auth.formatPhone(this.form.value.phone);

    this.auth.register({
      fullName:        this.form.value.fullName,
      phone:           this.form.value.phone,
      email:           this.form.value.email        || undefined,
      password:        this.form.value.password,
      confirmPassword: this.form.value.password,
      referralCode:    this.form.value.referralCode || undefined,
      acceptTerms:     true,
      role:            this.profileType,
    }).subscribe({
      next: () => {
        // SUPPLIER → step 3 (infos entreprise) | MEMBER → step 3 (OTP)
        this.step = 3;
      },
      error: (err) => {
        const msg = err?.error?.error?.message ?? err?.error?.message;
        this.errorMessage = msg || 'Une erreur est survenue. Réessayez.';
      }
    });
  }

  // ── Step 3 Fournisseur : valider le formulaire entreprise ─────
  submitCompany(): void {
    if (this.companyForm.invalid) {
      this.companyForm.markAllAsTouched();
      return;
    }
    this.step = 4; // → OTP
  }

  // ── OTP vérifié ───────────────────────────────────────────────
  onOtpComplete(otp: string): void {
    this.errorMessage = '';

    this.auth.verifyOtp({
      phone: this.otpPhone || this.auth.formatPhone(this.form.value.phone),
      otp,
    }).subscribe({
      next: () => {
        if (this.profileType === 'SUPPLIER') {
          // Fournisseur → soumettre les infos entreprise
          this.submitSupplierProfile();
        } else {
          // Membre → page de bienvenue
          this.step = 4;
        }
      },
      error: (err) => {
        const msg = err?.error?.error?.message ?? err?.error?.message;
        this.errorMessage = msg || 'Code OTP invalide ou expiré.';
      }
    });
  }

  // ── POST /auth/supplier-profile ───────────────────────────────
  // CORRECTION : envoyer phone dans le body (pas de JWT requis)
  private submitSupplierProfile(): void {
    const phone = this.otpPhone || this.auth.formatPhone(this.form.value.phone);

    this.http.post<any>(`${API}/auth/supplier-profile`, {
      phone,
      companyName: this.companyForm.value.companyName,
      taxId:       this.companyForm.value.taxId    || undefined,
      siret:       this.companyForm.value.siret    || undefined,
      city:        this.companyForm.value.city     || 'Ouagadougou',
      address:     this.companyForm.value.address  || undefined,
    }).subscribe({
      next:  () => { this.step = 5; },
      error: () => { this.step = 5; } // Passer à la confirmation même si erreur
    });
  }

  goToDashboard(): void {
    if (this.profileType === 'SUPPLIER') {
      this.router.navigate(['/auth/login']);
    } else {
      this.router.navigate(['/member']);
    }
  }

  get user() { return this.auth.currentUser(); }

  goToLogin() {
    this.switchToLogin.emit();
  }
}