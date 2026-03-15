import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  templateUrl: './member-profile.component.html',
  styleUrls:  ['./member-profile.component.scss']
})
export class ProfileComponent {
  activeTab = 'Infos';
  tabs = ['Infos', 'Sécurité', 'Notifications', 'Parrainage'];

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
  save(): void { console.log('save', this.form.value); }
}
