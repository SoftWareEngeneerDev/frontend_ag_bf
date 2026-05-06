import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';

const API = 'http://localhost:3000/api/v1';

@Component({
  selector   : 'app-admin-profile',
  templateUrl: './admin-profile.component.html',
  styleUrls  : ['./admin-profile.component.scss']
})
export class AdminProfileComponent implements OnInit, OnDestroy {
  loading         = true;
  saving          = false;
  uploadingAvatar = false;

  successMsg = '';
  errorMsg   = '';
  profile: any = null;

  form = { name: '', email: '', city: '', phone: '' };

  pwForm = { currentPassword: '', newPassword: '', confirmPassword: '' };
  showPwForm    = false;
  savingPw      = false;
  showCurrentPw = false;
  showNewPw     = false;
  showConfirmPw = false;

  private destroy$ = new Subject<void>();

  constructor(private http: HttpClient, public auth: AuthService) {}

  ngOnInit(): void { this.loadProfile(); }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadProfile(): void {
    this.http.get<any>(`${API}/users/me`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.profile = res.data;
          this.form = {
            name : res.data?.name  ?? '',
            email: res.data?.email ?? '',
            city : res.data?.city  ?? '',
            phone: res.data?.phone ?? '',
          };
          this.loading = false;
        },
        error: () => { this.loading = false; }
      });
  }

  // ── Upload avatar ─────────────────────────────────────────────
  onAvatarSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file  = input.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      this.showError('Format non supporté. Utilisez JPG, PNG ou WEBP.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      this.showError('Image trop lourde. Maximum 2MB.');
      return;
    }

    this.uploadingAvatar = true;
    const formData = new FormData();
    formData.append('avatar', file);  // ← clé 'avatar' pour la route /users/me/avatar

    this.http.post<any>(`${API}/users/me/avatar`, formData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          const url = res.data?.avatarUrl;
          if (url && this.profile) {
            this.profile.avatarUrl = url;
            // ✅ Mettre à jour topbar et sidebar
            this.auth.updateCurrentUser({ avatarUrl: url });
          }
          this.uploadingAvatar = false;
          this.showSuccess('Photo de profil mise à jour !');
          input.value = '';
        },
        error: () => {
          this.uploadingAvatar = false;
          this.showError('Erreur upload avatar');
          input.value = '';
        }
      });
  }

  // ── Sauvegarder les infos ─────────────────────────────────────
  saveProfile(): void {
    if (this.saving || !this.form.name.trim()) return;
    this.saving = true;

    this.http.put<any>(`${API}/users/me`, {
      name : this.form.name.trim(),
      email: this.form.email.trim() || undefined,
      city : this.form.city.trim()  || undefined,
    })
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: () => {
        this.profile = { ...this.profile, ...this.form };
        this.saving  = false;
        // ✅ Mettre à jour topbar et sidebar
        this.auth.updateCurrentUser({ fullName: this.form.name });
        this.showSuccess('Profil mis à jour avec succès');
      },
      error: (err) => {
        this.saving = false;
        this.showError(err?.error?.error?.message ?? 'Erreur mise à jour profil');
      }
    });
  }

  // ── Changer mot de passe ──────────────────────────────────────
  changePassword(): void {
    if (this.savingPw) return;
    if (!this.pwForm.currentPassword || !this.pwForm.newPassword) {
      this.showError('Remplissez tous les champs'); return;
    }
    if (this.pwForm.newPassword.length < 8) {
      this.showError('Minimum 8 caractères'); return;
    }
    if (this.pwForm.newPassword !== this.pwForm.confirmPassword) {
      this.showError('Les mots de passe ne correspondent pas'); return;
    }
    this.savingPw = true;

    // Utilise PUT /users/me avec les champs password
    this.http.put<any>(`${API}/users/me`, {
      currentPassword: this.pwForm.currentPassword,
      newPassword    : this.pwForm.newPassword,
    })
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: () => {
        this.savingPw   = false;
        this.showPwForm = false;
        this.pwForm     = { currentPassword: '', newPassword: '', confirmPassword: '' };
        this.showSuccess('Mot de passe modifié avec succès');
      },
      error: (err) => {
        this.savingPw = false;
        this.showError(err?.error?.error?.message ?? 'Erreur changement mot de passe');
      }
    });
  }

  get initials(): string {
    return (this.form.name || 'A').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  get memberSince(): string {
    if (!this.profile?.createdAt) return '';
    return new Date(this.profile.createdAt).toLocaleDateString('fr-FR', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
  }

  get pwStrengthPct(): number {
    const pw = this.pwForm.newPassword;
    if (!pw) return 0;
    let score = 0;
    if (pw.length >= 8)            score += 25;
    if (pw.length >= 12)           score += 15;
    if (/[A-Z]/.test(pw))         score += 20;
    if (/[0-9]/.test(pw))         score += 20;
    if (/[^A-Za-z0-9]/.test(pw)) score += 20;
    return Math.min(100, score);
  }

  get pwStrengthColor(): string {
    const p = this.pwStrengthPct;
    if (p >= 80) return '#10D98B';
    if (p >= 50) return '#F4A902';
    return '#FF4D6A';
  }

  get pwStrengthLabel(): string {
    const p = this.pwStrengthPct;
    if (p >= 80) return '✅ Mot de passe fort';
    if (p >= 50) return '⚠️ Mot de passe moyen';
    return '❌ Mot de passe faible';
  }

  private showSuccess(msg: string): void {
    this.successMsg = msg; this.errorMsg = '';
    setTimeout(() => { this.successMsg = ''; }, 4000);
  }

  private showError(msg: string): void {
    this.errorMsg = msg; this.successMsg = '';
    setTimeout(() => { this.errorMsg = ''; }, 5000);
  }
}