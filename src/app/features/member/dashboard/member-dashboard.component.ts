import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GroupService }        from '../../../core/services/group.service';
import { OrderService }        from '../../../core/services/order.service';
import { NotificationService } from '../../../core/services/notification.service';
import { AuthService }         from '../../../core/services/auth.service';
import { FormatService }       from '../../../core/services/format.service';
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
    { icon:'fa-solid fa-users',          label:'Groupes actifs',    val:'3',          sub:'+1 ce mois',          color:'#0DA487', bg:'#E6FAF5' },
    { icon:'fa-solid fa-piggy-bank',     label:'Total économisé',   val:'47 500 XOF', sub:'sur 5 achats',        color:'#10D98B', bg:'#E8FDF2' },
    { icon:'fa-solid fa-box',            label:'Commandes en cours', val:'1',          sub:'En expédition',       color:'#00D4FF', bg:'#E0F9FF' },
    { icon:'fa-solid fa-star',           label:'Score de confiance', val:'95/100',     sub:'Excellent',           color:'#7B2FBE', bg:'#F0E8FD' },
  ];

  // Données activité récente (timeline)
  timeline = [
    { icon:'fa-solid fa-fire',          color:'#F4A902', time:'Il y a 12 min',  text:'Seuil atteint — Climatiseur 12000 BTU',          action:'Payer', route:'/member/payment' },
    { icon:'fa-solid fa-user-plus',     color:'#0DA487', time:'Il y a 1h20',   text:'Nouveau membre rejoint le groupe Samsung A55' },
    { icon:'fa-solid fa-truck-fast',    color:'#00D4FF', time:'Hier, 09:14',   text:'Commande expédiée — TV LED 55" · DHL-BF-48291' },
    { icon:'fa-solid fa-circle-check',  color:'#10D98B', time:'Il y a 2 jours', text:'Paiement confirmé — 117 000 XOF pour Climatiseur' },
    { icon:'fa-solid fa-bell',          color:'#7B2FBE', time:'Il y a 3 jours', text:'Nouveau groupe : Samsung S24 Ultra — 45% de remise' },
  ];

  constructor(
    private groupService:  GroupService,
    private orderService:  OrderService,
    public  notifService:  NotificationService,
    public  auth:          AuthService,
    public  fmt:           FormatService,
    private router:        Router,
  ) {}

  ngOnInit(): void {
    this.groupService.getMyGroups().subscribe(g => { this.myGroups = g; this.loading = false; });
    this.orderService.getMyOrders().subscribe(o => this.orders = o.slice(0, 3));
    this.notifs = this.notifService.notifications().slice(0, 4);
  }

  get greeting(): string {
    const h = new Date().getHours();
    if (h < 12) return 'Bonjour';
    if (h < 18) return 'Bon après-midi';
    return 'Bonsoir';
  }

  get firstName(): string { return this.auth.currentUser()?.fullName?.split(' ')[0] || 'Membre'; }

  get urgentGroup(): Group | undefined { return this.myGroups.find(g => g.status === 'THRESHOLD_REACHED'); }

  productImage(g: Group): string {
    return g.product.images?.[0] ?? `https://picsum.photos/seed/${g.product.id}/120/120`;
  }

  progressPct(g: Group): number { return this.fmt.progressPercent(g.currentCount, g.minParticipants); }
  isThreshold(g: Group): boolean { return g.status === 'THRESHOLD_REACHED'; }

  goGroups():          void { this.router.navigate(['/member/groups']); }
  goPayment():         void { this.router.navigate(['/member/payment']); }
  goBrowse():          void { this.router.navigate(['/groups']); }
  goOrders():          void { this.router.navigate(['/member/orders']); }
  goNotifications():   void { this.router.navigate(['/member/notifications']); }
  goGroupDetail(g: Group): void { this.router.navigate(['/groups', g.id]); }
}
