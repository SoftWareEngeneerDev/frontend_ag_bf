import { Component, OnInit, OnDestroy } from '@angular/core';
import { forkJoin, Subject, takeUntil, catchError, of } from 'rxjs';
import { AdminService }  from '../../../core/services/admin.service';
import { FormatService } from '../../../core/services/format.service';

const CATEGORY_ICONS: Record<string, string> = {
  'Électronique'  : '📱',
  'Alimentaire'   : '🌾',
  'Textile & Mode': '👗',
  'Maison & Jardin': '🏠',
  'Santé & Beauté': '💊',
  'Agriculture'   : '🌱',
};

const RANGE_DAYS: Record<string, number> = {
  '7 jours' : 7,
  '30 jours': 30,
  '3 mois'  : 90,
  '1 an'    : 365,
};

@Component({
  selector   : 'app-admin-analytics',
  templateUrl: './admin-analytics.component.html',
  styleUrls  : ['./admin-analytics.component.scss']
})
export class AdminAnalyticsComponent implements OnInit, OnDestroy {
  activeRange = '3 mois';
  readonly ranges = ['7 jours', '30 jours', '3 mois', '1 an'];
  loading = true;

  // ── KPIs ──────────────────────────────────────────────────────
  kpis = [
    { val: '0 XOF', label: 'Revenus bruts',    color: '#F5A623', delta: '+0%' },
    { val: '0 XOF', label: 'Commissions',      color: '#10D98B', delta: '+0%' },
    { val: '0',     label: 'Membres actifs',   color: '#00D4FF', delta: '+0%' },
    { val: '0%',    label: 'Taux de succès',   color: '#10D98B', delta: '+0pts' },
  ];

  // ── Catégories ────────────────────────────────────────────────
  categories: { name: string; pct: number; icon: string; count: number }[] = [];

  // ── Jauges ────────────────────────────────────────────────────
  gauges = [
    { val: '0%',  label: 'Taux succès',  color: '#10D98B', pct: 0 },
    { val: '0/5', label: 'Satisfaction', color: '#F5A623', pct: 0 },
    { val: '0',   label: 'NPS score',    color: '#00D4FF', pct: 0 },
  ];

  // ── Top fournisseurs ──────────────────────────────────────────
  topSuppliers: { name: string; rev: string; groups: string }[] = [];

  private destroy$ = new Subject<void>();

  constructor(
    private adminService: AdminService,
    public  fmt         : FormatService,
  ) {}

  ngOnInit(): void { this.loadAnalytics(); }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Charger tout en parallèle ─────────────────────────────────
  private loadAnalytics(): void {
    this.loading = true;
    const days = RANGE_DAYS[this.activeRange] ?? 90;

    forkJoin({
      dashboard: this.adminService.getDashboard().pipe(catchError(() => of(null))),
      groups   : this.adminService.getGroupsAnalytics({ days }).pipe(catchError(() => of(null))),
      payments : this.adminService.getPaymentsAnalytics({ days }).pipe(catchError(() => of(null))),
    })
    .pipe(takeUntil(this.destroy$))
    .subscribe(({ dashboard, groups, payments }) => {
      this.processDashboard(dashboard);
      this.processGroups(groups);
      this.processPayments(payments);
      this.loading = false;
    });
  }

  // ── Traitement dashboard ──────────────────────────────────────
  private processDashboard(data: any): void {
    if (!data) return;
    this.kpis[0].val   = this.fmt.formatXOF(data.totalRevenue     ?? 0);
    this.kpis[1].val   = this.fmt.formatXOF(data.totalCommissions ?? 0);
    this.kpis[2].val   = (data.totalMembers ?? 0).toLocaleString('fr-FR');
    this.kpis[2].delta = `+${data.newMembersToday ?? 0} aujourd'hui`;
    this.kpis[3].val   = `${data.successRate ?? 0}%`;

    this.gauges[0].val = `${data.successRate ?? 0}%`;
    this.gauges[0].pct =  data.successRate   ?? 0;
  }

  // ── Traitement groupes ────────────────────────────────────────
  private processGroups(data: any): void {
    if (!data?.byCategory) return;
    const total = data.byCategory.reduce((s: number, c: any) => s + (c._count ?? 0), 0);

    this.categories = data.byCategory
      .sort((a: any, b: any) => (b._count ?? 0) - (a._count ?? 0))
      .map((c: any) => {
        const name = c.name ?? c.category ?? 'Autre';
        return {
          name,
          count: c._count ?? 0,
          pct  : total > 0 ? Math.round(((c._count ?? 0) / total) * 100) : 0,
          icon : CATEGORY_ICONS[name] ?? '📦',
        };
      });
  }

  // ── Traitement paiements ──────────────────────────────────────
  private processPayments(data: any): void {
    if (!data) return;
    if (data.topSuppliers?.length) {
      this.topSuppliers = data.topSuppliers.map((s: any) => ({
        name  : s.companyName ?? s.name ?? 'Fournisseur',
        rev   : this.fmt.formatXOF(s.totalRevenue ?? s.amount ?? 0),
        groups: `${s.groupCount ?? s.groups ?? 0} groupe${(s.groupCount ?? s.groups ?? 0) !== 1 ? 's' : ''}`,
      }));
    }
  }

  // ── Changer de période ────────────────────────────────────────
  onRangeChange(range: string): void {
    if (this.activeRange === range) return;
    this.activeRange = range;
    this.loadAnalytics();
  }

  trackByName(_: number, item: any): string { return item.name; }
}