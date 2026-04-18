import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { GroupService } from '../../../../core/services/group.service';
import { Group } from '../../../../core/models';

const API = 'http://localhost:3000/api/v1';

@Component({
  selector: 'app-admin-group-detail',
  templateUrl: './admin-group-detail.component.html',
  styleUrls: ['./admin-group-detail.component.scss']
})
export class AdminGroupDetailComponent implements OnInit {
  group:   Group | null = null;
  loading = true;

  constructor(
    private route:        ActivatedRoute,
    private router:       Router,
    private http:         HttpClient,
    private groupService: GroupService,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) { this.router.navigate(['/admin/groups']); return; }

    // ── GET /groups/:id ────────────────────────────────────────
    this.groupService.getById(id).subscribe({
      next: (g) => {
        this.group   = g;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.group   = null;
      }
    });
  }

  // ── PATCH /admin/groups/:id/close ────────────────────────────
  closeGroup(): void {
    if (!this.group) return;
    this.http.patch(`${API}/admin/groups/${this.group.id}/close`, {
      reason: 'Fermé manuellement par admin'
    }).subscribe({
      next: () => { if (this.group) this.group.status = 'CANCELLED' as any; },
      error: () => {}
    });
  }

  goBack(): void { this.router.navigate(['/admin/groups']); }

  get statusClass(): string {
    if (!this.group) return '';
    const s = this.group.status;
    if (s === 'OPEN')              return 'badge-cyan';
    if (s === 'THRESHOLD_REACHED') return 'badge-ok';
    if (s === 'PAYMENT_PENDING')   return 'badge-warn';
    if (s === 'PROCESSING')        return 'badge-gold';
    if (s === 'COMPLETED')         return 'badge-grey';
    return 'badge-err';
  }

  get statusLabel(): string {
    if (!this.group) return '';
    const s = this.group.status;
    if (s === 'OPEN')              return 'Ouvert';
    if (s === 'THRESHOLD_REACHED') return 'Seuil atteint';
    if (s === 'PAYMENT_PENDING')   return 'Paiement en attente';
    if (s === 'PROCESSING')        return 'En cours';
    if (s === 'COMPLETED')         return 'Terminé';
    if (s === 'CANCELLED')         return 'Annulé';
    return 'Expiré';
  }

  get fillPercent(): number {
    if (!this.group) return 0;
    return Math.min(100, Math.round((this.group.currentCount / this.group.minParticipants) * 100));
  }

  get fillColor(): string {
    if (this.fillPercent >= 100) return '#10D98B';
    if (this.fillPercent >= 60)  return '#F5A623';
    return '#00D4FF';
  }

  get isExpiringSoon(): boolean {
    if (!this.group) return false;
    return (new Date(this.group.expiresAt).getTime() - Date.now()) < 24 * 3600000;
  }

  formatXOF(val: number): string {
    return val.toLocaleString('fr-FR') + ' XOF';
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
  }

  formatExpiry(date: Date): string {
    const diff = new Date(date).getTime() - Date.now();
    const h    = Math.floor(diff / 3600000);
    const d    = Math.floor(h / 24);
    if (d > 0) return `${d}j ${h % 24}h`;
    if (h > 0) return `${h}h`;
    return 'Expiré';
  }
}