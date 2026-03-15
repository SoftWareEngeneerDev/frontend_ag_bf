import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  template: `
    <div class="es">
      <div class="es-icon">{{ icon }}</div>
      <h3 class="font-display es-title">{{ title }}</h3>
      <p class="text-muted es-desc">{{ description }}</p>
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    .es       { text-align:center; padding:52px 24px; }
    .es-icon  { font-size:52px; margin-bottom:16px; }
    .es-title { font-size:18px; font-weight:700; margin-bottom:8px; }
    .es-desc  { font-size:13.5px; max-width:320px; margin:0 auto 24px; line-height:1.55; }
  `]
})
export class EmptyStateComponent {
  @Input() icon        = '📭';
  @Input() title       = 'Aucune donnée';
  @Input() description = 'Aucun élément à afficher pour le moment.';
}
