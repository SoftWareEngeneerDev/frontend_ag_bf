import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-logo',
  template: `
    <a routerLink="/" class="logo-wrap">
      <div class="logo-mark" [style.width.px]="size+10" [style.height.px]="size+10">
        <span [style.font-size.px]="size*0.62">G</span>
      </div>
      <div class="logo-text">
        <span class="logo-main" [style.font-size.px]="size">AchatGroupé</span>
        <span class="logo-bf"   [style.font-size.px]="size">BF</span>
      </div>
    </a>
  `,
  styles: [`
    .logo-wrap { display:flex; align-items:center; gap:10px; text-decoration:none; }
    .logo-mark {
      background: linear-gradient(135deg, #0DA487, #065F46);
      border-radius: 10px;
      display:flex; align-items:center; justify-content:center;
      font-weight:900; color:#fff; font-family:'Syne',sans-serif;
      box-shadow: 0 4px 12px rgba(13,164,135,.35);
      flex-shrink:0;
    }
    .logo-text { display:flex; align-items:center; }
    .logo-main { font-family:'Syne',sans-serif; font-weight:700; color:#2B3445; }
    .logo-bf   { font-family:'Syne',sans-serif; font-weight:800; color:#0DA487; }
  `]
})
export class LogoComponent {
  @Input() size = 20;
}
