import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject, takeUntil } from 'rxjs';
import { NotificationService } from '../../../core/services/notification.service';
import { environment } from '../../../../environments/environment';

const API = environment.apiUrl;

const TYPE_CONFIG: Record<string, { icon: string; color: string; label: string }> = {
  SYSTEM        : { icon: 'fa-solid fa-gear',         color: '#6B7280', label: 'Système' },
  NEW_MEMBER    : { icon: 'fa-solid fa-user-plus',    color: '#10D98B', label: 'Nouveau membre' },
  GROUP_SUCCESS : { icon: 'fa-solid fa-fire',         color: '#F4A902', label: 'Seuil atteint' },
  GROUP_FAILED  : { icon: 'fa-solid fa-xmark-circle', color: '#FF4D6A', label: 'Groupe échoué' },
  PAYMENT       : { icon: 'fa-solid fa-coins',        color: '#00D4FF', label: 'Paiement' },
  DISPUTE       : { icon: 'fa-solid fa-scale-balanced',color: '#FF4D6A', label: 'Litige' },
};

@Component({
  selector   : 'app-admin-notifications',
  templateUrl: './admin-notifications.component.html',
  styleUrls  : ['./admin-notifications.component.scss']
})
export class AdminNotificationsComponent implements OnInit, OnDestroy {
  notifications: any[] = [];
  loading       = true;
  loadingMore   = false;
  markingAll    = false;

  page     = 1;
  hasMore  = true;
  total    = 0;
  unread   = 0;

  successMsg = '';

  private destroy$ = new Subject<void>();

  constructor(
    private http  : HttpClient,
    public  notifs: NotificationService,
  ) {}

  ngOnInit(): void { this.loadNotifications(); }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadNotifications(append = false): void {
    if (!append) this.loading = true;
    else         this.loadingMore = true;

    this.http.get<any>(`${API}/notifications`, { params: { page: this.page, limit: 20 } })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          const items = res.data?.notifications ?? [];
          const mapped = items.map((n: any) => this.mapNotif(n));

          this.notifications = append ? [...this.notifications, ...mapped] : mapped;
          this.unread        = res.data?.unreadCount ?? 0;
          this.total         = res.meta?.total ?? 0;
          this.hasMore       = this.notifications.length < this.total;
          this.loading       = false;
          this.loadingMore   = false;
        },
        error: () => { this.loading = false; this.loadingMore = false; }
      });
  }

  loadMore(): void {
    if (!this.hasMore || this.loadingMore) return;
    this.page++;
    this.loadNotifications(true);
  }

  // ── Marquer toutes comme lues ─────────────────────────────────
  markAllRead(): void {
    if (this.markingAll || this.unread === 0) return;
    this.markingAll = true;

    this.http.patch<any>(`${API}/notifications/read-all`, {})
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.notifications.forEach(n => n.isRead = true);
          this.unread     = 0;
          this.markingAll = false;
          this.notifs.markAllRead();
          this.showSuccess('Toutes les notifications marquées comme lues');
        },
        error: () => { this.markingAll = false; }
      });
  }

  // ── Marquer une comme lue ─────────────────────────────────────
  markRead(n: any): void {
    if (n.isRead) return;
    this.http.patch<any>(`${API}/notifications/${n.id}/read`, {})
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          n.isRead = true;
          if (this.unread > 0) this.unread--;
        },
        error: () => {}
      });
  }

  // ── Helpers ───────────────────────────────────────────────────
  typeIcon(type: string): string  { return TYPE_CONFIG[type]?.icon  ?? 'fa-solid fa-bell'; }
  typeColor(type: string): string { return TYPE_CONFIG[type]?.color ?? 'var(--primary)'; }
  typeLabel(type: string): string { return TYPE_CONFIG[type]?.label ?? type; }

  formatDate(date: string): string {
    const d    = new Date(date);
    const diff = Date.now() - d.getTime();
    const min  = Math.floor(diff / 60000);
    const h    = Math.floor(diff / 3600000);
    const day  = Math.floor(diff / 86400000);
    if (min < 1)  return 'À l\'instant';
    if (min < 60) return `il y a ${min} min`;
    if (h < 24)   return `il y a ${h}h`;
    if (day < 7)  return `il y a ${day}j`;
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  }

  trackById(_: number, n: any): string { return n.id; }

  private mapNotif(n: any): any {
    return {
      id     : n.id,
      type   : n.type,
      title  : n.title,
      body   : n.body,
      isRead : n.isRead,
      groupId: n.groupId,
      sentVia: n.sentVia ?? [],
      date   : n.createdAt,
    };
  }

  private showSuccess(msg: string): void {
    this.successMsg = msg;
    setTimeout(() => { this.successMsg = ''; }, 3000);
  }
}