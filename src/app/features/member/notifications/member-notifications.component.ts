import { Component, OnInit } from '@angular/core';
import { NotificationService } from '../../../core/services/notification.service';
import { Notification } from '../../../core/models';

@Component({
  selector: 'app-notifications',
  templateUrl: './member-notifications.component.html',
  styleUrls:  ['./member-notifications.component.scss']
})
export class NotificationsComponent implements OnInit {
  loading = false;

  constructor(public notifService: NotificationService) {}

  ngOnInit(): void {
    // Recharger les notifications à l'ouverture de la page
    if (this.notifService.notifications().length === 0) {
      this.loading = true;
      this.notifService.getAll().subscribe({
        next:  () => { this.loading = false; },
        error: () => { this.loading = false; }
      });
    }
  }

  // ── Getters ───────────────────────────────────────────────────
  get notifs() : Notification[] { return this.notifService.notifications(); }
  get unread()  : number         { return this.notifService.unreadCount(); }

  get today(): Notification[] {
    return this.notifs.filter(n => this.isToday(n.createdAt));
  }

  get thisWeek(): Notification[] {
    return this.notifs.filter(n => this.isThisWeek(n.createdAt) && !this.isToday(n.createdAt));
  }

  get older(): Notification[] {
    return this.notifs.filter(n => !this.isThisWeek(n.createdAt));
  }

  // ── Actions ───────────────────────────────────────────────────
  onNotifClick(n: Notification): void {
    if (!n.read) this.notifService.markRead(n.id);
  }

  markAll(): void { this.notifService.markAllRead(); }

  // ── Helpers date ──────────────────────────────────────────────
  isToday(d: Date | string): boolean {
    const now = new Date();
    const nd  = new Date(d);
    return nd.getDate()  === now.getDate()
        && nd.getMonth() === now.getMonth()
        && nd.getFullYear() === now.getFullYear();
  }

  isThisWeek(d: Date | string): boolean {
    const now  = new Date();
    const nd   = new Date(d);
    const diff = (now.getTime() - nd.getTime()) / (1000 * 60 * 60 * 24);
    return diff <= 7;
  }

  trackById(_: number, n: Notification): string { return n.id; }
}