import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NavItem } from '../../../layout/sidebar/sidebar.component';

const API = 'http://localhost:3000/api/v1';

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
export class SupplierShellComponent implements OnInit {
  sidebarOpen = false;

  navItems: NavItem[] = [
    { route: '/supplier',          icon: 'fa-solid fa-gauge-high',    label: 'Tableau de bord', exact: true },
    { route: '/supplier/products', icon: 'fa-solid fa-box-open',      label: 'Mes Produits' },
    { route: '/supplier/groups',   icon: 'fa-solid fa-layer-group',   label: 'Mes Groupes',   badge: 0 },
    { route: '/supplier/orders',   icon: 'fa-solid fa-cart-shopping', label: 'Commandes',     badge: 0, badgeColor: '#FF4D6A' },
    { route: '/supplier/revenue',  icon: 'fa-solid fa-sack-dollar',   label: 'Revenus' },
  ];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadBadges();
  }

  private loadBadges(): void {
    // ── Groupes actifs → badge Mes Groupes ───────────────────
    this.http.get<any>(`${API}/supplier/groups`, { params: { limit: 100 } }).subscribe({
      next: (res) => {
        const groups = res.data?.groups ?? res.data ?? [];
        const active = groups.filter((g: any) =>
          g.status === 'OPEN' || g.status === 'THRESHOLD_REACHED'
        ).length;
        this.navItems[2].badge = active;
      },
      error: () => {}
    });

    // ── Commandes urgentes → badge Commandes ─────────────────
    this.http.get<any>(`${API}/supplier/orders`, { params: { limit: 100 } }).subscribe({
      next: (res) => {
        const orders  = res.data?.orders ?? res.data ?? [];
        const urgent  = orders.filter((o: any) =>
          o.status === 'CREATED' || o.status === 'CONFIRMED'
        ).length;
        this.navItems[3].badge = urgent;
      },
      error: () => {}
    });
  }
}