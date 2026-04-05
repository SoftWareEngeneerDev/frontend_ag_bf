import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../../core/services/admin.service';

@Component({
  selector: 'app-admin-users',
  templateUrl: './admin-users.component.html',
  styleUrls:  ['./admin-users.component.scss']
})
export class AdminUsersComponent implements OnInit {
  search    = '';
  activeTab = 'Tous';
  loading   = true;
  tabs      = ['Tous', 'Membres', 'Fournisseurs', 'Suspendus'];
  users: any[] = [];

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  // ── GET /admin/users ──────────────────────────────────────────
  private loadUsers(): void {
    this.loading = true;
    this.adminService.getUsers({ page: 1 }).subscribe({
      next: (res) => {
        this.users   = (res.data?.users ?? res.data ?? []).map((u: any) => this.mapUser(u));
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  get filtered(): any[] {
    return this.users.filter(u => {
      const matchSearch = !this.search ||
        u.name.toLowerCase().includes(this.search.toLowerCase()) ||
        u.phone.includes(this.search);
      const matchTab =
        this.activeTab === 'Tous'         ? true :
        this.activeTab === 'Membres'      ? u.role === 'MEMBER' :
        this.activeTab === 'Fournisseurs' ? u.role === 'SUPPLIER' :
        this.activeTab === 'Suspendus'    ? u.status === 'SUSPENDED' : true;
      return matchSearch && matchTab;
    });
  }

  // ── Suspendre un utilisateur ──────────────────────────────────
  suspend(u: any): void {
    this.adminService.updateUserStatus(u.id, 'SUSPENDED').subscribe({
      next: () => { u.status = 'SUSPENDED'; },
      error: () => {}
    });
  }

  // ── Réactiver un utilisateur ──────────────────────────────────
  reactivate(u: any): void {
    this.adminService.updateUserStatus(u.id, 'ACTIVE').subscribe({
      next: () => { u.status = 'ACTIVE'; },
      error: () => {}
    });
  }

  // ── Helper mapper ─────────────────────────────────────────────
  private mapUser(u: any): any {
    return {
      id:     u.id,
      name:   u.name,
      phone:  u.phone,
      email:  u.email ?? '',
      role:   u.role,
      status: u.status,
      score:  u.trustScore ?? 100,
      groups: u._count?.groupMembers ?? 0,
      joined: new Date(u.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }),
      city:         u.city         ?? 'Ouagadougou',
      totalSaved:   u.totalSaved   ?? 0,
      referralCount: u.referralCount ?? 0,
      ordersCount:  u._count?.orders ?? 0,
      paymentsTotal: u.paymentsTotal ?? 0,
    };
  }
}