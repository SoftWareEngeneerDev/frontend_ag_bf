import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  templateUrl: './member-profile.component.html',
  styleUrls:  ['./member-profile.component.scss']
})
export class ProfileComponent {
  activeTab = 'infos';
  saving = false;

  tabs = [
    { key:'infos',         icon:'fa-solid fa-user',        label:'Infos' },
    { key:'securite',      icon:'fa-solid fa-shield-halved',label:'Sécurité' },
    { key:'notifications', icon:'fa-solid fa-bell',         label:'Notifications' },
    { key:'parrainage',    icon:'fa-solid fa-gift',         label:'Parrainage' },
  ];

  form: FormGroup;

  notifSettings = [
    { key:'newMember',  label:'Nouveaux membres',   desc:'Quand un groupe progresse',    on:true  },
    { key:'threshold',  label:'Seuil atteint',       desc:'Quand le seuil est atteint',   on:true  },
    { key:'payment',    label:'Rappels paiement',    desc:'Ne manquez pas les délais',    on:true  },
    { key:'delivery',   label:'Mises à jour livraison',desc:'Statut de vos commandes',   on:true  },
    { key:'promo',      label:'Promotions',          desc:'Nouveaux groupes intéressants',on:false },
  ];

  constructor(public auth: AuthService, private fb: FormBuilder) {
    const u = auth.currentUser();
    this.form = this.fb.group({
      fullName: [u?.fullName || ''],
      email:    [u?.email    || ''],
      phone:    [u?.phone    || ''],
      city:     [u?.city     || ''],
    });
  }

  get user() { return this.auth.currentUser(); }
  toggleNotif(item: any): void { item.on = !item.on; }

  save(): void {
    this.saving = true;
    setTimeout(() => { this.saving = false; }, 1200);
  }

  copyCode(): void {
    const code = this.user?.referralCode || '';
    navigator.clipboard?.writeText(code);
  }
}
