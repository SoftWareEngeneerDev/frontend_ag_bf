import { Component } from '@angular/core';
import { NavItem } from '../../../layout/sidebar/sidebar.component';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-member-shell',
  template: `
    <div class="shell-wrap">
      <app-sidebar [items]="navItems" userBg="#F5A623"
                   [open]="sidebarOpen" (closeRequest)="sidebarOpen = false">
      </app-sidebar>
      <div class="shell-main">
        <app-topbar [title]="title" userBg="#F5A623"
                    (menuToggle)="sidebarOpen = !sidebarOpen">
        </app-topbar>
        <div class="shell-content">
          <router-outlet></router-outlet>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .shell-wrap    { display:flex; }
    .shell-main    { margin-left:var(--sidebar-w); flex:1; min-height:100vh; }
    .shell-content { padding:28px; }
    @media (max-width:768px) {
      .shell-main    { margin-left:0; }
      .shell-content { padding:16px; }
    }
  `]
})
export class MemberShellComponent {
  title = 'Mon Espace';
  sidebarOpen = false;

  navItems: NavItem[] = [
    { route:'/member',               icon:'fa-solid fa-house',        label:'Tableau de bord', exact:true },
    { route:'/member/groups',        icon:'fa-solid fa-layer-group',  label:'Mes Groupes',     badge:3 },
    { route:'/member/payment',       icon:'fa-solid fa-credit-card',  label:'Paiement' },
    { route:'/member/orders',        icon:'fa-solid fa-box',          label:'Mes Commandes' },
    { route:'/member/notifications', icon:'fa-solid fa-bell',         label:'Notifications',   badge:3, badgeColor:'#FF4D6A' },
    { route:'/member/profile',       icon:'fa-solid fa-gear',         label:'Profil' },
  ];

  constructor(public notifs: NotificationService) {
    this.navItems[4].badge = this.notifs.unreadCount();
  }
}
