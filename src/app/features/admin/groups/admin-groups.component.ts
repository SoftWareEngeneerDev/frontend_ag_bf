import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { AdminService }  from '../../../core/services/admin.service';
import { GroupService }  from '../../../core/services/group.service';
import { FormatService } from '../../../core/services/format.service';
import { Group } from '../../../core/models';

const STATUS_MAP: Record<string, string[]> = {
  'Ouverts'      : ['OPEN'],
  'Seuil atteint': ['THRESHOLD_REACHED'],
  'En cours'     : ['PAYMENT_PENDING', 'PROCESSING'],
  'Terminés'     : ['COMPLETED', 'CANCELLED', 'EXPIRED'],
};

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
  selector   : 'app-admin-groups',
  templateUrl: './admin-groups.component.html',
  styleUrls  : ['./admin-groups.component.scss']
})
export class AdminGroupsComponent implements OnInit, OnDestroy {
  search    = '';
  activeTab = 'Tous';
  loading   = true;
  closing   = '';

  readonly tabs = ['Tous', 'Ouverts', 'Seuil atteint', 'En cours', 'Terminés'];

  groups    : Group[] = [];
  successMsg = '';
  errorMsg   = '';

  private destroy$ = new Subject<void>();

  constructor(
    private adminService : AdminService,
    private groupService : GroupService,
    public  fmt          : FormatService,
  ) {}

  ngOnInit(): void { this.loadGroups(); }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Charger les groupes ───────────────────────────────────────
  private loadGroups(): void {
    this.loading = true;
    this.adminService.getGroups({ limit: 100 })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          const data   = Array.isArray(res.data) ? res.data : [];
          this.groups  = data.map((g: any) => this.groupService.mapGroup(g));
          this.loading = false;
        },
        error: () => { this.loading = false; }
      });
  }

  // ── Filtre ────────────────────────────────────────────────────
  get filtered(): Group[] {
    const q = this.search.toLowerCase();
    return this.groups.filter(g => {
      const matchSearch = !q
        || g.product.name.toLowerCase().includes(q)
        || g.supplier.companyName.toLowerCase().includes(q)
        || g.id.toLowerCase().includes(q);
      const matchTab = this.activeTab === 'Tous'
        || (STATUS_MAP[this.activeTab] ?? []).includes(g.status);
      return matchSearch && matchTab;
    });
  }

  // ── Compteurs stats ───────────────────────────────────────────
  get openCount()      : number { return this.groups.filter(g => g.status === 'OPEN').length; }
  get thresholdCount() : number { return this.groups.filter(g => g.status === 'THRESHOLD_REACHED').length; }
  get completedCount() : number { return this.groups.filter(g => g.status === 'COMPLETED').length; }

  tabCount(t: string): number {
    if (t === 'Tous') return this.groups.length;
    return this.groups.filter(g => (STATUS_MAP[t] ?? []).includes(g.status)).length;
  }

  // ── Fermer un groupe ──────────────────────────────────────────
  closeGroup(g: Group): void {
    if (this.closing === g.id) return;
    this.closing = g.id;

    this.adminService.forceCloseGroup(g.id, 'Fermé manuellement par admin')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          g.status      = 'CANCELLED' as any;
          this.closing  = '';
          this.showSuccess('Groupe fermé avec succès');
        },
        error: (err) => {
          this.closing = '';
          this.showError(err?.error?.error?.message ?? 'Erreur lors de la fermeture');
        }
      });
  }

  // ── Helpers ───────────────────────────────────────────────────
  statusClass(s: string)  : string { return STATUS_CLASSES[s] ?? 'badge-grey'; }
  statusLabel(s: string)  : string { return STATUS_LABELS[s]  ?? s; }
  trackById(_: number, g: Group): string { return g.id; }

  fillPercent(g: Group): number {
    return g.minParticipants > 0
      ? Math.min(100, Math.round((g.currentCount / g.minParticipants) * 100))
      : 0;
  }

  fillColor(g: Group): string {
    const pct = this.fillPercent(g);
    if (pct >= 100) return '#10D98B';
    if (pct >= 60)  return '#F5A623';
    return '#00D4FF';
  }

  formatExpiry(date: Date): string {
    const diff = new Date(date).getTime() - Date.now();
    if (diff <= 0) return 'Expiré';
    const h = Math.floor(diff / 3600000);
    const d = Math.floor(h / 24);
    if (d > 0) return `${d}j ${h % 24}h`;
    return `${h}h`;
  }

  isExpiringSoon(date: Date): boolean {
    return new Date(date).getTime() - Date.now() < 24 * 3600000;
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