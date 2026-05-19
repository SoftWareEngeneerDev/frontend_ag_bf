import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AdminService }  from '../../../../core/services/admin.service';
import { FormatService } from '../../../../core/services/format.service';

@Component({
  selector   : 'app-admin-supplier-detail',
  templateUrl: './admin-supplier-detail.component.html',
  styleUrls  : ['./admin-supplier-detail.component.scss']
})
export class AdminSupplierDetailComponent implements OnInit, OnDestroy {
  supplier  : any  = null;
  loading    = true;
  processing = false;
  successMsg = '';
  errorMsg   = '';

  showSuspendModal = false;

  private destroy$ = new Subject<void>();

  constructor(
    private route       : ActivatedRoute,
    private router      : Router,
    private adminService: AdminService,
    public  fmt         : FormatService,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) { this.router.navigate(['/admin/suppliers']); return; }
    this.loadSupplier(id);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadSupplier(id: string): void {
    this.adminService.getSupplierById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          this.supplier = data ? this.mapSupplier(data) : null;
          this.loading  = false;
        },
        error: () => { this.loading = false; }
      });
  }

  approve(): void {
    if (!this.supplier || this.processing) return;
    this.processing = true;
    this.adminService.validateSupplier(this.supplier.id, true)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.supplier.status = 'APPROVED';
          this.processing = false;
          this.showSuccess(`${this.supplier.companyName} approuvé !`);
        },
        error: (err: any) => {
          this.processing = false;
          this.showError(err?.error?.error?.message ?? 'Erreur');
        }
      });
  }

  suspend(): void {
    if (!this.supplier || this.processing) return;
    this.processing = true;
    this.adminService.updateUserStatus(this.supplier.userId, 'SUSPENDED')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.supplier.status = 'SUSPENDED';
          this.showSuspendModal = false;
          this.processing = false;
          this.showSuccess(`${this.supplier.companyName} suspendu`);
        },
        error: (err: any) => {
          this.processing = false;
          this.showError(err?.error?.error?.message ?? 'Erreur');
        }
      });
  }

  reactivate(): void {
    if (!this.supplier || this.processing) return;
    this.processing = true;
    this.adminService.validateSupplier(this.supplier.id, true)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.supplier.status = 'APPROVED';
          this.processing = false;
          this.showSuccess(`${this.supplier.companyName} réactivé`);
        },
        error: (err: any) => {
          this.processing = false;
          this.showError(err?.error?.error?.message ?? 'Erreur');
        }
      });
  }

  goBack(): void { this.router.navigate(['/admin/suppliers']); }

  get statusLabel(): string {
    const m: Record<string, string> = { APPROVED: '✅ Approuvé', PENDING: '⏳ En attente', SUSPENDED: '🔴 Suspendu', REJECTED: '❌ Rejeté' };
    return m[this.supplier?.status] ?? this.supplier?.status;
  }

  get statusBadge(): string {
    const m: Record<string, string> = { APPROVED: 'badge-ok', PENDING: 'badge-warn', SUSPENDED: 'badge-err', REJECTED: 'badge-err' };
    return m[this.supplier?.status] ?? 'badge-grey';
  }

  private showSuccess(msg: string): void {
    this.successMsg = msg; this.errorMsg = '';
    setTimeout(() => { this.successMsg = ''; }, 3000);
  }

  private showError(msg: string): void {
    this.errorMsg = msg; this.successMsg = '';
    setTimeout(() => { this.errorMsg = ''; }, 4000);
  }

  private mapSupplier(s: any): any {
    return {
      id          : s.id,
      userId      : s.user?.id   ?? s.userId,
      companyName : s.companyName,
      contactName : s.user?.name ?? '',
      phone       : s.user?.phone ?? '',
      email       : s.user?.email ?? '',
      city        : s.user?.city  ?? 'Ouagadougou',
      address     : s.address     ?? '',
      description : s.description ?? '',
      status      : s.status,
      commissionRate: s.commissionRate ?? 0.07,
      rating      : s.rating          ?? 0,
      reviewCount : s.reviewCount      ?? 0,
      totalGroups : s._count?.groups   ?? 0,
      totalProducts: s._count?.products ?? 0,
      successRate : s.successRate      ?? 0,
      validatedAt : s.validatedAt ? new Date(s.validatedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : null,
      createdAt   : new Date(s.createdAt ?? Date.now()).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }),
      docsUrls    : s.docsUrls ?? [],
    };
  }
}