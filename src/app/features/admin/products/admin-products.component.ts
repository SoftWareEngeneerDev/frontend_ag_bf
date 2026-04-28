import { Component, OnInit, OnDestroy } from '@angular/core';
import { forkJoin, Subject, takeUntil, catchError, of } from 'rxjs';
import { AdminService }   from '../../../core/services/admin.service';
import { ProductService } from '../../../core/services/product.service';
import { FormatService }  from '../../../core/services/format.service';
import { Product } from '../../../core/models';

const STATUS_MAP: Record<string, string> = {
  'Actifs'    : 'ACTIVE',
  'En attente': 'PENDING',
  'Rejetés'   : 'REJECTED',
  'Inactifs'  : 'INACTIVE',
};

@Component({
  selector   : 'app-admin-products',
  templateUrl: './admin-products.component.html',
  styleUrls  : ['./admin-products.component.scss']
})
export class AdminProductsComponent implements OnInit, OnDestroy {
  search    = '';
  activeTab = 'En attente';
  loading   = true;
  processing = '';

  readonly tabs = ['Tous', 'Actifs', 'En attente', 'Rejetés', 'Inactifs'];

  products   : Product[] = [];
  successMsg  = '';
  errorMsg    = '';

  // Modal rejet
  showRejectModal  = false;
  selectedProduct  : Product | null = null;
  rejectReason     = '';

  private destroy$ = new Subject<void>();

  constructor(
    private adminService  : AdminService,
    private productService: ProductService,
    public  fmt           : FormatService,
  ) {}

  ngOnInit(): void { this.loadProducts(); }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Charger tous les produits en parallèle ────────────────────
  private loadProducts(): void {
    this.loading = true;
    forkJoin({
      pending : this.adminService.getPendingProducts(100).pipe(catchError(() => of([]))),
      all     : this.productService.getAll({ page: 1, limit: 100 }).pipe(catchError(() => of([]))),
    })
    .pipe(takeUntil(this.destroy$))
    .subscribe(({ pending, all }) => {
      const pendingMapped = pending.map((p: any) => this.mapProduct(p));
      const pendingIds    = new Set(pendingMapped.map((p: Product) => p.id));
      const allFiltered   = (all as Product[]).filter(p => !pendingIds.has(p.id));
      this.products = [...pendingMapped, ...allFiltered];
      this.loading  = false;
    });
  }

  // ── Filtre ────────────────────────────────────────────────────
  get filtered(): Product[] {
    const q = this.search.toLowerCase();
    return this.products.filter(p => {
      const matchSearch = !q
        || p.name.toLowerCase().includes(q)
        || p.supplier?.companyName?.toLowerCase().includes(q);
      const matchTab = this.activeTab === 'Tous'
        || p.status === STATUS_MAP[this.activeTab];
      return matchSearch && matchTab;
    });
  }

  // ── Compteurs ─────────────────────────────────────────────────
  get activeCount()  : number { return this.products.filter(p => p.status === 'ACTIVE').length; }
  get pendingCount() : number { return this.products.filter(p => p.status === 'PENDING').length; }
  get rejectedCount(): number { return this.products.filter(p => p.status === 'REJECTED').length; }

  tabCount(t: string): number {
    if (t === 'Tous') return this.products.length;
    return this.products.filter(p => p.status === STATUS_MAP[t]).length;
  }

  // ── Approuver ─────────────────────────────────────────────────
  approve(p: Product): void {
    if (this.processing === p.id) return;
    this.processing = p.id;
    this.adminService.validateProduct(p.id, true)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          p.status      = 'ACTIVE' as any;
          this.processing = '';
          this.showSuccess(`"${p.name}" approuvé`);
        },
        error: (err) => {
          this.processing = '';
          this.showError(err?.error?.error?.message ?? 'Erreur lors de l\'approbation');
        }
      });
  }

  // ── Ouvrir modal rejet ────────────────────────────────────────
  openRejectModal(p: Product): void {
    this.selectedProduct = p;
    this.rejectReason    = '';
    this.showRejectModal = true;
  }

  // ── Confirmer rejet ───────────────────────────────────────────
  confirmReject(): void {
    if (!this.selectedProduct || !this.rejectReason.trim()) return;
    this.processing = this.selectedProduct.id;

    this.adminService.validateProduct(this.selectedProduct.id, false, this.rejectReason)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          if (this.selectedProduct) this.selectedProduct.status = 'REJECTED' as any;
          this.showRejectModal  = false;
          this.processing       = '';
          this.showSuccess(`"${this.selectedProduct?.name}" rejeté`);
          this.selectedProduct  = null;
        },
        error: (err) => {
          this.processing = '';
          this.showError(err?.error?.error?.message ?? 'Erreur lors du rejet');
        }
      });
  }

  // ── Désactiver un produit actif ───────────────────────────────
  deactivate(p: Product): void {
    if (this.processing === p.id) return;
    this.processing = p.id;
    this.adminService.validateProduct(p.id, false, 'Désactivé par admin')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          p.status      = 'INACTIVE' as any;
          this.processing = '';
          this.showSuccess(`"${p.name}" désactivé`);
        },
        error: (err) => {
          this.processing = '';
          this.showError(err?.error?.error?.message ?? 'Erreur');
        }
      });
  }

  // ── Helpers ───────────────────────────────────────────────────
  statusClass(s: string): string {
    if (['ACTIVE', 'APPROVED'].includes(s))                return 'badge-ok';
    if (['PENDING', 'PENDING_APPROVAL'].includes(s))       return 'badge-warn';
    if (s === 'REJECTED')                                  return 'badge-err';
    return 'badge-grey';
  }

  statusLabel(s: string): string {
    if (['ACTIVE', 'APPROVED'].includes(s))                return '✅ Actif';
    if (['PENDING', 'PENDING_APPROVAL'].includes(s))       return '⏳ En attente';
    if (s === 'REJECTED')                                  return '❌ Rejeté';
    return '📦 Inactif';
  }

  discountPct(p: Product): number {
    if (!p.minGroupPrice || p.soloPrice === 0) return 0;
    return Math.round((1 - p.minGroupPrice / p.soloPrice) * 100);
  }

  stockColor(stock: number): string {
    if (stock > 50)  return '#10D98B';
    if (stock > 10)  return '#F5A623';
    return '#FF4D6A';
  }

  trackById(_: number, p: Product): string { return p.id; }

  private showSuccess(msg: string): void {
    this.successMsg = msg; this.errorMsg = '';
    setTimeout(() => { this.successMsg = ''; }, 3000);
  }

  private showError(msg: string): void {
    this.errorMsg = msg; this.successMsg = '';
    setTimeout(() => { this.errorMsg = ''; }, 4000);
  }

  private mapProduct(p: any): Product {
    return {
      id              : p.id,
      name            : p.name          ?? '',
      description     : p.description   ?? '',
      images          : p.imagesUrls    ?? [],
      emoji           : '📦',
      soloPrice       : p.soloPrice     ?? 0,
      minGroupPrice   : p.baseGroupPrice ?? 0,
      stock           : p.stock         ?? 0,
      rating          : p.rating        ?? 0,
      reviewCount     : p._count?.reviews ?? 0,
      activeGroupCount: p._count?.groups  ?? 0,
      status          : ['PENDING_APPROVAL'].includes(p.status) ? 'PENDING' as any : p.status,
      createdAt       : new Date(p.createdAt ?? Date.now()),
      category: {
        id          : p.category?.id   ?? '',
        name        : p.category?.name ?? '',
        icon        : p.category?.icon ?? 'fa-solid fa-tag',
        slug        : p.category?.slug ?? '',
        productCount: 0,
      },
      supplier: {
        id          : p.supplier?.id             ?? '',
        companyName : p.supplier?.companyName    ?? '',
        contactName : p.supplier?.user?.name     ?? '',
        phone       : p.supplier?.user?.phone    ?? '',
        email       : p.supplier?.user?.email    ?? '',
        address     : '',
        city        : p.supplier?.user?.city     ?? 'Ouagadougou',
        status      : 'APPROVED' as any,
        rating      : p.supplier?.rating         ?? 0,
        reviewCount : p.supplier?.reviewCount    ?? 0,
        totalGroups : p.supplier?._count?.groups ?? 0,
        successRate : p.supplier?.successRate    ?? 0,
        createdAt   : new Date(p.supplier?.createdAt ?? Date.now()),
        user        : null as any,
      },
    };
  }
}