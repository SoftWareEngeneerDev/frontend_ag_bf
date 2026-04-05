import { Component, OnInit } from '@angular/core';
import { AdminService }   from '../../../core/services/admin.service';
import { ProductService } from '../../../core/services/product.service';
import { Product } from '../../../core/models';

@Component({
  selector: 'app-admin-products',
  templateUrl: './admin-products.component.html',
  styleUrls: ['./admin-products.component.scss']
})
export class AdminProductsComponent implements OnInit {
  search    = '';
  activeTab = 'Tous';
  loading   = true;
  tabs      = ['Tous', 'Actifs', 'En attente', 'Rejetés', 'Inactifs'];
  products: Product[] = [];

  constructor(
    private adminService:   AdminService,
    private productService: ProductService,
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  // ── Charger tous les produits ─────────────────────────────────
  private loadProducts(): void {
    this.loading = true;
    // On charge d'abord les produits en attente
    this.adminService.getPendingProducts(100).subscribe({
      next: (pending) => {
        // Ensuite les produits approuvés via product.service
        this.productService.getAll({ page: 1, limit: 100 }).subscribe({
          next: (approved) => {
            const pendingMapped = pending.map((p: any) => this.mapProduct(p));
            // Fusionner sans doublons
            const ids = new Set(pendingMapped.map((p: Product) => p.id));
            const approvedFiltered = approved.filter(p => !ids.has(p.id));
            this.products = [...pendingMapped, ...approvedFiltered];
            this.loading  = false;
          },
          error: () => {
            this.products = pending.map((p: any) => this.mapProduct(p));
            this.loading  = false;
          }
        });
      },
      error: () => { this.loading = false; }
    });
  }

  get filtered(): Product[] {
    const statusMap: Record<string, string> = {
      'Actifs':     'ACTIVE',
      'En attente': 'PENDING',
      'Rejetés':    'REJECTED',
      'Inactifs':   'INACTIVE',
    };
    return this.products.filter(p => {
      const matchSearch = !this.search ||
        p.name.toLowerCase().includes(this.search.toLowerCase()) ||
        p.supplier?.companyName?.toLowerCase().includes(this.search.toLowerCase());
      const matchTab = this.activeTab === 'Tous' || p.status === statusMap[this.activeTab];
      return matchSearch && matchTab;
    });
  }

  get activeCount():   number { return this.products.filter(p => p.status === 'ACTIVE').length; }
  get pendingCount():  number { return this.products.filter(p => p.status === 'PENDING').length; }
  get rejectedCount(): number { return this.products.filter(p => p.status === 'REJECTED').length; }

  // ── Approuver un produit ──────────────────────────────────────
  approve(p: Product): void {
    this.adminService.validateProduct(p.id, true).subscribe({
      next: () => { p.status = 'ACTIVE' as any; },
      error: () => {}
    });
  }

  // ── Rejeter un produit ────────────────────────────────────────
  reject(p: Product): void {
    this.adminService.validateProduct(p.id, false, 'Non conforme').subscribe({
      next: () => { p.status = 'REJECTED' as any; },
      error: () => {}
    });
  }

  statusClass(s: string): string {
    if (s === 'ACTIVE'   || s === 'APPROVED') return 'badge-ok';
    if (s === 'PENDING'  || s === 'PENDING_APPROVAL') return 'badge-warn';
    if (s === 'REJECTED') return 'badge-err';
    return 'badge-grey';
  }

  statusLabel(s: string): string {
    if (s === 'ACTIVE'   || s === 'APPROVED')          return 'Actif';
    if (s === 'PENDING'  || s === 'PENDING_APPROVAL')   return 'En attente';
    if (s === 'REJECTED') return 'Rejeté';
    return 'Inactif';
  }

  formatXOF(val: number): string {
    return val.toLocaleString('fr-FR') + ' XOF';
  }

  // ── Helper mapper backend → Product front ─────────────────────
  private mapProduct(p: any): Product {
    return {
      id:               p.id,
      name:             p.name         ?? '',
      description:      p.description  ?? '',
      images:           p.imagesUrls   ?? [],
      emoji:            '📦',
      soloPrice:        p.soloPrice    ?? 0,
      minGroupPrice:    p.baseGroupPrice ?? 0,
      stock:            p.stock        ?? 0,
      rating:           p.rating       ?? 0,
      reviewCount:      p._count?.reviews ?? 0,
      activeGroupCount: p._count?.groups  ?? 0,
      status:           p.status === 'PENDING_APPROVAL' ? 'PENDING' as any : p.status,
      createdAt:        new Date(p.createdAt ?? Date.now()),
      category: {
        id:           p.category?.id   ?? '',
        name:         p.category?.name ?? '',
        icon:         p.category?.icon ?? 'fa-solid fa-tag',
        slug:         p.category?.slug ?? '',
        productCount: 0,
      },
      supplier: {
        id:           p.supplier?.id            ?? '',
        companyName:  p.supplier?.companyName   ?? '',
        contactName:  p.supplier?.user?.name    ?? '',
        phone:        p.supplier?.user?.phone   ?? '',
        email:        p.supplier?.user?.email   ?? '',
        address:      '',
        city:         p.supplier?.user?.city    ?? 'Ouagadougou',
        status:       'APPROVED' as any,
        rating:       p.supplier?.rating        ?? 0,
        reviewCount:  p.supplier?.reviewCount   ?? 0,
        totalGroups:  p.supplier?._count?.groups ?? 0,
        successRate:  p.supplier?.successRate   ?? 0,
        createdAt:    new Date(p.supplier?.createdAt ?? Date.now()),
        user:         null as any,
      },
    };
  }
}