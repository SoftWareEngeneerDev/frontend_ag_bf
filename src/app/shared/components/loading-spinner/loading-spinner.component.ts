import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loading-spinner',
  template: `
    <div class="ls-wrap" [class.ls-full]="full">
      <div class="ls-spin" [style.width.px]="size" [style.height.px]="size"></div>
      <p *ngIf="text" class="text-muted ls-text">{{ text }}</p>
    </div>
  `,
  styles: [`
    .ls-wrap { display:flex; flex-direction:column; align-items:center; justify-content:center; padding:28px; }
    .ls-full { min-height:200px; }
    .ls-spin { border:2.5px solid rgba(255,255,255,.1); border-top-color:var(--gold); border-radius:50%; animation:lsspin .75s linear infinite; }
    .ls-text { margin-top:14px; font-size:13px; }
    @keyframes lsspin { to { transform:rotate(360deg); } }
  `]
})
export class LoadingSpinnerComponent {
  @Input() size = 36;
  @Input() text = '';
  @Input() full = false;
}
