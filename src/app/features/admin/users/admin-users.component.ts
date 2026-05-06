import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { AdminService } from '../../../core/services/admin.service';

const ROLE_LABELS: Record<string, string> = {
  MEMBER  : 'Membre',
  SUPPLIER: 'Fournisseur',
  ADMIN   : 'Admin',
};

const ROLE_BADGES: Record<string, string> = {
  MEMBER  : 'badge-grey',
  SUPPLIER: 'badge-cyan',
  ADMIN   : 'badge-err',
};

@Component({
  selector   : 'app-admin-users',
  templateUrl: './admin-users.component.html',
  styleUrls  : ['./admin-users.component.scss']
})
export class AdminUsersComponent implements OnInit, OnDestroy {
  search    = '';
  activeTab = 'Tous';
  loading   = true;

  readonly tabs = ['Tous', 'Membres', 'Fournisseurs', 'Admins', 'Suspendus'];

  users      : any[] = [];
  successMsg = '';
  errorMsg   = '';

  // ── Popup suspension ──────────────────────────────────────────
  showSuspendModal = false;
  selectedUser     : any = null;
  suspendReason    = '';    // ✅ Raison de suspension
  processing       = false;

  private destroy$ = new Subject<void>();

  constructor(private adminService: AdminService) {}

  ngOnInit(): void { this.loadUsers(); }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadUsers(): void {
    this.loading = true;
    this.adminService.getUsers({ page: 1, limit: 200 })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          const list   = Array.isArray(data) ? data : [];
          this.users   = list.map((u: any) => this.mapUser(u));
          this.loading = false;
        },
        error: () => { this.loading = false; }
      });
  }

  get filtered(): any[] {
    const q = this.search.toLowerCase();
    return this.users.filter(u => {
      const matchSearch = !q
        || u.name.toLowerCase().includes(q)
        || u.phone.includes(q)
        || u.email?.toLowerCase().includes(q);

      const matchTab =
        this.activeTab === 'Tous'         ? true :
        this.activeTab === 'Membres'      ? u.role === 'MEMBER' :
        this.activeTab === 'Fournisseurs' ? u.role === 'SUPPLIER' :
        this.activeTab === 'Admins'       ? u.role === 'ADMIN' :
        this.activeTab === 'Suspendus'    ? u.status === 'SUSPENDED' : true;

      return matchSearch && matchTab;
    });
  }

  tabCount(t: string): number {
    if (t === 'Tous')         return this.users.length;
    if (t === 'Membres')      return this.users.filter(u => u.role === 'MEMBER').length;
    if (t === 'Fournisseurs') return this.users.filter(u => u.role === 'SUPPLIER').length;
    if (t === 'Admins')       return this.users.filter(u => u.role === 'ADMIN').length;
    if (t === 'Suspendus')    return this.users.filter(u => u.status === 'SUSPENDED').length;
    return 0;
  }

  // ── Ouvrir popup suspension ───────────────────────────────────
  openSuspendModal(u: any): void {
    this.selectedUser     = u;
    this.suspendReason    = '';   // ✅ Réinitialiser la raison
    this.showSuspendModal = true;
  }

  // ── Confirmer suspension ──────────────────────────────────────
  confirmSuspend(): void {
    if (!this.selectedUser || this.processing) return;
    this.processing = true;

    // ✅ Passer la raison au backend
    this.adminService.updateUserStatus(
      this.selectedUser.id,
      'SUSPENDED',
      this.suspendReason.trim() || undefined
    )
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: () => {
        this.selectedUser.status = 'SUSPENDED';
        this.showSuspendModal    = false;
        this.processing          = false;
        this.showSuccess(`${this.selectedUser.name} suspendu`);
        this.selectedUser        = null;
      },
      error: (err: any) => {
        this.processing = false;
        this.showError(err?.error?.error?.message ?? 'Erreur');
      }
    });
  }

  reactivate(u: any): void {
    this.adminService.updateUserStatus(u.id, 'ACTIVE')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => { u.status = 'ACTIVE'; this.showSuccess(`${u.name} réactivé`); },
        error: (err: any) => this.showError(err?.error?.error?.message ?? 'Erreur')
      });
  }

  roleLabel(r: string): string { return ROLE_LABELS[r] ?? r; }
  roleBadge(r: string): string { return ROLE_BADGES[r] ?? 'badge-grey'; }
  avatarBg (r: string): string { return r === 'SUPPLIER' ? '#00D4FF' : '#F5A623'; }
  trackById(_: number, u: any): string { return u.id; }

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
      email        : u.email        ?? '',
      role         : u.role,
      status       : u.status,
      score        : u.trustScore   ?? 100,
      groups       : u._count?.groupMembers ?? 0,
      paymentsTotal: u._count?.payments ?? 0,
      totalSaved   : u.totalSaved   ?? 0,
      referralCount: u.referralCount ?? 0,
      city         : u.city         ?? 'Ouagadougou',
      joined       : new Date(u.createdAt).toLocaleDateString('fr-FR', {
        day: 'numeric', month: 'short', year: 'numeric'
      }),
    };
  }
}