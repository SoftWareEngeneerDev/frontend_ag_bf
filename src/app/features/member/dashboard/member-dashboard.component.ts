import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GroupService }        from '../../../core/services/group.service';
import { OrderService }        from '../../../core/services/order.service';
import { NotificationService } from '../../../core/services/notification.service';
import { AuthService }         from '../../../core/services/auth.service';
import { FormatService }       from '../../../core/services/format.service';
import { Group, Order, Notification, NotifType } from '../../../core/models';

@Component({
  selector: 'app-member-dashboard',
  templateUrl: './member-dashboard.component.html',
  styleUrls:  ['./member-dashboard.component.scss']
})
export class MemberDashboardComponent implements OnInit {
  myGroups:  Group[]        = [];
  orders:    Order[]        = [];
  loading    = true;

  kpis = [
    { icon: 'fa-solid fa-users',      label: 'Groupes actifs',     val: '0',       sub: '',              color: '#0DA487', bg: '#E6FAF5' },
    { icon: 'fa-solid fa-piggy-bank', label: 'Total économisé',    val: '0 XOF',   sub: '',              color: '#10D98B', bg: '#E8FDF2' },
    { icon: 'fa-solid fa-box',        label: 'Commandes en cours', val: '0',       sub: 'En expédition', color: '#00D4FF', bg: '#E0F9FF' },
    { icon: 'fa-solid fa-star',       label: 'Score de confiance', val: '100/100', sub: 'Excellent',     color: '#7B2FBE', bg: '#F0E8FD' },
  ];

  timeline: { icon: string; color: string; time: string; text: string; action: string }[] = [
    { icon: 'fa-solid fa-bell', color: '#7B2FBE', time: '', text: 'Chargement de l\'activité...', action: '' },
  ];

  constructor(
    private groupService:  GroupService,
    private orderService:  OrderService,
    public  notifService:  NotificationService,
    public  auth:          AuthService,
    public  fmt:           FormatService,
    private router:        Router,
  ) {}

  ngOnInit(): void {
    // ── Charger mes groupes ────────────────────────────────────
    this.groupService.getMyGroups().subscribe({
      next: (data: any) => {
        const active    = data?.active    ?? [];
        const completed = data?.completed ?? [];

        this.myGroups = [
          ...active.map((m: any)    => this.groupService.mapGroup(m.group ?? m)),
          ...completed.map((m: any) => this.groupService.mapGroup(m.group ?? m)),
        ].filter(g => g.status === 'OPEN' || g.status === 'THRESHOLD_REACHED');

        this.loading = false;

        this.kpis[0].val = this.myGroups.length.toString();
        this.kpis[0].sub = `${this.myGroups.length} en cours`;
        this.kpis[3].val = `${this.auth.currentUser()?.trustScore ?? 100}/100`;
      },
      error: () => { this.loading = false; }
    });

    // ── Charger mes commandes ──────────────────────────────────
    this.orderService.getMyOrders().subscribe({
      next: (orders: Order[]) => {
        this.orders = orders.slice(0, 3);
        const inProgress = orders.filter(o =>
          o.status === 'PROCESSING' || o.status === 'SHIPPED'
        ).length;
        this.kpis[2].val = inProgress.toString();
      },
      error: () => {}
    });

    // ── Charger les notifications pour la timeline ─────────────
    this.notifService.getAll().subscribe({
      next: (notifs: Notification[]) => {
        if (notifs.length > 0) {
          this.timeline = notifs.slice(0, 5).map(n => ({
            icon:   this.notifIcon(n.type),
            color:  this.notifColor(n.type),
            time:   new Date(n.createdAt).toLocaleDateString('fr-FR'),
            text:   n.title + (n.body ? ' — ' + n.body : ''),
            // CORRECTION : utiliser THRESHOLD_REACHED (type front)
            action: n.type === 'THRESHOLD_REACHED' ? 'Payer' : '',
          }));
        }
      },
      error: () => {}
    });
  }

  // ── Helpers ───────────────────────────────────────────────────

  get greeting(): string {
    const h = new Date().getHours();
    if (h < 12) return 'Bonjour';
    if (h < 18) return 'Bon après-midi';
    return 'Bonsoir';
  }

  get firstName(): string {
    return this.auth.currentUser()?.fullName?.split(' ')[0] || 'Membre';
  }

  get urgentGroup(): Group | undefined {
    return this.myGroups.find(g => g.status === 'THRESHOLD_REACHED');
  }

  get referralCode(): string {
    return this.auth.currentUser()?.referralCode || '';
  }

  productImage(g: Group): string {
    return g.product.images?.[0] ?? `https://picsum.photos/seed/${g.product.id}/120/120`;
  }

  progressPct(g: Group): number {
    return this.fmt.progressPercent(g.currentCount, g.minParticipants);
  }

  isThreshold(g: Group): boolean {
    return g.status === 'THRESHOLD_REACHED';
  }

  // CORRECTION : utiliser les types NotifType du front
  private notifIcon(type: NotifType | string): string {
    const map: Record<string, string> = {
      'NEW_MEMBER':       'fa-solid fa-user-plus',
      'THRESHOLD_REACHED':'fa-solid fa-fire',        // ← CORRECTION
      'GROUP_EXPIRED':    'fa-solid fa-times-circle',
      'PAYMENT_REMINDER': 'fa-solid fa-credit-card',
      'PAYMENT_SUCCESS':  'fa-solid fa-circle-check',
      'ORDER_SHIPPED':    'fa-solid fa-truck-fast',
      'ORDER_DELIVERED':  'fa-solid fa-box-open',
      'PROMO':            'fa-solid fa-tag',
      'SYSTEM':           'fa-solid fa-bell',
    };
    return map[type] ?? 'fa-solid fa-bell';
  }

  // CORRECTION : utiliser les types NotifType du front
  private notifColor(type: NotifType | string): string {
    const map: Record<string, string> = {
      'NEW_MEMBER':       '#0DA487',
      'THRESHOLD_REACHED':'#F4A902',  // ← CORRECTION
      'GROUP_EXPIRED':    '#FF4D6A',
      'PAYMENT_REMINDER': '#F4A902',
      'PAYMENT_SUCCESS':  '#10D98B',
      'ORDER_SHIPPED':    '#00D4FF',
      'ORDER_DELIVERED':  '#10D98B',
      'PROMO':            '#7B2FBE',
      'SYSTEM':           '#7B2FBE',
    };
    return map[type] ?? '#7B2FBE';
  }

  copyReferralCode(): void {
    navigator.clipboard?.writeText(this.referralCode);
  }

  // ── Navigation ────────────────────────────────────────────────
  goGroups():              void { this.router.navigate(['/member/groups']); }
  goPayment():             void { this.router.navigate(['/member/payment']); }
  goBrowse():              void { this.router.navigate(['/groups']); }
  goOrders():              void { this.router.navigate(['/member/orders']); }
  goNotifications():       void { this.router.navigate(['/member/notifications']); }
  goGroupDetail(g: Group): void { this.router.navigate(['/groups', g.id]); }
}