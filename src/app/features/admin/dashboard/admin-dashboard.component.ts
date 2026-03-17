import { Component } from '@angular/core';
import { MockDataService } from '../../../core/services/mock-data.service';
import { FormatService }   from '../../../core/services/format.service';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls:  ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent {
  stats   = this.mock.platformStats;
  revData = this.mock.monthlyRevenue;
  get revMax(): number { return Math.max(...this.revData.map(r => r.revenue)); }

  // ── Barre de santé ────────────────────────────────────────────────
  statusMetrics = [
    { label:'Escrow',          val:'1.25M XOF', color:'#F4A902' },
    { label:'Groupes actifs',  val:'43',        color:'#0DA487' },
    { label:'Taux de succès',  val:'89%',       color:'#10D98B' },
    { label:'Litiges ouverts', val:'7',         color:'#FF4D6A' },
  ];

  // ── KPIs (6 cartes) ──────────────────────────────────────────────
  kpis = [
    { icon:'fa-solid fa-users',          label:'Membres actifs',  val:'5 247',  sub:"+23 aujourd'hui", color:'#00D4FF', bg:'#E0F9FF', up:true,  alert:false },
    { icon:'fa-solid fa-fire',           label:'Groupes actifs',  val:'43',     sub:'8 seuil atteint', color:'#F4A902', bg:'#FFF8E1', up:true,  alert:false },
    { icon:'fa-solid fa-circle-check',   label:'Taux de succès',  val:'89%',    sub:'Ce mois',         color:'#10D98B', bg:'#E8FDF2', up:true,  alert:false },
    { icon:'fa-solid fa-coins',          label:'Commission mars',  val:'3.24M',  sub:'+18% vs fév.',    color:'#F4A902', bg:'#FFF8E1', up:true,  alert:false },
    { icon:'fa-solid fa-vault',          label:'En escrow',        val:'1.25M',  sub:'12 groupes',      color:'#FFB347', bg:'#FFF4E5', up:false, alert:false },
    { icon:'fa-solid fa-gavel',          label:'Litiges ouverts',  val:'7',      sub:'3 urgents',       color:'#FF4D6A', bg:'#FFE8EC', up:false, alert:true  },
  ];

  // ── Méthodes de paiement ─────────────────────────────────────────
  paymentMethods = [
    { icon:'fa-solid fa-mobile-screen-button', label:'Orange Money',  pct:48, amount:'1.56M XOF', color:'#FF6B00' },
    { icon:'fa-solid fa-mobile-screen-button', label:'Moov Money',    pct:30, amount:'972K XOF',   color:'#0057B8' },
    { icon:'fa-solid fa-circle-dollar-to-slot',label:'Ligdicash',     pct:14, amount:'454K XOF',   color:'#00A651' },
    { icon:'fa-solid fa-credit-card',          label:'Carte bancaire', pct:8,  amount:'259K XOF',   color:'#7B2FBE' },
  ];

  // ── Actions prioritaires ─────────────────────────────────────────
  pending = [
    {
      title:'Fournisseurs', faIcon:'fa-solid fa-store', badge:4,
      color:'#FFB347', route:'/admin/suppliers', act:'Valider',
      items:[
        { name:'Sahel Tech SARL',      delay:'En attente depuis 2j' },
        { name:'Agri Plus BF',         delay:'En attente depuis 1j' },
        { name:'Mode Africaine',        delay:'En attente depuis 4j' },
        { name:'Solar Energy BF',       delay:'En attente depuis 5j' },
      ],
    },
    {
      title:'Produits', faIcon:'fa-solid fa-box', badge:3,
      color:'#F4A902', route:'/admin/products', act:'Approuver',
      items:[
        { name:'iPhone 15 Pro — Tech Ouaga',  delay:'Soumis il y a 1j' },
        { name:'Panneaux 400W — Solar BF',     delay:'Soumis il y a 2j' },
        { name:'Bogolan Premium — Mode Sav.',  delay:'Soumis il y a 3j' },
      ],
    },
    {
      title:'Litiges', faIcon:'fa-solid fa-gavel', badge:7,
      color:'#FF4D6A', route:'/admin/disputes', act:'Traiter',
      items:[
        { name:'Produit non reçu — Kofi T.',       delay:'Ouvert depuis 3j' },
        { name:'Qualité défaillante — Moussa B.',   delay:'Ouvert depuis 5j' },
        { name:'Remboursement refusé — Fatima C.',  delay:'Ouvert depuis 7j' },
      ],
    },
  ];

  // ── Journal d'audit ──────────────────────────────────────────────
  auditLog = [
    { time:'14:32:18', user:'A. Traoré', action:'VALIDATION',    entity:'Fournisseur · Tech Ouaga SARL' },
    { time:'14:18:05', user:'A. Traoré', action:'APPROBATION',   entity:'Produit · Samsung Galaxy A55' },
    { time:'13:55:42', user:'S. Admin',  action:'REMBOURSEMENT', entity:'Paiement · TXN-8847 · 8 500 XOF' },
    { time:'13:12:19', user:'A. Traoré', action:'SUSPENSION',    entity:'Utilisateur · USR-0248' },
    { time:'12:44:38', user:'S. Admin',  action:'FERMETURE',     entity:'Groupe · GRP-0152 · Expiré' },
  ];

  actionIcon(a: string): string {
    if (['SUSPENSION','FERMETURE','REJET'].includes(a)) return 'fa-solid fa-ban';
    if (a === 'REMBOURSEMENT') return 'fa-solid fa-rotate-left';
    if (a === 'APPROBATION')   return 'fa-solid fa-circle-check';
    return 'fa-solid fa-shield-check';
  }

  actionColor(a: string): string {
    if (['SUSPENSION','FERMETURE','REJET'].includes(a)) return '#FF4D6A';
    if (a === 'REMBOURSEMENT') return '#F4A902';
    return '#0DA487';
  }

  actionBg(a: string): string { return this.actionColor(a) + '18'; }

  actionIconClass(_a: string): string { return ''; }

  constructor(public mock: MockDataService, public fmt: FormatService) {}
}
