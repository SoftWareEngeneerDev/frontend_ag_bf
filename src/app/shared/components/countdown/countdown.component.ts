import { Component, Input, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-countdown',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="cd-wrap">
      <div class="cd-block" *ngFor="let b of blocks" [class.urgent]="urgent">
        <span class="cd-val font-mono">{{ b.val }}</span>
        <span class="cd-sep" *ngIf="b.sep">:</span>
        <span class="cd-lbl">{{ b.lbl }}</span>
      </div>
    </div>
  `,
  styles: [`
    .cd-wrap  { display:flex; align-items:center; gap:2px; }
    .cd-block { display:flex; flex-direction:column; align-items:center; background:var(--bg2); border-radius:var(--r-sm); padding:5px 8px; min-width:42px; }
    .cd-block.urgent { background:var(--red-l); }
    .cd-val   { font-size:18px; font-weight:800; color:var(--txt); line-height:1; }
    .cd-block.urgent .cd-val { color:var(--red); }
    .cd-lbl   { font-size:8px; color:var(--muted); letter-spacing:1px; text-transform:uppercase; margin-top:2px; }
    .cd-sep   { font-size:16px; font-weight:800; color:var(--primary); align-self:flex-start; padding-top:4px; }
  `]
})
export class CountdownComponent implements OnInit, OnDestroy {
  @Input() expiresAt!: Date | string;
  d=0; h=0; m=0; s=0; urgent=false;
  private timer?: ReturnType<typeof setInterval>;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void { this.tick(); this.timer = setInterval(() => { this.tick(); this.cdr.markForCheck(); }, 1000); }
  ngOnDestroy(): void { if (this.timer) clearInterval(this.timer); }

  tick(): void {
    const diff = Math.max(0, new Date(this.expiresAt).getTime() - Date.now());
    this.d = Math.floor(diff / 86400000);
    this.h = Math.floor((diff % 86400000) / 3600000);
    this.m = Math.floor((diff % 3600000) / 60000);
    this.s = Math.floor((diff % 60000) / 1000);
    this.urgent = this.d === 0 && this.h < 4;
  }

  get blocks() {
    const p = (n: number) => String(n).padStart(2,'0');
    return [
      { val: String(this.d), lbl:'J', sep:false },
      { val: p(this.h),      lbl:'H', sep:true  },
      { val: p(this.m),      lbl:'M', sep:true  },
      { val: p(this.s),      lbl:'S', sep:false },
    ];
  }
}
