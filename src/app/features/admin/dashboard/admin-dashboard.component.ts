import { Component, OnInit, OnDestroy } from '@angular/core';
import { forkJoin, Subject, takeUntil, catchError, of } from 'rxjs';
import { AdminService }  from '../../../core/services/admin.service';
import { FormatService } from '../../../core/services/format.service';

const MONTHS = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];

@Component({
  selector   : 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls  : ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit, OnDestroy {

  loading = true;
  today   = new Date();

  // ── Stats globales ────────────────────────────────────────────
  stats = {
    totalMembers    : 0,
    activeGroups    : 0,
    successRate     : 0,
    totalRevenue    : 0,
    totalCommissions: 0,
    escrowAmount    : 0,
    openDisputes    : 0,
    pendingSuppliers: 0,
    pendingProducts : 0,
    newMembersToday : 0,
  };

  // ── Graphique revenus ─────────────────────────────────────────
  revData: { month: string; revenue: number; commissions: number }[] = [];
  get revMax(): number { return Math.max(...this.revData.map(r => r.revenue), 1); }

  // ── Barre de santé ────────────────────────────────────────────
  statusMetrics = [
    { label: 'Escrow',          val: '0 XOF', color: '#F4A902' },
    { label: 'Groupes actifs',  val: '0',     color: '#0DA487' },
    { label: 'Taux de succès',  val: '0%',    color: '#10D98B' },
    { label: 'Litiges ouverts', val: '0',     color: '#FF4D6A' },
  ];

  // ── KPIs ──────────────────────────────────────────────────────
  kpis = [
    { icon: 'fa-solid fa-users',        label: 'Membres actifs',  val: '0',  sub: '',          color: '#00D4FF', bg: '#E0F9FF', up: true,  alert: false },
    { icon: 'fa-solid fa-fire',         label: 'Groupes actifs',  val: '0',  sub: '',          color: '#F4A902', bg: '#FFF8E1', up: true,  alert: false },
    { icon: 'fa-solid fa-circle-check', label: 'Taux de succès',  val: '0%', sub: 'Ce mois',   color: '#10D98B', bg: '#E8FDF2', up: true,  alert: false },
    { icon: 'fa-solid fa-coins',        label: 'Commissions',     val: '0',  sub: '',          color: '#F4A902', bg: '#FFF8E1', up: true,  alert: false },
    { icon: 'fa-solid fa-vault',        label: 'En escrow',       val: '0',  sub: 'Sécurisé',  color: '#FFB347', bg: '#FFF4E5', up: false, alert: false },
    { icon: 'fa-solid fa-gavel',        label: 'Litiges ouverts', val: '0',  sub: '',          color: '#FF4D6A', bg: '#FFE8EC', up: false, alert: false },
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
    { title: 'Fournisseurs', faIcon: 'fa-solid fa-store', badge: 0, color: '#FFB347', route: '/admin/suppliers', act: 'Valider',   items: [] as { name: string; delay: string }[] },
    { title: 'Produits',     faIcon: 'fa-solid fa-box',   badge: 0, color: '#F4A902', route: '/admin/products',  act: 'Approuver', items: [] as { name: string; delay: string }[] },
    { title: 'Litiges',      faIcon: 'fa-solid fa-gavel', badge: 0, color: '#FF4D6A', route: '/admin/disputes',  act: 'Traiter',   items: [] as { name: string; delay: string }[] },
  ];

  // ── Journal d'audit ───────────────────────────────────────────
  auditLog: { time: string; user: string; action: string; entity: string }[] = [];

  private destroy$ = new Subject<void>();

  private readonly METHOD_MAP: Record<string, number> = {
    ORANGE_MONEY: 0,
    MOOV_MONEY  : 1,
    LIGDICASH   : 2,
    CARD        : 3,
  };

  constructor(
    private adminService: AdminService,
    public  fmt         : FormatService,
  ) {}

  ngOnInit(): void { this.loadAll(); }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Charger tout en parallèle ─────────────────────────────────
  private loadAll(): void {
    forkJoin({
      dashboard  : this.adminService.getDashboard().pipe(catchError(() => of(null))),
      payments   : this.adminService.getPaymentsAnalytics().pipe(catchError(() => of(null))),
      suppliers  : this.adminService.getSuppliers('PENDING', 4).pipe(catchError(() => of([]))),
      products   : this.adminService.getPendingProducts(3).pipe(catchError(() => of([]))),
      disputes   : this.adminService.getDisputes('OPEN', 3).pipe(catchError(() => of([]))),
      auditLogs  : this.adminService.getAuditLogs({ limit: 5 }).pipe(catchError(() => of(null))),
    })
    .pipe(takeUntil(this.destroy$))
    .subscribe(({ dashboard, payments, suppliers, products, disputes, auditLogs }) => {
      this.processDashboard(dashboard);
      this.processPayments(payments);
      this.processPendingItems(suppliers, products, disputes);
      this.processAuditLogs(auditLogs);
      this.loading = false;
    });
  }

  // ── Traitement dashboard ──────────────────────────────────────
  private processDashboard(data: any): void {
    if (!data) return;

    this.stats = {
      totalMembers    : data.totalMembers     ?? 0,
      activeGroups    : data.activeGroups     ?? 0,
      successRate     : data.successRate      ?? 0,
      totalRevenue    : data.totalRevenue     ?? 0,
      totalCommissions: data.totalCommissions ?? 0,
      escrowAmount    : data.escrowAmount     ?? 0,
      openDisputes    : data.openDisputes     ?? 0,
      pendingSuppliers: data.pendingSuppliers ?? 0,
      pendingProducts : data.pendingProducts  ?? 0,
      newMembersToday : data.newMembersToday  ?? 0,
    };

    // KPIs
    this.kpis[0].val   = (data.totalMembers ?? 0).toLocaleString('fr-FR');
    this.kpis[0].sub   = `+${data.newMembersToday ?? 0} aujourd'hui`;
    this.kpis[1].val   = (data.activeGroups ?? 0).toString();
    this.kpis[1].sub   = `${data.totalGroups ?? 0} au total`;
    this.kpis[2].val   = `${data.successRate ?? 0}%`;
    this.kpis[3].val   = this.fmt.formatXOF(data.totalCommissions ?? 0);
    this.kpis[3].sub   = `sur ${this.fmt.formatXOF(data.totalRevenue ?? 0)}`;
    this.kpis[4].val   = this.fmt.formatXOF(data.escrowAmount ?? 0);
    this.kpis[5].val   = (data.openDisputes ?? 0).toString();
    this.kpis[5].alert = (data.openDisputes ?? 0) > 0;
    this.kpis[5].sub   = (data.openDisputes ?? 0) > 0 ? 'Action requise' : 'Aucun';

    // Barre de santé
    this.statusMetrics[0].val = this.fmt.formatXOF(data.escrowAmount ?? 0);
    this.statusMetrics[1].val = (data.activeGroups ?? 0).toString();
    this.statusMetrics[2].val = `${data.successRate ?? 0}%`;
    this.statusMetrics[3].val = (data.openDisputes ?? 0).toString();

    // Revenus mensuels
    if (data.monthlyRevenue?.length) {
      this.revData = data.monthlyRevenue;
    } else {
      this.buildDefaultChart();
    }

    // Badges pending
    this.pending[0].badge = data.pendingSuppliers ?? 0;
    this.pending[1].badge = data.pendingProducts  ?? 0;
    this.pending[2].badge = data.openDisputes     ?? 0;
  }

  // ── Traitement paiements ──────────────────────────────────────
  private processPayments(data: any): void {
    if (!data?.byMethod) return;
    const total = data.byMethod.reduce((s: number, m: any) => s + (m._sum?.amount ?? 0), 0);
    data.byMethod.forEach((m: any) => {
      const idx = this.METHOD_MAP[m.method];
      if (idx !== undefined) {
        const amount = m._sum?.amount ?? 0;
        this.paymentMethods[idx].pct    = total > 0 ? Math.round((amount / total) * 100) : 0;
        this.paymentMethods[idx].amount = this.fmt.formatXOF(amount);
      }
    });
  }

  // ── Traitement items en attente ───────────────────────────────
  private processPendingItems(suppliers: any[], products: any[], disputes: any[]): void {
    this.pending[0].items = suppliers.map((s: any) => ({
      name : s.companyName ?? s.user?.name ?? 'Fournisseur',
      delay: `En attente depuis ${this.relativeTime(s.createdAt)}`,
    }));
    if (suppliers.length) this.pending[0].badge = suppliers.length;

    this.pending[1].items = products.map((p: any) => ({
      name : p.name ?? 'Produit',
      delay: `Soumis par ${p.supplier?.companyName ?? 'fournisseur'}`,
    }));
    if (products.length) this.pending[1].badge = products.length;

    this.pending[2].items = disputes.map((d: any) => ({
      name : d.subject ?? 'Litige',
      delay: `Ouvert par ${d.user?.name ?? 'membre'}`,
    }));
    if (disputes.length) this.pending[2].badge = disputes.length;
  }

  // ── Traitement audit logs ─────────────────────────────────────
  private processAuditLogs(res: any): void {
    const logs = res?.data?.logs ?? res?.data ?? [];
    this.auditLog = logs.map((l: any) => ({
      time  : new Date(l.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      user  : l.user?.name ?? 'Admin',
      action: l.action,
      entity: `${l.entity}${l.entityId ? ' · ' + l.entityId.slice(0, 8) : ''}`,
    }));
  }

  // ── Chart par défaut si pas de données ───────────────────────
  private buildDefaultChart(): void {
    const now = new Date();
    this.revData = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
      return { month: MONTHS[d.getMonth()], revenue: 0, commissions: 0 };
    });
  }

  // ── Helpers ───────────────────────────────────────────────────
  private relativeTime(date: string): string {
    if (!date) return '—';
    const diff = Date.now() - new Date(date).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return 'aujourd\'hui';
    if (days === 1) return 'hier';
    return `${days} jours`;
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