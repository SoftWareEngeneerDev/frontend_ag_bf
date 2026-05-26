import { Component, OnInit, OnDestroy, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject, takeUntil } from 'rxjs';
import { NavItem } from '../../../layout/sidebar/sidebar.component';
import { NotificationService } from '../../../core/services/notification.service';
import { AuthService } from '../../../core/services/auth.service';
import { SocketService } from '../../../core/services/socket.service';
import { environment } from '../../../../environments/environment';

const API = environment.apiUrl;

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
    .shell-wrap  { display:flex; min-height:100vh; background:var(--bg); }
    .shell-main  { margin-left:var(--sidebar-w); flex:1; min-height:100vh; overflow-x:hidden; display:flex; flex-direction:column; }
    .shell-content { padding:28px; flex:1; }
    @media (max-width:768px) {
      .shell-main    { margin-left:0; }
      .shell-content { padding:16px; }
    }
    @media (max-width:480px) {
      .shell-content { padding:12px; }
    }
  `]
})
export class MemberShellComponent implements OnInit, OnDestroy {
  title       = 'Mon Espace';
  sidebarOpen = false;
  private destroy$ = new Subject<void>();

  navItems: NavItem[] = [
    { route: '/member',               icon: 'fa-solid fa-house',       label: 'Tableau de bord', exact: true },
    { route: '/member/catalogue',     icon: 'fa-solid fa-store',       label: 'Catalogue',       badge: 0, badgeColor: '#10D98B' },
    { route: '/member/groups',        icon: 'fa-solid fa-layer-group', label: 'Mes Groupes',     badge: 0 },
    { route: '/member/payment',       icon: 'fa-solid fa-credit-card', label: 'Paiement' },
    { route: '/member/payments',      icon: 'fa-solid fa-clock-rotate-left', label: 'Historique paiements' },
    { route: '/member/orders',        icon: 'fa-solid fa-box',         label: 'Mes Commandes',   badge: 0 },
    { route: '/member/disputes',      icon: 'fa-solid fa-gavel',       label: 'Mes Litiges',     badge: 0, badgeColor: '#E63946' },
    { route: '/member/notifications', icon: 'fa-solid fa-bell',        label: 'Notifications',   badge: 0, badgeColor: '#FF4D6A' },
    { route: '/member/profile',       icon: 'fa-solid fa-gear',        label: 'Profil' },
  ];

  constructor(
    public  notifs : NotificationService,
    private http   : HttpClient,
    private auth   : AuthService,
    private socket : SocketService,
  ) {
    effect(() => {
      this.navItems[7].badge = this.notifs.unreadCount();
    });
  }

  ngOnInit(): void {
    this.loadBadges();
    this.socket.connect();
    this.socket.onNotification()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        // Incrémenter le badge notifications en temps réel
        const current = (this.navItems[7].badge as number) || 0;
        this.navItems[7].badge = current + 1;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.socket.disconnect();
  }

  private loadBadges(): void {
    // Badge catalogue — groupes disponibles
    this.http.get<any>(`${API}/groups`, { params: { limit: '100' } }).subscribe({
      next: (res) => {
        const open = (res.data ?? []).filter((g: any) =>
          ['OPEN', 'THRESHOLD_REACHED'].includes(g.status)
        ).length;
        this.navItems[1].badge = open || 0;
      },
      error: () => {}
    });

    // Badge mes groupes actifs
    this.http.get<any>(`${API}/users/me/groups`).subscribe({
      next: (res) => {
        const active = res.data?.active ?? [];
        this.navItems[2].badge = active.length || 0;
      },
      error: () => { this.navItems[2].badge = 0; }
    });

    // Badge commandes en cours
    this.http.get<any>(`${API}/orders/me`).subscribe({
      next: (res) => {
        const orders  = res.data ?? [];
        const pending = orders.filter((o: any) =>
          ['CREATED', 'PROCESSING', 'SHIPPED'].includes(o.status)
        ).length;
        this.navItems[5].badge      = pending;
        this.navItems[5].badgeColor = pending > 0 ? '#00D4FF' : undefined;
      },
      error: () => { this.navItems[5].badge = 0; }
    });

    // Badge litiges ouverts
    this.http.get<any>(`${API}/disputes/me`).subscribe({
      next: (res) => {
        const open = (res.data ?? []).filter((d: any) => d.status === 'OPEN').length;
        this.navItems[6].badge = open || 0;
      },
      error: () => { this.navItems[6].badge = 0; }
    });
  }
}