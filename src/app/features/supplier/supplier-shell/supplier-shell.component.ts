import { Component } from '@angular/core';
import { NavItem } from '../../../layout/sidebar/sidebar.component';

@Component({
  selector: 'app-supplier-shell',
  template: `
    <div class="shell-wrap">
      <app-sidebar [items]="navItems" userBg="linear-gradient(135deg,#00D4FF,#7B2FBE)"
                   [open]="sidebarOpen" (closeRequest)="sidebarOpen = false">
      </app-sidebar>
      <div class="shell-main">
        <app-topbar title="Espace Fournisseur" userBg="linear-gradient(135deg,#00D4FF,#7B2FBE)"
                    (menuToggle)="sidebarOpen = !sidebarOpen">
        </app-topbar>
        <div class="shell-content"><router-outlet></router-outlet></div>
      </div>
    </div>
  `,
  styles: [`
    .shell-wrap    { display:flex; }
    .shell-main    { margin-left:var(--sidebar-w); flex:1; min-height:100vh; overflow-x:hidden; }
    .shell-content { padding:28px; }
    @media (max-width:768px) {
      .shell-main    { margin-left:0; }
      .shell-content { padding:16px; }
    }
    @media (max-width:480px) {
      .shell-content { padding:12px; }
    }
  `]
})
export class SupplierShellComponent {
  sidebarOpen = false;
  navItems: NavItem[] = [
    { route:'/supplier',          icon:'fa-solid fa-gauge-high',    label:'Tableau de bord', exact:true },
    { route:'/supplier/products', icon:'fa-solid fa-box-open',      label:'Mes Produits' },
    { route:'/supplier/groups',   icon:'fa-solid fa-layer-group',   label:'Mes Groupes',     badge:5 },
    { route:'/supplier/orders',   icon:'fa-solid fa-cart-shopping', label:'Commandes',       badge:3, badgeColor:'#FF4D6A' },
    { route:'/supplier/revenue',  icon:'fa-solid fa-sack-dollar',   label:'Revenus' },
  ];
}
