import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../../core/services/admin.service';

@Component({
  selector: 'app-admin-logs',
  templateUrl: './admin-logs.component.html',
  styleUrls:  ['./admin-logs.component.scss']
})
export class AdminLogsComponent implements OnInit {
  search    = '';
  activeTab = 'Tous';
  loading   = true;
  tabs      = ['Tous', 'Authentification', 'Paiements', 'Groupes', 'Système'];
  logs: any[] = [];

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadLogs();
  }

  // ── GET /admin/audit-logs ─────────────────────────────────────
  private loadLogs(): void {
    this.loading = true;
    this.adminService.getAuditLogs({ limit: 100 }).subscribe({
      next: (res) => {
        const data    = res.data?.logs ?? res.data ?? [];
        this.logs     = data.map((l: any) => this.mapLog(l));
        this.loading  = false;
      },
      error: () => { this.loading = false; }
    });
  }

  get filtered(): any[] {
    return this.logs.filter(l => {
      const matchSearch = !this.search ||
        l.action.toLowerCase().includes(this.search.toLowerCase()) ||
        l.user.toLowerCase().includes(this.search.toLowerCase()) ||
        l.entity.toLowerCase().includes(this.search.toLowerCase());

      const moduleMap: Record<string, string[]> = {
        'Authentification': ['auth', 'login', 'otp', 'register', 'session'],
        'Paiements':        ['payment', 'refund', 'escrow'],
        'Groupes':          ['group'],
        'Système':          ['system', 'cron', 'backup'],
      };

      const matchTab = this.activeTab === 'Tous' ||
        (moduleMap[this.activeTab] ?? []).some(k =>
          l.module.toLowerCase().includes(k) ||
          l.action.toLowerCase().includes(k)
        );

      return matchSearch && matchTab;
    });
  }

  levelClass(l: string): string {
    return l === 'INFO' ? 'badge-ok' : l === 'WARN' ? 'badge-warn' : 'badge-err';
  }

  // ── Helper mapper ─────────────────────────────────────────────
  private mapLog(l: any): any {
    const action = (l.action ?? '').toUpperCase();

    // Déduire le module depuis l'action ou l'entité
    const module = this.inferModule(action, l.entity ?? '');

    // Déduire le niveau depuis l'action
    const level = ['DELETE', 'SUSPEND', 'BAN', 'REJECT', 'FAIL', 'ERROR'].some(k => action.includes(k))
      ? 'WARN'
      : 'INFO';

    return {
      time:   new Date(l.createdAt).toLocaleString('fr-FR', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
      }),
      user:   l.user?.name ?? 'System',
      action,
      entity: `${l.entity ?? ''}${l.entityId ? ' · ' + l.entityId.slice(0, 8) : ''}`,
      ip:     l.ipAddress ?? '—',
      module,
      level,
    };
  }

  private inferModule(action: string, entity: string): string {
    const a = action.toLowerCase();
    const e = entity.toLowerCase();
    if (a.includes('auth') || a.includes('login') || a.includes('otp') || a.includes('session')) return 'Authentification';
    if (a.includes('payment') || a.includes('refund') || e.includes('payment')) return 'Paiement';
    if (a.includes('group') || e.includes('group')) return 'Groupe';
    if (a.includes('product') || e.includes('product')) return 'Produit';
    if (a.includes('supplier') || e.includes('supplier')) return 'Fournisseur';
    if (a.includes('user') || e.includes('user')) return 'Utilisateur';
    if (a.includes('cron') || a.includes('backup') || a.includes('system')) return 'Système';
    return 'Autre';
  }
}