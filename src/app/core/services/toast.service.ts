import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: number;
  type: ToastType;
  message: string;
  duration: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private _toasts = signal<Toast[]>([]);
  private nextId = 1;

  readonly toasts = this._toasts.asReadonly();

  show(message: string, type: ToastType = 'info', duration = 3500): void {
    const id = this.nextId++;
    this._toasts.update(t => [...t, { id, type, message, duration }]);
    setTimeout(() => this.dismiss(id), duration);
  }

  success(message: string): void { this.show(message, 'success'); }
  error(message: string):   void { this.show(message, 'error', 5000); }
  info(message: string):    void { this.show(message, 'info'); }
  warning(message: string): void { this.show(message, 'warning'); }

  dismiss(id: number): void {
    this._toasts.update(t => t.filter(x => x.id !== id));
  }
}
