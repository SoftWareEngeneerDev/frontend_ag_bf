import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminService } from '../../../../core/services/admin.service';

@Component({
  selector: 'app-admin-user-detail',
  templateUrl: './admin-user-detail.component.html',
  styleUrls: ['./admin-user-detail.component.scss']
})
export class AdminUserDetailComponent implements OnInit {
  user: any = null;
  loading = true;

  constructor(
    private route:        ActivatedRoute,
    private router:       Router,
    private adminService: AdminService,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) { this.router.navigate(['/admin/users']); return; }

    // ── Charger les détails de l'utilisateur ──────────────────
    this.adminService.getUsers({ search: id }).subscribe({
      next: (res) => {
        const users = res.data?.users ?? res.data ?? [];
        const found = users.find((u: any) => u.id === id);
        this.user    = found ? this.mapUser(found) : null;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  // ── Suspendre ─────────────────────────────────────────────────
  suspend(): void {
    if (!this.user) return;
    this.adminService.updateUserStatus(this.user.id, 'SUSPENDED').subscribe({
      next: () => { this.user.status = 'SUSPENDED'; },
      error: () => {}
    });
  }

  // ── Réactiver ─────────────────────────────────────────────────
  reactivate(): void {
    if (!this.user) return;
    this.adminService.updateUserStatus(this.user.id, 'ACTIVE').subscribe({
      next: () => { this.user.status = 'ACTIVE'; },
      error: () => {}
    });
  }

  goBack(): void { this.router.navigate(['/admin/users']); }

  get roleLabel(): string  { return this.user?.role === 'SUPPLIER' ? 'Fournisseur' : this.user?.role === 'ADMIN' ? 'Admin' : 'Membre'; }
  get roleBadge(): string  { return this.user?.role === 'SUPPLIER' ? 'badge-cyan' : this.user?.role === 'ADMIN' ? 'badge-err' : 'badge-grey'; }
  get statusLabel(): string { return this.user?.status === 'ACTIVE' ? 'Actif' : 'Suspendu'; }
  get statusBadge(): string { return this.user?.status === 'ACTIVE' ? 'badge-ok' : 'badge-err'; }
  get avatarBg(): string   { return this.user?.role === 'SUPPLIER' ? '#00D4FF' : '#F5A623'; }

  formatXOF(val: number): string {
    return (val ?? 0).toLocaleString('fr-FR') + ' XOF';
  }

  // ── Helper mapper ─────────────────────────────────────────────
  private mapUser(u: any): any {
    return {
      id:            u.id,
      name:          u.name,
      phone:         u.phone,
      email:         u.email         ?? '',
      role:          u.role,
      status:        u.status,
      score:         u.trustScore    ?? 100,
      groups:        u._count?.groupMembers ?? 0,
      joined:        new Date(u.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }),
      city:          u.city          ?? 'Ouagadougou',
      totalSaved:    u.totalSaved    ?? 0,
      referralCount: u.referralCount ?? 0,
      ordersCount:   u._count?.orders ?? 0,
      paymentsTotal: u.paymentsTotal ?? 0,
    };
  }
}