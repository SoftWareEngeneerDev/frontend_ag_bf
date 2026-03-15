import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GroupService }        from '../../../core/services/group.service';
import { OrderService }        from '../../../core/services/order.service';
import { NotificationService } from '../../../core/services/notification.service';
import { AuthService }         from '../../../core/services/auth.service';
import { FormatService }       from '../../../core/services/format.service';
import { MockDataService }     from '../../../core/services/mock-data.service';
import { Group, Order, Notification } from '../../../core/models';

@Component({
  selector: 'app-member-dashboard',
  templateUrl: './member-dashboard.component.html',
  styleUrls:  ['./member-dashboard.component.scss']
})
export class MemberDashboardComponent implements OnInit {
  myGroups:  Group[]        = [];
  orders:    Order[]        = [];
  notifs:    Notification[] = [];
  loading = true;

  kpis = [
    { icon:'👥', label:'Groupes actifs',     val:'3',          sub:'+1 ce mois',          color:'#F5A623' },
    { icon:'💰', label:'Total économisé',     val:'47 500 XOF', sub:'sur 5 achats',        color:'#10D98B' },
    { icon:'📦', label:'Commandes en cours',  val:'1',          sub:'expédition en cours', color:'#00D4FF' },
    { icon:'⭐', label:'Score de confiance',  val:'95/100',     sub:'Excellent',           color:'#7B2FBE' },
  ];

  constructor(
    private groupService:  GroupService,
    private orderService:  OrderService,
    public  notifService:  NotificationService,
    public  auth:          AuthService,
    public  fmt:           FormatService,
    private mock:          MockDataService,
    private router:        Router,
  ) {}

  ngOnInit(): void {
    this.groupService.getMyGroups().subscribe(g => { this.myGroups = g; this.loading = false; });
    this.orderService.getMyOrders().subscribe(o => this.orders = o.slice(0, 3));
    this.notifs = this.notifService.notifications().slice(0, 4);
  }

  progressPct(g: Group): number { return this.fmt.progressPercent(g.currentCount, g.minParticipants); }
  isThreshold(g: Group): boolean { return g.status === 'THRESHOLD_REACHED'; }

  goGroups():        void { this.router.navigate(['/member/groups']); }
  goPayment():       void { this.router.navigate(['/member/payment']); }
  goNotifications(): void { this.router.navigate(['/member/notifications']); }
  goGroupDetail(g: Group): void { this.router.navigate(['/groups', g.id]); }

  get greeting(): string {
    const h = new Date().getHours();
    if (h < 12) return 'Bonjour';
    if (h < 18) return 'Bon après-midi';
    return 'Bonsoir';
  }

  get firstName(): string {
    return this.auth.currentUser()?.fullName?.split(' ')[0] || 'Membre';
  }
}
