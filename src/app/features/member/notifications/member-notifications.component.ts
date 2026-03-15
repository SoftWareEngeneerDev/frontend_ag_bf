import { Component } from '@angular/core';
import { NotificationService } from '../../../core/services/notification.service';
import { Notification } from '../../../core/models';

@Component({
  selector: 'app-notifications',
  templateUrl: './member-notifications.component.html',
  styleUrls:  ['./member-notifications.component.scss']
})
export class NotificationsComponent {
  constructor(public notifService: NotificationService) {}

  get notifs(): Notification[] { return this.notifService.notifications(); }
  get unread(): number { return this.notifService.unreadCount(); }

  onNotifClick(n: Notification): void { this.notifService.markRead(n.id); }
  markAll(): void { this.notifService.markAllRead(); }

  get today():    Notification[] { return this.notifs.filter(n => this.isToday(n.createdAt)); }
  get thisWeek(): Notification[] { return this.notifs.filter(n => !this.isToday(n.createdAt)); }

  isToday(d: Date): boolean {
    const today = new Date();
    const nd    = new Date(d);
    return nd.getDate() === today.getDate() && nd.getMonth() === today.getMonth();
  }
}
