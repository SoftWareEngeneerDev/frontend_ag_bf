import { Component } from '@angular/core';
import { NavItem } from '../../../layout/sidebar/sidebar.component';

@Component({
  selector: 'app-admin-shell',
  template: `
    <div class="shell-wrap">
      <app-sidebar [items]="navItems" userBg="linear-gradient(135deg,#E63946,#7B2FBE)"
                   [open]="sidebarOpen" (closeRequest)="sidebarOpen = false">
      </app-sidebar>
      <div class="shell-main">
        <div class="admin-alert">
          <i class="fa-solid fa-triangle-exclamation" style="font-size:16px"></i>
          <span><strong>7 litiges ouverts</strong> nécessitent votre attention immédiate</span>
          <a routerLink="/admin/disputes" class="btn-danger btn-sm btn-round" style="margin-left:auto">
            Traiter maintenant →
          </a>
        </div>
        <app-topbar title="Administration" userBg="linear-gradient(135deg,#E63946,#7B2FBE)"
                    (menuToggle)="sidebarOpen = !sidebarOpen">
        </app-topbar>
        <div class="shell-content"><router-outlet></router-outlet></div>
      </div>
    </div>
  `,
  styles: [`
    .shell-wrap    { display:flex; }
    .shell-main    { margin-left:var(--sidebar-w); flex:1; min-height:100vh; background:var(--bg); }
    .shell-content { padding:24px; }
    .admin-alert   { background:#FEF2F2; border-bottom:2px solid var(--red); padding:10px 28px; display:flex; align-items:center; gap:12px; font-size:13px; color:var(--red); flex-wrap:wrap; }
    @media (max-width:768px) {
      .shell-main    { margin-left:0; }
      .shell-content { padding:12px; }
      .admin-alert   { padding:10px 16px; }
    }
  `]
})
export class AdminShellComponent {
  sidebarOpen = false;
  navItems: NavItem[] = [
    { route:'/admin',           icon:'fa-solid fa-gauge-high',       label:"Vue d'ensemble",  exact:true },
    { route:'/admin/users',     icon:'fa-solid fa-users',            label:'Utilisateurs',    badge:'5 247' },
    { route:'/admin/suppliers', icon:'fa-solid fa-store',            label:'Fournisseurs',    badge:4,  badgeColor:'#F4A902' },
    { route:'/admin/products',  icon:'fa-solid fa-box',              label:'Produits',        badge:3,  badgeColor:'#F4A902' },
    { route:'/admin/groups',    icon:'fa-solid fa-layer-group',      label:'Groupes' },
    { separator:true, route:'', icon:'', label:'' },
    { route:'/admin/payments',  icon:'fa-solid fa-credit-card',      label:'Paiements' },
    { route:'/admin/disputes',  icon:'fa-solid fa-gavel',            label:'Litiges',         badge:7,  badgeColor:'#E63946' },
    { separator:true, route:'', icon:'', label:'' },
    { route:'/admin/analytics', icon:'fa-solid fa-chart-line',       label:'Analytics' },
    { route:'/admin/logs',      icon:'fa-solid fa-scroll',           label:'Logs système' },
  ];
}
