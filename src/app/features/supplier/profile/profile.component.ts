import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '..//../../core/services/auth.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { environment } from '../../../../environments/environment.prod';

// const API = 'http://localhost:3000/api/v1';
const API          = environment.apiUrl;

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit, OnDestroy {
  loading         = true;
  saving          = false;
  uploadingLogo   = false;
  uploadingDocs   = false;

  successMsg = '';
  errorMsg   = '';
  supplier: any = null;

  // Formulaire informations entreprise
  form = {
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    city: '',
    address: '',
    description: '',
    commissionRate: 0
  };

  // Documents
  newDocs: File[] = [];
  existingDocs: string[] = [];

  // Mot de passe
  pwForm = { currentPassword: '', newPassword: '', confirmPassword: '' };
  showPwForm    = false;
  savingPw      = false;
  showCurrentPw = false;
  showNewPw     = false;
  showConfirmPw = false;

  private destroy$ = new Subject<void>();

  constructor(
    private http: HttpClient,
    public auth: AuthService
  ) {}

  ngOnInit(): void {
    this.loadSupplierProfile();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ─────────────────────────────────────────────────────────────
  // CHARGEMENT DU PROFIL FOURNISSEUR
  // ─────────────────────────────────────────────────────────────
  private loadSupplierProfile(): void {
    this.http.get<any>(`${API}/suppliers/me`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.supplier = res.data;
          this.form = {
            companyName: res.data?.companyName ?? '',
            contactName: res.data?.contactName ?? '',
            email: res.data?.user?.email ?? '',
            phone: res.data?.user?.phone ?? '',
            city: res.data?.user?.city ?? '',
            address: res.data?.address ?? '',
            description: res.data?.description ?? '',
            commissionRate: res.data?.commissionRate ?? 0.07
          };
          this.existingDocs = res.data?.docsUrls ?? [];
          this.loading = false;
        },
        error: (err) => {
          this.loading = false;
          this.showError(err?.error?.error?.message ?? 'Erreur chargement profil');
        }
      });
  }

  // ─────────────────────────────────────────────────────────────
  // LOGO / AVATAR
  // ─────────────────────────────────────────────────────────────
  onLogoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      this.showError('Format non supporté. Utilisez JPG, PNG ou WEBP.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      this.showError('Image trop lourde. Maximum 2MB.');
      return;
    }

    this.uploadingLogo = true;
    const formData = new FormData();
    formData.append('logo', file);

    this.http.post<any>(`${API}/suppliers/me/logo`, formData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          const url = res.data?.logoUrl;
          if (url && this.supplier) {
            this.supplier.logoUrl = url;
            this.auth.updateCurrentUser({ avatarUrl: url });
          }
          this.uploadingLogo = false;
          this.showSuccess('Logo mis à jour !');
          input.value = '';
        },
        error: () => {
          this.uploadingLogo = false;
          this.showError('Erreur upload logo');
          input.value = '';
        }
      });
  }

  // ─────────────────────────────────────────────────────────────
  // DOCUMENTS
  // ─────────────────────────────────────────────────────────────
  onDocsSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (!files) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > 5 * 1024 * 1024) {
        this.showError(`Document ${file.name} dépasse 5MB`);
        continue;
      }
      this.newDocs.push(file);
    }
    input.value = '';
  }

  uploadDocuments(): void {
    if (this.newDocs.length === 0) return;

    this.uploadingDocs = true;
    const formData = new FormData();
    this.newDocs.forEach(doc => {
      formData.append('documents', doc);
    });

    this.http.post<any>(`${API}/suppliers/me/documents`, formData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.existingDocs = [...this.existingDocs, ...res.data.urls];
          this.newDocs = [];
          this.uploadingDocs = false;
          this.showSuccess(`${res.data.urls.length} document(s) ajouté(s)`);
        },
        error: () => {
          this.uploadingDocs = false;
          this.showError('Erreur upload documents');
        }
      });
  }

  removeDocument(index: number): void {
    const docUrl = this.existingDocs[index];
    this.http.delete<any>(`${API}/suppliers/me/documents`, { body: { url: docUrl } })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.existingDocs.splice(index, 1);
          this.showSuccess('Document supprimé');
        },
        error: () => {
          this.showError('Erreur suppression document');
        }
      });
  }

  // ─────────────────────────────────────────────────────────────
  // SAUVEGARDER INFOS ENTREPRISE
  // ─────────────────────────────────────────────────────────────
  saveProfile(): void {
    if (this.saving || !this.form.companyName.trim()) return;
    this.saving = true;

    this.http.put<any>(`${API}/suppliers/me`, {
      companyName: this.form.companyName.trim(),
      contactName: this.form.contactName.trim(),
      email: this.form.email.trim() || undefined,
      city: this.form.city.trim() || undefined,
      address: this.form.address.trim() || undefined,
      description: this.form.description.trim() || undefined
    })
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: () => {
        this.supplier = { ...this.supplier, ...this.form };
        this.saving = false;
        this.auth.updateCurrentUser({ fullName: this.form.contactName });
        this.showSuccess('Profil mis à jour avec succès');
      },
      error: (err) => {
        this.saving = false;
        this.showError(err?.error?.error?.message ?? 'Erreur mise à jour profil');
      }
    });
  }

  // ─────────────────────────────────────────────────────────────
  // CHANGER MOT DE PASSE
  // ─────────────────────────────────────────────────────────────
  changePassword(): void {
    if (this.savingPw) return;
    if (!this.pwForm.currentPassword || !this.pwForm.newPassword) {
      this.showError('Remplissez tous les champs');
      return;
    }
    if (this.pwForm.newPassword.length < 8) {
      this.showError('Minimum 8 caractères');
      return;
    }
    if (this.pwForm.newPassword !== this.pwForm.confirmPassword) {
      this.showError('Les mots de passe ne correspondent pas');
      return;
    }
    this.savingPw = true;

    this.http.put<any>(`${API}/users/me`, {
      currentPassword: this.pwForm.currentPassword,
      newPassword: this.pwForm.newPassword
    })
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: () => {
        this.savingPw = false;
        this.showPwForm = false;
        this.pwForm = { currentPassword: '', newPassword: '', confirmPassword: '' };
        this.showSuccess('Mot de passe modifié avec succès');
      },
      error: (err) => {
        this.savingPw = false;
        this.showError(err?.error?.error?.message ?? 'Erreur changement mot de passe');
      }
    });
  }

  // ─────────────────────────────────────────────────────────────
  // GETTERS & UTILITAIRES
  // ─────────────────────────────────────────────────────────────
  get initials(): string {
    return (this.form.companyName || 'S').charAt(0).toUpperCase();
  }

  get memberSince(): string {
    if (!this.supplier?.createdAt) return '';
    return new Date(this.supplier.createdAt).toLocaleDateString('fr-FR', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
  }

  get statusLabel(): string {
    const m: Record<string, string> = {
      APPROVED: '✅ Approuvé',
      PENDING: '⏳ En attente',
      SUSPENDED: '🔴 Suspendu',
      REJECTED: '❌ Rejeté'
    };
    return m[this.supplier?.status] ?? this.supplier?.status;
  }

  get statusBadge(): string {
    const m: Record<string, string> = {
      APPROVED: 'badge-ok',
      PENDING: 'badge-warn',
      SUSPENDED: 'badge-err',
      REJECTED: 'badge-err'
    };
    return m[this.supplier?.status] ?? 'badge-grey';
  }

  get commissionPercent(): string {
  return (this.form.commissionRate * 100).toFixed(0);
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
    this.successMsg = msg;
    this.errorMsg = '';
    setTimeout(() => { this.successMsg = ''; }, 4000);
  }

  private showError(msg: string): void {
    this.errorMsg = msg;
    this.successMsg = '';
    setTimeout(() => { this.errorMsg = ''; }, 5000);
  }
}
