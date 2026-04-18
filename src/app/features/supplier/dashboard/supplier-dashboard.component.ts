import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
import { GroupService } from '../../../core/services/group.service';

const API = 'http://localhost:3000/api/v1';

@Component({
  selector: 'app-supplier-dashboard',
  templateUrl: './supplier-dashboard.component.html',
  styleUrls:  ['./supplier-dashboard.component.scss']
})
export class SupplierDashboardComponent implements OnInit {

  // ── Profil fournisseur ────────────────────────────────────────
  supplierName  = '';
  supplierCity  = 'Ouagadougou';
  supplierRating = 0;
  supplierReviews = 0;
  supplierSince = '';
  totalGroups   = 0;
  successRate   = 0;
  totalRevenue  = '0';

  // ── KPIs ──────────────────────────────────────────────────────
  kpis = [
    { icon: 'fa-solid fa-box-open',             label: 'Produits approuvés',  val: '0',       sub: '',             color: '#F4A902', bg: '#FFF8E1', trend: '',     up: true  },
    { icon: 'fa-solid fa-users',                label: 'Groupes actifs',      val: '0',       sub: '',             color: '#00D4FF', bg: '#E0F9FF', trend: '',     up: true  },
    { icon: 'fa-solid fa-triangle-exclamation', label: 'Commandes urgentes',  val: '0',       sub: 'Action requise',color: '#FF4D6A', bg: '#FFE8EC', trend: '',    up: false },
    { icon: 'fa-solid fa-coins',                label: 'Revenu ce mois',      val: '0 XOF',   sub: '',             color: '#10D98B', bg: '#E8FDF2', trend: '+0%',  up: true  },
  ];

  // ── Graphique revenus ─────────────────────────────────────────
  chartData:   number[] = [0, 0, 0, 0, 0, 0];
  chartMonths: string[] = ['', '', '', '', '', ''];
  get chartMax(): number { return Math.max(...this.chartData, 1); }

  // ── Statut groupes ────────────────────────────────────────────
  groupStatus = [
    { label: 'Actifs',        val: 0, color: '#F4A902', pct: 0 },
    { label: 'Seuil atteint', val: 0, color: '#00D4FF', pct: 0 },
    { label: 'En traitement', val: 0, color: '#10D98B', pct: 0 },
    { label: 'Terminés',      val: 0, color: '#7B2FBE', pct: 0 },
  ];

  // ── Commandes urgentes ────────────────────────────────────────
  urgentOrders: any[] = [];

  // ── Top produits ──────────────────────────────────────────────
  topProducts: any[] = [];

  constructor(
    private http:         HttpClient,
    private auth:         AuthService,
    private groupService: GroupService,
    private router:       Router,
  ) {}

  ngOnInit(): void {
    this.loadProfile();
    this.loadGroups();
    this.loadOrders();
    this.loadProducts();
  }

  // ── Charger le profil fournisseur ─────────────────────────────
  private loadProfile(): void {
    const user = this.auth.currentUser();
    if (user) {
      this.supplierName  = user.fullName;
      this.supplierCity  = user.city ?? 'Ouagadougou';
      this.supplierSince = new Date(user.createdAt).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    }

    this.http.get<any>(`${API}/users/me`).subscribe({
      next: (res) => {
        const data = res.data;
        this.supplierName    = data.name    ?? this.supplierName;
        this.supplierCity    = data.city    ?? this.supplierCity;
        this.supplierSince   = new Date(data.createdAt).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

        // Stats supplier
        if (data.supplier) {
          this.supplierRating  = data.supplier.rating      ?? 0;
          this.supplierReviews = data.supplier.reviewCount ?? 0;
          this.successRate     = data.supplier.successRate ?? 0;
        }
      },
      error: () => {}
    });
  }

  // ── Charger les groupes du fournisseur ────────────────────────
  private loadGroups(): void {
    this.http.get<any>(`${API}/supplier/groups`, { params: { limit: 100 } }).subscribe({
      next: (res) => {
        const groups = (res.data?.groups ?? res.data ?? []).map((g: any) => this.groupService.mapGroup(g));

        this.totalGroups = groups.length;

        // Statut groupes
        const open      = groups.filter((g: any) => g.status === 'OPEN').length;
        const threshold = groups.filter((g: any) => g.status === 'THRESHOLD_REACHED').length;
        const completed = groups.filter((g: any) => g.status === 'COMPLETED').length;
        const total     = groups.length || 1;

        this.groupStatus[0].val = open;       this.groupStatus[0].pct = Math.round(open / total * 100);
        this.groupStatus[1].val = threshold;  this.groupStatus[1].pct = Math.round(threshold / total * 100);
        this.groupStatus[2].val = completed;  this.groupStatus[2].pct = Math.round(completed / total * 100);
        this.groupStatus[3].val = groups.filter((g: any) => g.status === 'CANCELLED' || g.status === 'EXPIRED').length;

        // KPI groupes actifs
        this.kpis[1].val = open.toString();
        this.kpis[1].sub = `${groups.reduce((s: number, g: any) => s + g.currentCount, 0)} participants`;

        // Graphique revenus (6 derniers mois simulés depuis les groupes)
        const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
        const now = new Date();
        this.chartMonths = Array.from({ length: 6 }, (_, i) => {
          const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
          return months[d.getMonth()];
        });
        this.chartData = [820000, 1450000, 980000, 1820000, 2100000, 2450000]; // Données mock jusqu'à intégration analytics supplier
      },
      error: () => {}
    });
  }

  // ── Charger les commandes urgentes ────────────────────────────
  private loadOrders(): void {
    this.http.get<any>(`${API}/supplier/orders`, { params: { limit: 3 } }).subscribe({
      next: (res) => {
        const orders = res.data?.orders ?? res.data ?? [];
        this.urgentOrders = orders
          .filter((o: any) => o.status === 'CREATED' || o.status === 'PROCESSING')
          .slice(0, 3)
          .map((o: any) => ({
            group:       o.group?.title         ?? 'Groupe',
            product:     o.group?.product?.name ?? 'Produit',
            participants: o.group?.currentCount ?? 0,
            amount: (o.totalAmount ?? 0).toLocaleString('fr-FR') + ' XOF',
            status:      this.orderStatusLabel(o.status),
            statusColor: this.orderStatusColor(o.status),
            id:          o.id,
          }));

        this.kpis[2].val = this.urgentOrders.length.toString();
      },
      error: () => {}
    });
  }

  // ── Charger les top produits ──────────────────────────────────
  private loadProducts(): void {
    this.http.get<any>(`${API}/supplier/products`, { params: { limit: 3, status: 'APPROVED' } }).subscribe({
      next: (res) => {
        const products = res.data?.products ?? res.data ?? [];
        this.topProducts = products.slice(0, 3).map((p: any) => ({
          name:    p.name ?? 'Produit',
          groups:  p._count?.groups ?? 0,
          revenue: '—',
          rating:  p.rating ?? 0,
          trend:   '+0%',
        }));

        this.kpis[0].val = products.filter((p: any) => p.status === 'APPROVED').length.toString();
        this.kpis[0].sub = `${products.filter((p: any) => p.status === 'PENDING_APPROVAL').length} en attente`;
      },
      error: () => {}
    });
  }

  // ── Helpers ───────────────────────────────────────────────────
  private orderStatusLabel(s: string): string {
    if (s === 'CREATED')    return 'CRÉÉE';
    if (s === 'PROCESSING') return 'EN TRAITEMENT';
    if (s === 'SHIPPED')    return 'EXPÉDIÉE';
    return s;
  }

  private orderStatusColor(s: string): string {
    if (s === 'CREATED')    return '#FF4D6A';
    if (s === 'PROCESSING') return '#F4A902';
    if (s === 'SHIPPED')    return '#00D4FF';
    return '#10D98B';
  }

  stars(n: number): boolean[] { return [1, 2, 3, 4, 5].map(i => i <= Math.round(n)); }

  goProducts(): void { this.router.navigate(['/supplier/products']); }
  goGroups():   void { this.router.navigate(['/supplier/groups']); }
  goOrders():   void { this.router.navigate(['/supplier/orders']); }
  goRevenue():  void { this.router.navigate(['/supplier/revenue']); }
}