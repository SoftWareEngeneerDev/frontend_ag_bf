import { Component } from '@angular/core';
import { MockDataService } from '../../../core/services/mock-data.service';
import { FormatService }   from '../../../core/services/format.service';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls:  ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent {
  stats = this.mock.platformStats;
  revData = this.mock.monthlyRevenue;
  get revMax(): number { return Math.max(...this.revData.map(r => r.revenue)); }

  kpis = [
    { icon:'👥', label:'Membres actifs',   val:'5 247', sub:"+23 aujourd'hui", color:'#00D4FF' },
    { icon:'🔥', label:'Groupes actifs',   val:'43',    sub:'8 seuil atteint',  color:'#F5A623' },
    { icon:'✅', label:'Taux de succès',   val:'89%',   sub:'Ce mois',          color:'#10D98B' },
    { icon:'💰', label:'Commission mars',  val:'3.24M', sub:'+18% vs fév.',     color:'#F5A623' },
    { icon:'🔒', label:'En escrow',        val:'1.25M', sub:'12 groupes',       color:'#FFB347' },
    { icon:'⚖️', label:'Litiges ouverts', val:'7',     sub:'3 urgents',        color:'#FF4D6A' },
  ];

  pending = [
    { title:'🏪 Fournisseurs en attente', badge:4, color:'#FFB347', route:'/admin/suppliers',
      items:['Sahel Tech SARL · 2j','Agri Plus BF · 1j','Mode Africaine · 4j','Solar Energy BF · 5j'], act:'Valider' },
    { title:'📦 Produits à approuver',    badge:3, color:'#F5A623', route:'/admin/products',
      items:['iPhone 15 Pro — Tech Ouaga · 1j','Panneaux 400W — Solar BF · 2j','Bogolan Premium · 3j'], act:'Approuver' },
    { title:'⚖️ Litiges non traités',    badge:7, color:'#FF4D6A', route:'/admin/disputes',
      items:['Produit non reçu — Kofi T. · 3j','Qualité défaillante — Moussa B. · 5j','Remboursement refusé · 7j'], act:'Traiter' },
  ];

  auditLog = [
    { time:'14:32:18', user:'A. Traoré', action:'VALIDATION',  entity:'Fournisseur · Tech Ouaga SARL' },
    { time:'14:18:05', user:'A. Traoré', action:'APPROBATION', entity:'Produit · Samsung Galaxy A55' },
    { time:'13:55:42', user:'S. Admin',  action:'REMBOURSEMENT',entity:'Paiement · TXN-8847 · 8 500 XOF' },
    { time:'13:12:19', user:'A. Traoré', action:'SUSPENSION',  entity:'Utilisateur · ID: USR-0248' },
    { time:'12:44:38', user:'S. Admin',  action:'FERMETURE',   entity:'Groupe · ID: GRP-0152 · Expiré' },
  ];

  actionClass(a: string): string {
    if (['SUSPENSION','FERMETURE','REJET'].includes(a)) return 'badge-err';
    if (a === 'REMBOURSEMENT') return 'badge-gold';
    return 'badge-ok';
  }

  constructor(public mock: MockDataService, public fmt: FormatService) {}
}
