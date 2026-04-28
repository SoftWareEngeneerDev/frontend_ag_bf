import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { AdminService } from '../../../core/services/admin.service';

const TAB_STATUS_MAP: Record<string, string> = {
  'Ouverts'  : 'OPEN',
  'En cours' : 'IN_REVIEW',
  'Résolus'  : 'RESOLVED',
};

@Component({
  selector   : 'app-admin-disputes',
  templateUrl: './admin-disputes.component.html',
  styleUrls  : ['./admin-disputes.component.scss']
})
export class AdminDisputesComponent implements OnInit, OnDestroy {
  activeTab = 'Tous';
  loading   = true;
  resolving = false;

  readonly tabs = ['Tous', 'Ouverts', 'En cours', 'Résolus'];

  disputes  : any[] = [];
  successMsg = '';
  errorMsg   = '';

  // Modal résolution
  showResolveModal = false;
  selectedDispute  : any = null;
  resolution       = '';

  private destroy$ = new Subject<void>();

  constructor(private adminService: AdminService) {}

  ngOnInit(): void { this.loadDisputes(); }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Charger les litiges ───────────────────────────────────────
  private loadDisputes(): void {
    this.loading = true;
    this.adminService.getDisputes('OPEN', 100)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          // Charger toutes catégories en parallèle via plusieurs appels
          this.loadAllDisputes();
        },
        error: () => { this.loading = false; }
      });
  }

  private loadAllDisputes(): void {
    // Charger OPEN + IN_REVIEW + RESOLVED en parallèle
    const statuses = ['OPEN', 'IN_REVIEW', 'RESOLVED'];
    const results: any[] = [];
    let completed = 0;

    statuses.forEach(status => {
      this.adminService.getDisputes(status, 50)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (data) => {
            results.push(...(Array.isArray(data) ? data : []));
            completed++;
            if (completed === statuses.length) {
              this.disputes = results.map((d: any) => this.mapDispute(d));
              this.loading  = false;
            }
          },
          error: () => {
            completed++;
            if (completed === statuses.length) this.loading = false;
          }
        });
    });
  }

  // ── Getters ───────────────────────────────────────────────────
  get openCount()  : number { return this.disputes.filter(d => d.status === 'OPEN').length; }
  get urgentCount(): number { return this.disputes.filter(d => d.urgent).length; }

  get filtered(): any[] {
    if (this.activeTab === 'Tous') return this.disputes;
    const status = TAB_STATUS_MAP[this.activeTab];
    return this.disputes.filter(d => d.status === status);
  }

  tabCount(t: string): number {
    if (t === 'Tous') return this.disputes.length;
    const status = TAB_STATUS_MAP[t];
    return this.disputes.filter(d => d.status === status).length;
  }

  setTab(t: string): void { this.activeTab = t; }

  // ── Prendre en charge → IN_REVIEW ────────────────────────────
  takeCharge(d: any): void {
    this.adminService.takeChargeDispute(d.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          d.status = 'IN_REVIEW';
          this.showSuccess('Litige pris en charge');
        },
        error: (err) => this.showError(err?.error?.error?.message ?? 'Erreur')
      });
  }

  // ── Ouvrir modal résolution ───────────────────────────────────
  openResolveModal(d: any): void {
    this.selectedDispute = d;
    this.resolution      = '';
    this.showResolveModal = true;
  }

  // ── Résoudre un litige ────────────────────────────────────────
  resolve(): void {
    if (!this.selectedDispute || !this.resolution.trim() || this.resolving) return;
    this.resolving = true;

    this.adminService.resolveDispute(this.selectedDispute.id, this.resolution)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.selectedDispute.status = 'RESOLVED';
          this.showResolveModal       = false;
          this.resolving              = false;
          this.showSuccess('Litige résolu — membre notifié');
        },
        error: (err) => {
          this.resolving = false;
          this.showError(err?.error?.error?.message ?? 'Erreur lors de la résolution');
        }
      });
  }

  // ── Rembourser ────────────────────────────────────────────────
  refund(d: any): void {
    if (!d.paymentId) {
      this.showError('Aucun paiement associé à ce litige');
      return;
    }
    this.adminService.refundPayment(d.paymentId, `Litige ${d.id} — ${d.reason}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          d.status = 'RESOLVED';
          this.showSuccess('Remboursement effectué — membre notifié');
        },
        error: (err) => this.showError(err?.error?.error?.message ?? 'Erreur lors du remboursement')
      });
  }

  // ── Helpers ───────────────────────────────────────────────────
  statusClass(s: string): string {
    const m: Record<string, string> = {
      OPEN     : 'badge-err',
      IN_REVIEW: 'badge-warn',
      RESOLVED : 'badge-ok',
      CLOSED   : 'badge-grey',
    };
    return m[s] ?? 'badge-grey';
  }

  statusLabel(s: string): string {
    const m: Record<string, string> = {
      OPEN     : '🔴 Ouvert',
      IN_REVIEW: '🟡 En cours',
      RESOLVED : '🟢 Résolu',
      CLOSED   : '⚫ Clôturé',
    };
    return m[s] ?? s;
  }

  trackById(_: number, d: any): string { return d.id; }

  private showSuccess(msg: string): void {
    this.successMsg = msg; this.errorMsg = '';
    setTimeout(() => { this.successMsg = ''; }, 3000);
  }

  private showError(msg: string): void {
    this.errorMsg = msg; this.successMsg = '';
    setTimeout(() => { this.errorMsg = ''; }, 4000);
  }

  private mapDispute(d: any): any {
    const createdAt = new Date(d.createdAt ?? Date.now());
    const ageInDays = Math.floor((Date.now() - createdAt.getTime()) / (1000 * 3600 * 24));
    return {
      id       : d.id,
      reporter : d.user?.name  ?? 'Inconnu',
      product  : d.orderId     ?? d.groupId ?? 'N/A',
      reason   : d.subject     ?? d.description ?? 'Litige',
      status   : d.status,
      date     : createdAt.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }),
      urgent   : ageInDays >= 3 && d.status === 'OPEN',
      paymentId: d.paymentId   ?? null,
    };
  }
}