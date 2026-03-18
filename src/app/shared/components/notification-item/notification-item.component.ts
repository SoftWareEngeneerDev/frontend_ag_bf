import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Notification } from '../../../core/models';

@Component({
  selector: 'app-notification-item',
  template: `
    <div class="ni" [class.unread]="!notif.read" (click)="clicked.emit(notif)">
      <div class="ni-icon" [style.background]="bg" [style.color]="color">
        <i [class]="icon"></i>
      </div>
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
    .ni       { display:flex; align-items:flex-start; gap:12px; padding:12px 14px; border-radius:10px; transition:background .2s; cursor:pointer; }
    .ni:hover { background:var(--bg); }
    .ni.unread{ background:var(--primary-l); border-left:3px solid var(--primary); }
    .ni-icon  { width:40px; height:40px; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:18px; flex-shrink:0; }
    .ni-title { font-size:13.5px; margin-bottom:3px; line-height:1.4; color:var(--txt); }
    .fw       { font-weight:600; }
    .ni-body  { font-size:12.5px; line-height:1.45; }
    .ni-meta  { display:flex; flex-direction:column; align-items:flex-end; gap:6px; flex-shrink:0; padding-top:2px; }
    .unread-dot { width:8px; height:8px; background:var(--primary); border-radius:50%; }
  `]
})
export class NotificationItemComponent {
  @Input() notif!: Notification;
  @Output() clicked = new EventEmitter<Notification>();

  private static icons: Record<string, string> = {
    NEW_MEMBER:        'fa-solid fa-fire',
    THRESHOLD_REACHED: 'fa-solid fa-bullseye',
    PAYMENT_REMINDER:  'fa-solid fa-credit-card',
    PAYMENT_SUCCESS:   'fa-solid fa-circle-check',
    ORDER_SHIPPED:     'fa-solid fa-truck-fast',
    ORDER_DELIVERED:   'fa-solid fa-house-circle-check',
    PROMO:             'fa-solid fa-star',
  };
  private static colors: Record<string, string> = {
    NEW_MEMBER:'#FF6B35', THRESHOLD_REACHED:'#F4A902', PAYMENT_REMINDER:'#0DA487',
    PAYMENT_SUCCESS:'#10D98B', ORDER_SHIPPED:'#0DA487', ORDER_DELIVERED:'#10D98B',
    PROMO:'#7B2FBE',
  };
  private static bgs: Record<string, string> = {
    NEW_MEMBER:'rgba(255,107,53,.12)', THRESHOLD_REACHED:'rgba(244,169,2,.12)',
    PAYMENT_REMINDER:'rgba(13,164,135,.1)', PAYMENT_SUCCESS:'rgba(16,217,139,.1)',
    ORDER_SHIPPED:'rgba(13,164,135,.1)', ORDER_DELIVERED:'rgba(16,217,139,.1)',
    PROMO:'rgba(123,47,190,.12)',
  };

  get icon():  string { return NotificationItemComponent.icons[this.notif?.type]  || 'fa-solid fa-bell'; }
  get color(): string { return NotificationItemComponent.colors[this.notif?.type] || 'var(--muted)'; }
  get bg():    string { return NotificationItemComponent.bgs[this.notif?.type]    || 'var(--bg)'; }
}
