import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MockDataService } from '../../../core/services/mock-data.service';

@Component({
  selector: 'app-supplier-dashboard',
  templateUrl: './supplier-dashboard.component.html',
  styleUrls:  ['./supplier-dashboard.component.scss']
})
export class SupplierDashboardComponent {

  kpis = [
    { icon:'fa-solid fa-box-open',       label:'Produits approuvés', val:'12',       sub:'3 en attente',    color:'#F4A902', bg:'#FFF8E1', trend:'+2',   up:true  },
    { icon:'fa-solid fa-users',          label:'Groupes actifs',     val:'5',        sub:'847 participants', color:'#00D4FF', bg:'#E0F9FF', trend:'+1',   up:true  },
    { icon:'fa-solid fa-triangle-exclamation', label:'Commandes urgentes', val:'3', sub:'Action requise',   color:'#FF4D6A', bg:'#FFE8EC', trend:'3',    up:false },
    { icon:'fa-solid fa-coins',          label:'Revenu ce mois',     val:'2.45M XOF',sub:'vs 2.18M fév.',  color:'#10D98B', bg:'#E8FDF2', trend:'+12%', up:true  },
  ];

  chartData   = [820, 1450, 980, 1820, 2100, 2450];
  chartMonths = ['Oct', 'Nov', 'Déc', 'Jan', 'Fév', 'Mar'];
  get chartMax(): number { return Math.max(...this.chartData); }

  groupStatus = [
    { label:'Actifs',       val:5, color:'#F4A902', pct:33 },
    { label:'Seuil atteint',val:2, color:'#00D4FF', pct:13 },
    { label:'En traitement',val:3, color:'#10D98B', pct:20 },
    { label:'Terminés',     val:8, color:'#7B2FBE', pct:53 },
  ];

  urgentOrders = [
    { group:'Groupe Samsung A55', product:'Samsung Galaxy A55',  participants:'10/10', amount:'1 886 000 XOF', status:'CRÉÉE',      statusColor:'#FF4D6A' },
    { group:'Groupe TV 4K',       product:'TV LED 55" 4K Ultra', participants:'5/5',   amount:'1 075 000 XOF', status:'CONFIRMÉE',  statusColor:'#F4A902' },
    { group:'Groupe Clim',        product:'Climatiseur 12000',   participants:'6/6',   amount:'780 000 XOF',   status:'PRÉPARATION',statusColor:'#00D4FF' },
  ];

  // Top produits
  topProducts = [
    { name:'Samsung Galaxy A55', groups:2, revenue:'1 886 000 XOF', rating:4.5, trend:'+8%'  },
    { name:'TV LED 55" 4K',      groups:1, revenue:'1 075 000 XOF', rating:4.8, trend:'+5%'  },
    { name:'Climatiseur 12000',  groups:2, revenue:'780 000 XOF',   rating:4.6, trend:'+12%' },
  ];

  stars(n: number): boolean[] { return [1,2,3,4,5].map(i => i <= Math.round(n)); }

  constructor(public mock: MockDataService, private router: Router) {}

  goProducts(): void { this.router.navigate(['/supplier/products']); }
  goGroups():   void { this.router.navigate(['/supplier/groups']); }
  goOrders():   void { this.router.navigate(['/supplier/orders']); }
  goRevenue():  void { this.router.navigate(['/supplier/revenue']); }
}
