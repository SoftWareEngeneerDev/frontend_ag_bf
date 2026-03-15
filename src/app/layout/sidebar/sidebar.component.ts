import { Component, Input } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';

export interface NavItem {
  route:      string;
  icon:       string;
  label:      string;
  badge?:     number | string;
  badgeColor?: string;
  separator?: boolean;
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  @Input() items:   NavItem[] = [];
  @Input() userBg = '#F5A623';

  constructor(public auth: AuthService) {}
  get user() { return this.auth.currentUser(); }
}
