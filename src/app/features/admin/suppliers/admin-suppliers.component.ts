import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { AdminService } from '../../../core/services/admin.service';
import { Supplier } from '../../../core/models';

const TAB_STATUS_MAP: Record<string, string> = {
  'Approuvés' : 'APPROVED',
  'En attente': 'PENDING',
  'Suspendus' : 'SUSPENDED',
};

@Component({
  selector   : 'app-admin-suppliers',
  templateUrl: './admin-suppliers.component.html',
  styleUrls  : ['./admin-suppliers.component.scss']
})
export class AdminSuppliersComponent implements OnInit, OnDestroy {
  suppliers : Supplier[] = [];
  loading    = true;
  activeTab  = 'En attente';

  readonly tabs = ['Tous', 'Approuvés', 'En attente', 'Suspendus'];

  successMsg = '';
  errorMsg   = '';

  showRejectModal   = false;
  selectedSupplier  : Supplier | null = null;
  rejectReason      = '';
  processing        = false;

  private destroy$ = new Subject<void>();

  constructor(private adminService: AdminService) {}

  ngOnInit(): void { this.loadAllSuppliers(); }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadAllSuppliers(): void {
    this.loading = true;
    const statuses = ['PENDING', 'APPROVED', 'SUSPENDED'];
    const results: any[] = [];
    let completed = 0;

    statuses.forEach(status => {
      this.adminService.getSuppliers(status, 100)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (data: any) => {
            const list = Array.isArray(data) ? data : [];
            results.push(...list);
            completed++;
            if (completed === statuses.length) {
              const seen = new Set<string>();
              this.suppliers = results
                .filter(s => { if (seen.has(s.id)) return false; seen.add(s.id); return true; })
                .map((s: any) => this.mapSupplier(s));
              this.loading = false;
            }
          },
          error: () => {
            completed++;
            if (completed === statuses.length) this.loading = false;
          }
        });
    });
  }

  get filtered(): Supplier[] {
    if (this.activeTab === 'Tous') return this.suppliers;
    const status = TAB_STATUS_MAP[this.activeTab];
    return this.suppliers.filter(s => s.status === status);
  }

  get pendingCount(): number {
    return this.suppliers.filter(s => s.status === 'PENDING').length;
  }

  tabCount(t: string): number {
    if (t === 'Tous') return this.suppliers.length;
    const status = TAB_STATUS_MAP[t];
    return this.suppliers.filter(s => s.status === status).length;
  }

  approve(s: Supplier): void {
    if (this.processing) return;
    this.processing = true;
    this.adminService.validateSupplier(s.id, true)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          s.status      = 'APPROVED' as any;
          this.processing = false;
          this.showSuccess(`${s.companyName} approuvé`);
        },
        error: (err: any) => {
          this.processing = false;
          this.showError(err?.error?.error?.message ?? 'Erreur');
        }
      });
  }

  openRejectModal(s: Supplier): void {
    this.selectedSupplier = s;
    this.rejectReason     = '';
    this.showRejectModal  = true;
  }

  confirmReject(): void {
    if (!this.selectedSupplier || !this.rejectReason.trim() || this.processing) return;
    this.processing = true;

    this.adminService.validateSupplier(this.selectedSupplier.id, false, this.rejectReason)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          if (this.selectedSupplier) this.selectedSupplier.status = 'SUSPENDED' as any;
          this.showRejectModal  = false;
          this.processing       = false;
          this.showSuccess(`${this.selectedSupplier?.companyName} rejeté`);
          this.selectedSupplier = null;
        },
        error: (err: any) => {
          this.processing = false;
          this.showError(err?.error?.error?.message ?? 'Erreur');
        }
      });
  }

  suspend(s: Supplier): void {
    if (this.processing) return;
    this.processing = true;
    this.adminService.updateUserStatus((s as any).user?.id ?? s.id, 'SUSPENDED')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          s.status      = 'SUSPENDED' as any;
          this.processing = false;
          this.showSuccess(`${s.companyName} suspendu`);
        },
        error: (err: any) => {
          this.processing = false;
          this.showError(err?.error?.error?.message ?? 'Erreur');
        }
      });
  }

  reactivate(s: Supplier): void { this.approve(s); }

  statusClass(s: string): string {
    const m: Record<string, string> = { APPROVED: 'badge-ok', PENDING: 'badge-warn', SUSPENDED: 'badge-err' };
    return m[s] ?? 'badge-grey';
  }

  statusLabel(s: string): string {
    const m: Record<string, string> = { APPROVED: '✅ Approuvé', PENDING: '⏳ En attente', SUSPENDED: '🔴 Suspendu' };
    return m[s] ?? s;
  }

  trackById(_: number, s: Supplier): string { return s.id; }

  private showSuccess(msg: string): void {
    this.successMsg = msg; this.errorMsg = '';
    setTimeout(() => { this.successMsg = ''; }, 3000);
  }

  private showError(msg: string): void {
    this.errorMsg = msg; this.successMsg = '';
    setTimeout(() => { this.errorMsg = ''; }, 4000);
  }

  private mapSupplier(s: any): Supplier {
    return {
      id          : s.id,
      companyName : s.companyName,
      contactName : s.user?.name    ?? '',
      phone       : s.user?.phone   ?? s.phone ?? '',
      email       : s.user?.email   ?? s.email ?? '',
      address     : s.address       ?? '',
      city        : s.user?.city    ?? s.city ?? 'Ouagadougou',
      description : s.description   ?? '',
      status      : s.status,
      verifiedAt  : s.validatedAt ? new Date(s.validatedAt) : undefined,
      rating      : s.rating        ?? 0,
      reviewCount : s.reviewCount   ?? 0,
      totalGroups : s._count?.groups ?? 0,
      successRate : s.successRate   ?? 0,
      createdAt   : new Date(s.createdAt ?? Date.now()),
      user        : s.user,
    };
  }
}