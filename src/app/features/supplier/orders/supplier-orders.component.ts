import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject, takeUntil } from 'rxjs';
import { FormatService } from '../../../core/services/format.service';

const API = 'http://localhost:3000/api/v1';

const TAB_STATUS_MAP: Record<string, string> = {
  'À confirmer'   : 'CREATED',
  'En préparation': 'PROCESSING',
  'Expédiées'     : 'SHIPPED',
  'Livrées'       : 'DELIVERED',
};

@Component({
  selector: 'app-supplier-orders',
  templateUrl: './supplier-orders.component.html',
  styleUrls:  ['./supplier-orders.component.scss']
})
export class SupplierOrdersComponent implements OnInit, OnDestroy {
  orders   : any[] = [];
  filtered : any[] = [];
  loading   = true;
  activeTab = 'Toutes';

  // ── Modal expédition ──────────────────────────────────────
  showShipModal  = false;
  selectedOrder  : any = null;
  trackingCode   = '';
  shipping       = false;
  confirming     = false;

  successMsg = '';
  errorMsg   = '';

  readonly tabs = ['Toutes', 'À confirmer', 'En préparation', 'Expédiées', 'Livrées'];

  private destroy$ = new Subject<void>();

  constructor(
    private http : HttpClient,
    public  fmt  : FormatService,
  ) {}

  ngOnInit(): void { this.loadOrders(); }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Charger les commandes ─────────────────────────────────
  private loadOrders(): void {
    this.loading = true;
    this.http.get<any>(`${API}/supplier/orders`, { params: { limit: '100' } })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          const data    = res.data ?? [];
          this.orders   = data.map((o: any) => this.mapOrder(o));
          this.applyFilter();
          this.loading  = false;
        },
        error: () => { this.loading = false; }
      });
  }

  // ── Filtre ────────────────────────────────────────────────
  private applyFilter(): void {
    if (this.activeTab === 'Toutes') {
      this.filtered = this.orders;
    } else {
      const status  = TAB_STATUS_MAP[this.activeTab];
      this.filtered = this.orders.filter(o => o.status === status);
    }
  }

  setTab(t: string): void { this.activeTab = t; this.applyFilter(); }

  // ── Compteurs ─────────────────────────────────────────────
  get urgentCount(): number {
    return this.orders.filter(o => o.status === 'CREATED').length;
  }

  tabCount(t: string): number {
    if (t === 'Toutes') return this.orders.length;
    const status = TAB_STATUS_MAP[t];
    return this.orders.filter(o => o.status === status).length;
  }

  // ── Confirmer une commande ────────────────────────────────
  confirm(o: any): void {
    if (this.confirming) return;
    this.confirming = true;

    this.http.patch(`${API}/supplier/orders/${o.id}/confirm`, {})
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          o.status    = 'PROCESSING';
          this.confirming = false;
          this.applyFilter();
          this.showSuccess('Commande confirmée — membres notifiés');
        },
        error: (err) => {
          this.confirming = false;
          this.showError(err?.error?.error?.message ?? 'Erreur lors de la confirmation');
        }
      });
  }

  // ── Ouvrir modal expédition ───────────────────────────────
  openShipModal(o: any): void {
    this.selectedOrder = o;
    this.trackingCode  = '';
    this.showShipModal = true;
  }

  // ── Marquer comme expédiée ────────────────────────────────
  ship(): void {
    if (!this.selectedOrder || !this.trackingCode.trim() || this.shipping) return;
    this.shipping = true;

    this.http.patch(`${API}/supplier/orders/${this.selectedOrder.id}/ship`, {
      trackingCode: this.trackingCode.trim(),
    })
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: () => {
        this.selectedOrder.status       = 'SHIPPED';
        this.selectedOrder.trackingCode = this.trackingCode.trim();
        this.showShipModal = false;
        this.shipping      = false;
        this.applyFilter();
        this.showSuccess('Commande marquée comme expédiée — membres notifiés');
      },
      error: (err) => {
        this.shipping = false;
        this.showError(err?.error?.error?.message ?? 'Erreur lors de l\'expédition');
      }
    });
  }

  // ── Action principale selon le statut ─────────────────────
  nextAction(o: any): string {
    const map: Record<string, string> = {
      CREATED    : '✅ Confirmer',
      PROCESSING : '🚚 Expédier',
    };
    return map[o.status] ?? '';
  }

  onAction(o: any): void {
    if (o.status === 'CREATED')    this.confirm(o);
    if (o.status === 'PROCESSING') this.openShipModal(o);
  }

  // ── Helpers ───────────────────────────────────────────────
  statusClass(s: string): string { return this.fmt.orderStatusClass(s as any); }
  statusLabel(s: string): string { return this.fmt.orderStatusLabel(s as any); }
  trackById(_: number, o: any): string { return o.id; }

  private showSuccess(msg: string): void {
    this.successMsg = msg; this.errorMsg = '';
    setTimeout(() => { this.successMsg = ''; }, 3000);
  }

  private showError(msg: string): void {
    this.errorMsg = msg; this.successMsg = '';
    setTimeout(() => { this.errorMsg = ''; }, 4000);
  }

  private mapOrder(o: any): any {
    return {
      id          : o.id,
      group       : o.group?.title         ?? 'Groupe',
      product     : o.group?.product?.name ?? 'Produit',
      icon        : 'fa-solid fa-box',
      qty         : o.group?.currentCount  ?? 1,
      amount      : o.totalAmount ?? o.amount ?? 0,
      status      : o.status,
      date        : new Date(o.createdAt ?? Date.now()).toLocaleDateString('fr-FR'),
      trackingCode: o.trackingCode ?? '',
    };
  }
}