import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { AdminService }  from '../../../core/services/admin.service';
import { FormatService } from '../../../core/services/format.service';

const STATUS_TABS: Record<string, string> = {
  'En attente' : 'PENDING',
  'Complétés'  : 'COMPLETED',
  'Rejetés'    : 'REJECTED',
};

const METHOD_LABELS: Record<string, string> = {
  ORANGE_MONEY: 'Orange Money',
  MOOV_MONEY  : 'Moov Money',
  LIGDICASH   : 'Ligdicash',
};

@Component({
  selector   : 'app-admin-withdrawals',
  templateUrl: './admin-withdrawals.component.html',
  styleUrls  : ['./admin-withdrawals.component.scss'],
})
export class AdminWithdrawalsComponent implements OnInit, OnDestroy {
  withdrawals : any[] = [];
  loading      = true;
  processing   = '';
  activeTab    = 'Tous';
  successMsg   = '';
  errorMsg     = '';

  readonly tabs = ['Tous', 'En attente', 'Complétés', 'Rejetés'];

  showModal    = false;
  modalApprove = true;
  modalItem    : any = null;
  modalReason  = '';

  private destroy$ = new Subject<void>();

  constructor(
    private adminService: AdminService,
    public  fmt         : FormatService,
  ) {}

  ngOnInit(): void { this.loadWithdrawals(); }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadWithdrawals(): void {
    this.loading = true;
    this.adminService.getWithdrawals({ limit: 100 })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ data }) => {
          this.withdrawals = data;
          this.loading     = false;
        },
        error: () => { this.loading = false; },
      });
  }

  get filtered(): any[] {
    if (this.activeTab === 'Tous') return this.withdrawals;
    const status = STATUS_TABS[this.activeTab];
    return this.withdrawals.filter(w => w.status === status);
  }

  tabCount(tab: string): number {
    if (tab === 'Tous') return this.withdrawals.length;
    const status = STATUS_TABS[tab];
    return this.withdrawals.filter(w => w.status === status).length;
  }

  setTab(t: string): void { this.activeTab = t; }

  openModal(item: any, approve: boolean): void {
    this.modalItem    = item;
    this.modalApprove = approve;
    this.modalReason  = '';
    this.showModal    = true;
  }

  closeModal(): void { this.showModal = false; }

  confirm(): void {
    if (!this.modalItem || this.processing) return;
    if (!this.modalApprove && !this.modalReason.trim()) return;

    this.processing = this.modalItem.id;
    this.showModal  = false;

    this.adminService.processWithdrawal(
      this.modalItem.id,
      this.modalApprove,
      this.modalReason.trim() || undefined,
    )
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: () => {
        const w = this.withdrawals.find(x => x.id === this.modalItem.id);
        if (w) w.status = this.modalApprove ? 'COMPLETED' : 'REJECTED';
        this.processing = '';
        this.showSuccess(
          this.modalApprove
            ? 'Retrait approuvé — fournisseur notifié.'
            : 'Retrait refusé — fournisseur notifié.'
        );
      },
      error: (err) => {
        this.processing = '';
        this.showError(err?.error?.error?.message ?? 'Erreur lors du traitement.');
      },
    });
  }

  methodLabel(m: string): string  { return METHOD_LABELS[m] ?? m; }

  statusLabel(s: string): string {
    const m: Record<string, string> = {
      PENDING  : '⏳ En attente',
      COMPLETED: '✅ Approuvé',
      REJECTED : '❌ Refusé',
    };
    return m[s] ?? s;
  }

  statusClass(s: string): string {
    const m: Record<string, string> = {
      PENDING  : 'badge-warn',
      COMPLETED: 'badge-ok',
      REJECTED : 'badge-err',
    };
    return m[s] ?? 'badge-grey';
  }

  trackById(_: number, w: any): string { return w.id; }

  private showSuccess(msg: string): void {
    this.successMsg = msg; this.errorMsg = '';
    setTimeout(() => { this.successMsg = ''; }, 4000);
  }

  private showError(msg: string): void {
    this.errorMsg = msg; this.successMsg = '';
    setTimeout(() => { this.errorMsg = ''; }, 5000);
  }
}
