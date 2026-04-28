import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap, catchError, of } from 'rxjs';
import { Notification } from '../models';

const API = 'http://localhost:3000/api/v1';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private _list = signal<Notification[]>([]);

  readonly notifications = this._list.asReadonly();
  readonly unreadCount   = () => this._list().filter(n => !n.read).length;

  constructor(private http: HttpClient) {
    this.getAll().subscribe();
  }

  // ── GET /users/me/notifications ───────────────────────────────
  getAll(): Observable<Notification[]> {
    return this.http.get<any>(`${API}/users/me/notifications`).pipe(
      map(res => (res.data?.notifications ?? res.data ?? []).map((n: any) => this.mapNotif(n))),
      tap(list => this._list.set(list)),
      catchError(() => of([]))
    );
  }

  // ── PATCH /users/me/notifications/:id/read ────────────────────
  markRead(id: string): void {
    this.http.patch(`${API}/users/me/notifications/${id}/read`, {}).subscribe();
    this._list.update(list =>
      list.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }

  // ── PATCH /users/me/notifications/read-all ────────────────────
  markAllRead(): void {
    this.http.patch(`${API}/users/me/notifications/read-all`, {}).subscribe();
    this._list.update(list => list.map(n => ({ ...n, read: true })));
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