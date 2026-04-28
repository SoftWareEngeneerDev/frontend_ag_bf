import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject, takeUntil } from 'rxjs';

const API = 'http://localhost:3000/api/v1';

const MONTHS = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];
const COMMISSION_RATE = 0.07;

const TYPE_LABELS: Record<string, string> = {
  DEPOSIT      : 'DÉPÔT',
  FINAL_PAYMENT: 'REÇU',
  COMMISSION   : 'COMMISSION',
  REFUND       : 'REMBOURSÉ',
};

@Component({
  selector: 'app-supplier-revenue',
  templateUrl: './supplier-revenue.component.html',
  styleUrls:  ['./supplier-revenue.component.scss']
})
export class SupplierRevenueComponent implements OnInit, OnDestroy {
  loading = true;

  // ── Graphique ─────────────────────────────────────────────
  revData: { month: string; revenue: number; commissions: number }[] = [];
  get revMax(): number { return Math.max(...this.revData.map(r => r.revenue), 1); }

  // ── KPIs ──────────────────────────────────────────────────
  kpis = [
    { icon: '💰', label: 'Revenu ce mois',       val: '0 XOF', sub: '',                   color: '#10D98B' },
    { icon: '🏦', label: 'En escrow (bloqué)',    val: '0 XOF', sub: 'Groupes actifs',     color: '#FFB347' },
    { icon: '✅', label: 'Net reçu ce mois',      val: '0 XOF', sub: 'Après commission',   color: '#F5A623' },
    { icon: '📊', label: 'Commission plateforme', val: '0 XOF', sub: '7% du revenu total', color: '#00D4FF' },
  ];

  // ── Transactions ──────────────────────────────────────────
  transactions: {
    date  : string;
    desc  : string;
    amount: number;
    type  : string;
    color : string;
  }[] = [];

  private destroy$ = new Subject<void>();

  constructor(private http: HttpClient) {}

  ngOnInit(): void { this.loadRevenue(); }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadRevenue(): void {
    this.loading = true;

    this.http.get<any>(`${API}/users/me/history`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          const payments = res.data?.payments ?? [];
          this.processPayments(payments);
          this.loading = false;
        },
        error: () => {
          this.loading  = false;
          this.buildDefaultChart();
        }
      });
  }

  private processPayments(payments: any[]): void {
    const now = new Date();

    // ── KPIs ────────────────────────────────────────────────
    const thisMonth = payments.filter((p: any) => {
      const d = new Date(p.createdAt);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });

    const totalMonth = thisMonth
      .filter((p: any) => p.status === 'COMPLETED')
      .reduce((s: number, p: any) => s + (p.amount ?? 0), 0);

    const escrow = payments
      .filter((p: any) => p.status === 'ESCROWED')
      .reduce((s: number, p: any) => s + (p.amount ?? 0), 0);

    const commission = Math.round(totalMonth * COMMISSION_RATE);

    this.kpis[0].val = this.formatXOF(totalMonth);
    this.kpis[1].val = this.formatXOF(escrow);
    this.kpis[2].val = this.formatXOF(totalMonth - commission);
    this.kpis[3].val = this.formatXOF(commission);

    // ── Graphique 6 mois ────────────────────────────────────
    this.revData = Array.from({ length: 6 }, (_, i) => {
      const d   = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
      const rev = payments
        .filter((p: any) => {
          const pd = new Date(p.createdAt);
          return pd.getMonth() === d.getMonth()
              && pd.getFullYear() === d.getFullYear()
              && p.status === 'COMPLETED';
        })
        .reduce((s: number, p: any) => s + (p.amount ?? 0), 0);

      return {
        month      : MONTHS[d.getMonth()],
        revenue    : rev,
        commissions: Math.round(rev * COMMISSION_RATE),
      };
    });

    // ── Transactions récentes ────────────────────────────────
    this.transactions = payments.slice(0, 10).map((p: any) => {
      const isDeduction = ['COMMISSION', 'REFUND'].includes(p.type);
      const amount      = isDeduction ? -(p.amount ?? 0) : (p.amount ?? 0);
      const productName = p.group?.product?.name;
      const typeLabel   = TYPE_LABELS[p.type] ?? p.type;

      return {
        date  : new Date(p.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }),
        desc  : productName
          ? `${typeLabel} — ${productName}`
          : `Paiement ${p.id?.slice(0, 8) ?? '—'}`,
        amount,
        type  : typeLabel,
        color : amount >= 0 ? '#10D98B' : '#FF4D6A',
      };
    });
  }

  private buildDefaultChart(): void {
    const now = new Date();
    this.revData = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
      return { month: MONTHS[d.getMonth()], revenue: 0, commissions: 0 };
    });
  }

  // ── Formatter XOF ─────────────────────────────────────────
  formatXOF(val: number): string {
    if (val >= 1_000_000) return (val / 1_000_000).toFixed(2) + 'M XOF';
    if (val >= 1_000)     return (val / 1_000).toFixed(0) + 'k XOF';
    return val.toLocaleString('fr-FR') + ' XOF';
  }

  trackByMonth(_: number, r: any): string { return r.month; }
  trackByDate (_: number, t: any): string { return t.date + t.desc; }
}