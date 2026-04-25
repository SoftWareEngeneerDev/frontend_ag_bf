import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { OrderService }  from '../../../core/services/order.service';
import { FormatService } from '../../../core/services/format.service';
import { Order } from '../../../core/models';

@Component({
  selector: 'app-orders',
  templateUrl: './member-orders.component.html',
  styleUrls:  ['./member-orders.component.scss']
})
export class OrdersComponent implements OnInit, OnDestroy {
  orders   : Order[] = [];
  filtered : Order[] = [];
  loading    = true;
  activeTab  = 'all';

  private destroy$ = new Subject<void>();

  readonly tabList = [
    { key: 'all',       icon: 'fa-solid fa-list',         label: 'Toutes',    count: 0 },
    { key: 'ongoing',   icon: 'fa-solid fa-clock',        label: 'En cours',  count: 0 },
    { key: 'shipped',   icon: 'fa-solid fa-truck-fast',   label: 'Expédiées', count: 0 },
    { key: 'delivered', icon: 'fa-solid fa-circle-check', label: 'Livrées',   count: 0 },
    { key: 'cancelled', icon: 'fa-solid fa-circle-xmark', label: 'Annulées',  count: 0 },
  ];

  readonly timelineSteps = [
    { icon: 'fa-solid fa-file-circle-check',  label: 'Créée'      },
    { icon: 'fa-solid fa-circle-check',       label: 'Confirmée'  },
    { icon: 'fa-solid fa-box',                label: 'Préparation'},
    { icon: 'fa-solid fa-truck-fast',         label: 'Expédiée'   },
    { icon: 'fa-solid fa-house-circle-check', label: 'Livrée'     },
  ];

  private readonly statusMap: Record<string, number> = {
    CREATED    : 0,
    CONFIRMED  : 1,
    PROCESSING : 2,
    SHIPPED    : 3,
    DELIVERED  : 4,
  };

  private readonly filterMap: Record<string, string[]> = {
    ongoing   : ['CREATED', 'CONFIRMED', 'PROCESSING'],
    shipped   : ['SHIPPED'],
    delivered : ['DELIVERED'],
    cancelled : ['CANCELLED'],
  };

  constructor(
    private orderService : OrderService,
    public  fmt          : FormatService,
    private router       : Router,
  ) {}

  ngOnInit(): void {
    this.orderService.getMyOrders()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (orders: Order[]) => {
          this.orders  = orders;
          this.loading = false;
          this.updateCounts();
          this.applyFilter(this.activeTab);
        },
        error: () => { this.loading = false; }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Compteurs ─────────────────────────────────────────────────
  private updateCounts(): void {
    this.tabList[0].count = this.orders.length;
    this.tabList[1].count = this.orders.filter(o => ['CREATED','CONFIRMED','PROCESSING'].includes(o.status)).length;
    this.tabList[2].count = this.orders.filter(o => o.status === 'SHIPPED').length;
    this.tabList[3].count = this.orders.filter(o => o.status === 'DELIVERED').length;
    this.tabList[4].count = this.orders.filter(o => o.status === 'CANCELLED').length;
  }

  // ── Filtre ────────────────────────────────────────────────────
  private applyFilter(key: string): void {
    const statuses = this.filterMap[key];
    this.filtered  = statuses
      ? this.orders.filter(o => statuses.includes(o.status))
      : this.orders;
  }

  setTab(key: string): void {
    this.activeTab = key;
    this.applyFilter(key);
  }

  // ── Helpers ───────────────────────────────────────────────────
  stepIndex(status: string): number {
    return this.statusMap[status] ?? 0;
  }

  productImage(o: Order): string {
    return o.product?.images?.[0]
      ?? `https://picsum.photos/seed/${o.product?.id ?? o.id}/80/80`;
  }

  statusIcon(status: string): string {
    const icons: Record<string, string> = {
      CREATED    : 'fa-solid fa-file-pen',
      CONFIRMED  : 'fa-solid fa-circle-check',
      PROCESSING : 'fa-solid fa-gear fa-spin',
      SHIPPED    : 'fa-solid fa-truck-fast',
      DELIVERED  : 'fa-solid fa-house-circle-check',
      CANCELLED  : 'fa-solid fa-circle-xmark',
    };
    return icons[status] ?? 'fa-solid fa-circle';
  }

  isOngoing(o: Order): boolean {
    return ['CREATED', 'CONFIRMED', 'PROCESSING'].includes(o.status);
  }

  trackById(_: number, o: Order): string { return o.id; }

  // ── Navigation ────────────────────────────────────────────────
  reorder(o: Order): void { this.router.navigate(['/groups', o.group?.id ?? o.id]); }
  leaveReview(o: Order): void { this.router.navigate(['/groups', o.group?.id ?? o.id], { queryParams: { review: true } }); }
}