import { Component } from '@angular/core';

@Component({
  selector: 'app-admin-logs',
  templateUrl: './admin-logs.component.html',
  styleUrls:  ['./admin-logs.component.scss']
})
export class AdminLogsComponent {
  search    = '';
  activeTab = 'Tous';
  tabs      = ['Tous','Authentification','Paiements','Groupes','Système'];

  logs = [
    { time:'2024-03-15 14:32:18', user:'Aminata Admin',  action:'VALIDATION_FOURNISSEUR', entity:'Tech Ouaga SARL',     ip:'196.14.22.xx', level:'INFO',    module:'Fournisseur' },
    { time:'2024-03-15 14:18:05', user:'Aminata Admin',  action:'APPROBATION_PRODUIT',    entity:'Samsung Galaxy A55',  ip:'196.14.22.xx', level:'INFO',    module:'Produit' },
    { time:'2024-03-15 13:55:42', user:'System',         action:'REMBOURSEMENT_AUTO',     entity:'TXN-8847 · 8 500 XOF',ip:'—',           level:'INFO',    module:'Paiement' },
    { time:'2024-03-15 13:12:19', user:'Aminata Admin',  action:'SUSPENSION_UTILISATEUR', entity:'USR-0248',            ip:'196.14.22.xx', level:'WARN',    module:'Authentification' },
    { time:'2024-03-15 12:44:38', user:'System',         action:'FERMETURE_GROUPE',       entity:'GRP-0152 · Expiré',   ip:'—',           level:'INFO',    module:'Groupe' },
    { time:'2024-03-15 11:30:10', user:'Kofi Traoré',    action:'LOGIN',                  entity:'+22676528609',         ip:'41.207.xx.xx', level:'INFO',    module:'Authentification' },
    { time:'2024-03-15 10:55:07', user:'System',         action:'EXPIRATION_OTP',         entity:'OTP-8821',            ip:'—',           level:'WARN',    module:'Authentification' },
    { time:'2024-03-15 09:20:44', user:'Ibrahim Ouédr.', action:'CREATION_GROUPE',        entity:'GRP-0201 · Samsung',  ip:'41.207.xx.xx', level:'INFO',    module:'Groupe' },
    { time:'2024-03-15 08:01:33', user:'System',         action:'CRON_EXPIRATION',        entity:'3 groupes expirés',   ip:'—',           level:'INFO',    module:'Système' },
    { time:'2024-03-14 23:45:12', user:'System',         action:'BACKUP_DB',              entity:'achatgrouper_db',     ip:'—',           level:'INFO',    module:'Système' },
  ];

  get filtered() {
    return this.logs.filter(l => {
      const matchSearch = !this.search || l.action.includes(this.search.toUpperCase()) || l.user.toLowerCase().includes(this.search.toLowerCase()) || l.entity.toLowerCase().includes(this.search.toLowerCase());
      const matchTab = this.activeTab === 'Tous' || l.module === this.activeTab;
      return matchSearch && matchTab;
    });
  }

  levelClass(l: string): string {
    return l === 'INFO' ? 'badge-ok' : l === 'WARN' ? 'badge-warn' : 'badge-err';
  }
}
