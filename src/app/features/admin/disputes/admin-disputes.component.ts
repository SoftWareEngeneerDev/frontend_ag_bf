import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../../core/services/admin.service';

@Component({
  selector: 'app-admin-disputes',
  templateUrl: './admin-disputes.component.html',
  styleUrls:  ['./admin-disputes.component.scss']
})
export class AdminDisputesComponent implements OnInit {
  activeTab = 'Tous';
  loading   = true;
  tabs      = ['Tous', 'Ouverts', 'En cours', 'Résolus'];
  disputes: any[] = [];

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadDisputes();
  }

  // ── GET /admin/disputes ───────────────────────────────────────
  private loadDisputes(): void {
    this.loading = true;
    this.adminService.getDisputes('ALL', 100).subscribe({
      next: (data) => {
        this.disputes = data.map((d: any) => this.mapDispute(d));
        this.loading  = false;
      },
      error: () => { this.loading = false; }
    });
  }

  get openCount():   number { return this.disputes.filter(d => d.status === 'OPEN').length; }
  get urgentCount(): number { return this.disputes.filter(d => d.urgent).length; }

  get filtered(): any[] {
    const map: Record<string, string> = {
      'Ouverts':  'OPEN',
      'En cours': 'IN_REVIEW',
      'Résolus':  'RESOLVED',
    };
    return this.activeTab === 'Tous'
      ? this.disputes
      : this.disputes.filter(d => d.status === map[this.activeTab]);
  }

  // ── Prendre en charge → statut IN_REVIEW ─────────────────────
  takeCharge(d: any): void {
    // Pas d'endpoint direct — on met à jour localement
    d.status = 'IN_REVIEW';
  }

  // ── Résoudre un litige ────────────────────────────────────────
  resolve(d: any): void {
    this.adminService.getAuditLogs().subscribe(); // Trigger audit
    d.status = 'RESOLVED';
  }

  // ── Rembourser via litige ─────────────────────────────────────
  refund(d: any): void {
    if (!d.paymentId) return;
    this.adminService.refundPayment(d.paymentId, `Litige ${d.id} — ${d.reason}`).subscribe({
      next: () => { d.status = 'RESOLVED'; },
      error: () => {}
    });
  }

  statusClass(s: string): string {
    return s === 'OPEN' ? 'badge-err' : s === 'IN_REVIEW' ? 'badge-warn' : 'badge-ok';
  }

  statusLabel(s: string): string {
    return s === 'OPEN' ? '🔴 Ouvert' : s === 'IN_REVIEW' ? '🟡 En cours' : '🟢 Résolu';
  }

  // ── Helper mapper ─────────────────────────────────────────────
  private mapDispute(d: any): any {
    const createdAt  = new Date(d.createdAt ?? Date.now());
    const ageInDays  = Math.floor((Date.now() - createdAt.getTime()) / (1000 * 3600 * 24));

    return {
      id:        d.id,
      reporter:  d.user?.name    ?? 'Inconnu',
      product:   d.orderId       ?? d.groupId ?? 'N/A',
      reason:    d.subject       ?? d.description ?? 'Litige',
      status:    d.status,
      date:      createdAt.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }),
      amount:    0, // Pas retourné par le backend directement
      urgent:    ageInDays >= 3 || d.status === 'OPEN', // Urgent si ouvert depuis 3+ jours
      paymentId: d.paymentId ?? null,
    };
  }
}