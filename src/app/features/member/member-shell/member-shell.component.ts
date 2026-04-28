import { Component, OnInit, OnDestroy, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NavItem } from '../../../layout/sidebar/sidebar.component';
import { NotificationService } from '../../../core/services/notification.service';
import { AuthService } from '../../../core/services/auth.service';

const API = 'http://localhost:3000/api/v1';

@Component({
  selector: 'app-member-shell',
  template: `
    <div class="shell-wrap">
      <app-sidebar
        [items]="navItems"
        userBg="#F5A623"
        [open]="sidebarOpen"
        (closeRequest)="sidebarOpen = false">
      </app-sidebar>

      <div class="shell-main">
        <app-topbar
          [title]="title"
          userBg="#F5A623"
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
export class MemberShellComponent implements OnInit {
  title       = 'Mon Espace';
  sidebarOpen = false;

  navItems: NavItem[] = [
    { route: '/member',               icon: 'fa-solid fa-house',       label: 'Tableau de bord', exact: true },
    { route: '/member/groups',        icon: 'fa-solid fa-layer-group', label: 'Mes Groupes',     badge: 0 },
    { route: '/member/payment',       icon: 'fa-solid fa-credit-card', label: 'Paiement' },
    { route: '/member/orders',        icon: 'fa-solid fa-box',         label: 'Mes Commandes',   badge: 0 },
    { route: '/member/notifications', icon: 'fa-solid fa-bell',        label: 'Notifications',   badge: 0, badgeColor: '#FF4D6A' },
    { route: '/member/profile',       icon: 'fa-solid fa-gear',        label: 'Profil' },
  ];

  constructor(
    public  notifs: NotificationService,
    private http:   HttpClient,
    private auth:   AuthService,
  ) {
    // ── Sync badge notifications en temps réel via signal ──────
    effect(() => {
      this.navItems[4].badge = this.notifs.unreadCount();
    });
  }

  ngOnInit(): void {
    this.loadBadges();
  }

  private loadBadges(): void {
    // ── Badge groupes actifs ───────────────────────────────────
    this.http.get<any>(`${API}/users/me/groups`).subscribe({
      next: (res) => {
        const active = res.data?.active ?? [];
        this.navItems[1].badge = active.length || 0;
      },
      error: () => { this.navItems[1].badge = 0; }
    });

    // ── Badge commandes en cours ───────────────────────────────
    this.http.get<any>(`${API}/orders/me`).subscribe({
      next: (res) => {
        const orders  = res.data ?? [];
        const pending = orders.filter((o: any) =>
          ['CREATED', 'CONFIRMED', 'PROCESSING', 'SHIPPED'].includes(o.status)
        ).length;
        this.navItems[3].badge      = pending;
        this.navItems[3].badgeColor = pending > 0 ? '#00D4FF' : undefined;
      },
      error: () => { this.navItems[3].badge = 0; }
    });
  }
}