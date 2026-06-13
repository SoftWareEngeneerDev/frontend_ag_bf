import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap, catchError, of } from 'rxjs';
import { Notification } from '../models';
import { environment } from '../../../environments/environment';

// const API = 'http://localhost:3000/api/v1';
const API          = environment.apiUrl;

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private _list        = signal<Notification[]>([]);
  private _unreadCount = signal<number>(0);

  readonly notifications = this._list.asReadonly();
  readonly unreadCount   = this._unreadCount.asReadonly();

  constructor(private http: HttpClient) {
    this.refreshUnreadCount();
  }

  // ── GET /notifications/unread-count — appel léger pour le badge ─
  refreshUnreadCount(): void {
    this.http.get<any>(`${API}/notifications/unread-count`).pipe(
      catchError(() => of({ data: { count: 0 } }))
    ).subscribe(res => this._unreadCount.set(res.data?.count ?? 0));
  }

  // ── GET /users/me/notifications — chargement complet (page notifs) ─
  getAll(): Observable<Notification[]> {
    return this.http.get<any>(`${API}/users/me/notifications`).pipe(
      map(res => (res.data?.notifications ?? res.data ?? []).map((n: any) => this.mapNotif(n))),
      tap(list => {
        this._list.set(list);
        this._unreadCount.set(list.filter((n: Notification) => !n.read).length);
      }),
      catchError(() => of([]))
    );
  }

  // ── PATCH /notifications/:id/read ─────────────────────────────
  markRead(id: string): void {
    this.http.patch(`${API}/notifications/${id}/read`, {}).subscribe();
    this._list.update(list =>
      list.map(n => n.id === id ? { ...n, read: true } : n)
    );
    this._unreadCount.update(c => Math.max(0, c - 1));
  }

  // ── PATCH /notifications/read-all ─────────────────────────────
  markAllRead(): void {
    this.http.patch(`${API}/notifications/read-all`, {}).subscribe();
    this._list.update(list => list.map(n => ({ ...n, read: true })));
    this._unreadCount.set(0);
  }

  // ── Helper mapper ─────────────────────────────────────────────
  private mapNotif(n: any): Notification {
    return {
      id       : n.id,
      type     : n.type,
      title    : n.title,
      body     : n.body,
      read     : n.isRead ?? false,
      createdAt: new Date(n.createdAt ?? Date.now()),
      metadata : n.metadata,
    };
  }
}
