import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GroupService } from '../../../core/services/group.service';
import { Group } from '../../../core/models';

const API = 'http://localhost:3000/api/v1';

@Component({
  selector: 'app-admin-groups',
  templateUrl: './admin-groups.component.html',
  styleUrls: ['./admin-groups.component.scss']
})
export class AdminGroupsComponent implements OnInit {
  search    = '';
  activeTab = 'Tous';
  loading   = true;
  tabs      = ['Tous', 'Ouverts', 'Seuil atteint', 'En cours', 'Terminés'];
  groups: Group[] = [];

  constructor(
    private http:         HttpClient,
    private groupService: GroupService,
  ) {}

  ngOnInit(): void {
    this.loadGroups();
  }

  // ── GET /admin/groups ─────────────────────────────────────────
  private loadGroups(): void {
    this.loading = true;
    this.http.get<any>(`${API}/admin/groups`, { params: { limit: 100 } }).subscribe({
      next: (res) => {
        const data   = res.data?.groups ?? res.data ?? [];
        this.groups  = data.map((g: any) => this.groupService.mapGroup(g));
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  get filtered(): Group[] {
    const statusMap: Record<string, string[]> = {
      'Ouverts':       ['OPEN'],
      'Seuil atteint': ['THRESHOLD_REACHED'],
      'En cours':      ['PAYMENT_PENDING', 'PROCESSING'],
      'Terminés':      ['COMPLETED', 'CANCELLED', 'EXPIRED'],
    };
    return this.groups.filter(g => {
      const matchSearch = !this.search ||
        g.product.name.toLowerCase().includes(this.search.toLowerCase()) ||
        g.supplier.companyName.toLowerCase().includes(this.search.toLowerCase()) ||
        g.id.toLowerCase().includes(this.search.toLowerCase());
      const matchTab = this.activeTab === 'Tous' ||
        (statusMap[this.activeTab] ?? []).includes(g.status);
      return matchSearch && matchTab;
    });
  }

  get openCount():      number { return this.groups.filter(g => g.status === 'OPEN').length; }
  get thresholdCount(): number { return this.groups.filter(g => g.status === 'THRESHOLD_REACHED').length; }
  get completedCount(): number { return this.groups.filter(g => g.status === 'COMPLETED').length; }

  // ── PATCH /admin/groups/:id/close ────────────────────────────
  closeGroup(g: Group): void {
    this.http.patch(`${API}/admin/groups/${g.id}/close`, {
      reason: 'Fermé manuellement par admin'
    }).subscribe({
      next: () => { g.status = 'CANCELLED' as any; },
      error: () => {}
    });
  }

  statusClass(s: string): string {
    if (s === 'OPEN')              return 'badge-cyan';
    if (s === 'THRESHOLD_REACHED') return 'badge-ok';
    if (s === 'PAYMENT_PENDING')   return 'badge-warn';
    if (s === 'PROCESSING')        return 'badge-gold';
    if (s === 'COMPLETED')         return 'badge-grey';
    return 'badge-err';
  }

  statusLabel(s: string): string {
    if (s === 'OPEN')              return 'Ouvert';
    if (s === 'THRESHOLD_REACHED') return 'Seuil atteint';
    if (s === 'PAYMENT_PENDING')   return 'Paiement en attente';
    if (s === 'PROCESSING')        return 'En cours';
    if (s === 'COMPLETED')         return 'Terminé';
    if (s === 'CANCELLED')         return 'Annulé';
    return 'Expiré';
  }

  fillPercent(g: Group): number {
    return Math.min(100, Math.round((g.currentCount / g.minParticipants) * 100));
  }

  fillColor(g: Group): string {
    const pct = this.fillPercent(g);
    if (pct >= 100) return '#10D98B';
    if (pct >= 60)  return '#F5A623';
    return '#00D4FF';
  }

  formatXOF(val: number): string { return val.toLocaleString('fr-FR') + ' XOF'; }

  formatExpiry(date: Date): string {
    const diff = new Date(date).getTime() - Date.now();
    const h    = Math.floor(diff / 3600000);
    const d    = Math.floor(h / 24);
    if (d > 0) return `${d}j ${h % 24}h`;
    if (h > 0) return `${h}h`;
    return 'Expiré';
  }

  isExpiringSoon(date: Date): boolean {
    return (new Date(date).getTime() - Date.now()) < 24 * 3600000;
  }
}