import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../../core/services/admin.service';

@Component({
  selector: 'app-admin-analytics',
  templateUrl: './admin-analytics.component.html',
  styleUrls:  ['./admin-analytics.component.scss']
})
export class AdminAnalyticsComponent implements OnInit {
  activeRange = '3 mois';
  ranges      = ['7 jours', '30 jours', '3 mois', '1 an'];
  loading     = true;

  kpis = [
    { val: '0 XOF', label: 'Revenus',          color: '#F5A623', delta: '0%' },
    { val: '0 XOF', label: 'Commissions',       color: '#10D98B', delta: '0%' },
    { val: '0',     label: 'Nouveaux membres',  color: '#00D4FF', delta: '0%' },
    { val: '0%',    label: 'Taux de succès',    color: '#10D98B', delta: '0pts' },
  ];

  categories: { name: string; pct: number; icon: string }[] = [];

  gauges = [
    { val: '0%',   label: 'Taux succès',  color: '#10D98B', pct: 0 },
    { val: '0/5',  label: 'Satisfaction', color: '#F5A623', pct: 0 },
    { val: '0',    label: 'NPS score',    color: '#00D4FF', pct: 0 },
  ];

  topSuppliers: { name: string; rev: string; groups: string }[] = [];

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadAnalytics();
  }

  // ── Charger les analytics ─────────────────────────────────────
  private loadAnalytics(): void {
    this.loading = true;

    // ── Dashboard KPIs ────────────────────────────────────────
    this.adminService.getDashboard().subscribe({
      next: (data) => {
        if (!data) return;

        this.kpis[0].val   = this.formatAmount(data.totalRevenue     ?? 0);
        this.kpis[1].val   = this.formatAmount(data.totalCommissions ?? 0);
        this.kpis[2].val   = (data.totalMembers ?? 0).toLocaleString('fr-FR');
        this.kpis[3].val   = (data.successRate  ?? 0) + '%';

        // Gauges
        this.gauges[0].val = (data.successRate ?? 0) + '%';
        this.gauges[0].pct = data.successRate  ?? 0;

        this.loading = false;
      },
      error: () => { this.loading = false; }
    });

    // ── Analytics groupes → catégories ────────────────────────
    this.adminService.getGroupsAnalytics().subscribe({
      next: (data) => {
        if (!data?.byCategory) return;

        const total = data.byCategory.reduce((s: number, c: any) => s + (c._count ?? 0), 0);
        const icons: Record<string, string> = {
          'Électronique':   '📱',
          'Alimentaire':    '🌾',
          'Textile & Mode': '👗',
          'Maison & Jardin':'🏠',
          'Santé & Beauté': '💊',
        };

        this.categories = data.byCategory
          .sort((a: any, b: any) => (b._count ?? 0) - (a._count ?? 0))
          .map((c: any) => ({
            name: c.name ?? c.category ?? 'Autre',
            pct:  total > 0 ? Math.round(((c._count ?? 0) / total) * 100) : 0,
            icon: icons[c.name ?? c.category ?? ''] ?? '📦',
          }));
      },
      error: () => {}
    });

    // ── Analytics paiements ────────────────────────────────────
    this.adminService.getPaymentsAnalytics().subscribe({
      next: (data) => {
        if (!data) return;

        // Top fournisseurs depuis les données de paiement
        if (data.topSuppliers) {
          this.topSuppliers = data.topSuppliers.map((s: any) => ({
            name:   s.companyName ?? s.name ?? 'Fournisseur',
            rev:    this.formatAmount(s.totalRevenue ?? s.amount ?? 0),
            groups: `${s.groupCount ?? s.groups ?? 0} groupes`,
          }));
        }
      },
      error: () => {}
    });
  }

  // ── Recharger quand on change la période ─────────────────────
  onRangeChange(range: string): void {
    this.activeRange = range;
    this.loadAnalytics();
  }

  // ── Helper ────────────────────────────────────────────────────
  private formatAmount(amount: number): string {
    if (amount >= 1_000_000) return (amount / 1_000_000).toFixed(2) + 'M XOF';
    if (amount >= 1_000)     return (amount / 1_000).toFixed(0) + 'k XOF';
    return amount.toLocaleString('fr-FR') + ' XOF';
  }
}