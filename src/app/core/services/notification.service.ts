import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';
import { Notification } from '../models';

const API = 'http://localhost:3000/api/v1';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private _list = signal<Notification[]>([]);

  readonly notifications = this._list.asReadonly();
  readonly unreadCount   = () => this._list().filter(n => !n.read).length;

  constructor(private http: HttpClient) {
    // Charger les notifications au démarrage
    this.getAll().subscribe();
  }

  // ── GET /notifications ────────────────────────────────────────
  getAll(): Observable<Notification[]> {
    return this.http.get<any>(`${API}/notifications`).pipe(
      map(res => (res.data?.notifications ?? res.data ?? []).map((n: any) => this.mapNotif(n))),
      tap(list => this._list.set(list))
    );
  }

  // ── PATCH /notifications/:id/read ────────────────────────────
  markRead(id: string): void {
    this.http.patch(`${API}/notifications/${id}/read`, {}).subscribe();
    this._list.update(list =>
      list.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }

  // ── PATCH /notifications/read-all ────────────────────────────
  markAllRead(): void {
    this.http.patch(`${API}/notifications/read-all`, {}).subscribe();
    this._list.update(list => list.map(n => ({ ...n, read: true })));
  }

  // ── Helper : mapper backend → modèle Notification front ──────
  private mapNotif(n: any): Notification {
    return {
      id:        n.id,
      type:      n.type,
      title:     n.title,
      body:      n.body,
      read:      n.isRead ?? false,   // backend: isRead → front: read
      createdAt: new Date(n.createdAt ?? Date.now()),
      metadata:  n.metadata,
    };
  }
}