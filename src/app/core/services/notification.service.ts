import { Injectable, signal } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Notification } from '../models';
import { MockDataService } from './mock-data.service';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private _list = signal<Notification[]>([...this.mock.notifications]);

  readonly notifications = this._list.asReadonly();
  readonly unreadCount   = () => this._list().filter(n => !n.read).length;

  constructor(private mock: MockDataService) {}

  getAll(): Observable<Notification[]> {
    return of(this.mock.notifications).pipe(delay(300));
  }

  markRead(id: string): void {
    this._list.update(list => list.map(n => n.id === id ? { ...n, read: true } : n));
  }

  markAllRead(): void {
    this._list.update(list => list.map(n => ({ ...n, read: true })));
  }
}
