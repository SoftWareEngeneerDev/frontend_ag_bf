import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

const API = 'http://localhost:3000/api/v1';

@Component({
  selector: 'app-supplier-revenue',
  templateUrl: './supplier-revenue.component.html',
  styleUrls:  ['./supplier-revenue.component.scss']
})
export class SupplierRevenueComponent implements OnInit {
  loading = true;

  // ── Graphique revenus ─────────────────────────────────────────
  revData: { month: string; revenue: number; commissions: number }[] = [];
  get revMax(): number { return Math.max(...this.revData.map(r => r.revenue), 1); }

  // ── KPIs ──────────────────────────────────────────────────────
  kpis = [
    { icon: '💰', label: 'Revenu ce mois',      val: '0 XOF',   sub: '',                   color: '#10D98B' },
    { icon: '🏦', label: 'En escrow (bloqué)',   val: '0 XOF',   sub: 'Groupes actifs',     color: '#FFB347' },
    { icon: '✅', label: 'Payé ce mois',         val: '0 XOF',   sub: 'Groupes terminés',   color: '#F5A623' },
    { icon: '📊', label: 'Commission plateforme', val: '0 XOF',   sub: '7% du revenu total', color: '#00D4FF' },
  ];

  // ── Transactions ──────────────────────────────────────────────
  transactions: {
    date:   string;
    desc:   string;
    amount: number;
    type:   string;
    color:  string;
  }[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadRevenue();
  }

  // ── Charger les données de revenus ────────────────────────────
  private loadRevenue(): void {
    this.loading = true;

    // ── Paiements du fournisseur ──────────────────────────────
    this.http.get<any>(`${API}/users/me/history`).subscribe({
      next: (res) => {
        const payments = res.data?.payments ?? res.data ?? [];

        // Calculer les KPIs depuis les paiements
        const now       = new Date();
        const thisMonth = payments.filter((p: any) =>
          new Date(p.createdAt).getMonth() === now.getMonth() &&
          new Date(p.createdAt).getFullYear() === now.getFullYear()
        );

        const totalMonth    = thisMonth.filter((p: any) => p.status === 'COMPLETED').reduce((s: number, p: any) => s + (p.amount ?? 0), 0);
        const escrow        = payments.filter((p: any) => p.status === 'ESCROWED').reduce((s: number, p: any) => s + (p.amount ?? 0), 0);
        const commission    = Math.round(totalMonth * 0.07);

        this.kpis[0].val = this.formatXOF(totalMonth);
        this.kpis[1].val = this.formatXOF(escrow);
        this.kpis[2].val = this.formatXOF(totalMonth - commission);
        this.kpis[3].val = this.formatXOF(commission);

        // Graphique 6 derniers mois
        const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
        this.revData = Array.from({ length: 6 }, (_, i) => {
          const d     = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
          const month = months[d.getMonth()];
          const rev   = payments
            .filter((p: any) => {
              const pd = new Date(p.createdAt);
              return pd.getMonth() === d.getMonth() && pd.getFullYear() === d.getFullYear() && p.status === 'COMPLETED';
            })
            .reduce((s: number, p: any) => s + (p.amount ?? 0), 0);
          return { month, revenue: rev, commissions: Math.round(rev * 0.07) };
        });

        // Transactions récentes
        this.transactions = payments
          .slice(0, 10)
          .map((p: any) => {
            const isCommission = p.type === 'COMMISSION';
            const isRefund     = p.type === 'REFUND';
            const amount = isCommission || isRefund ? -(p.amount ?? 0) : (p.amount ?? 0);
            return {
              date:   new Date(p.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }),
              desc:   p.group?.product?.name
                ? `${p.type === 'DEPOSIT' ? 'Dépôt reçu' : p.type === 'FINAL_PAYMENT' ? 'Paiement final' : p.type} — ${p.group.product.name}`
                : `Paiement ${p.id?.slice(0, 8)}`,
              amount,
              type:   isCommission ? 'PRÉLEVÉ' : isRefund ? 'REMBOURSÉ' : p.type === 'DEPOSIT' ? 'DÉPÔT' : 'REÇU',
              color:  amount > 0 ? '#10D98B' : '#FF4D6A',
            };
          });

        this.loading = false;
      },
      error: () => {
        this.loading = false;
        // Données par défaut si erreur
        this.revData = Array.from({ length: 6 }, (_, i) => ({
          month:       ['Oct', 'Nov', 'Déc', 'Jan', 'Fév', 'Mar'][i],
          revenue:     0,
          commissions: 0,
        }));
      }
    });
  }

  private formatXOF(val: number): string {
    if (val >= 1_000_000) return (val / 1_000_000).toFixed(2) + 'M XOF';
    if (val >= 1_000)     return (val / 1_000).toFixed(0) + 'k XOF';
    return val.toLocaleString('fr-FR') + ' XOF';
  }
}