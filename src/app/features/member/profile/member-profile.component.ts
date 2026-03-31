import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-profile',
  templateUrl: './member-profile.component.html',
  styleUrls:  ['./member-profile.component.scss']
})
export class ProfileComponent implements OnInit {
  activeTab = 'infos';
  saving    = false;
  errorMessage = '';
  successMessage = '';

  tabs = [
    { key: 'infos',         icon: 'fa-solid fa-user',         label: 'Infos' },
    { key: 'securite',      icon: 'fa-solid fa-shield-halved', label: 'Sécurité' },
    { key: 'notifications', icon: 'fa-solid fa-bell',          label: 'Notifications' },
    { key: 'parrainage',    icon: 'fa-solid fa-gift',          label: 'Parrainage' },
  ];

  form: FormGroup;

  notifSettings = [
    { key: 'notifPush',  label: 'Nouveaux membres',        desc: 'Quand un groupe progresse',     on: true  },
    { key: 'notifSMS',   label: 'Seuil atteint',           desc: 'Quand le seuil est atteint',    on: true  },
    { key: 'notifEmail', label: 'Rappels paiement',        desc: 'Ne manquez pas les délais',     on: true  },
    { key: 'delivery',   label: 'Mises à jour livraison',  desc: 'Statut de vos commandes',       on: true  },
    { key: 'promo',      label: 'Promotions',              desc: 'Nouveaux groupes intéressants', on: false },
  ];

  constructor(
    public auth: AuthService,
    private userService: UserService,
    private fb: FormBuilder,
  ) {
    const u = auth.currentUser();
    this.form = this.fb.group({
      fullName: [u?.fullName || ''],
      email:    [u?.email    || ''],
      phone:    [u?.phone    || ''],
      city:     [u?.city     || ''],
    });
  }

  // ── Charger le profil depuis le backend au démarrage ──────────
  ngOnInit(): void {
    this.userService.getProfile().subscribe({
      next: (user) => {
        // Mettre à jour le formulaire avec les vraies données
        this.form.patchValue({
          fullName: user.fullName,
          email:    user.email    || '',
          phone:    user.phone    || '',
          city:     user.city     || '',
        });
      },
      error: () => {} // Garde les données du signal auth en cas d'erreur
    });
  }

  get user() { return this.auth.currentUser(); }

  toggleNotif(item: any): void { item.on = !item.on; }

  // ── Sauvegarder le profil → PUT /users/me ────────────────────
  save(): void {
    this.saving       = true;
    this.errorMessage   = '';
    this.successMessage = '';

    this.userService.updateProfile({
      name:  this.form.value.fullName,  // front: fullName → backend: name
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

  // ── Copier le code de parrainage ─────────────────────────────
  copyCode(): void {
    const code = this.user?.referralCode || '';
    navigator.clipboard?.writeText(code);
  }
}