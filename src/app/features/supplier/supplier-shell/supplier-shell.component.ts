import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, catchError, of } from 'rxjs';
import { NavItem } from '../../../layout/sidebar/sidebar.component';

const API = 'http://localhost:3000/api/v1';

@Component({
  selector: 'app-supplier-shell',
  template: `
    <div class="shell-wrap">
      <app-sidebar
        [items]="navItems"
        userBg="linear-gradient(135deg,#00D4FF,#7B2FBE)"
        [open]="sidebarOpen"
        (closeRequest)="sidebarOpen = false">
      </app-sidebar>
      <div class="shell-main">
        <app-topbar
          title="Espace Fournisseur"
          userBg="linear-gradient(135deg,#00D4FF,#7B2FBE)"
          (menuToggle)="sidebarOpen = !sidebarOpen">
        </app-topbar>
        <div class="shell-content">
          <router-outlet></router-outlet>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .shell-wrap {
      display: flex;
      min-height: 100vh;
      background: var(--bg);
    }
    .shell-main {
      margin-left: var(--sidebar-w);
      flex: 1;
      min-height: 100vh;
      overflow-x: hidden;
      display: flex;
      flex-direction: column;
    }
    .shell-content {
      padding: 28px;
      flex: 1;
    }
    @media (max-width: 768px) {
      .shell-main    { margin-left: 0; }
      .shell-content { padding: 16px; }
    }
    @media (max-width: 480px) {
      .shell-content { padding: 12px; }
    }
  `]
})
export class SupplierShellComponent implements OnInit {
  sidebarOpen = false;

  navItems: NavItem[] = [
    { route: '/supplier',          icon: 'fa-solid fa-gauge-high',    label: 'Tableau de bord', exact: true },
    { route: '/supplier/products', icon: 'fa-solid fa-box-open',      label: 'Mes Produits',    badge: 0 },
    { route: '/supplier/groups',   icon: 'fa-solid fa-layer-group',   label: 'Mes Groupes',     badge: 0 },
    { route: '/supplier/orders',   icon: 'fa-solid fa-cart-shopping', label: 'Commandes',       badge: 0, badgeColor: '#FF4D6A' },
    { route: '/supplier/revenue',  icon: 'fa-solid fa-sack-dollar',   label: 'Revenus' },
  ];

  constructor(private http: HttpClient) {}

  ngOnInit(): void { this.loadBadges(); }

  private loadBadges(): void {
    forkJoin({
      groups  : this.http.get<any>(`${API}/supplier/groups`,   { params: { limit: '100' } }).pipe(catchError(() => of(null))),
      orders  : this.http.get<any>(`${API}/supplier/orders`,   { params: { limit: '100' } }).pipe(catchError(() => of(null))),
      products: this.http.get<any>(`${API}/supplier/products`, { params: { status: 'PENDING_APPROVAL' } }).pipe(catchError(() => of(null))),
    }).subscribe(({ groups, orders, products }) => {

      // Badge groupes actifs
      const groupList = groups?.data ?? [];
      this.navItems[2].badge = groupList.filter((g: any) =>
        ['OPEN', 'THRESHOLD_REACHED'].includes(g.status)
      ).length || 0;

      // Badge commandes urgentes
      const orderList = orders?.data ?? [];
      const urgent = orderList.filter((o: any) =>
        ['CREATED', 'CONFIRMED'].includes(o.status)
      ).length;
      this.navItems[3].badge      = urgent;
      this.navItems[3].badgeColor = urgent > 0 ? '#FF4D6A' : undefined;

      // Badge produits en attente de validation admin
      const productList = products?.data ?? [];
      this.navItems[1].badge = productList.length || 0;
    });
  }
}