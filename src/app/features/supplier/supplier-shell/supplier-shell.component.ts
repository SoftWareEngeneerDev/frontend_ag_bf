import { Component } from '@angular/core';
import { NavItem } from '../../../layout/sidebar/sidebar.component';

@Component({
  selector: 'app-supplier-shell',
  template: `
    <div class="shell-wrap">
      <app-sidebar [items]="navItems" userBg="linear-gradient(135deg,#00D4FF,#7B2FBE)"></app-sidebar>
      <div class="shell-main">
        <app-topbar title="Espace Fournisseur" userBg="linear-gradient(135deg,#00D4FF,#7B2FBE)"></app-topbar>
        <div class="shell-content"><router-outlet></router-outlet></div>
      </div>
    </div>
  `,
  styles: ['.shell-wrap{display:flex} .shell-main{margin-left:var(--sidebar-w);flex:1;min-height:100vh} .shell-content{padding:28px}']
})
export class SupplierShellComponent {
  navItems: NavItem[] = [
    { route:'/supplier',          icon:'📊', label:'Tableau de bord' },
    { route:'/supplier/products', icon:'📦', label:'Mes Produits' },
    { route:'/supplier/groups',   icon:'👥', label:'Mes Groupes',   badge:5 },
    { route:'/supplier/orders',   icon:'🛒', label:'Commandes',     badge:3, badgeColor:'#FF4D6A' },
    { route:'/supplier/revenue',  icon:'💰', label:'Revenus' },
  ];
}
