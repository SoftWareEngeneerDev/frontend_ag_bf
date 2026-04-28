import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AdminService }  from '../../../../core/services/admin.service';
import { GroupService }  from '../../../../core/services/group.service';
import { FormatService } from '../../../../core/services/format.service';
import { Group } from '../../../../core/models';

const STATUS_LABELS: Record<string, string> = {
  OPEN             : 'Ouvert',
  THRESHOLD_REACHED: 'Seuil atteint',
  PAYMENT_PENDING  : 'Paiement en attente',
  PROCESSING       : 'En cours',
  COMPLETED        : 'Terminé',
  CANCELLED        : 'Annulé',
  EXPIRED          : 'Expiré',
};

const STATUS_CLASSES: Record<string, string> = {
  OPEN             : 'badge-cyan',
  THRESHOLD_REACHED: 'badge-ok',
  PAYMENT_PENDING  : 'badge-warn',
  PROCESSING       : 'badge-gold',
  COMPLETED        : 'badge-grey',
  CANCELLED        : 'badge-err',
  EXPIRED          : 'badge-err',
};

@Component({
  selector   : 'app-admin-group-detail',
  templateUrl: './admin-group-detail.component.html',
  styleUrls  : ['./admin-group-detail.component.scss']
})
export class AdminGroupDetailComponent implements OnInit, OnDestroy {
  group  : Group | null = null;
  loading = true;
  closing = false;
  successMsg = '';
  errorMsg   = '';

  private destroy$ = new Subject<void>();

  constructor(
    private route        : ActivatedRoute,
    private router       : Router,
    private adminService : AdminService,
    private groupService : GroupService,
    public  fmt          : FormatService,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) { this.router.navigate(['/admin/groups']); return; }
    this.loadGroup(id);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadGroup(id: string): void {
    this.groupService.getById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next : (g) => { this.group = g; this.loading = false; },
        error: ()  => { this.group = null; this.loading = false; }
      });
  }

  // ── Fermer le groupe ──────────────────────────────────────────
  closeGroup(): void {
    if (!this.group || this.closing) return;
    this.closing = true;

    this.adminService.forceCloseGroup(this.group.id, 'Fermé manuellement par admin')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          if (this.group) this.group.status = 'CANCELLED' as any;
          this.closing = false;
          this.showSuccess('Groupe fermé avec succès');
        },
        error: (err) => {
          this.closing = false;
          this.showError(err?.error?.error?.message ?? 'Erreur lors de la fermeture');
        }
      });
  }

  goBack(): void { this.router.navigate(['/admin/groups']); }

  // ── Getters ───────────────────────────────────────────────────
  get statusClass() : string { return this.group ? (STATUS_CLASSES[this.group.status] ?? 'badge-grey') : ''; }
  get statusLabel() : string { return this.group ? (STATUS_LABELS[this.group.status]  ?? this.group.status) : ''; }

  get fillPercent(): number {
    if (!this.group) return 0;
    return this.group.minParticipants > 0
      ? Math.min(100, Math.round((this.group.currentCount / this.group.minParticipants) * 100))
      : 0;
  }

  get fillColor(): string {
    if (this.fillPercent >= 100) return '#10D98B';
    if (this.fillPercent >= 60)  return '#F5A623';
    return '#00D4FF';
  }

  get isExpiringSoon(): boolean {
    if (!this.group) return false;
    return new Date(this.group.expiresAt).getTime() - Date.now() < 24 * 3600000;
  }

  get totalDeposits(): number {
    if (!this.group) return 0;
    return this.group.depositAmount * this.group.currentCount;
  }

  // ── Helpers ───────────────────────────────────────────────────
  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
  }

  formatExpiry(date: Date): string {
    const diff = new Date(date).getTime() - Date.now();
    if (diff <= 0) return 'Expiré';
    const h = Math.floor(diff / 3600000);
    const d = Math.floor(h / 24);
    if (d > 0) return `${d}j ${h % 24}h`;
    return `${h}h`;
  }

  private showSuccess(msg: string): void {
    this.successMsg = msg; this.errorMsg = '';
    setTimeout(() => { this.successMsg = ''; }, 3000);
  }

  private showError(msg: string): void {
    this.errorMsg = msg; this.successMsg = '';
    setTimeout(() => { this.errorMsg = ''; }, 4000);
  }
}