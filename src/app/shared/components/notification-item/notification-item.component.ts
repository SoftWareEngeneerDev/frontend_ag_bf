import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Notification } from '../../../core/models';

@Component({
  selector: 'app-notification-item',
  template: `
    <div class="ni" [class.unread]="!notif.read" (click)="clicked.emit(notif)">
      <div class="ni-icon" [style.background]="bg">{{ icon }}</div>
      <div style="flex:1; min-width:0">
        <div class="ni-title" [class.fw]="!notif.read">{{ notif.title }}</div>
        <div class="text-muted ni-body">{{ notif.body }}</div>
      </div>
      <div class="ni-meta">
        <span class="text-muted" style="font-size:11px; white-space:nowrap">{{ notif.createdAt | timeAgo }}</span>
        <div *ngIf="!notif.read" class="unread-dot"></div>
      </div>
    </div>
  `,
  styles: [`
    .ni       { display:flex; align-items:flex-start; gap:12px; padding:12px 14px; border-radius:10px; transition:all .2s; cursor:pointer; }
    .ni:hover { background:rgba(245,166,35,.04); }
    .ni.unread{ background:rgba(0,212,255,.03); border-left:2px solid rgba(0,212,255,.4); }
    .ni-icon  { width:40px; height:40px; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:18px; flex-shrink:0; }
    .ni-title { font-size:13.5px; margin-bottom:3px; line-height:1.4; }
    .fw       { font-weight:600; }
    .ni-body  { font-size:12.5px; line-height:1.45; }
    .ni-meta  { display:flex; flex-direction:column; align-items:flex-end; gap:6px; flex-shrink:0; padding-top:2px; }
    .unread-dot { width:8px; height:8px; background:var(--cyan); border-radius:50%; }
  `]
})
export class NotificationItemComponent {
  @Input() notif!: Notification;
  @Output() clicked = new EventEmitter<Notification>();

  private static icons: Record<string, string> = {
    NEW_MEMBER:'🔥', THRESHOLD_REACHED:'🎯', PAYMENT_REMINDER:'💳',
    PAYMENT_SUCCESS:'✅', ORDER_SHIPPED:'📦', ORDER_DELIVERED:'✅', PROMO:'⭐',
  };
  private static bgs: Record<string, string> = {
    NEW_MEMBER:'rgba(255,107,53,.12)', THRESHOLD_REACHED:'rgba(245,166,35,.12)',
    PAYMENT_REMINDER:'rgba(0,212,255,.1)', PAYMENT_SUCCESS:'rgba(16,217,139,.1)',
    ORDER_SHIPPED:'rgba(0,212,255,.1)', ORDER_DELIVERED:'rgba(16,217,139,.1)',
    PROMO:'rgba(123,47,190,.12)',
  };

  get icon(): string { return NotificationItemComponent.icons[this.notif?.type] || '🔔'; }
  get bg():   string { return NotificationItemComponent.bgs[this.notif?.type]   || 'rgba(255,255,255,.06)'; }
}
