import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { forkJoin, Subject, takeUntil, catchError, of } from 'rxjs';
import { AuthService }  from '../../../core/services/auth.service';
import { GroupService } from '../../../core/services/group.service';

const API = 'http://localhost:3000/api/v1';

@Component({
  selector: 'app-supplier-dashboard',
  templateUrl: './supplier-dashboard.component.html',
  styleUrls:  ['./supplier-dashboard.component.scss']
})
export class SupplierDashboardComponent implements OnInit, OnDestroy {

  loading = true;

  // ── Profil ────────────────────────────────────────────────
  supplierName    = '';
  supplierCity    = 'Ouagadougou';
  supplierRating  = 0;
  supplierReviews = 0;
  supplierSince   = '';
  totalGroups     = 0;
  successRate     = 0;
  totalRevenue    = '0';

  // ── KPIs ──────────────────────────────────────────────────
  kpis = [
    { icon: 'fa-solid fa-box-open',             label: 'Produits approuvés',  val: '0', sub: '',              color: '#F4A902', bg: '#FFF8E1', trend: '', up: true  },
    { icon: 'fa-solid fa-users',                label: 'Groupes actifs',      val: '0', sub: '',              color: '#00D4FF', bg: '#E0F9FF', trend: '', up: true  },
    { icon: 'fa-solid fa-triangle-exclamation', label: 'Commandes urgentes',  val: '0', sub: 'Action requise',color: '#FF4D6A', bg: '#FFE8EC', trend: '', up: false },
    { icon: 'fa-solid fa-coins',                label: 'Revenu ce mois',      val: '0 XOF', sub: '',          color: '#10D98B', bg: '#E8FDF2', trend: '', up: true  },
  ];

  // ── Graphique revenus ─────────────────────────────────────
  chartData   : number[] = [0, 0, 0, 0, 0, 0];
  chartMonths : string[] = ['', '', '', '', '', ''];
  get chartMax(): number { return Math.max(...this.chartData, 1); }

  // ── Statut groupes ────────────────────────────────────────
  groupStatus = [
    { label: 'Actifs',        val: 0, color: '#F4A902', pct: 0 },
    { label: 'Seuil atteint', val: 0, color: '#00D4FF', pct: 0 },
    { label: 'Terminés',      val: 0, color: '#10D98B', pct: 0 },
    { label: 'Annulés',       val: 0, color: '#FF4D6A', pct: 0 },
  ];

  // ── Données ───────────────────────────────────────────────
  urgentOrders : any[] = [];
  topProducts  : any[] = [];

  private destroy$ = new Subject<void>();

  private readonly MONTHS = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];

  constructor(
    private http        : HttpClient,
    private auth        : AuthService,
    private groupService: GroupService,
    private router      : Router,
  ) {}

  ngOnInit(): void {
    // Initialiser depuis le cache auth
    const user = this.auth.currentUser();
    if (user) {
      this.supplierName = user.fullName;
      this.supplierCity = user.city ?? 'Ouagadougou';
      this.supplierSince = new Date(user.createdAt).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    }

    this.loadDashboard();
    this.buildChartMonths();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Charger tout en parallèle ─────────────────────────────
  private loadDashboard(): void {
    forkJoin({
      profile : this.http.get<any>(`${API}/users/me`).pipe(catchError(() => of(null))),
      groups  : this.http.get<any>(`${API}/supplier/groups`,   { params: { limit: '100' } }).pipe(catchError(() => of(null))),
      orders  : this.http.get<any>(`${API}/supplier/orders`,   { params: { limit: '20'  } }).pipe(catchError(() => of(null))),
      products: this.http.get<any>(`${API}/supplier/products`, { params: { limit: '10'  } }).pipe(catchError(() => of(null))),
    })
    .pipe(takeUntil(this.destroy$))
    .subscribe(({ profile, groups, orders, products }) => {
      this.processProfile(profile);
      this.processGroups(groups);
      this.processOrders(orders);
      this.processProducts(products);
      this.loading = false;
    });
  }

  // ── Traitement profil ─────────────────────────────────────
  private processProfile(res: any): void {
    if (!res?.data) return;
    const data = res.data;
    this.supplierName  = data.name ?? this.supplierName;
    this.supplierCity  = data.city ?? this.supplierCity;
    this.supplierSince = new Date(data.createdAt).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

    if (data.supplier) {
      this.supplierRating  = data.supplier.rating      ?? 0;
      this.supplierReviews = data.supplier.reviewCount ?? 0;
      this.successRate     = Math.round(data.supplier.successRate ?? 0);
    }
  }

  // ── Traitement groupes ────────────────────────────────────
  private processGroups(res: any): void {
    const groups = (res?.data ?? []).map((g: any) => this.groupService.mapGroup(g));
    this.totalGroups = groups.length;

    const open      = groups.filter((g: any) => g.status === 'OPEN').length;
    const threshold = groups.filter((g: any) => g.status === 'THRESHOLD_REACHED').length;
    const completed = groups.filter((g: any) => g.status === 'COMPLETED').length;
    const cancelled = groups.filter((g: any) => ['CANCELLED', 'FAILED', 'EXPIRED'].includes(g.status)).length;
    const total     = groups.length || 1;

    this.groupStatus[0].val = open;       this.groupStatus[0].pct = Math.round(open      / total * 100);
    this.groupStatus[1].val = threshold;  this.groupStatus[1].pct = Math.round(threshold / total * 100);
    this.groupStatus[2].val = completed;  this.groupStatus[2].pct = Math.round(completed / total * 100);
    this.groupStatus[3].val = cancelled;  this.groupStatus[3].pct = Math.round(cancelled / total * 100);

    const totalParticipants = groups.reduce((s: number, g: any) => s + (g.currentCount ?? 0), 0);
    this.kpis[1].val = open.toString();
    this.kpis[1].sub = `${totalParticipants} participant${totalParticipants !== 1 ? 's' : ''}`;
  }

  // ── Traitement commandes ──────────────────────────────────
  private processOrders(res: any): void {
    const orders = res?.data ?? [];
    this.urgentOrders = orders
      .filter((o: any) => ['CREATED', 'PROCESSING'].includes(o.status))
      .slice(0, 3)
      .map((o: any) => ({
        id          : o.id,
        group       : o.group?.title         ?? 'Groupe',
        product     : o.group?.product?.name ?? 'Produit',
        participants: o.group?.currentCount  ?? 0,
        amount      : (o.totalAmount ?? o.amount ?? 0).toLocaleString('fr-FR') + ' XOF',
        status      : this.orderStatusLabel(o.status),
        statusColor : this.orderStatusColor(o.status),
      }));

    this.kpis[2].val = this.urgentOrders.length.toString();
  }

  // ── Traitement produits ───────────────────────────────────
  private processProducts(res: any): void {
    const products = res?.data ?? [];
    const approved = products.filter((p: any) => p.status === 'APPROVED');
    const pending  = products.filter((p: any) => p.status === 'PENDING_APPROVAL');

    this.kpis[0].val = approved.length.toString();
    this.kpis[0].sub = pending.length > 0 ? `${pending.length} en attente` : 'Tous approuvés';

    this.topProducts = approved.slice(0, 3).map((p: any) => ({
      name   : p.name ?? 'Produit',
      groups : p._count?.groups ?? 0,
      revenue: '—',
      rating : p.rating ?? 0,
      trend  : '+0%',
    }));
  }

  // ── Construire les mois du graphique ──────────────────────
  private buildChartMonths(): void {
    const now = new Date();
    this.chartMonths = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
      return this.MONTHS[d.getMonth()];
    });
    // Données mock jusqu'à intégration analytics réelle
    this.chartData = [820000, 1450000, 980000, 1820000, 2100000, 2450000];
  }

  // ── Helpers ───────────────────────────────────────────────
  private orderStatusLabel(s: string): string {
    const labels: Record<string, string> = {
      CREATED    : 'CRÉÉE',
      PROCESSING : 'EN TRAITEMENT',
      SHIPPED    : 'EXPÉDIÉE',
      DELIVERED  : 'LIVRÉE',
    };
    return labels[s] ?? s;
  }

  private orderStatusColor(s: string): string {
    const colors: Record<string, string> = {
      CREATED    : '#FF4D6A',
      PROCESSING : '#F4A902',
      SHIPPED    : '#00D4FF',
      DELIVERED  : '#10D98B',
    };
    return colors[s] ?? '#718096';
  }

  stars(n: number): boolean[] {
    return [1, 2, 3, 4, 5].map(i => i <= Math.round(n));
  }

  // ── Navigation ────────────────────────────────────────────
  goProducts(): void { this.router.navigate(['/supplier/products']); }
  goGroups()  : void { this.router.navigate(['/supplier/groups']); }
  goOrders()  : void { this.router.navigate(['/supplier/orders']); }
  goRevenue() : void { this.router.navigate(['/supplier/revenue']); }
}