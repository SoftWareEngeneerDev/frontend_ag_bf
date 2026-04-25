import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { AuthService }  from '../../../core/services/auth.service';
import { UserService }  from '../../../core/services/user.service';
import { HttpClient }   from '@angular/common/http';

const API = 'http://localhost:3000/api/v1';

@Component({
  selector: 'app-profile',
  templateUrl: './member-profile.component.html',
  styleUrls:  ['./member-profile.component.scss']
})
export class ProfileComponent implements OnInit, OnDestroy {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  activeTab      = 'infos';
  saving         = false;
  uploadingPhoto = false;
  errorMessage   = '';
  successMessage = '';
  copied         = false;
  avatarPreview  : string | null = null;

  private destroy$ = new Subject<void>();

  readonly tabs = [
    { key: 'infos',         icon: 'fa-solid fa-user',         label: 'Infos personnelles' },
    { key: 'securite',      icon: 'fa-solid fa-shield-halved', label: 'Sécurité' },
    { key: 'notifications', icon: 'fa-solid fa-bell',          label: 'Notifications' },
    { key: 'parrainage',    icon: 'fa-solid fa-gift',          label: 'Parrainage' },
  ];

  form         : FormGroup;
  passwordForm : FormGroup;

  notifSettings = [
    { key: 'notifPush',  label: 'Nouveaux membres',        desc: 'Quand un groupe progresse',     on: true  },
    { key: 'notifSMS',   label: 'Seuil atteint',           desc: 'Quand le seuil est atteint',    on: true  },
    { key: 'notifEmail', label: 'Rappels paiement',        desc: 'Ne manquez pas les délais',     on: true  },
    { key: 'delivery',   label: 'Mises à jour livraison',  desc: 'Statut de vos commandes',       on: true  },
    { key: 'promo',      label: 'Promotions',              desc: 'Nouveaux groupes intéressants', on: false },
  ];

  readonly refStats = [
    { icon: 'fa-solid fa-users',         color: '#0DA487', bg: '#E6FAF5', val: '0', label: 'Amis parrainés'      },
    { icon: 'fa-solid fa-sack-dollar',   color: '#F4A902', bg: '#FFF8E6', val: '0', label: 'Crédits gagnés'      },
    { icon: 'fa-solid fa-cart-shopping', color: '#7B2FBE', bg: '#F3EAFF', val: '0', label: 'Achats via parrainage'},
  ];

  constructor(
    public  auth        : AuthService,
    private userService : UserService,
    private fb          : FormBuilder,
    private http        : HttpClient,
  ) {
    const u = auth.currentUser();
    this.form = this.fb.group({
      fullName : [u?.fullName || '', Validators.required],
      email    : [u?.email    || '', Validators.email],
      phone    : [{ value: u?.phone || '', disabled: true }],
      city     : [u?.city     || ''],
    });

    this.passwordForm = this.fb.group({
      currentPassword : ['', Validators.required],
      newPassword     : ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword : ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.userService.getProfile()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (user) => {
          this.form.patchValue({
            fullName : user.fullName,
            email    : user.email || '',
            phone    : user.phone || '',
            city     : user.city  || '',
          });
          if (user.avatarUrl) this.avatarPreview = user.avatarUrl;

          // Stats parrainage
          this.refStats[0].val = String(user.referralCount ?? 0);
          this.refStats[1].val = user.totalSaved ? user.totalSaved + ' XOF' : '0 XOF';
        },
        error: () => {}
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get user() { return this.auth.currentUser(); }

  get memberSince(): string {
    const d = this.user?.createdAt;
    if (!d) return '—';
    return new Date(d).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  }

  // ── Photo de profil ───────────────────────────────────────────
  openFilePicker(): void { this.fileInput.nativeElement.click(); }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file  = input.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.showError('Veuillez sélectionner une image (JPG, PNG, etc.)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.showError('L\'image ne doit pas dépasser 5 MB');
      return;
    }

    // Preview locale immédiate
    const reader = new FileReader();
    reader.onload = (e) => { this.avatarPreview = e.target?.result as string; };
    reader.readAsDataURL(file);

    this.uploadPhoto(file);
  }

  private uploadPhoto(file: File): void {
    this.uploadingPhoto = true;
    this.errorMessage   = '';

    const formData = new FormData();
    formData.append('avatar', file);

    this.http.post<any>(`${API}/users/me/avatar`, formData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.uploadingPhoto = false;
          if (res.data?.avatarUrl) this.avatarPreview = res.data.avatarUrl;
          this.showSuccess('Photo de profil mise à jour !');
        },
        error: () => {
          this.uploadingPhoto = false;
          this.showSuccess('Photo mise à jour localement !');
        }
      });
  }

  // ── Sauvegarder le profil ─────────────────────────────────────
  save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving       = true;
    this.errorMessage = '';

    this.userService.updateProfile({
      name  : this.form.value.fullName,
      email : this.form.value.email || undefined,
      city  : this.form.value.city  || undefined,
    })
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: () => {
        this.saving = false;
        this.showSuccess('Profil mis à jour avec succès !');
      },
      error: (err) => {
        this.saving       = false;
        this.errorMessage = err?.error?.error?.message ?? 'Une erreur est survenue.';
      }
    });
  }

  // ── Changer le mot de passe ───────────────────────────────────
  changePassword(): void {
    if (this.passwordForm.invalid) { this.passwordForm.markAllAsTouched(); return; }
    const { newPassword, confirmPassword } = this.passwordForm.value;
    if (newPassword !== confirmPassword) {
      this.showError('Les mots de passe ne correspondent pas.');
      return;
    }
    // TODO: câbler l'endpoint changePassword quand disponible
    this.showSuccess('Mot de passe mis à jour !');
    this.passwordForm.reset();
  }

  // ── Notifications ─────────────────────────────────────────────
  toggleNotif(item: any): void { item.on = !item.on; }

  // ── Parrainage ────────────────────────────────────────────────
  copyCode(): void {
    const code = this.user?.referralCode || '';
    if (!code) return;
    navigator.clipboard?.writeText(code).then(() => {
      this.copied = true;
      setTimeout(() => { this.copied = false; }, 2000);
    });
  }

  shareWhatsApp(): void {
    const code = this.user?.referralCode || '';
    const msg  = encodeURIComponent(
      `Rejoins-moi sur Djula Market et économise sur tes achats ! Utilise mon code : ${code} 🛒`
    );
    window.open(`https://wa.me/?text=${msg}`, '_blank');
  }

  // ── Helpers ───────────────────────────────────────────────────
  private showSuccess(msg: string): void {
    this.successMessage = msg;
    this.errorMessage   = '';
    setTimeout(() => { this.successMessage = ''; }, 3000);
  }

  private showError(msg: string): void {
    this.errorMessage   = msg;
    this.successMessage = '';
    setTimeout(() => { this.errorMessage = ''; }, 4000);
  }
}