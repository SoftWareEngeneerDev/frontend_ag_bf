import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-badge',
  template: `<span [class]="'badge-' + variant">{{ label }}</span>`,
  styles: []
})
export class BadgeComponent {
  @Input() label   = '';
  @Input() variant = 'grey'; // ok | gold | err | cyan | grey | violet | warn
}
