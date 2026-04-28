import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AdminService }  from '../../../../core/services/admin.service';
import { FormatService } from '../../../../core/services/format.service';

@Component({
  selector   : 'app-admin-user-detail',
  templateUrl: './admin-user-detail.component.html',
  styleUrls  : ['./admin-user-detail.component.scss']
})
export class AdminUserDetailComponent implements OnInit, OnDestroy {
  user    : any    = null;
  loading  = true;
  updating = false;
  successMsg = '';
  errorMsg   = '';

  private destroy$ = new Subject<void>();

  constructor(
    private route       : ActivatedRoute,
    private router      : Router,
    private adminService: AdminService,
    public  fmt         : FormatService,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) { this.router.navigate(['/admin/users']); return; }
    this.loadUser(id);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadUser(id: string): void {
    this.adminService.getUsers({ search: id, limit: 50 })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          const list  = Array.isArray(data) ? data : [];
          const found = list.find((u: any) => u.id === id);
          this.user    = found ? this.mapUser(found) : null;
          this.loading = false;
        },
        error: () => { this.loading = false; }
      });
  }

  suspend(): void {
    if (!this.user || this.updating) return;
    this.updating = true;
    this.adminService.updateUserStatus(this.user.id, 'SUSPENDED')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.user.status = 'SUSPENDED';
          this.updating    = false;
          this.showSuccess('Utilisateur suspendu');
        },
        error: (err: any) => {
          this.updating = false;
          this.showError(err?.error?.error?.message ?? 'Erreur');
        }
      });
  }

  reactivate(): void {
    if (!this.user || this.updating) return;
    this.updating = true;
    this.adminService.updateUserStatus(this.user.id, 'ACTIVE')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.user.status = 'ACTIVE';
          this.updating    = false;
          this.showSuccess('Utilisateur réactivé');
        },
        error: (err: any) => {
          this.updating = false;
          this.showError(err?.error?.error?.message ?? 'Erreur');
        }
      });
  }

  goBack(): void { this.router.navigate(['/admin/users']); }

  get roleLabel() : string { return this.user?.role === 'SUPPLIER' ? 'Fournisseur' : this.user?.role === 'ADMIN' ? 'Admin' : 'Membre'; }
  get roleBadge() : string { return this.user?.role === 'SUPPLIER' ? 'badge-cyan'  : this.user?.role === 'ADMIN' ? 'badge-err'  : 'badge-grey'; }
  get statusLabel(): string { return this.user?.status === 'ACTIVE' ? '✅ Actif' : '🔴 Suspendu'; }
  get statusBadge(): string { return this.user?.status === 'ACTIVE' ? 'badge-ok'  : 'badge-err'; }
  get avatarBg()  : string { return this.user?.role === 'SUPPLIER' ? '#00D4FF' : '#F5A623'; }

  private showSuccess(msg: string): void {
    this.successMsg = msg; this.errorMsg = '';
    setTimeout(() => { this.successMsg = ''; }, 3000);
  }

  private showError(msg: string): void {
    this.errorMsg = msg; this.successMsg = '';
    setTimeout(() => { this.errorMsg = ''; }, 4000);
  }

  private mapUser(u: any): any {
    return {
      id           : u.id,
      name         : u.name,
      phone        : u.phone,
      email        : u.email         ?? '',
      role         : u.role,
      status       : u.status,
      score        : u.trustScore    ?? 100,
      groups       : u._count?.groupMembers ?? 0,
      ordersCount  : u._count?.orders ?? 0,
      paymentsTotal: u.paymentsTotal ?? 0,
      totalSaved   : u.totalSaved    ?? 0,
      referralCount: u.referralCount ?? 0,
      city         : u.city          ?? 'Ouagadougou',
      joined       : new Date(u.createdAt).toLocaleDateString('fr-FR', {
        day: 'numeric', month: 'short', year: 'numeric'
      }),
    };
  }
}