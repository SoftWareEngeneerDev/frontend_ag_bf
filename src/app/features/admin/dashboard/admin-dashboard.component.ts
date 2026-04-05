import { Component, OnInit } from '@angular/core';
import { AdminService }    from '../../../core/services/admin.service';
import { FormatService }   from '../../../core/services/format.service';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls:  ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {

  // ── Stats globales ────────────────────────────────────────────
  stats = {
    totalMembers:     0,
    activeGroups:     0,
    successRate:      0,
    totalRevenue:     0,
    totalCommissions: 0,
    escrowAmount:     0,
    openDisputes:     0,
    pendingSuppliers: 0,
    pendingProducts:  0,
  };

  // ── Données graphique revenus ─────────────────────────────────
  revData: { month: string; revenue: number; commissions: number }[] = [];
  get revMax(): number {
    return this.revData.length > 0 ? Math.max(...this.revData.map(r => r.revenue)) : 1;
  }

  // ── Barre de santé ────────────────────────────────────────────
  statusMetrics = [
    { label: 'Escrow',          val: '0 XOF', color: '#F4A902' },
    { label: 'Groupes actifs',  val: '0',     color: '#0DA487' },
    { label: 'Taux de succès',  val: '0%',    color: '#10D98B' },
    { label: 'Litiges ouverts', val: '0',     color: '#FF4D6A' },
  ];

  // ── KPIs ──────────────────────────────────────────────────────
  kpis = [
    { icon: 'fa-solid fa-users',        label: 'Membres actifs',  val: '0',    sub: '',           color: '#00D4FF', bg: '#E0F9FF', up: true,  alert: false },
    { icon: 'fa-solid fa-fire',         label: 'Groupes actifs',  val: '0',    sub: '',           color: '#F4A902', bg: '#FFF8E1', up: true,  alert: false },
    { icon: 'fa-solid fa-circle-check', label: 'Taux de succès',  val: '0%',   sub: 'Ce mois',    color: '#10D98B', bg: '#E8FDF2', up: true,  alert: false },
    { icon: 'fa-solid fa-coins',        label: 'Commissions',     val: '0',    sub: '',           color: '#F4A902', bg: '#FFF8E1', up: true,  alert: false },
    { icon: 'fa-solid fa-vault',        label: 'En escrow',       val: '0',    sub: '',           color: '#FFB347', bg: '#FFF4E5', up: false, alert: false },
    { icon: 'fa-solid fa-gavel',        label: 'Litiges ouverts', val: '0',    sub: '',           color: '#FF4D6A', bg: '#FFE8EC', up: false, alert: true  },
  ];

  // ── Méthodes de paiement ──────────────────────────────────────
  paymentMethods = [
    { icon: 'fa-solid fa-mobile-screen-button',  label: 'Orange Money',   pct: 0, amount: '0 XOF', color: '#FF6B00' },
    { icon: 'fa-solid fa-mobile-screen-button',  label: 'Moov Money',     pct: 0, amount: '0 XOF', color: '#0057B8' },
    { icon: 'fa-solid fa-circle-dollar-to-slot', label: 'Ligdicash',      pct: 0, amount: '0 XOF', color: '#00A651' },
    { icon: 'fa-solid fa-credit-card',           label: 'Carte bancaire', pct: 0, amount: '0 XOF', color: '#7B2FBE' },
  ];

  // ── Actions prioritaires ──────────────────────────────────────
  pending = [
    {
      title: 'Fournisseurs', faIcon: 'fa-solid fa-store',  badge: 0,
      color: '#FFB347', route: '/admin/suppliers', act: 'Valider',
      items: [] as { name: string; delay: string }[],
    },
    {
      title: 'Produits', faIcon: 'fa-solid fa-box', badge: 0,
      color: '#F4A902', route: '/admin/products', act: 'Approuver',
      items: [] as { name: string; delay: string }[],
    },
    {
      title: 'Litiges', faIcon: 'fa-solid fa-gavel', badge: 0,
      color: '#FF4D6A', route: '/admin/disputes', act: 'Traiter',
      items: [] as { name: string; delay: string }[],
    },
  ];

  // ── Journal d'audit ───────────────────────────────────────────
  auditLog: { time: string; user: string; action: string; entity: string }[] = [];

  constructor(
    private adminService: AdminService,
    public  fmt: FormatService,
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
    this.loadPaymentsAnalytics();
    this.loadPendingItems();
    this.loadAuditLogs();
  }

  // ── Charger les KPIs globaux ──────────────────────────────────
  private loadDashboard(): void {
    this.adminService.getDashboard().subscribe({
      next: (data) => {
        if (!data) return;

        this.stats = {
          totalMembers:     data.totalMembers     ?? 0,
          activeGroups:     data.activeGroups     ?? 0,
          successRate:      data.successRate      ?? 0,
          totalRevenue:     data.totalRevenue     ?? 0,
          totalCommissions: data.totalCommissions ?? 0,
          escrowAmount:     data.escrowAmount     ?? 0,
          openDisputes:     data.openDisputes     ?? 0,
          pendingSuppliers: data.pendingSuppliers ?? 0,
          pendingProducts:  data.pendingProducts  ?? 0,
        };

        // Mettre à jour les KPIs
        this.kpis[0].val = data.totalMembers?.toLocaleString('fr-FR') ?? '0';
        this.kpis[1].val = data.activeGroups?.toString() ?? '0';
        this.kpis[2].val = (data.successRate ?? 0) + '%';
        this.kpis[3].val = this.formatAmount(data.totalCommissions ?? 0);
        this.kpis[4].val = this.formatAmount(data.escrowAmount ?? 0);
        this.kpis[5].val = (data.openDisputes ?? 0).toString();
        this.kpis[5].alert = (data.openDisputes ?? 0) > 0;

        // Barre de santé
        this.statusMetrics[0].val = this.formatAmount(data.escrowAmount ?? 0);
        this.statusMetrics[1].val = (data.activeGroups ?? 0).toString();
        this.statusMetrics[2].val = (data.successRate ?? 0) + '%';
        this.statusMetrics[3].val = (data.openDisputes ?? 0).toString();

        // Revenus mensuels
        if (data.monthlyRevenue) {
          this.revData = data.monthlyRevenue;
        }

        // Badges pending
        this.pending[0].badge = data.pendingSuppliers ?? 0;
        this.pending[1].badge = data.pendingProducts  ?? 0;
        this.pending[2].badge = data.openDisputes     ?? 0;
      },
      error: () => {}
    });
  }

  // ── Charger les stats paiements ───────────────────────────────
  private loadPaymentsAnalytics(): void {
    this.adminService.getPaymentsAnalytics().subscribe({
      next: (data) => {
        if (!data?.byMethod) return;

        const total = data.byMethod.reduce((sum: number, m: any) => sum + (m._sum?.amount ?? 0), 0);

        const methodMap: Record<string, number> = {
          'ORANGE_MONEY': 0,
          'MOOV_MONEY':   1,
          'LIGDICASH':    2,
          'CARD':         3,
        };

        data.byMethod.forEach((m: any) => {
          const idx = methodMap[m.method];
          if (idx !== undefined) {
            const amount = m._sum?.amount ?? 0;
            this.paymentMethods[idx].pct    = total > 0 ? Math.round((amount / total) * 100) : 0;
            this.paymentMethods[idx].amount = this.formatAmount(amount);
          }
        });
      },
      error: () => {}
    });
  }

  // ── Charger les items en attente ──────────────────────────────
  private loadPendingItems(): void {
    // Fournisseurs en attente
    this.adminService.getSuppliers('PENDING', 4).subscribe({
      next: (suppliers) => {
        this.pending[0].items = suppliers.map((s: any) => ({
          name:  s.companyName ?? 'Fournisseur',
          delay: 'En attente de validation',
        }));
        this.pending[0].badge = suppliers.length;
      },
      error: () => {}
    });

    // Produits en attente
    this.adminService.getPendingProducts(3).subscribe({
      next: (products) => {
        this.pending[1].items = products.map((p: any) => ({
          name:  p.name ?? 'Produit',
          delay: `Soumis par ${p.supplier?.companyName ?? 'fournisseur'}`,
        }));
        this.pending[1].badge = products.length;
      },
      error: () => {}
    });

    // Litiges ouverts
    this.adminService.getDisputes('OPEN', 3).subscribe({
      next: (disputes) => {
        this.pending[2].items = disputes.map((d: any) => ({
          name:  d.subject ?? 'Litige',
          delay: `Ouvert par ${d.user?.name ?? 'membre'}`,
        }));
        this.pending[2].badge = disputes.length;
      },
      error: () => {}
    });
  }

  // ── Charger les logs d'audit ──────────────────────────────────
  private loadAuditLogs(): void {
    this.adminService.getAuditLogs({ limit: 5 }).subscribe({
      next: (res) => {
        const logs = res.data?.logs ?? res.data ?? [];
        this.auditLog = logs.map((l: any) => ({
          time:   new Date(l.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          user:   l.user?.name ?? 'Admin',
          action: l.action,
          entity: `${l.entity}${l.entityId ? ' · ' + l.entityId.slice(0, 8) : ''}`,
        }));
      },
      error: () => {}
    });
  }

  // ── Helpers ───────────────────────────────────────────────────
  private formatAmount(amount: number): string {
    if (amount >= 1_000_000) return (amount / 1_000_000).toFixed(2) + 'M XOF';
    if (amount >= 1_000)     return (amount / 1_000).toFixed(0) + 'K XOF';
    return amount.toLocaleString('fr-FR') + ' XOF';
  }

  actionIcon(a: string): string {
    if (['SUSPENSION', 'FERMETURE', 'REJET'].includes(a)) return 'fa-solid fa-ban';
    if (a === 'REMBOURSEMENT') return 'fa-solid fa-rotate-left';
    if (a === 'APPROBATION')   return 'fa-solid fa-circle-check';
    return 'fa-solid fa-shield-check';
  }

  actionColor(a: string): string {
    if (['SUSPENSION', 'FERMETURE', 'REJET'].includes(a)) return '#FF4D6A';
    if (a === 'REMBOURSEMENT') return '#F4A902';
    return '#0DA487';
  }

  actionBg(a: string): string { return this.actionColor(a) + '18'; }

  actionIconClass(_a: string): string { return ''; }
}