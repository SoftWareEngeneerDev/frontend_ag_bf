import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AdminService }   from '../../../../core/services/admin.service';
import { ProductService } from '../../../../core/services/product.service';
import { FormatService }  from '../../../../core/services/format.service';
import { Product } from '../../../../core/models';

@Component({
  selector   : 'app-admin-product-detail',
  templateUrl: './admin-product-detail.component.html',
  styleUrls  : ['./admin-product-detail.component.scss']
})
export class AdminProductDetailComponent implements OnInit, OnDestroy {
  product   : Product | null = null;
  loading    = true;
  processing = false;
  successMsg = '';
  errorMsg   = '';

  // Modal rejet
  showRejectModal = false;
  rejectReason    = '';

  private destroy$ = new Subject<void>();

  constructor(
    private route         : ActivatedRoute,
    private router        : Router,
    private adminService  : AdminService,
    private productService: ProductService,
    public  fmt           : FormatService,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) { this.router.navigate(['/admin/products']); return; }
    this.loadProduct(id);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadProduct(id: string): void {
    this.adminService.getProductById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (p: any) => {
          this.product  = this.mapProduct(p);
          this.loading  = false;
        },
        error: () => { this.product = null; this.loading = false; }
      });
  }

  private mapProduct(p: any): any {
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
      status          : p.status === 'APPROVED' ? 'ACTIVE'
                      : p.status === 'PENDING_APPROVAL' ? 'PENDING' : p.status,
      createdAt       : new Date(p.createdAt ?? Date.now()),
      category: {
        id  : p.category?.id   ?? '',
        name: p.category?.name ?? '',
        icon: p.category?.icon ?? 'fa-solid fa-tag',
        slug: p.category?.slug ?? '',
        productCount: 0,
      },
      supplier: {
        id         : p.supplier?.id          ?? '',
        companyName: p.supplier?.companyName ?? '',
        contactName: p.supplier?.user?.name  ?? '',
        phone      : p.supplier?.user?.phone ?? '',
        email      : p.supplier?.user?.email ?? '',
        address    : '',
        city       : p.supplier?.user?.city  ?? 'Ouagadougou',
        status     : 'APPROVED' as any,
        rating     : p.supplier?.rating      ?? 0,
        reviewCount: p.supplier?.reviewCount ?? 0,
        totalGroups: p.supplier?._count?.groups ?? 0,
        successRate: p.supplier?.successRate ?? 0,
        createdAt  : new Date(p.supplier?.createdAt ?? Date.now()),
        user       : null as any,
      },
    };
  }

  // ── Approuver ─────────────────────────────────────────────────
  approve(): void {
    if (!this.product || this.processing) return;
    this.processing = true;
    this.adminService.validateProduct(this.product.id, true)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          if (this.product) this.product.status = 'ACTIVE' as any;
          this.processing = false;
          this.showSuccess('Produit approuvé — fournisseur notifié');
        },
        error: (err) => {
          this.processing = false;
          this.showError(err?.error?.error?.message ?? 'Erreur');
        }
      });
  }

  // ── Ouvrir modal rejet ────────────────────────────────────────
  openRejectModal(): void {
    this.rejectReason    = '';
    this.showRejectModal = true;
  }

  // ── Confirmer rejet ───────────────────────────────────────────
  confirmReject(): void {
    if (!this.product || !this.rejectReason.trim() || this.processing) return;
    this.processing = true;

    this.adminService.validateProduct(this.product.id, false, this.rejectReason)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          if (this.product) this.product.status = 'REJECTED' as any;
          this.showRejectModal = false;
          this.processing      = false;
          this.showSuccess('Produit rejeté — fournisseur notifié');
        },
        error: (err) => {
          this.processing = false;
          this.showError(err?.error?.error?.message ?? 'Erreur lors du rejet');
        }
      });
  }

  goBack(): void { this.router.navigate(['/admin/products']); }

  // ── Getters ───────────────────────────────────────────────────
  get statusClass(): string {
    if (!this.product) return '';
    const s = this.product.status as string;
    if (['ACTIVE', 'APPROVED'].includes(s))          return 'badge-ok';
    if (['PENDING', 'PENDING_APPROVAL'].includes(s)) return 'badge-warn';
    if (s === 'REJECTED')                            return 'badge-err';
    return 'badge-grey';
  }

  get statusLabel(): string {
    if (!this.product) return '';
    const s = this.product.status as string;
    if (['ACTIVE', 'APPROVED'].includes(s))          return '✅ Actif';
    if (['PENDING', 'PENDING_APPROVAL'].includes(s)) return '⏳ En attente';
    if (s === 'REJECTED')                            return '❌ Rejeté';
    return '📦 Inactif';
  }

  get discountPercent(): number {
    if (!this.product?.minGroupPrice || this.product.soloPrice === 0) return 0;
    return Math.round((1 - this.product.minGroupPrice / this.product.soloPrice) * 100);
  }

  get stockColor(): string {
    if (!this.product) return 'inherit';
    if (this.product.stock > 50)  return '#10D98B';
    if (this.product.stock > 10)  return '#F5A623';
    return '#FF4D6A';
  }

  private showSuccess(msg: string): void {
    this.successMsg = msg; this.errorMsg = '';
    setTimeout(() => { this.successMsg = ''; }, 3000);
  }

  private showError(msg: string): void {
    this.errorMsg = msg; this.successMsg = '';
    setTimeout(() => { this.errorMsg = ''; }, 4000);
  }
}