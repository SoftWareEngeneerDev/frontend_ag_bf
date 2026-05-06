import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { AdminService } from '../../../core/services/admin.service';

const MODULE_MAP: Record<string, string> = {
  // Auth
  'USER_LOGIN'           : 'Authentification',
  'USER_LOGOUT'          : 'Authentification',
  'USER_REGISTER'        : 'Authentification',
  'OTP_SENT'             : 'Authentification',
  'PASSWORD_RESET'       : 'Authentification',
  // Users
  'USER_ACTIVE'          : 'Utilisateurs',
  'USER_SUSPENDED'       : 'Utilisateurs',
  'USER_BANNED'          : 'Utilisateurs',
  'USER_ROLE_CHANGED'    : 'Utilisateurs',
  // Suppliers
  'SUPPLIER_APPROVED'    : 'Fournisseurs',
  'SUPPLIER_REJECTED'    : 'Fournisseurs',
  'SUPPLIER_SUSPENDED'   : 'Fournisseurs',
  // Products
  'PRODUCT_APPROVED'     : 'Produits',
  'PRODUCT_REJECTED'     : 'Produits',
  'PRODUCT_ARCHIVED'     : 'Produits',
  // Groups
  'GROUP_CANCELLED'      : 'Groupes',
  'GROUP_CLOSED'         : 'Groupes',
  'GROUP_CREATED'        : 'Groupes',
  // Payments
  'REFUND_PROCESSED'     : 'Paiements',
  'PAYMENT_REFUNDED'     : 'Paiements',
  'COMMISSION_PAID'      : 'Paiements',
  // Disputes
  'DISPUTE_RESOLVED'     : 'Litiges',
  'DISPUTE_TAKEN'        : 'Litiges',
  // System
  'GDPR_EXPORT'          : 'Système',
  'BACKUP_CREATED'       : 'Système',
  'SYSTEM_HEALTH'        : 'Système',
};

const LEVEL_MAP: Record<string, string> = {
  'SUSPENDED' : 'WARN',
  'BANNED'    : 'ERROR',
  'REJECTED'  : 'WARN',
  'CANCELLED' : 'WARN',
  'CLOSED'    : 'WARN',
  'REFUND'    : 'WARN',
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

  readonly tabs  = ['Tous', 'Utilisateurs', 'Fournisseurs', 'Produits', 'Groupes', 'Paiements', 'Litiges', 'Authentification', 'Système'];
  readonly LIMIT = 50;

  logs        : any[] = [];
  successMsg   = '';

  // Détail log sélectionné
  selectedLog  : any = null;
  showDetail   = false;

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
        error: () => { this.loading = false; }
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

      const matchTab = this.activeTab === 'Tous' || l.module === this.activeTab;

      return matchSearch && matchTab;
    });
  }

  tabCount(t: string): number {
    if (t === 'Tous') return this.logs.length;
    return this.logs.filter(l => l.module === t).length;
  }

  openDetail(l: any): void {
    this.selectedLog = l;
    this.showDetail  = true;
  }

  exportCsv(): void {
    const headers = ['Horodatage', 'Utilisateur', 'Action', 'Entité', 'Module', 'Niveau'];
    const rows    = this.filtered.map(l =>
      [l.time, l.user, l.action, l.entity, l.module, l.level]
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
    const m: Record<string, string> = {
      INFO : 'badge-ok',
      WARN : 'badge-warn',
      ERROR: 'badge-err',
    };
    return m[l] ?? 'badge-grey';
  }

  moduleClass(m: string): string {
    const map: Record<string, string> = {
      'Authentification': 'badge-cyan',
      'Utilisateurs'    : 'badge-grey',
      'Fournisseurs'    : 'badge-warn',
      'Produits'        : 'badge-cyan',
      'Groupes'         : 'badge-ok',
      'Paiements'       : 'badge-gold',
      'Litiges'         : 'badge-err',
      'Système'         : 'badge-grey',
    };
    return map[m] ?? 'badge-grey';
  }

  actionColor(action: string): string {
    if (['APPROVED', 'RESOLVED', 'ACTIVE'].some(k => action.includes(k))) return '#10D98B';
    if (['REJECTED', 'SUSPENDED', 'CANCELLED', 'BANNED'].some(k => action.includes(k))) return '#FF4D6A';
    if (['REFUND', 'WARN'].some(k => action.includes(k))) return '#F4A902';
    return 'var(--primary)';
  }

  trackByTime(_: number, l: any): string { return l.id; }

  private mapLog(l: any): any {
    const action = (l.action ?? '').toUpperCase();
    const module = MODULE_MAP[action] ?? this.inferModule(action, l.entity ?? '');
    const level  = Object.keys(LEVEL_MAP).some(k => action.includes(k)) ? 'WARN'
                 : action.includes('ERROR') || action.includes('FAIL') ? 'ERROR'
                 : 'INFO';

    return {
      id      : l.id,
      time    : new Date(l.createdAt).toLocaleString('fr-FR', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
      }),
      user    : l.user?.name ?? 'Système',
      action,
      entity  : `${l.entity ?? ''}${l.entityId ? ' · ' + l.entityId.slice(0, 8) : ''}`,
      entityId: l.entityId ?? '',
      module,
      level,
      metadata: l.metadata ?? {},
    };
  }

  private inferModule(action: string, entity: string): string {
    const a = action.toLowerCase();
    const e = entity.toLowerCase();
    if (a.includes('user') || e === 'user')         return 'Utilisateurs';
    if (a.includes('supplier') || e === 'supplier') return 'Fournisseurs';
    if (a.includes('product') || e === 'product')   return 'Produits';
    if (a.includes('group') || e === 'group')       return 'Groupes';
    if (a.includes('payment') || a.includes('refund') || e === 'payment') return 'Paiements';
    if (a.includes('dispute') || e === 'dispute')   return 'Litiges';
    if (a.includes('auth') || a.includes('login'))  return 'Authentification';
    if (a.includes('system') || a.includes('gdpr')) return 'Système';
    return 'Système';
  }
}