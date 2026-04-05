import { Component, OnInit } from '@angular/core';
import { NavItem } from '../../../layout/sidebar/sidebar.component';
import { AdminService } from '../../../core/services/admin.service';

@Component({
  selector: 'app-admin-shell',
  template: `
    <div class="shell-wrap">
      <app-sidebar [items]="navItems" userBg="linear-gradient(135deg,#E63946,#7B2FBE)"
                   [open]="sidebarOpen" (closeRequest)="sidebarOpen = false">
      </app-sidebar>
      <div class="shell-main">
        <div class="admin-alert" *ngIf="openDisputes > 0">
          <i class="fa-solid fa-triangle-exclamation" style="font-size:16px"></i>
          <span><strong>{{ openDisputes }} litige(s) ouvert(s)</strong> nécessitent votre attention immédiate</span>
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
    .shell-main    { margin-left:var(--sidebar-w); flex:1; min-height:100vh; background:var(--bg); overflow-x:hidden; }
    .shell-content { padding:24px; }
    .admin-alert   { background:#FEF2F2; border-bottom:2px solid var(--red); padding:10px 28px; display:flex; align-items:center; gap:12px; font-size:13px; color:var(--red); flex-wrap:wrap; }
    @media (max-width:768px) {
      .shell-main    { margin-left:0; }
      .shell-content { padding:16px; }
      .admin-alert   { padding:10px 16px; font-size:12px; }
    }
    @media (max-width:480px) {
      .shell-content { padding:12px; }
      .admin-alert   { flex-direction:column; align-items:flex-start; gap:8px; }
      .admin-alert a { width:100%; text-align:center; }
    }
  `]
})
export class AdminShellComponent implements OnInit {
  sidebarOpen  = false;
  openDisputes = 0;

  navItems: NavItem[] = [
    { route: '/admin',           icon: 'fa-solid fa-gauge-high',   label: "Vue d'ensemble", exact: true },
    { route: '/admin/users',     icon: 'fa-solid fa-users',        label: 'Utilisateurs',   badge: '' },
    { route: '/admin/suppliers', icon: 'fa-solid fa-store',        label: 'Fournisseurs',   badge: 0,  badgeColor: '#F4A902' },
    { route: '/admin/products',  icon: 'fa-solid fa-box',          label: 'Produits',       badge: 0,  badgeColor: '#F4A902' },
    { route: '/admin/groups',    icon: 'fa-solid fa-layer-group',  label: 'Groupes' },
    { separator: true, route: '', icon: '', label: '' },
    { route: '/admin/payments',  icon: 'fa-solid fa-credit-card',  label: 'Paiements' },
    { route: '/admin/disputes',  icon: 'fa-solid fa-gavel',        label: 'Litiges',        badge: 0,  badgeColor: '#E63946' },
    { separator: true, route: '', icon: '', label: '' },
    { route: '/admin/analytics', icon: 'fa-solid fa-chart-line',   label: 'Analytics' },
    { route: '/admin/logs',      icon: 'fa-solid fa-scroll',       label: 'Logs système' },
  ];

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    // ── Charger les badges dynamiques depuis le dashboard ──────
    this.adminService.getDashboard().subscribe({
      next: (data) => {
        if (!data) return;

        // Membres actifs
        this.navItems[1].badge = (data.totalMembers ?? 0).toLocaleString('fr-FR');

        // Fournisseurs en attente
        this.navItems[2].badge = data.pendingSuppliers ?? 0;

        // Produits en attente
        this.navItems[3].badge = data.pendingProducts ?? 0;

        // Litiges ouverts
        this.navItems[6].badge = data.openDisputes ?? 0;
        this.openDisputes       = data.openDisputes ?? 0;
      },
      error: () => {}
    });
  }
}