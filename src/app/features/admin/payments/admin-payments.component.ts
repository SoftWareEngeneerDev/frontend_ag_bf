import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { AdminService }  from '../../../core/services/admin.service';
import { FormatService } from '../../../core/services/format.service';

const TYPE_MAP: Record<string, string> = {
  'Acomptes'        : 'DEPOSIT',
  'Paiements finaux': 'FINAL_PAYMENT',
  'Remboursements'  : 'REFUND',
  'Commissions'     : 'COMMISSION',
};

const TYPE_LABELS: Record<string, string> = {
  DEPOSIT      : 'Acompte',
  FINAL_PAYMENT: 'Paiement final',
  FINAL        : 'Paiement final',
  REFUND       : 'Remboursement',
  COMMISSION   : 'Commission',
};

const TYPE_CLASSES: Record<string, string> = {
  DEPOSIT      : 'badge-cyan',
  FINAL_PAYMENT: 'badge-ok',
  FINAL        : 'badge-ok',
  REFUND       : 'badge-warn',
  COMMISSION   : 'badge-gold',
};

const STATUS_LABELS: Record<string, string> = {
  COMPLETED: '✅ Succès',
  PENDING  : '⏳ En attente',
  FAILED   : '❌ Échoué',
  ESCROWED : '🔒 Escrow',
  REFUNDED : '↩️ Remboursé',
};

const STATUS_CLASSES: Record<string, string> = {
  COMPLETED: 'badge-ok',
  PENDING  : 'badge-warn',
  FAILED   : 'badge-err',
  ESCROWED : 'badge-cyan',
  REFUNDED : 'badge-grey',
};

interface PaymentRow {
  id           : string;
  reference    : string;
  transactionId: string;
  user         : string;
  phone        : string;
  product      : string;
  groupId      : string;
  type         : string;
  status       : string;
  method       : string;
  amount       : number;
  date         : string;
}

@Component({
  selector   : 'app-admin-payments',
  templateUrl: './admin-payments.component.html',
  styleUrls  : ['./admin-payments.component.scss']
})
export class AdminPaymentsComponent implements OnInit, OnDestroy {
  search     = '';
  activeTab  = 'Tous';
  loading    = true;
  refunding  = '';

  readonly tabs = ['Tous', 'Acomptes', 'Paiements finaux', 'Remboursements', 'Commissions'];

  payments   : PaymentRow[] = [];
  successMsg  = '';
  errorMsg    = '';

  // Modal remboursement
  showRefundModal  = false;
  selectedPayment  : PaymentRow | null = null;
  refundReason     = '';

  private destroy$ = new Subject<void>();

  constructor(
    private adminService: AdminService,
    public  fmt         : FormatService,
  ) {}

  ngOnInit(): void { this.loadPayments(); }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Charger les paiements ─────────────────────────────────────
  private loadPayments(): void {
    this.loading = true;
    this.adminService.getPaymentsAnalytics()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          const recent  = data?.recentPayments ?? data?.payments ?? [];
          this.payments = recent.map((p: any) => this.mapPayment(p));
          this.loading  = false;
        },
        error: () => { this.loading = false; }
      });
  }

  // ── Filtre ────────────────────────────────────────────────────
  get filtered(): PaymentRow[] {
    const q = this.search.toLowerCase();
    return this.payments.filter(p => {
      const matchSearch = !q
        || p.reference.toLowerCase().includes(q)
        || p.user.toLowerCase().includes(q)
        || p.product.toLowerCase().includes(q)
        || p.transactionId.toLowerCase().includes(q);
      const matchTab = this.activeTab === 'Tous'
        || p.type === TYPE_MAP[this.activeTab];
      return matchSearch && matchTab;
    });
  }

  tabCount(t: string): number {
    if (t === 'Tous') return this.payments.length;
    return this.payments.filter(p => p.type === TYPE_MAP[t]).length;
  }

  // ── Totaux ────────────────────────────────────────────────────
  get totalSuccess()    : number { return this.sum(p => p.status === 'COMPLETED'); }
  get totalPending()    : number { return this.sum(p => p.status === 'PENDING' || p.status === 'ESCROWED'); }
  get totalRefunded()   : number { return this.sum(p => p.status === 'REFUNDED'); }
  get totalCommissions(): number { return this.sum(p => p.type === 'COMMISSION'); }

  private sum(pred: (p: PaymentRow) => boolean): number {
    return this.payments.filter(pred).reduce((s, p) => s + p.amount, 0);
  }

  // ── Ouvrir modal remboursement ────────────────────────────────
  openRefundModal(p: PaymentRow): void {
    this.selectedPayment = p;
    this.refundReason    = '';
    this.showRefundModal = true;
  }

  // ── Confirmer remboursement ───────────────────────────────────
  confirmRefund(): void {
    if (!this.selectedPayment || !this.refundReason.trim()) return;
    this.refunding = this.selectedPayment.id;

    this.adminService.refundPayment(this.selectedPayment.id, this.refundReason)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          if (this.selectedPayment) this.selectedPayment.status = 'REFUNDED';
          this.showRefundModal = false;
          this.refunding       = '';
          this.showSuccess('Remboursement effectué — membre notifié');
          this.selectedPayment = null;
        },
        error: (err) => {
          this.refunding = '';
          this.showError(err?.error?.error?.message ?? 'Erreur lors du remboursement');
        }
      });
  }

  // ── Helpers ───────────────────────────────────────────────────
  typeLabel(t: string)  : string { return TYPE_LABELS[t]   ?? t; }
  typeClass(t: string)  : string { return TYPE_CLASSES[t]  ?? 'badge-grey'; }
  statusLabel(s: string): string { return STATUS_LABELS[s] ?? s; }
  statusClass(s: string): string { return STATUS_CLASSES[s] ?? 'badge-grey'; }

  methodIcon(m: string): string {
    const icons: Record<string, string> = {
      ORANGE_MONEY: '🟠',
      MOOV_MONEY  : '🔵',
      LIGDICASH   : '🟢',
      CARD        : '💳',
    };
    return icons[m] ?? '💰';
  }

  methodLabel(m: string): string {
    return this.fmt.paymentMethodLabel(m as any);
  }

  amountColor(p: PaymentRow): string {
    if (p.type === 'REFUND')      return '#888';
    if (p.type === 'COMMISSION')  return '#F4A902';
    return '#10D98B';
  }

  trackById(_: number, p: PaymentRow): string { return p.id; }

  private showSuccess(msg: string): void {
    this.successMsg = msg; this.errorMsg = '';
    setTimeout(() => { this.successMsg = ''; }, 3000);
  }

  private showError(msg: string): void {
    this.errorMsg = msg; this.successMsg = '';
    setTimeout(() => { this.errorMsg = ''; }, 4000);
  }

  private mapPayment(p: any): PaymentRow {
    return {
      id           : p.id,
      reference    : p.transactionRef  ?? p.id?.slice(0, 12).toUpperCase() ?? 'N/A',
      transactionId: p.transactionRef  ?? '—',
      user         : p.user?.name      ?? 'Inconnu',
      phone        : p.user?.phone     ?? '—',
      product      : p.group?.product?.name ?? p.group?.title ?? 'N/A',
      groupId      : p.groupId         ?? '—',
      type         : p.type,
      status       : p.status,
      method       : p.method          ?? 'ORANGE_MONEY',
      amount       : p.amount          ?? 0,
      date         : new Date(p.createdAt ?? Date.now()).toLocaleDateString('fr-FR', {
        day: 'numeric', month: 'short', year: 'numeric'
      }),
    };
  }
}