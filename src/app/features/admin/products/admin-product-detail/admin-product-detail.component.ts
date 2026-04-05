import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminService }   from '../../../../core/services/admin.service';
import { ProductService } from '../../../../core/services/product.service';
import { Product } from '../../../../core/models';

@Component({
  selector: 'app-admin-product-detail',
  templateUrl: './admin-product-detail.component.html',
  styleUrls: ['./admin-product-detail.component.scss']
})
export class AdminProductDetailComponent implements OnInit {
  product: Product | null = null;
  loading = true;

  constructor(
    private route:          ActivatedRoute,
    private router:         Router,
    private adminService:   AdminService,
    private productService: ProductService,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) { this.router.navigate(['/admin/products']); return; }

    // ── Charger le produit depuis le backend ───────────────────
    this.productService.getById(id).subscribe({
      next: (p) => {
        this.product = p;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.product = null;
      }
    });
  }

  // ── Approuver le produit ──────────────────────────────────────
  approve(): void {
    if (!this.product) return;
    this.adminService.validateProduct(this.product.id, true).subscribe({
      next: () => { if (this.product) this.product.status = 'ACTIVE' as any; },
      error: () => {}
    });
  }

  // ── Rejeter le produit ────────────────────────────────────────
  reject(): void {
    if (!this.product) return;
    this.adminService.validateProduct(this.product.id, false, 'Non conforme aux standards').subscribe({
      next: () => { if (this.product) this.product.status = 'REJECTED' as any; },
      error: () => {}
    });
  }

  goBack(): void { this.router.navigate(['/admin/products']); }

  get statusClass(): string {
    if (!this.product) return '';
    if (this.product.status === 'ACTIVE'   || this.product.status === ('APPROVED' as any)) return 'badge-ok';
    if (this.product.status === 'PENDING'  || this.product.status === ('PENDING_APPROVAL' as any)) return 'badge-warn';
    if (this.product.status === 'REJECTED') return 'badge-err';
    return 'badge-grey';
  }

  get statusLabel(): string {
    if (!this.product) return '';
    if (this.product.status === 'ACTIVE'   || this.product.status === ('APPROVED' as any))        return 'Actif';
    if (this.product.status === 'PENDING'  || this.product.status === ('PENDING_APPROVAL' as any)) return 'En attente';
    if (this.product.status === 'REJECTED') return 'Rejeté';
    return 'Inactif';
  }

  get stockColor(): string {
    if (!this.product) return 'inherit';
    return this.product.stock > 50 ? '#10D98B' : this.product.stock > 10 ? '#F5A623' : '#FF4D6A';
  }

  get discountPercent(): number {
    if (!this.product || !this.product.minGroupPrice) return 0;
    return Math.round((1 - this.product.minGroupPrice / this.product.soloPrice) * 100);
  }

  formatXOF(val: number): string {
    return val.toLocaleString('fr-FR') + ' XOF';
  }
}