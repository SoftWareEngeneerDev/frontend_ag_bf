import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../../core/services/admin.service';
import { Supplier } from '../../../core/models';

@Component({
  selector: 'app-admin-suppliers',
  templateUrl: './admin-suppliers.component.html',
  styleUrls:  ['./admin-suppliers.component.scss']
})
export class AdminSuppliersComponent implements OnInit {
  suppliers: Supplier[] = [];
  loading   = true;
  activeTab = 'Tous';
  tabs      = ['Tous', 'Approuvés', 'En attente', 'Suspendus'];

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadSuppliers();
  }

  // ── GET /admin/suppliers ──────────────────────────────────────
  private loadSuppliers(): void {
    this.loading = true;
    this.adminService.getSuppliers('ALL', 100).subscribe({
      next: (data) => {
        this.suppliers = data.map((s: any) => this.mapSupplier(s));
        this.loading   = false;
      },
      error: () => { this.loading = false; }
    });
  }

  get pendingCount(): number {
    return this.suppliers.filter(s => s.status === 'PENDING').length;
  }

  get filtered(): Supplier[] {
    const map: Record<string, string> = {
      'Approuvés':  'APPROVED',
      'En attente': 'PENDING',
      'Suspendus':  'SUSPENDED',
    };
    return this.activeTab === 'Tous'
      ? this.suppliers
      : this.suppliers.filter(s => s.status === map[this.activeTab]);
  }

  // ── PATCH /admin/suppliers/:id/validate → Approuver ──────────
  approve(s: Supplier): void {
    this.adminService.validateSupplier(s.id, true).subscribe({
      next: () => {
        s.status = 'APPROVED' as any;
      },
      error: () => {}
    });
  }

  // ── PATCH /admin/suppliers/:id/validate → Rejeter ─────────────
  reject(s: Supplier): void {
    this.adminService.validateSupplier(s.id, false, 'Dossier incomplet').subscribe({
      next: () => {
        s.status = 'SUSPENDED' as any;
      },
      error: () => {}
    });
  }

  // ── PATCH /admin/users/:id/status → Suspendre ─────────────────
  suspend(s: Supplier): void {
    this.adminService.updateUserStatus(s.user?.id ?? s.id, 'SUSPENDED').subscribe({
      next: () => {
        s.status = 'SUSPENDED' as any;
      },
      error: () => {}
    });
  }

  statusClass(s: string): string {
    return s === 'APPROVED' ? 'badge-ok' : s === 'PENDING' ? 'badge-warn' : 'badge-err';
  }

  statusLabel(s: string): string {
    return s === 'APPROVED' ? '✓ Approuvé' : s === 'PENDING' ? '⏳ En attente' : '✗ Suspendu';
  }

  // ── Helper mapper ─────────────────────────────────────────────
  private mapSupplier(s: any): Supplier {
    return {
      id:           s.id,
      companyName:  s.companyName,
      contactName:  s.user?.name  ?? '',
      phone:        s.user?.phone ?? '',
      email:        s.user?.email ?? '',
      address:      '',
      city:         s.user?.city  ?? 'Ouagadougou',
      status:       s.status,
      verifiedAt:   s.validatedAt ? new Date(s.validatedAt) : undefined,
      rating:       s.rating      ?? 0,
      reviewCount:  s.reviewCount ?? 0,
      totalGroups:  s._count?.groups ?? 0,
      successRate:  s.successRate    ?? 0,
      createdAt:    new Date(s.createdAt ?? Date.now()),
      user:         s.user,
    };
  }
}