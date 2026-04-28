import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { GroupService }  from '../../../core/services/group.service';
import { FormatService } from '../../../core/services/format.service';
import { Group } from '../../../core/models';

@Component({
  selector: 'app-my-groups',
  templateUrl: './member-my-groups.component.html',
  styleUrls:  ['./member-my-groups.component.scss']
})
export class MyGroupsComponent implements OnInit, OnDestroy {
  groups   : Group[] = [];
  filtered : Group[] = [];
  loading    = true;
  activeTab  = 'all';

  private destroy$ = new Subject<void>();

  tabList = [
    { key: 'all',       icon: 'fa-solid fa-list',         label: 'Tous',          count: 0 },
    { key: 'open',      icon: 'fa-solid fa-clock',        label: 'Actifs',        count: 0 },
    { key: 'threshold', icon: 'fa-solid fa-fire',         label: 'Seuil atteint', count: 0 },
    { key: 'done',      icon: 'fa-solid fa-circle-check', label: 'Terminés',      count: 0 },
  ];

  constructor(
    private groupService : GroupService,
    public  fmt          : FormatService,
    private router       : Router,
  ) {}

  ngOnInit(): void {
    this.groupService.getMyGroups()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          const active    = data?.active    ?? [];
          const completed = data?.completed ?? [];

          const activeGroups    = active.map   ((m: any) => this.groupService.mapGroup(m.group ?? m));
          const completedGroups = completed.map((m: any) => this.groupService.mapGroup(m.group ?? m));

          this.groups   = [...activeGroups, ...completedGroups];
          this.loading  = false;
          this.updateCounts();
          this.applyFilter(this.activeTab);
        },
        error: () => { this.loading = false; }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Mettre à jour les compteurs des onglets ───────────────────
  private updateCounts(): void {
    this.tabList[0].count = this.groups.length;
    this.tabList[1].count = this.groups.filter(g => g.status === 'OPEN').length;
    this.tabList[2].count = this.groups.filter(g => g.status === 'THRESHOLD_REACHED').length;
    this.tabList[3].count = this.groups.filter(g => g.status === 'COMPLETED').length;
  }

  // ── Appliquer le filtre actif ─────────────────────────────────
  private applyFilter(key: string): void {
    const filters: Record<string, string[]> = {
      open      : ['OPEN'],
      threshold : ['THRESHOLD_REACHED'],
      done      : ['COMPLETED', 'EXPIRED', 'CANCELLED'],
    };
    this.filtered = filters[key]
      ? this.groups.filter(g => filters[key].includes(g.status))
      : this.groups;
  }

  setTab(key: string): void {
    this.activeTab = key;
    this.applyFilter(key);
  }

  // ── Helpers ───────────────────────────────────────────────────
  pct(g: Group): number    { return this.fmt.progressPercent(g.currentCount, g.minParticipants); }
  isHot(g: Group): boolean { return g.status === 'THRESHOLD_REACHED'; }

  onJoin(g: Group): void {
    if (g.status === 'THRESHOLD_REACHED') {
      this.router.navigate(['/member/payment']);
    } else {
      this.goDetail(g);
    }
  }

  goDetail(g: Group): void { this.router.navigate(['/groups', g.id]); }

  trackById(_: number, g: Group): string { return g.id; }
}