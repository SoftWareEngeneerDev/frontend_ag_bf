import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormatService } from '../../../core/services/format.service';
import { Product, Category } from '../../../core/models';
import { ProductService } from '../../../core/services/product.service';

const API = 'http://localhost:3000/api/v1';

@Component({
  selector: 'app-supplier-products',
  templateUrl: './supplier-products.component.html',
  styleUrls:  ['./supplier-products.component.scss']
})
export class SupplierProductsComponent implements OnInit {
  products: Product[] = [];
  filtered: Product[] = [];
  allCategories: Category[] = [];
  loading       = true;
  saving        = false;
  creatingGroup = false;
  search        = '';
  activeTab     = 'Tous';
  tabs          = ['Tous', 'Approuvés', 'En attente', 'Rejetés'];

  showAddModal   = false;
  showEditModal  = false;
  showGroupModal = false;
  selectedProduct: Product | null = null;

  // ── Formulaire ajout produit ──────────────────────────────────
  addForm = {
    name:          '',
    description:   '',
    soloPrice:     0,
    baseGroupPrice:0,
    stock:         0,
    categoryId:    '',
  };

  // ── Formulaire modification produit ──────────────────────────
  editForm = {
    name:          '',
    description:   '',
    soloPrice:     0,
    minGroupPrice: 0,
    stock:         0,
    category:      '',
  };

  // ── Formulaire création groupe ────────────────────────────────
  groupForm = {
    minParticipants: 10,
    maxParticipants: 100,
    depositPercent:  10,
    expiresInDays:   7,
    tiers: [
      { minParticipants: 5,  discountPercent: 15 },
      { minParticipants: 10, discountPercent: 25 },
      { minParticipants: 15, discountPercent: 35 },
    ]
  };

  categories = ['Électronique', 'Alimentaire', 'Textile & Mode', 'Maison & Jardin', 'Santé & Beauté', 'Agriculture'];

  constructor(
    private http:           HttpClient,
    private productService: ProductService,
    public  fmt:            FormatService,
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadCategories();
  }

  // ── GET /supplier/products ────────────────────────────────────
  private loadProducts(): void {
    this.loading = true;
    this.http.get<any>(`${API}/supplier/products`, { params: { limit: 100 } }).subscribe({
      next: (res) => {
        const data     = res.data?.products ?? res.data ?? [];
        this.products  = data.map((p: any) => this.mapProduct(p));
        this.filtered  = this.products;
        this.loading   = false;
      },
      error: () => { this.loading = false; }
    });
  }

  // ── GET /categories ───────────────────────────────────────────
  private loadCategories(): void {
    this.productService.getCategories().subscribe({
      next: (cats) => { this.allCategories = cats; },
      error: () => {}
    });
  }

  // ── POST /supplier/products ───────────────────────────────────
  submitProduct(): void {
    if (!this.addForm.name || this.saving) return;
    this.saving = true;

    this.http.post<any>(`${API}/supplier/products`, {
      name:          this.addForm.name,
      description:   this.addForm.description,
      soloPrice:     this.addForm.soloPrice,
      baseGroupPrice:this.addForm.baseGroupPrice,
      stock:         this.addForm.stock,
      categoryId:    this.addForm.categoryId || this.allCategories[0]?.id,
    }).subscribe({
      next: (res) => {
        const newP = this.mapProduct(res.data);
        this.products.unshift(newP);
        this.filtered     = this.products;
        this.showAddModal = false;
        this.saving       = false;
        this.addForm = { name: '', description: '', soloPrice: 0, baseGroupPrice: 0, stock: 0, categoryId: '' };
      },
      error: () => { this.saving = false; }
    });
  }

  // ── PUT /supplier/products/:id ────────────────────────────────
  saveEdit(): void {
    if (!this.selectedProduct || this.saving) return;
    this.saving = true;

    this.http.put<any>(`${API}/supplier/products/${this.selectedProduct.id}`, {
      name:          this.editForm.name,
      description:   this.editForm.description,
      soloPrice:     this.editForm.soloPrice,
      baseGroupPrice:this.editForm.minGroupPrice,
      stock:         this.editForm.stock,
    }).subscribe({
      next: () => {
        if (this.selectedProduct) {
          this.selectedProduct.name          = this.editForm.name;
          this.selectedProduct.description   = this.editForm.description;
          this.selectedProduct.soloPrice     = this.editForm.soloPrice;
          this.selectedProduct.minGroupPrice = this.editForm.minGroupPrice;
          this.selectedProduct.stock         = this.editForm.stock;
          this.selectedProduct.status        = 'PENDING' as any; // Resoumis à validation
        }
        this.showEditModal = false;
        this.saving        = false;
      },
      error: () => { this.saving = false; }
    });
  }

  // ── POST /supplier/groups → Créer groupe depuis produit ───────
  createGroupFromProduct(): void {
    if (!this.selectedProduct || this.creatingGroup) return;
    this.creatingGroup = true;

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + this.groupForm.expiresInDays);

    this.http.post<any>(`${API}/supplier/groups`, {
      productId:       this.selectedProduct.id,
      minParticipants: this.groupForm.minParticipants,
      maxParticipants: this.groupForm.maxParticipants,
      depositPercent:  this.groupForm.depositPercent / 100,
      expiresAt:       expiresAt.toISOString(),
      pricingTiers:    this.groupForm.tiers.map(t => ({
        participantCount: t.minParticipants,
        discountPercent:  t.discountPercent,
      })),
    }).subscribe({
      next: () => {
        this.showGroupModal = false;
        this.creatingGroup  = false;
      },
      error: () => { this.creatingGroup = false; }
    });
  }

  // ── Ouvrir modal modification ─────────────────────────────────
  openEdit(p: Product): void {
    this.selectedProduct = p;
    this.editForm = {
      name:          p.name,
      description:   p.description,
      soloPrice:     p.soloPrice,
      minGroupPrice: p.minGroupPrice ?? 0,
      stock:         p.stock,
      category:      p.category.name,
    };
    this.showEditModal = true;
  }

  // ── Ouvrir modal création groupe ──────────────────────────────
  openCreateGroup(p: Product): void {
    this.selectedProduct = p;
    this.groupForm = {
      minParticipants: 10,
      maxParticipants: 100,
      depositPercent:  10,
      expiresInDays:   7,
      tiers: [
        { minParticipants: 5,  discountPercent: 15 },
        { minParticipants: 10, discountPercent: 25 },
        { minParticipants: 15, discountPercent: 35 },
      ]
    };
    this.showGroupModal = true;
  }

  get groupPricePreview(): number {
    if (!this.selectedProduct) return 0;
    const bestDiscount = Math.max(...this.groupForm.tiers.map(t => t.discountPercent));
    return Math.round(this.selectedProduct.soloPrice * (1 - bestDiscount / 100));
  }

  setTab(t: string): void {
    this.activeTab = t;
    const map: Record<string, string> = {
      'Approuvés':  'ACTIVE',
      'En attente': 'PENDING',
      'Rejetés':    'REJECTED',
    };
    this.filtered = t === 'Tous'
      ? this.products
      : this.products.filter(p => p.status === map[t]);
  }

  onSearch(v: string): void {
    this.search   = v;
    this.filtered = this.products.filter(p =>
      p.name.toLowerCase().includes(v.toLowerCase())
    );
  }

  statusClass(s: string): string {
    return s === 'ACTIVE' ? 'badge-ok' : s === 'PENDING' ? 'badge-warn' : s === 'REJECTED' ? 'badge-err' : 'badge-grey';
  }

  statusLabel(s: string): string {
    return s === 'ACTIVE' ? 'Approuvé' : s === 'PENDING' ? 'En attente' : s === 'REJECTED' ? 'Rejeté' : s;
  }

  stars(): number[] { return Array(5).fill(0).map((_, i) => i); }

  // ── Helper mapper ─────────────────────────────────────────────
  private mapProduct(p: any): Product {
    return {
      id:               p.id,
      name:             p.name          ?? '',
      description:      p.description   ?? '',
      images:           p.imagesUrls    ?? [],
      emoji:            '📦',
      soloPrice:        p.soloPrice     ?? 0,
      minGroupPrice:    p.baseGroupPrice ?? 0,
      stock:            p.stock         ?? 0,
      rating:           p.rating        ?? 0,
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
      supplier: null as any,
    };
  }
}