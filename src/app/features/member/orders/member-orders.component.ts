import { Component, OnInit } from '@angular/core';
import { OrderService }  from '../../../core/services/order.service';
import { FormatService } from '../../../core/services/format.service';
import { Order } from '../../../core/models';

@Component({
  selector: 'app-orders',
  templateUrl: './member-orders.component.html',
  styleUrls:  ['./member-orders.component.scss']
})
export class OrdersComponent implements OnInit {
  orders:   Order[] = [];
  filtered: Order[] = [];
  loading   = true;
  activeTab = 'Toutes';

  tabList = [
    { key: 'Toutes',    icon: 'fa-solid fa-list',         label: 'Toutes',    count: 0 },
    { key: 'En cours',  icon: 'fa-solid fa-clock',        label: 'En cours',  count: 0 },
    { key: 'Expédiées', icon: 'fa-solid fa-truck-fast',   label: 'Expédiées', count: 0 },
    { key: 'Livrées',   icon: 'fa-solid fa-circle-check', label: 'Livrées',   count: 0 },
  ];

  timelineSteps = [
    { icon: 'fa-solid fa-file-circle-check',  label: 'Créée' },
    { icon: 'fa-solid fa-circle-check',       label: 'Confirmée' },
    { icon: 'fa-solid fa-box',                label: 'Préparation' },
    { icon: 'fa-solid fa-truck-fast',         label: 'Expédiée' },
    { icon: 'fa-solid fa-house-circle-check', label: 'Livrée' },
  ];

  constructor(
    private orderService: OrderService,
    public  fmt:          FormatService,
  ) {}

  ngOnInit(): void {
    this.orderService.getMyOrders().subscribe({
      next: (o: Order[]) => {
        this.orders   = o;
        this.filtered = o;
        this.loading  = false;

        this.tabList[0].count = o.length;
        this.tabList[1].count = o.filter((x: Order) => ['CREATED', 'CONFIRMED', 'PROCESSING'].includes(x.status)).length;
        this.tabList[2].count = o.filter((x: Order) => x.status === 'SHIPPED').length;
        this.tabList[3].count = o.filter((x: Order) => x.status === 'DELIVERED').length;
      },
      error: () => { this.loading = false; }
    });
  }

  setTab(t: string): void {
    this.activeTab = t;
    if      (t === 'En cours')  this.filtered = this.orders.filter(o => ['CREATED', 'CONFIRMED', 'PROCESSING'].includes(o.status));
    else if (t === 'Expédiées') this.filtered = this.orders.filter(o => o.status === 'SHIPPED');
    else if (t === 'Livrées')   this.filtered = this.orders.filter(o => o.status === 'DELIVERED');
    else                        this.filtered = this.orders;
  }

  stepIndex(status: string): number {
    const m: Record<string, number> = {
      CREATED:    0,
      CONFIRMED:  1,
      PROCESSING: 2,
      SHIPPED:    3,
      DELIVERED:  4,
    };
    return m[status] ?? 0;
  }

  productImage(o: Order): string {
    return o.product?.images?.[0] ?? `https://picsum.photos/seed/${o.product?.id ?? o.id}/80/80`;
  }

  statusIcon(status: string): string {
    const icons: Record<string, string> = {
      CREATED:    'fa-solid fa-file-pen',
      CONFIRMED:  'fa-solid fa-circle-check',
      PROCESSING: 'fa-solid fa-gear',
      SHIPPED:    'fa-solid fa-truck-fast',
      DELIVERED:  'fa-solid fa-house-circle-check',
      CANCELLED:  'fa-solid fa-circle-xmark',
    };
    return icons[status] ?? 'fa-solid fa-circle';
  }
}