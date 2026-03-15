import { Component } from '@angular/core';
import { NavItem } from '../../../layout/sidebar/sidebar.component';

@Component({
  selector: 'app-admin-shell',
  template: `
    <div class="shell-wrap">
      <app-sidebar [items]="navItems" userBg="linear-gradient(135deg,#E63946,#7B2FBE)"></app-sidebar>
      <div class="shell-main">
        <div class="admin-alert">
          <span style="font-size:16px">⚠️</span>
          <span><strong>7 litiges ouverts</strong> nécessitent votre attention immédiate</span>
          <a routerLink="/admin/disputes" class="btn-danger btn-sm btn-round" style="margin-left:auto">
            Traiter maintenant →
          </a>
        </div>
        <app-topbar title="Administration" userBg="linear-gradient(135deg,#E63946,#7B2FBE)"></app-topbar>
        <div class="shell-content"><router-outlet></router-outlet></div>
      </div>
    </div>
  `,
  styles: [
    '.shell-wrap{display:flex}',
    '.shell-main{margin-left:var(--sidebar-w);flex:1;min-height:100vh;background:var(--bg)}',
    '.shell-content{padding:24px}',
    '.admin-alert{background:#FEF2F2;border-bottom:2px solid var(--red);padding:10px 28px;display:flex;align-items:center;gap:12px;font-size:13px;color:var(--red)}'
  ]
})
export class AdminShellComponent {
  navItems: NavItem[] = [
    { route:'/admin',           icon:'📊', label:"Vue d'ensemble" },
    { route:'/admin/users',     icon:'👥', label:'Utilisateurs',    badge:'5 247' },
    { route:'/admin/suppliers', icon:'🏪', label:'Fournisseurs',    badge:4, badgeColor:'#F4A902' },
    { route:'/admin/products',  icon:'📦', label:'Produits',        badge:3, badgeColor:'#F4A902' },
    { route:'/admin/groups',    icon:'🔗', label:'Groupes' },
    { separator:true, route:'', icon:'', label:'' },
    { route:'/admin/payments',  icon:'💳', label:'Paiements' },
    { route:'/admin/disputes',  icon:'⚖️', label:'Litiges', badge:7, badgeColor:'#E63946' },
    { separator:true, route:'', icon:'', label:'' },
    { route:'/admin/analytics', icon:'📈', label:'Analytics' },
    { route:'/admin/logs',      icon:'🔍', label:'Logs système' },
  ];
}
