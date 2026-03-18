import { Component } from '@angular/core';
import { ToastService, Toast } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast-container',
  template: `
    <div class="toast-container">
      <div *ngFor="let t of toastService.toasts()" class="toast" [class]="'toast-' + t.type">
        <i [class]="icon(t.type)"></i>
        <span class="toast-msg">{{ t.message }}</span>
        <button class="toast-close" (click)="toastService.dismiss(t.id)">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed; bottom: 24px; right: 24px;
      display: flex; flex-direction: column; gap: 10px;
      z-index: 9999; max-width: 360px;
    }
    .toast {
      display: flex; align-items: center; gap: 10px;
      padding: 12px 16px; border-radius: 10px;
      font-size: 13.5px; font-weight: 500;
      box-shadow: 0 4px 20px rgba(0,0,0,.14);
      animation: toastIn .25s ease;
      color: #fff;
    }
    @keyframes toastIn {
      from { opacity:0; transform:translateY(12px) scale(.96); }
      to   { opacity:1; transform:translateY(0)    scale(1); }
    }
    .toast-success { background: #0DA487; }
    .toast-error   { background: #E63946; }
    .toast-warning { background: #F4A902; color: #1a1a1a; }
    .toast-info    { background: #0EA5E9; }
    .toast-msg  { flex: 1; line-height: 1.4; }
    .toast-close {
      background: none; border: none; cursor: pointer;
      color: inherit; opacity: .75; font-size: 14px; padding: 0;
      &:hover { opacity: 1; }
    }
  `]
})
export class ToastContainerComponent {
  constructor(public toastService: ToastService) {}

  icon(type: string): string {
    const icons: Record<string, string> = {
      success: 'fa-solid fa-circle-check',
      error:   'fa-solid fa-circle-xmark',
      warning: 'fa-solid fa-triangle-exclamation',
      info:    'fa-solid fa-circle-info',
    };
    return icons[type] || 'fa-solid fa-bell';
  }
}
