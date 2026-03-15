import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-stats-card',
  template: `
    <div class="kpi-card sc-wrap" [style.borderTop]="'3px solid ' + color">
      <div class="sc-top">
        <div class="sc-icon-wrap" [style.background]="color + '15'">
          <span [style.font-size.px]="22">{{ icon }}</span>
        </div>
        <div *ngIf="trend" class="sc-trend" [class.up]="trend! > 0" [class.down]="trend! < 0">
          {{ trend! > 0 ? '↑' : '↓' }} {{ trend! > 0 ? '+' : '' }}{{ trend }}%
        </div>
      </div>
      <div class="sc-val font-mono font-display" [style.color]="color">{{ value }}</div>
      <div class="sc-label">{{ label }}</div>
      <div class="sc-sub text-muted" *ngIf="sub">{{ sub }}</div>
    </div>
  `,
  styles: [`
    .sc-wrap  { border-radius: var(--r-lg) !important; }
    .sc-top   { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px; }
    .sc-icon-wrap { width:48px; height:48px; border-radius:var(--r); display:flex; align-items:center; justify-content:center; }
    .sc-trend { font-size:12px; font-weight:700; padding:3px 8px; border-radius:var(--r-full); &.up{background:#E6F7F4;color:var(--ok)} &.down{background:var(--red-l);color:var(--red)} }
    .sc-val   { font-size:24px; font-weight:800; margin-bottom:4px; }
    .sc-label { font-size:13px; font-weight:600; color:var(--txt2); margin-bottom:2px; }
    .sc-sub   { font-size:11.5px; }
  `]
})
export class StatsCardComponent {
  @Input() icon   = '📊';
  @Input() value  = '0';
  @Input() label  = '';
  @Input() sub    = '';
  @Input() color  = 'var(--primary)';
  @Input() trend?: number;
}
