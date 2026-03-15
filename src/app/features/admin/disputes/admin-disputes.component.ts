import { Component } from '@angular/core';
import { MockDataService } from '../../../core/services/mock-data.service';

@Component({
  selector: 'app-admin-disputes',
  templateUrl: './admin-disputes.component.html',
  styleUrls:  ['./admin-disputes.component.scss']
})
export class AdminDisputesComponent {
  activeTab = 'Tous';
  tabs = ['Tous','Ouverts','En cours','Résolus'];

  disputes = [
    { id:'DIS-001', reporter:'Kofi Traoré',     product:'TV LED 55" 4K',         reason:'Produit non reçu',    status:'OPEN',        date:'12 mars 2024', amount:215000, urgent:true },
    { id:'DIS-002', reporter:'Aminata Sawadogo',product:'Riz Basmati 50kg',       reason:'Qualité non conforme',status:'IN_PROGRESS',  date:'10 mars 2024', amount:16500,  urgent:false },
    { id:'DIS-003', reporter:'Moussa Traoré',   product:'Samsung Galaxy A55',     reason:'Remboursement refusé',status:'OPEN',         date:'9 mars 2024',  amount:18860,  urgent:true },
    { id:'DIS-004', reporter:'Fatou Compaoré',  product:'Climatiseur 12000 BTU',  reason:'Produit endommagé',   status:'IN_PROGRESS',  date:'7 mars 2024',  amount:130000, urgent:false },
    { id:'DIS-005', reporter:'Ibrahim Kaboré',  product:'Ensemble Bogolan',       reason:'Mauvaise taille',     status:'RESOLVED',     date:'2 mars 2024',  amount:25000,  urgent:false },
    { id:'DIS-006', reporter:'Salimata Ouéd.', product:'Kit Panneaux Solaires',  reason:'Livraison incomplète',status:'OPEN',         date:'1 mars 2024',  amount:170000, urgent:true },
    { id:'DIS-007', reporter:'Adama Sawadogo',  product:'Cuisinière à Gaz 4 Feux',reason:'Produit non reçu',   status:'OPEN',         date:'28 fév. 2024', amount:66500,  urgent:true },
  ];

  get openCount():   number { return this.disputes.filter(d => d.status === 'OPEN').length; }
  get urgentCount(): number { return this.disputes.filter(d => d.urgent).length; }

  get filtered() {
    const map: Record<string,string> = { 'Ouverts':'OPEN','En cours':'IN_PROGRESS','Résolus':'RESOLVED' };
    return this.activeTab === 'Tous' ? this.disputes : this.disputes.filter(d => d.status === map[this.activeTab]);
  }

  statusClass(s: string): string {
    return s === 'OPEN' ? 'badge-err' : s === 'IN_PROGRESS' ? 'badge-warn' : 'badge-ok';
  }
  statusLabel(s: string): string {
    return s === 'OPEN' ? '🔴 Ouvert' : s === 'IN_PROGRESS' ? '🟡 En cours' : '🟢 Résolu';
  }

  constructor(public mock: MockDataService) {}
}
