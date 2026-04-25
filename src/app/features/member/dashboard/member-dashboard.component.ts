import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin, Subject, takeUntil, catchError, of } from 'rxjs';
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
export class MemberDashboardComponent implements OnInit, OnDestroy {
  myGroups : Group[]        = [];
  orders   : Order[]        = [];
  loading    = true;
  copied     = false;

  private destroy$ = new Subject<void>();

  kpis = [
    { icon: 'fa-solid fa-users',      label: 'Groupes actifs',     val: '0',       sub: 'En cours',      color: '#0DA487', bg: '#E6FAF5' },
    { icon: 'fa-solid fa-piggy-bank', label: 'Total économisé',    val: '0 XOF',   sub: 'Cumulé',        color: '#10D98B', bg: '#E8FDF2' },
    { icon: 'fa-solid fa-box',        label: 'Commandes en cours', val: '0',       sub: 'En expédition', color: '#00D4FF', bg: '#E0F9FF' },
    { icon: 'fa-solid fa-star',       label: 'Score de confiance', val: '100/100', sub: 'Excellent',     color: '#7B2FBE', bg: '#F0E8FD' },
  ];

  timeline: {
    icon: string;
    color: string;
    time: string;
    text: string;
    action: string;
  }[] = [
    { icon: 'fa-solid fa-bell', color: '#7B2FBE', time: '', text: 'Chargement de l\'activité...', action: '' },
  ];

  constructor(
    private groupService : GroupService,
    private orderService : OrderService,
    public  notifService : NotificationService,
    public  auth         : AuthService,
    public  fmt          : FormatService,
    private router       : Router,
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Charger toutes les données en parallèle ───────────────────
  private loadDashboard(): void {
    forkJoin({
      groups : this.groupService.getMyGroups().pipe(catchError(() => of(null))),
      orders : this.orderService.getMyOrders().pipe(catchError(() => of([]))),
      notifs : this.notifService.getAll().pipe(catchError(() => of([]))),
    })
    .pipe(takeUntil(this.destroy$))
    .subscribe(({ groups, orders, notifs }) => {
      this.processGroups(groups);
      this.processOrders(orders as Order[]);
      this.processNotifs(notifs as Notification[]);
      this.loading = false;
    });
  }

  // ── Traitement des groupes ────────────────────────────────────
  private processGroups(data: any): void {
    if (!data) return;
    const active    = data?.active    ?? [];
    const completed = data?.completed ?? [];

    this.myGroups = [
      ...active.map   ((m: any) => this.groupService.mapGroup(m.group ?? m)),
      ...completed.map((m: any) => this.groupService.mapGroup(m.group ?? m)),
    ].filter(g => g.status === 'OPEN' || g.status === 'THRESHOLD_REACHED');

    this.kpis[0].val = this.myGroups.length.toString();
    this.kpis[0].sub = `${this.myGroups.length} en cours`;
    this.kpis[3].val = `${this.auth.currentUser()?.trustScore ?? 100}/100`;
  }

  // ── Traitement des commandes ──────────────────────────────────
  private processOrders(orders: Order[]): void {
    this.orders = orders.slice(0, 3);
    const inProgress = orders.filter(o =>
      ['PROCESSING', 'SHIPPED'].includes(o.status)
    ).length;
    this.kpis[2].val = inProgress.toString();

    // Calcul économies totales (prix solo - prix groupe × quantité)
    const saved = orders
      .filter(o => o.status === 'DELIVERED')
      .reduce((acc, o) => acc + ((o as any).savedAmount ?? 0), 0);
    if (saved > 0) {
      this.kpis[1].val = this.fmt.currency(saved);
      this.kpis[1].sub = 'Économisé au total';
    }
  }

  // ── Traitement des notifications → timeline ───────────────────
  private processNotifs(notifs: Notification[]): void {
    if (!notifs.length) {
      this.timeline = [];
      return;
    }
    this.timeline = notifs.slice(0, 5).map(n => ({
      icon   : this.notifIcon(n.type),
      color  : this.notifColor(n.type),
      time   : new Date(n.createdAt).toLocaleDateString('fr-FR', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' }),
      text   : n.title + (n.body ? ' — ' + n.body : ''),
      action : n.type === 'THRESHOLD_REACHED' ? 'Payer' : '',
    }));
  }

  // ── Getters ───────────────────────────────────────────────────
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
    return this.auth.currentUser()?.referralCode || '—';
  }

  get totalSaved(): number {
    return this.auth.currentUser()?.totalSaved ?? 0;
  }

  // ── Helpers ───────────────────────────────────────────────────
  productImage(g: Group): string {
    return g.product?.images?.[0]
      ?? `https://picsum.photos/seed/${g.product?.id}/120/120`;
  }

  progressPct(g: Group): number {
    return this.fmt.progressPercent(g.currentCount, g.minParticipants);
  }

  isThreshold(g: Group): boolean {
    return g.status === 'THRESHOLD_REACHED';
  }

  // ── Copier le code de parrainage ──────────────────────────────
  copyReferralCode(): void {
    if (!this.referralCode || this.referralCode === '—') return;
    navigator.clipboard?.writeText(this.referralCode).then(() => {
      this.copied = true;
      setTimeout(() => { this.copied = false; }, 2000);
    });
  }

  // ── Icônes et couleurs notifications ─────────────────────────
  private notifIcon(type: NotifType | string): string {
    const map: Record<string, string> = {
      NEW_MEMBER       : 'fa-solid fa-user-plus',
      THRESHOLD_REACHED: 'fa-solid fa-fire',
      GROUP_EXPIRED    : 'fa-solid fa-times-circle',
      PAYMENT_REMINDER : 'fa-solid fa-credit-card',
      PAYMENT_SUCCESS  : 'fa-solid fa-circle-check',
      ORDER_SHIPPED    : 'fa-solid fa-truck-fast',
      ORDER_DELIVERED  : 'fa-solid fa-box-open',
      PROMO            : 'fa-solid fa-tag',
      SYSTEM           : 'fa-solid fa-bell',
    };
    return map[type] ?? 'fa-solid fa-bell';
  }

  private notifColor(type: NotifType | string): string {
    const map: Record<string, string> = {
      NEW_MEMBER       : '#0DA487',
      THRESHOLD_REACHED: '#F4A902',
      GROUP_EXPIRED    : '#FF4D6A',
      PAYMENT_REMINDER : '#F4A902',
      PAYMENT_SUCCESS  : '#10D98B',
      ORDER_SHIPPED    : '#00D4FF',
      ORDER_DELIVERED  : '#10D98B',
      PROMO            : '#7B2FBE',
      SYSTEM           : '#7B2FBE',
    };
    return map[type] ?? '#7B2FBE';
  }

  // ── Navigation ────────────────────────────────────────────────
  goGroups()              : void { this.router.navigate(['/member/groups']); }
  goPayment()             : void { this.router.navigate(['/member/payment']); }
  goBrowse()              : void { this.router.navigate(['/groups']); }
  goOrders()              : void { this.router.navigate(['/member/orders']); }
  goNotifications()       : void { this.router.navigate(['/member/notifications']); }
  goGroupDetail(g: Group) : void { this.router.navigate(['/groups', g.id]); }
}