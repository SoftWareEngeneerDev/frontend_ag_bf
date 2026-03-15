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
  loading = true;
  activeTab = 'Toutes';

  steps = ['Créée','Confirmée','En préparation','Expédiée','Livrée'];

  constructor(
    private orderService: OrderService,
    public  fmt: FormatService,
  ) {}

  ngOnInit(): void {
    this.orderService.getMyOrders().subscribe(o => {
      this.orders = this.filtered = o;
      this.loading = false;
    });
  }

  setTab(t: string): void {
    this.activeTab = t;
    if (t === 'En cours')   this.filtered = this.orders.filter(o => ['CREATED','CONFIRMED','PROCESSING'].includes(o.status));
    else if (t === 'Expédiées')  this.filtered = this.orders.filter(o => o.status === 'SHIPPED');
    else if (t === 'Livrées')    this.filtered = this.orders.filter(o => o.status === 'DELIVERED');
    else this.filtered = this.orders;
  }

  stepIndex(status: string): number {
    const m: Record<string,number> = { CREATED:0, CONFIRMED:1, PROCESSING:2, SHIPPED:3, DELIVERED:4 };
    return m[status] ?? 0;
  }
}
