import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-avatar',
  template: `
    <div class="av"
         [style.width.px]="size" [style.height.px]="size"
         [style.background]="bg" [style.font-size.px]="size*0.38"
         [style.border-radius]="round ? '50%' : '10px'">
      {{ initials }}
    </div>
  `,
  styles: [`
    .av {
      display:flex; align-items:center; justify-content:center;
      font-weight:700; font-family:'Syne',sans-serif; color:#fff; flex-shrink:0;
    }
  `]
})
export class AvatarComponent {
  @Input() name  = 'U';
  @Input() size  = 36;
  @Input() bg    = '#0DA487';
  @Input() round = true;

  get initials(): string {
    return (this.name || 'U').split(' ').map((w: string) => w[0]).slice(0,2).join('').toUpperCase();
  }
}
