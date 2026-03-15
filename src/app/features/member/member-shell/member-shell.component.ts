import { Component } from '@angular/core';
import { NavItem } from '../../../layout/sidebar/sidebar.component';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-member-shell',
  template: `
    <div class="shell-wrap">
      <app-sidebar [items]="navItems" userBg="#F5A623"></app-sidebar>
      <div class="shell-main">
        <app-topbar [title]="title" userBg="#F5A623"></app-topbar>
        <div class="shell-content">
          <router-outlet></router-outlet>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .shell-wrap  { display:flex; }
    .shell-main  { margin-left:var(--sidebar-w); flex:1; min-height:100vh; }
    .shell-content { padding:28px; }
  `]
})
export class MemberShellComponent {
  title = 'Mon Espace';

  navItems: NavItem[] = [
    { route:'/member',              icon:'🏠', label:'Tableau de bord' },
    { route:'/member/groups',       icon:'👥', label:'Mes Groupes',     badge:3 },
    { route:'/member/payment',      icon:'💳', label:'Paiement' },
    { route:'/member/orders',       icon:'📦', label:'Mes Commandes' },
    { route:'/member/notifications',icon:'🔔', label:'Notifications',   badge:3, badgeColor:'#FF4D6A' },
    { route:'/member/profile',      icon:'⚙️', label:'Profil' },
  ];

  constructor(public notifs: NotificationService) {
    this.navItems[4].badge = this.notifs.unreadCount();
  }
}
