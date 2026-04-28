import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { AdminService } from '../../../core/services/admin.service';

const MODULE_KEYWORDS: Record<string, string[]> = {
  'Authentification': ['auth', 'login', 'otp', 'register', 'session', 'logout'],
  'Paiements'       : ['payment', 'refund', 'escrow', 'commission'],
  'Groupes'         : ['group'],
  'Fournisseurs'    : ['supplier'],
  'Système'         : ['system', 'cron', 'backup', 'health'],
};

@Component({
  selector   : 'app-admin-logs',
  templateUrl: './admin-logs.component.html',
  styleUrls  : ['./admin-logs.component.scss']
})
export class AdminLogsComponent implements OnInit, OnDestroy {
  search    = '';
  activeTab = 'Tous';
  loading   = true;
  page      = 1;
  hasMore   = true;

  readonly tabs  = ['Tous', 'Authentification', 'Paiements', 'Groupes', 'Fournisseurs', 'Système'];
  readonly LIMIT = 50;

  logs       : any[] = [];
  successMsg  = '';

  private destroy$ = new Subject<void>();

  constructor(private adminService: AdminService) {}

  ngOnInit(): void { this.loadLogs(); }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadLogs(append = false): void {
    this.loading = true;
    this.adminService.getAuditLogs({ limit: this.LIMIT, page: this.page })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          const mapped = (res as any[]).map((l: any) => this.mapLog(l));
          this.logs    = append ? [...this.logs, ...mapped] : mapped;
          this.hasMore = mapped.length === this.LIMIT;
          this.loading = false;
        },
        error: (err) => {
          console.error('Erreur chargement logs:', err);
          this.loading = false;
        }
      });
  }

  loadMore(): void {
    if (!this.hasMore || this.loading) return;
    this.page++;
    this.loadLogs(true);
  }

  get filtered(): any[] {
    const q = this.search.toLowerCase();
    return this.logs.filter(l => {
      const matchSearch = !q
        || l.action.toLowerCase().includes(q)
        || l.user.toLowerCase().includes(q)
        || l.entity.toLowerCase().includes(q)
        || l.module.toLowerCase().includes(q);

      const matchTab = this.activeTab === 'Tous'
        || (MODULE_KEYWORDS[this.activeTab] ?? []).some(k =>
            l.module.toLowerCase().includes(k) ||
            l.action.toLowerCase().includes(k)
          );

      return matchSearch && matchTab;
    });
  }

  tabCount(t: string): number {
    if (t === 'Tous') return this.logs.length;
    return this.logs.filter(l =>
      (MODULE_KEYWORDS[t] ?? []).some(k =>
        l.module.toLowerCase().includes(k) ||
        l.action.toLowerCase().includes(k)
      )
    ).length;
  }

  exportCsv(): void {
    const headers = ['Horodatage', 'Utilisateur', 'Action', 'Entité', 'Module', 'Niveau', 'IP'];
    const rows    = this.filtered.map(l =>
      [l.time, l.user, l.action, l.entity, l.module, l.level, l.ip]
        .map(v => `"${(v ?? '').toString().replace(/"/g, '""')}"`)
        .join(',')
    );
    const csv  = [headers.join(','), ...rows].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `djula-logs-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    this.successMsg = `${this.filtered.length} entrées exportées`;
    setTimeout(() => { this.successMsg = ''; }, 3000);
  }

  levelClass(l: string): string {
    const m: Record<string, string> = { INFO: 'badge-ok', WARN: 'badge-warn', ERROR: 'badge-err' };
    return m[l] ?? 'badge-grey';
  }

  trackByTime(_: number, l: any): string { return l.time + l.action; }

  private mapLog(l: any): any {
    const action = (l.action ?? '').toUpperCase();
    const module = this.inferModule(action, l.entity ?? '');
    const level  = ['DELETE', 'SUSPEND', 'BAN', 'REJECT', 'FAIL', 'ERROR', 'CLOSE'].some(k => action.includes(k))
      ? 'WARN' : 'INFO';
    return {
      time  : new Date(l.createdAt).toLocaleString('fr-FR', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
      }),
      user  : l.user?.name ?? 'System',
      action,
      entity: `${l.entity ?? ''}${l.entityId ? ' · ' + l.entityId.slice(0, 8) : ''}`,
      ip    : l.ipAddress ?? '—',
      module,
      level,
    };
  }

  private inferModule(action: string, entity: string): string {
    const a = action.toLowerCase();
    const e = entity.toLowerCase();
    for (const [mod, keywords] of Object.entries(MODULE_KEYWORDS)) {
      if (keywords.some(k => a.includes(k) || e.includes(k))) return mod;
    }
    return 'Autre';
  }
}