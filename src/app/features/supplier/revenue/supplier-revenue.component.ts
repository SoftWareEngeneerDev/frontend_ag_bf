import { Component } from '@angular/core';
import { MockDataService } from '../../../core/services/mock-data.service';

@Component({
  selector: 'app-supplier-revenue',
  templateUrl: './supplier-revenue.component.html',
  styleUrls:  ['./supplier-revenue.component.scss']
})
export class SupplierRevenueComponent {
  revData = this.mock.monthlyRevenue;
  get revMax(): number { return Math.max(...this.revData.map(r => r.revenue)); }

  kpis = [
    { icon:'💰', label:'Revenu ce mois',     val:'2 450 000 XOF', sub:'+12% vs mois dernier', color:'#10D98B' },
    { icon:'🏦', label:'En escrow (bloqué)', val:'650 000 XOF',   sub:'5 groupes actifs',     color:'#FFB347' },
    { icon:'✅', label:'Payé ce mois',       val:'1 800 000 XOF', sub:'3 groupes terminés',   color:'#F5A623' },
    { icon:'📊', label:'Commission plateforme',val:'171 500 XOF', sub:'7% du revenu total',   color:'#00D4FF' },
  ];

  transactions = [
    { date:'15 mars 2024', desc:'Paiement final — Groupe Samsung A55',    amount:1886000, type:'REÇU',    color:'#10D98B' },
    { date:'12 mars 2024', desc:'Paiement final — Groupe Climatiseur',     amount:780000,  type:'REÇU',    color:'#10D98B' },
    { date:'10 mars 2024', desc:'Commission plateforme — Samsung A55',     amount:-132020, type:'PRÉLEVÉ', color:'#FF4D6A' },
    { date:'08 mars 2024', desc:'Paiement final — Groupe TV 4K',           amount:1075000, type:'REÇU',    color:'#10D98B' },
    { date:'05 mars 2024', desc:'Commission plateforme — Clim + TV',       amount:-128450, type:'PRÉLEVÉ', color:'#FF4D6A' },
    { date:'01 mars 2024', desc:'Dépôts reçus — Groupe Riz Basmati',      amount:33000,   type:'DÉPÔT',   color:'#F5A623' },
  ];

  constructor(public mock: MockDataService) {}
}
