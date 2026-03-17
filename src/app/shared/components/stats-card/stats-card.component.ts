import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-stats-card',
  template: `
    <div class="kpi-card sc-wrap" [style.borderTop]="'3px solid ' + color">
      <div class="sc-top">
        <div class="sc-icon-wrap" [style.background]="color + '15'" [style.color]="color">
          <i [class]="icon" style="font-size:20px"></i>
        </div>
        <div *ngIf="trend !== undefined" class="sc-trend"
             [class.up]="trend > 0" [class.down]="trend < 0">
          <i [class]="trend > 0 ? 'fa-solid fa-arrow-trend-up' : 'fa-solid fa-arrow-trend-down'"></i>
          {{ trend > 0 ? '+' : '' }}{{ trend }}%
        </div>
      </div>
      <div class="sc-val font-mono" [style.color]="color">{{ value }}</div>
      <div class="sc-label">{{ label }}</div>
      <div class="sc-sub text-muted" *ngIf="sub">{{ sub }}</div>
    </div>
  `,
  styles: [`
    .sc-wrap      { border-radius: var(--r-lg) !important; transition: transform .2s, box-shadow .2s; &:hover { transform: translateY(-2px); box-shadow: var(--shadow-md) !important; } }
    .sc-top       { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:14px; }
    .sc-icon-wrap { width:48px; height:48px; border-radius:12px; display:flex; align-items:center; justify-content:center; }
    .sc-trend     { font-size:11px; font-weight:700; padding:4px 9px; border-radius:99px; display:flex; align-items:center; gap:4px;
                    &.up   { background:#E8FDF2; color:#10D98B; }
                    &.down { background:#FFE8EC; color:#FF4D6A; } }
    .sc-val       { font-size:24px; font-weight:800; margin-bottom:5px; line-height:1; }
    .sc-label     { font-size:12px; font-weight:600; color:var(--txt2); margin-bottom:3px; text-transform:uppercase; letter-spacing:.4px; }
    .sc-sub       { font-size:11.5px; color:var(--light); }
  `]
})
export class StatsCardComponent {
  /** Classe Font Awesome complète ex: 'fa-solid fa-users' */
  @Input() icon  = 'fa-solid fa-chart-pie';
  @Input() value = '0';
  @Input() label = '';
  @Input() sub   = '';
  @Input() color = 'var(--primary)';
  @Input() trend?: number;
}
