import { Component } from '@angular/core';
import { MockDataService } from '../../../core/services/mock-data.service';
import { FormatService }   from '../../../core/services/format.service';

@Component({
  selector: 'app-supplier-dashboard',
  templateUrl: './supplier-dashboard.component.html',
  styleUrls:  ['./supplier-dashboard.component.scss']
})
export class SupplierDashboardComponent {
  kpis = [
    { icon:'📦', label:'Produits approuvés', val:'12', sub:'3 en attente ⚠️', color:'#F5A623' },
    { icon:'👥', label:'Groupes actifs',     val:'5',  sub:'847 participants', color:'#00D4FF' },
    { icon:'🛒', label:'Commandes urgentes', val:'3',  sub:'Action requise',   color:'#FF4D6A' },
    { icon:'💰', label:'Revenu ce mois',     val:'2.45M XOF', sub:'+12% ↑',   color:'#10D98B' },
  ];

  chartData  = [820, 1450, 980, 1820, 2100, 2450];
  chartMonths = ['Oct','Nov','Déc','Jan','Fév','Mar'];
  get chartMax(): number { return Math.max(...this.chartData); }

  urgentOrders = [
    { group:'Groupe Samsung A55', product:'Samsung Galaxy A55', participants:'10/10', amount:'1 886 000 XOF', status:'CRÉÉE' },
    { group:'Groupe TV 4K',       product:'TV LED 55" 4K',      participants:'5/5',   amount:'1 075 000 XOF', status:'CONFIRMÉE' },
    { group:'Groupe Clim',        product:'Climatiseur 12000',  participants:'6/6',   amount:'780 000 XOF',   status:'PRÉPARATION' },
  ];

  statusClass(s: string): string {
    if (s === 'CRÉÉE') return 'badge-err';
    if (s === 'CONFIRMÉE') return 'badge-gold';
    return 'badge-cyan';
  }

  constructor(public mock: MockDataService, public fmt: FormatService) {}
}
