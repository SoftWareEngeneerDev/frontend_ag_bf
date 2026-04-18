import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AdminService } from '../../../core/services/admin.service';

const API = 'http://localhost:3000/api/v1';

interface PaymentRow {
  id:            string;
  reference:     string;
  transactionId: string;
  user:          string;
  phone:         string;
  product:       string;
  groupId:       string;
  type:          string;
  status:        string;
  method:        string;
  amount:        number;
  date:          string;
}

@Component({
  selector: 'app-admin-payments',
  templateUrl: './admin-payments.component.html',
  styleUrls: ['./admin-payments.component.scss']
})
export class AdminPaymentsComponent implements OnInit {
  search    = '';
  activeTab = 'Tous';
  loading   = true;
  tabs      = ['Tous', 'Acomptes', 'Paiements finaux', 'Remboursements', 'Commissions'];
  payments: PaymentRow[] = [];

  constructor(
    private http:         HttpClient,
    private adminService: AdminService,
  ) {}

  ngOnInit(): void {
    this.loadPayments();
  }

  // ── Charger les paiements depuis les analytics ────────────────
  private loadPayments(): void {
    this.loading = true;
    this.http.get<any>(`${API}/admin/analytics/payments`).subscribe({
      next: (res) => {
        const data = res.data;

        // Mapper les paiements récents
        const recent = data?.recentPayments ?? data?.payments ?? [];
        this.payments = recent.map((p: any) => this.mapPayment(p));
        this.loading  = false;
      },
      error: () => { this.loading = false; }
    });
  }

  get filtered(): PaymentRow[] {
    const typeMap: Record<string, string> = {
      'Acomptes':        'DEPOSIT',
      'Paiements finaux':'FINAL_PAYMENT',
      'Remboursements':  'REFUND',
      'Commissions':     'COMMISSION',
    };
    return this.payments.filter(p => {
      const q           = this.search.toLowerCase();
      const matchSearch = !this.search ||
        p.reference.toLowerCase().includes(q)     ||
        p.user.toLowerCase().includes(q)          ||
        p.product.toLowerCase().includes(q)       ||
        p.transactionId.toLowerCase().includes(q);
      const matchTab = this.activeTab === 'Tous' || p.type === typeMap[this.activeTab];
      return matchSearch && matchTab;
    });
  }

  get totalSuccess():     number { return this.payments.filter(p => p.status === 'COMPLETED').reduce((s, p) => s + p.amount, 0); }
  get totalPending():     number { return this.payments.filter(p => p.status === 'PENDING').reduce((s, p) => s + p.amount, 0); }
  get totalRefunded():    number { return this.payments.filter(p => p.status === 'REFUNDED').reduce((s, p) => s + p.amount, 0); }
  get totalCommissions(): number { return this.payments.filter(p => p.type === 'COMMISSION').reduce((s, p) => s + p.amount, 0); }

  // ── Rembourser un paiement ────────────────────────────────────
  refund(p: PaymentRow): void {
    this.adminService.refundPayment(p.id, 'Remboursement manuel admin').subscribe({
      next: () => { p.status = 'REFUNDED'; },
      error: () => {}
    });
  }

  typeLabel(t: string): string {
    if (t === 'DEPOSIT'       || t === 'DEPOSIT')        return 'Acompte';
    if (t === 'FINAL_PAYMENT' || t === 'FINAL')          return 'Paiement final';
    if (t === 'REFUND')                                   return 'Remboursement';
    return 'Commission';
  }

  typeClass(t: string): string {
    if (t === 'DEPOSIT')       return 'badge-cyan';
    if (t === 'FINAL_PAYMENT') return 'badge-ok';
    if (t === 'REFUND')        return 'badge-warn';
    return 'badge-gold';
  }

  statusLabel(s: string): string {
    if (s === 'COMPLETED') return 'Succès';
    if (s === 'PENDING')   return 'En attente';
    if (s === 'FAILED')    return 'Échoué';
    if (s === 'ESCROWED')  return 'Escrow';
    return 'Remboursé';
  }

  statusClass(s: string): string {
    if (s === 'COMPLETED') return 'badge-ok';
    if (s === 'PENDING')   return 'badge-warn';
    if (s === 'FAILED')    return 'badge-err';
    if (s === 'ESCROWED')  return 'badge-cyan';
    return 'badge-grey';
  }

  methodIcon(m: string): string {
    if (m === 'ORANGE_MONEY') return '🟠';
    if (m === 'MOOV_MONEY')   return '🔵';
    if (m === 'LIGDICASH')    return '🟢';
    return '💳';
  }

  methodLabel(m: string): string {
    if (m === 'ORANGE_MONEY') return 'Orange Money';
    if (m === 'MOOV_MONEY')   return 'Moov Money';
    if (m === 'LIGDICASH')    return 'LigdiCash';
    return 'Carte';
  }

  formatXOF(val: number): string {
    return (val ?? 0).toLocaleString('fr-FR') + ' XOF';
  }

  // ── Helper mapper ─────────────────────────────────────────────
  private mapPayment(p: any): PaymentRow {
    return {
      id:            p.id,
      reference:     p.transactionRef  ?? p.id?.slice(0, 12).toUpperCase() ?? 'N/A',
      transactionId: p.transactionRef  ?? '—',
      user:          p.user?.name      ?? 'Inconnu',
      phone:         p.user?.phone     ?? '—',
      product:       p.group?.product?.name ?? p.group?.title ?? 'N/A',
      groupId:       p.groupId         ?? '—',
      type:          p.type,
      status:        p.status,
      method:        p.method          ?? 'ORANGE_MONEY',
      amount:        p.amount          ?? 0,
      date:          new Date(p.createdAt ?? Date.now()).toLocaleDateString('fr-FR', {
        day: 'numeric', month: 'short', year: 'numeric'
      }),
    };
  }
}