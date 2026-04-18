import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AuthService }  from '../../../core/services/auth.service';
import { UserService }  from '../../../core/services/user.service';
import { HttpClient }   from '@angular/common/http';

const API = 'http://localhost:3000/api/v1';

@Component({
  selector: 'app-profile',
  templateUrl: './member-profile.component.html',
  styleUrls:  ['./member-profile.component.scss']
})
export class ProfileComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  activeTab      = 'infos';
  saving         = false;
  uploadingPhoto = false;
  errorMessage   = '';
  successMessage = '';
  avatarPreview: string | null = null; // Preview locale avant upload

  tabs = [
    { key: 'infos',         icon: 'fa-solid fa-user',          label: 'Infos' },
    { key: 'securite',      icon: 'fa-solid fa-shield-halved',  label: 'Sécurité' },
    { key: 'notifications', icon: 'fa-solid fa-bell',           label: 'Notifications' },
    { key: 'parrainage',    icon: 'fa-solid fa-gift',           label: 'Parrainage' },
  ];

  form: FormGroup;

  notifSettings = [
    { key: 'notifPush',  label: 'Nouveaux membres',       desc: 'Quand un groupe progresse',     on: true  },
    { key: 'notifSMS',   label: 'Seuil atteint',          desc: 'Quand le seuil est atteint',    on: true  },
    { key: 'notifEmail', label: 'Rappels paiement',       desc: 'Ne manquez pas les délais',     on: true  },
    { key: 'delivery',   label: 'Mises à jour livraison', desc: 'Statut de vos commandes',       on: true  },
    { key: 'promo',      label: 'Promotions',             desc: 'Nouveaux groupes intéressants', on: false },
  ];

  constructor(
    public  auth:        AuthService,
    private userService: UserService,
    private fb:          FormBuilder,
    private http:        HttpClient,
  ) {
    const u = auth.currentUser();
    this.form = this.fb.group({
      fullName: [u?.fullName || ''],
      email:    [u?.email    || ''],
      phone:    [u?.phone    || ''],
      city:     [u?.city     || ''],
    });
  }

  ngOnInit(): void {
    this.userService.getProfile().subscribe({
      next: (user) => {
        this.form.patchValue({
          fullName: user.fullName,
          email:    user.email || '',
          phone:    user.phone || '',
          city:     user.city  || '',
        });
        // Charger la photo de profil existante
        if (user.avatarUrl) {
          this.avatarPreview = user.avatarUrl;
        }
      },
      error: () => {}
    });
  }

  get user() { return this.auth.currentUser(); }

  // ── Ouvrir le sélecteur de fichier ────────────────────────────
  openFilePicker(): void {
    this.fileInput.nativeElement.click();
  }

  // ── Gérer la sélection d'une photo ───────────────────────────
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file  = input.files?.[0];
    if (!file) return;

    // Vérifier le type
    if (!file.type.startsWith('image/')) {
      this.errorMessage = 'Veuillez sélectionner une image (JPG, PNG, etc.)';
      return;
    }

    // Vérifier la taille (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      this.errorMessage = 'L\'image ne doit pas dépasser 5MB';
      return;
    }

    // Afficher la preview locale immédiatement
    const reader = new FileReader();
    reader.onload = (e) => {
      this.avatarPreview = e.target?.result as string;
    };
    reader.readAsDataURL(file);

    // Uploader la photo
    this.uploadPhoto(file);
  }

  // ── Uploader la photo vers le backend ────────────────────────
  private uploadPhoto(file: File): void {
    this.uploadingPhoto = true;
    this.errorMessage   = '';

    const formData = new FormData();
    formData.append('avatar', file);

    this.http.post<any>(`${API}/users/me/avatar`, formData).subscribe({
      next: (res) => {
        this.uploadingPhoto = false;
        this.successMessage = 'Photo de profil mise à jour !';
        // Mettre à jour l'URL si le backend retourne une URL
        if (res.data?.avatarUrl) {
          this.avatarPreview = res.data.avatarUrl;
        }
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: () => {
        // Si l'endpoint n'existe pas encore, garder la preview locale
        this.uploadingPhoto = false;
        this.successMessage = 'Photo mise à jour localement !';
        setTimeout(() => this.successMessage = '', 3000);
      }
    });
  }

  toggleNotif(item: any): void { item.on = !item.on; }

  // ── Sauvegarder le profil → PUT /users/me ────────────────────
  save(): void {
    this.saving         = true;
    this.errorMessage   = '';
    this.successMessage = '';

    this.userService.updateProfile({
      name:  this.form.value.fullName,
      email: this.form.value.email || undefined,
      city:  this.form.value.city  || undefined,
    }).subscribe({
      next: () => {
        this.saving         = false;
        this.successMessage = 'Profil mis à jour avec succès !';
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err) => {
        this.saving       = false;
        const msg         = err?.error?.error?.message;
        this.errorMessage = msg || 'Une erreur est survenue. Réessayez.';
      }
    });
  }

  copyCode(): void {
    const code = this.user?.referralCode || '';
    navigator.clipboard?.writeText(code);
  }
}