import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormatService } from '../../../core/services/format.service';

const API = 'http://localhost:3000/api/v1';

@Component({
  selector: 'app-supplier-orders',
  templateUrl: './supplier-orders.component.html',
  styleUrls:  ['./supplier-orders.component.scss']
})
export class SupplierOrdersComponent implements OnInit {
  orders:   any[] = [];
  filtered: any[] = [];
  loading   = true;
  activeTab = 'Toutes';
  tabs      = ['Toutes', 'À confirmer', 'En préparation', 'Expédiées', 'Livrées'];

  constructor(
    private http: HttpClient,
    public  fmt:  FormatService,
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  // ── GET /supplier/orders ──────────────────────────────────────
  private loadOrders(): void {
    this.loading = true;
    this.http.get<any>(`${API}/supplier/orders`, { params: { limit: 100 } }).subscribe({
      next: (res) => {
        const data     = res.data?.orders ?? res.data ?? [];
        this.orders    = data.map((o: any) => this.mapOrder(o));
        this.filtered  = this.orders;
        this.loading   = false;
      },
      error: () => { this.loading = false; }
    });
  }

  get urgentCount(): number {
    return this.orders.filter(o => o.status === 'CREATED').length;
  }

  setTab(t: string): void {
    this.activeTab = t;
    const map: Record<string, string> = {
      'À confirmer':    'CREATED',
      'En préparation': 'PROCESSING',
      'Expédiées':      'SHIPPED',
      'Livrées':        'DELIVERED',
    };
    this.filtered = t === 'Toutes'
      ? this.orders
      : this.orders.filter(o => o.status === map[t]);
  }

  // ── Confirmer une commande → PATCH /supplier/orders/:id/confirm
  confirm(o: any): void {
    this.http.patch(`${API}/supplier/orders/${o.id}/confirm`, {}).subscribe({
      next: () => { o.status = 'CONFIRMED'; },
      error: () => {}
    });
  }

  // ── Marquer comme expédiée → PATCH /supplier/orders/:id/ship ──
  ship(o: any): void {
    const trackingCode = prompt('Code de suivi (ex: DHL-BF-12345)') ?? '';
    this.http.patch(`${API}/supplier/orders/${o.id}/ship`, { trackingCode }).subscribe({
      next: () => { o.status = 'SHIPPED'; o.trackingCode = trackingCode; },
      error: () => {}
    });
  }

  statusClass(s: string): string { return this.fmt.orderStatusClass(s as any); }
  statusLabel(s: string): string { return this.fmt.orderStatusLabel(s as any); }

  nextAction(o: any): string {
    const m: Record<string, string> = {
      'CREATED':    'Confirmer',
      'CONFIRMED':  'Préparer',
      'PROCESSING': 'Expédier',
    };
    return m[o.status] ?? '';
  }

  onAction(o: any): void {
    if (o.status === 'CREATED' || o.status === 'CONFIRMED') this.confirm(o);
    else if (o.status === 'PROCESSING') this.ship(o);
  }

  // ── Helper mapper ─────────────────────────────────────────────
  private mapOrder(o: any): any {
    return {
      id:           o.id,
      group:        o.group?.title         ?? 'Groupe',
      product:      o.group?.product?.name ?? 'Produit',
      icon:         'fa-solid fa-box',
      qty:          o.group?.currentCount  ?? 1,
      amount:       o.totalAmount          ?? 0,
      status:       o.status,
      buyer:        o.group?.product?.supplier?.companyName ?? 'Acheteurs',
      date:         new Date(o.createdAt ?? Date.now()).toLocaleDateString('fr-FR'),
      trackingCode: o.trackingCode ?? '',
    };
  }
}