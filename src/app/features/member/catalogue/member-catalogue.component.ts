import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { GroupService }  from '../../../core/services/group.service';
import { FormatService } from '../../../core/services/format.service';
import { Group } from '../../../core/models';

@Component({
  selector   : 'app-member-catalogue',
  templateUrl: './member-catalogue.component.html',
  styleUrls  : ['./member-catalogue.component.scss']
})
export class MemberCatalogueComponent implements OnInit, OnDestroy {
  groups   : Group[] = [];
  filtered : Group[] = [];
  loading   = true;
  joining   = '';
  search    = '';
  activeTab = 'OPEN';

  successMsg = '';
  errorMsg   = '';

  // Modal confirmation rejoindre
  showJoinModal  = false;
  selectedGroup  : Group | null = null;
  joinResult     : any = null;
  joining2       = false;

  readonly tabs = [
    { key: 'OPEN',              label: '🟢 Ouverts' },
    { key: 'THRESHOLD_REACHED', label: '🔥 Seuil atteint' },
    { key: 'all',               label: 'Tous' },
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private groupService: GroupService,
    public  fmt         : FormatService,
    private router      : Router,
  ) {}

  ngOnInit(): void { this.loadGroups(); }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadGroups(): void {
    this.loading = true;
    this.groupService.getAll({ limit: 100 })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.groups  = data;
          this.loading = false;
          this.applyFilter();
        },
        error: () => { this.loading = false; }
      });
  }

  get filteredGroups(): Group[] {
    const q = this.search.toLowerCase();
    return this.filtered.filter(g =>
      !q ||
      g.product?.name?.toLowerCase().includes(q) ||
      g.supplier?.companyName?.toLowerCase().includes(q)
    );
  }

  private applyFilter(): void {
    if (this.activeTab === 'all') {
      this.filtered = this.groups;
    } else {
      this.filtered = this.groups.filter(g => g.status === this.activeTab);
    }
  }

  setTab(key: string): void {
    this.activeTab = key;
    this.applyFilter();
  }

  tabCount(key: string): number {
    if (key === 'all') return this.groups.length;
    return this.groups.filter(g => g.status === key).length;
  }

  // ── Ouvrir modal confirmation ─────────────────────────────────
  openJoinModal(g: Group): void {
    this.selectedGroup = g;
    this.joinResult    = null;
    this.showJoinModal = true;
  }

  // ── Confirmer rejoindre ───────────────────────────────────────
  confirmJoin(): void {
    if (!this.selectedGroup || this.joining2) return;
    this.joining2 = true;

    this.groupService.joinGroup(this.selectedGroup.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this.joinResult = result;
          this.joining2   = false;
          this.showSuccess(`Vous avez rejoint le groupe ! Acompte : ${this.fmt.formatXOF(result.depositAmount)}`);
          this.showJoinModal = false;
          // Recharger pour mettre à jour les compteurs
          this.loadGroups();
          // Rediriger vers paiement
          setTimeout(() => this.router.navigate(['/member/payment']), 1500);
        },
        error: (err) => {
          this.joining2 = false;
          this.showError(err?.error?.error?.message ?? 'Erreur lors de la tentative de rejoindre');
          this.showJoinModal = false;
        }
      });
  }

  // ── Helpers ───────────────────────────────────────────────────
  pct(g: Group): number { return this.fmt.progressPercent(g.currentCount, g.minParticipants); }
  isHot(g: Group): boolean { return g.status === 'THRESHOLD_REACHED'; }
  trackById(_: number, g: Group): string { return g.id; }

  fillColor(g: Group): string {
    const p = this.pct(g);
    if (p >= 100) return '#10D98B';
    if (p >= 60)  return '#F4A902';
    return '#00D4FF';
  }

  formatExpiry(date: Date): string {
    const diff = new Date(date).getTime() - Date.now();
    const days = Math.floor(diff / 86400000);
    if (days < 0)  return 'Expiré';
    if (days === 0) return 'Expire aujourd\'hui';
    if (days === 1) return 'Expire demain';
    return `${days} jours restants`;
  }

  private showSuccess(msg: string): void {
    this.successMsg = msg; this.errorMsg = '';
    setTimeout(() => { this.successMsg = ''; }, 4000);
  }

  private showError(msg: string): void {
    this.errorMsg = msg; this.successMsg = '';
    setTimeout(() => { this.errorMsg = ''; }, 4000);
  }
}