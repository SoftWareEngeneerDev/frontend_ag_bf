import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { PaymentService } from '../../../core/services/payment.service';
import { FormatService }  from '../../../core/services/format.service';

const TYPE_LABELS: Record<string, string> = {
  DEPOSIT       : 'Acompte',
  FINAL_PAYMENT : 'Paiement final',
  COMMISSION    : 'Commission',
  SUPPLIER_PAYOUT: 'Virement fournisseur',
};

const TYPE_CLASSES: Record<string, string> = {
  DEPOSIT       : 'badge-cyan',
  FINAL_PAYMENT : 'badge-ok',
  COMMISSION    : 'badge-gold',
  SUPPLIER_PAYOUT: 'badge-grey',
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

interface PaymentItem {
  id          : string;
  reference   : string;
  type        : string;
  status      : string;
  method      : string;
  amount      : number;
  product     : string;
  date        : string;
}

@Component({
  selector   : 'app-member-payments',
  templateUrl: './member-payments.component.html',
  styleUrls  : ['./member-payments.component.scss'],
})
export class MemberPaymentsComponent implements OnInit, OnDestroy {
  payments : PaymentItem[] = [];
  loading   = true;
  activeTab = 'Tous';

  readonly tabList = [
    { key: 'Tous',             icon: 'fa-solid fa-list',           label: 'Tous' },
    { key: 'Acomptes',         icon: 'fa-solid fa-coins',          label: 'Acomptes' },
    { key: 'Paiements finaux', icon: 'fa-solid fa-circle-check',   label: 'Paiements finaux' },
    { key: 'Remboursements',   icon: 'fa-solid fa-rotate-left',    label: 'Remboursements' },
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private payService: PaymentService,
    public  fmt       : FormatService,
  ) {}

  ngOnInit(): void { this.loadPayments(); }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadPayments(): void {
    this.loading = true;
    this.payService.getMyPayments(1, 100)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.payments = (res.data ?? []).map((p: any) => this.mapPayment(p));
          this.loading  = false;
        },
        error: () => { this.loading = false; }
      });
  }

  get filtered(): PaymentItem[] {
    if (this.activeTab === 'Tous')            return this.payments;
    if (this.activeTab === 'Acomptes')        return this.payments.filter(p => p.type === 'DEPOSIT');
    if (this.activeTab === 'Paiements finaux') return this.payments.filter(p => p.type === 'FINAL_PAYMENT');
    if (this.activeTab === 'Remboursements')  return this.payments.filter(p => p.status === 'REFUNDED');
    return this.payments;
  }

  tabCount(key: string): number {
    if (key === 'Tous')             return this.payments.length;
    if (key === 'Acomptes')         return this.payments.filter(p => p.type === 'DEPOSIT').length;
    if (key === 'Paiements finaux')  return this.payments.filter(p => p.type === 'FINAL_PAYMENT').length;
    if (key === 'Remboursements')   return this.payments.filter(p => p.status === 'REFUNDED').length;
    return 0;
  }

  typeLabel(t: string) : string { return TYPE_LABELS[t]   ?? t; }
  typeClass(t: string) : string { return TYPE_CLASSES[t]  ?? 'badge-grey'; }
  statusLabel(s: string): string { return STATUS_LABELS[s] ?? s; }
  statusClass(s: string): string { return STATUS_CLASSES[s] ?? 'badge-grey'; }

  methodIcon(m: string): string {
    const icons: Record<string, string> = {
      ORANGE_MONEY : '🟠',
      MOOV_MONEY   : '🔵',
      LIGDICASH    : '🟢',
      CARD         : '💳',
      BANK_TRANSFER: '🏦',
    };
    return icons[m] ?? '💰';
  }

  trackById(_: number, p: PaymentItem): string { return p.id; }

  private mapPayment(p: any): PaymentItem {
    return {
      id       : p.id,
      reference: p.transactionRef ?? p.id?.slice(0, 12).toUpperCase() ?? 'N/A',
      type     : p.type,
      status   : p.status,
      method   : p.method ?? 'ORANGE_MONEY',
      amount   : p.amount ?? 0,
      product  : p.group?.product?.name ?? p.group?.title ?? '—',
      date     : new Date(p.createdAt ?? Date.now()).toLocaleDateString('fr-FR', {
        day: 'numeric', month: 'short', year: 'numeric',
      }),
    };
  }
}
