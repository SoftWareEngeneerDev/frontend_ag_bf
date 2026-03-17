import { Component, Input, Output, EventEmitter } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';

export interface NavItem {
  route:       string;
  /** Classe Font Awesome complète ex: 'fa-solid fa-house' */
  icon:        string;
  label:       string;
  badge?:      number | string;
  badgeColor?: string;
  separator?:  boolean;
  exact?:      boolean;
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  @Input() items:  NavItem[] = [];
  @Input() userBg = '#F5A623';
  @Input() open   = false;
  @Output() closeRequest = new EventEmitter<void>();

  constructor(public auth: AuthService) {}

  get user() { return this.auth.currentUser(); }

  get roleLabel(): string {
    const r = this.user?.role;
    return r === 'ADMIN' ? 'Super Admin' : r === 'SUPPLIER' ? 'Fournisseur' : 'Membre';
  }

  get roleIcon(): string {
    const r = this.user?.role;
    return r === 'ADMIN' ? 'fa-solid fa-shield-halved' :
           r === 'SUPPLIER' ? 'fa-solid fa-store' :
           'fa-solid fa-user';
  }
}
