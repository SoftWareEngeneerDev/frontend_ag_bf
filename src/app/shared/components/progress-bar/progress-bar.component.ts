import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-progress-bar',
  template: `
    <div>
      <div *ngIf="label" class="pb-header">
        <span class="text-muted" style="font-size:12px">{{ label }}</span>
        <span class="font-mono" style="font-size:12px; color:var(--gold)">{{ percent }}%</span>
      </div>
      <div class="prog-wrap" [style.height.px]="height">
        <div class="prog-fill" [class]="color" [style.width.%]="clampedPercent"></div>
      </div>
    </div>
  `,
  styles: [`.pb-header { display:flex; justify-content:space-between; margin-bottom:4px; }`]
})
export class ProgressBarComponent {
  @Input() percent = 0;
  @Input() height  = 8;
  @Input() color   = '';    // '' | 'cyan' | 'ok' | 'err'
  @Input() label   = '';

  get clampedPercent(): number { return Math.min(100, Math.max(0, this.percent)); }
}
