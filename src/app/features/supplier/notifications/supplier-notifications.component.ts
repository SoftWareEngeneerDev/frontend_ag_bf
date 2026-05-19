import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject, takeUntil } from 'rxjs';
import { environment } from '../../../../environments/environment';

const API = environment.apiUrl;

@Component({
  selector   : 'app-supplier-notifications',
  templateUrl: './supplier-notifications.component.html',
  styleUrls  : ['./supplier-notifications.component.scss'],
})
export class SupplierNotificationsComponent implements OnInit, OnDestroy {
  loading     = true;
  markingAll  = false;

  notifications: any[] = [];
  unreadCount   = 0;
  page          = 1;
  total         = 0;
  readonly limit = 20;

  private destroy$ = new Subject<void>();

  constructor(private http: HttpClient) {}

  ngOnInit(): void { this.loadNotifications(); }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadNotifications(p = 1): void {
    this.loading = true;
    this.page    = p;

    this.http.get<any>(`${API}/notifications`, { params: { page: String(p), limit: String(this.limit) } })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.notifications = res.data?.notifications ?? [];
          this.unreadCount   = res.data?.unreadCount   ?? 0;
          this.total         = res.meta?.total          ?? 0;
          this.loading       = false;
        },
        error: () => { this.loading = false; }
      });
  }

  markRead(n: any): void {
    if (n.isRead) return;
    this.http.patch<any>(`${API}/notifications/${n.id}/read`, {})
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          n.isRead = true;
          this.unreadCount = Math.max(0, this.unreadCount - 1);
        },
        error: () => {}
      });
  }

  markAllRead(): void {
    if (this.markingAll || this.unreadCount === 0) return;
    this.markingAll = true;

    this.http.patch<any>(`${API}/notifications/read-all`, {})
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.notifications.forEach(n => n.isRead = true);
          this.unreadCount = 0;
          this.markingAll  = false;
        },
        error: () => { this.markingAll = false; }
      });
  }

  get totalPages(): number { return Math.ceil(this.total / this.limit); }

  notifIcon(type: string): string {
    const map: Record<string, string> = {
      ORDER_CONFIRMED : 'fa-solid fa-circle-check',
      ORDER_SHIPPED   : 'fa-solid fa-truck',
      GROUP_SUCCESS   : 'fa-solid fa-users',
      GROUP_FAILED    : 'fa-solid fa-triangle-exclamation',
      PAYMENT_RECEIVED: 'fa-solid fa-coins',
      SYSTEM          : 'fa-solid fa-bell',
    };
    return map[type] ?? 'fa-solid fa-bell';
  }

  notifColor(type: string): string {
    const map: Record<string, string> = {
      ORDER_CONFIRMED : '#10D98B',
      ORDER_SHIPPED   : '#00D4FF',
      GROUP_SUCCESS   : '#F4A902',
      GROUP_FAILED    : '#FF4D6A',
      PAYMENT_RECEIVED: '#10D98B',
      SYSTEM          : '#7B2FBE',
    };
    return map[type] ?? '#7B2FBE';
  }

  trackById(_: number, n: any): string { return n.id; }
}
