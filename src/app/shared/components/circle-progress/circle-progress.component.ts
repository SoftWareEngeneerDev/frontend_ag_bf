import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-circle-progress',
  template: `
    <div [style.position]="'relative'" [style.width.px]="size" [style.height.px]="size" [style.flexShrink]="0">
      <svg [attr.width]="size" [attr.height]="size">
        <circle [attr.cx]="size/2" [attr.cy]="size/2" [attr.r]="r"
          fill="none" stroke="rgba(255,255,255,.08)" [attr.stroke-width]="sw"/>
        <circle [attr.cx]="size/2" [attr.cy]="size/2" [attr.r]="r"
          fill="none" [attr.stroke]="color" [attr.stroke-width]="sw" stroke-linecap="round"
          [attr.stroke-dasharray]="circ*(pct/100) + ' ' + circ*(1-pct/100)"
          [attr.stroke-dashoffset]="circ*0.25"/>
      </svg>
      <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: []
})
export class CircleProgressComponent {
  @Input() size  = 120;
  @Input() sw    = 10;
  @Input() pct   = 0;
  @Input() color = '#F5A623';

  get r():    number { return (this.size - this.sw * 2) / 2; }
  get circ(): number { return 2 * Math.PI * this.r; }
}
