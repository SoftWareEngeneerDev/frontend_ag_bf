import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject, takeUntil } from 'rxjs';
import { FormatService }  from '../../../core/services/format.service';
import { ProductService } from '../../../core/services/product.service';
import { Product, Category } from '../../../core/models';
import { environment } from '../../../../environments/environment';

const API = environment.apiUrl;

const STATUS_MAP: Record<string, string> = {
  'Approuvés'  : 'ACTIVE',
  'En attente' : 'PENDING',
  'Rejetés'    : 'REJECTED',
  'Archivés'   : 'INACTIVE',
};

@Component({
  selector: 'app-supplier-products',
  templateUrl: './supplier-products.component.html',
  styleUrls:  ['./supplier-products.component.scss']
})
export class SupplierProductsComponent implements OnInit, OnDestroy {
  products     : Product[]  = [];
  filtered     : Product[]  = [];
  allCategories: Category[] = [];
  loading       = true;
  saving        = false;
  uploading     = false;
  creatingGroup = false;
  search        = '';
  activeTab     = 'Tous';

  readonly tabs = ['Tous', 'Approuvés', 'En attente', 'Rejetés', 'Archivés'];

  showAddModal   = false;
  showEditModal  = false;
  showGroupModal = false;
  showStockModal = false;
  selectedProduct: Product | null = null;

  stockForm = { newStock: 0 };
  savingStock = false;

  successMsg = '';
  errorMsg   = '';

  private destroy$ = new Subject<void>();

  // ── Formulaire ajout ──────────────────────────────────────
  addForm = {
    name          : '',
    description   : '',
    soloPrice     : 0,
    baseGroupPrice: 0,
    stock         : 0,
    categoryId    : '',
    imagesUrls    : [] as string[],
  };

  // ── Prévisualisation images ───────────────────────────────
  imagePreviews : string[] = [];
  imageError    = '';

  // ── Formulaire modification ───────────────────────────────
  editForm = {
    name         : '',
    description  : '',
    soloPrice    : 0,
    minGroupPrice: 0,
    stock        : 0,
  };

  // ── Formulaire groupe ─────────────────────────────────────
  groupForm = {
    minParticipants: 10,
    maxParticipants: 100,
    depositPercent  : 10,
    expiresInDays   : 7,
    tiers: [
      { minParticipants: 5,  discountPercent: 15 },
      { minParticipants: 10, discountPercent: 25 },
      { minParticipants: 15, discountPercent: 35 },
    ],
  };

  constructor(
    private http           : HttpClient,
    private productService : ProductService,
    public  fmt            : FormatService,
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadCategories();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadProducts(): void {
    this.loading = true;
    this.http.get<any>(`${API}/supplier/products`, { params: { limit: '100' } })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          const data    = res.data ?? [];
          this.products = data.map((p: any) => this.mapProduct(p));
          this.applyFilter();
          this.loading  = false;
        },
        error: () => { this.loading = false; }
      });
  }

  private loadCategories(): void {
    this.productService.getCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next : (cats) => { this.allCategories = cats; },
        error: () => {}
      });
  }

  private applyFilter(): void {
    let list = this.products;
    if (this.activeTab !== 'Tous') {
      const status = STATUS_MAP[this.activeTab];
      list = list.filter(p => p.status === status);
    }
    if (this.search.trim()) {
      const q = this.search.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q));
    }
    this.filtered = list;
  }

  setTab(t: string): void   { this.activeTab = t; this.applyFilter(); }
  onSearch(v: string): void { this.search = v; this.applyFilter(); }

  // ── Sélectionner les images ───────────────────────────────
  onImagesSelected(event: Event): void {
    const input   = event.target as HTMLInputElement;
    const files   = Array.from(input.files ?? []);
    this.imageError = '';

    if (files.length === 0) return;

    // Validation côté client
    const totalImages = this.imagePreviews.length + files.length;
    if (totalImages > 4) {
      this.imageError = `Maximum 4 images. Vous avez déjà ${this.imagePreviews.length} image(s).`;
      input.value = '';
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize      = 5 * 1024 * 1024; // 5MB

    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        this.imageError = 'Format non supporté. Utilisez JPG, PNG ou WEBP.';
        input.value = '';
        return;
      }
      if (file.size > maxSize) {
        this.imageError = `"${file.name}" est trop lourd. Maximum 5MB par image.`;
        input.value = '';
        return;
      }
    }

    // Aperçu local avant upload
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreviews.push(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    });

    // Upload vers Cloudinary
    this.uploadImages(files);
    input.value = '';
  }

  // ── Upload vers backend → Cloudinary ─────────────────────
  private uploadImages(files: File[]): void {
    this.uploading  = true;
    this.imageError = '';

    const formData = new FormData();
    files.forEach(f => formData.append('images', f));

    this.http.post<any>(`${API}/supplier/upload/images`, formData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          const urls = res.data?.urls ?? [];
          this.addForm.imagesUrls.push(...urls);
          this.uploading = false;
        },
        error: (err) => {
          this.uploading  = false;
          this.imageError = err?.error?.error?.message ?? 'Erreur upload images';
          // Retirer les aperçus en cas d'erreur
          this.imagePreviews = this.imagePreviews.slice(0, this.addForm.imagesUrls.length);
        }
      });
  }

  // ── Supprimer une image ───────────────────────────────────
  removeImage(index: number): void {
    this.imagePreviews = this.imagePreviews.filter((_, i) => i !== index);
    this.addForm.imagesUrls = this.addForm.imagesUrls.filter((_, i) => i !== index);
  }

  // ── Ajouter un produit ────────────────────────────────────
  submitProduct(): void {
    if (!this.addForm.name || this.saving) return;
    if (this.addForm.baseGroupPrice >= this.addForm.soloPrice) {
      this.showError('Le prix groupe doit être inférieur au prix solo');
      return;
    }
    if (this.uploading) {
      this.showError('Veuillez attendre la fin de l\'upload des images');
      return;
    }
    this.saving = true;

    this.http.post<any>(`${API}/supplier/products`, {
      name          : this.addForm.name,
      description   : this.addForm.description,
      soloPrice     : this.addForm.soloPrice,
      baseGroupPrice: this.addForm.baseGroupPrice,
      stock         : this.addForm.stock,
      categoryId    : this.addForm.categoryId || this.allCategories[0]?.id,
      imagesUrls    : this.addForm.imagesUrls,
    })
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (res) => {
        this.products.unshift(this.mapProduct(res.data));
        this.applyFilter();
        this.showAddModal = false;
        this.saving       = false;
        this.resetAddForm();
        this.showSuccess('Produit soumis — en attente de validation admin');
      },
      error: (err) => {
        this.saving = false;
        this.showError(err?.error?.error?.message ?? 'Erreur lors de la soumission');
      }
    });
  }

  // ── Modifier un produit ───────────────────────────────────
  saveEdit(): void {
    if (!this.selectedProduct || this.saving) return;
    this.saving = true;

    this.http.put<any>(`${API}/supplier/products/${this.selectedProduct.id}`, {
      name          : this.editForm.name,
      description   : this.editForm.description,
      soloPrice     : this.editForm.soloPrice,
      baseGroupPrice: this.editForm.minGroupPrice,
      stock         : this.editForm.stock,
    })
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: () => {
        if (this.selectedProduct) {
          this.selectedProduct.name          = this.editForm.name;
          this.selectedProduct.description   = this.editForm.description;
          this.selectedProduct.soloPrice     = this.editForm.soloPrice;
          this.selectedProduct.minGroupPrice = this.editForm.minGroupPrice;
          this.selectedProduct.stock         = this.editForm.stock;
          this.selectedProduct.status        = 'PENDING_APPROVAL' as any;
        }
        this.showEditModal = false;
        this.saving        = false;
        this.showSuccess('Produit mis à jour — resoumis pour validation');
      },
      error: (err) => {
        this.saving = false;
        this.showError(err?.error?.error?.message ?? 'Erreur lors de la modification');
      }
    });
  }

  // ── Créer un groupe depuis un produit ─────────────────────
  createGroupFromProduct(): void {
    if (!this.selectedProduct || this.creatingGroup) return;
    this.creatingGroup = true;

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + this.groupForm.expiresInDays);

    this.http.post<any>(`${API}/supplier/groups`, {
      productId      : this.selectedProduct.id,
      minParticipants: this.groupForm.minParticipants,
      maxParticipants: this.groupForm.maxParticipants,
      depositPercent : this.groupForm.depositPercent / 100,
      expiresAt      : expiresAt.toISOString(),
      pricingTiers   : this.groupForm.tiers.map(t => ({
        participantCount: t.minParticipants,
        discountPercent : t.discountPercent,
      })),
    })
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: () => {
        this.showGroupModal = false;
        this.creatingGroup  = false;
        this.showSuccess('Groupe créé avec succès !');
      },
      error: (err) => {
        this.creatingGroup = false;
        this.showError(err?.error?.error?.message ?? 'Erreur lors de la création du groupe');
      }
    });
  }

  // ── Ouvrir modals ─────────────────────────────────────────
  openEdit(p: Product): void {
    this.selectedProduct = p;
    this.editForm = {
      name         : p.name,
      description  : p.description,
      soloPrice    : p.soloPrice,
      minGroupPrice: p.minGroupPrice ?? 0,
      stock        : p.stock,
    };
    this.showEditModal = true;
  }

  openStockModal(p: Product): void {
    this.selectedProduct  = p;
    this.stockForm.newStock = p.stock;
    this.showStockModal   = true;
  }

  saveStock(): void {
    if (!this.selectedProduct || this.savingStock) return;
    this.savingStock = true;

    this.http.patch<any>(`${API}/supplier/products/${this.selectedProduct.id}/stock`, {
      stock: this.stockForm.newStock,
    })
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: () => {
        if (this.selectedProduct) {
          this.selectedProduct.stock = this.stockForm.newStock;
        }
        this.showStockModal = false;
        this.savingStock    = false;
        const warn = this.stockForm.newStock === 0
          ? 'Stock à 0 — groupes actifs annulés et membres notifiés'
          : 'Stock mis à jour';
        this.showSuccess(warn);
      },
      error: (err) => {
        this.savingStock = false;
        this.showError(err?.error?.error?.message ?? 'Erreur mise à jour stock');
      }
    });
  }

  openCreateGroup(p: Product): void {
    this.selectedProduct = p;
    this.groupForm = {
      minParticipants: 10,
      maxParticipants: 100,
      depositPercent  : 10,
      expiresInDays   : 7,
      tiers: [
        { minParticipants: 5,  discountPercent: 15 },
        { minParticipants: 10, discountPercent: 25 },
        { minParticipants: 15, discountPercent: 35 },
      ],
    };
    this.showGroupModal = true;
  }

  // ── Getters ───────────────────────────────────────────────
  get groupPricePreview(): number {
    if (!this.selectedProduct) return 0;
    const best = Math.max(...this.groupForm.tiers.map(t => t.discountPercent));
    return Math.round(this.selectedProduct.soloPrice * (1 - best / 100));
  }

  get canSubmit(): boolean {
    return !!(this.addForm.name && this.addForm.soloPrice > 0 &&
              this.addForm.baseGroupPrice > 0 && this.addForm.stock >= 0 &&
              this.addForm.categoryId && !this.uploading);
  }

  statusClass(s: string): string {
    const map: Record<string, string> = {
      ACTIVE          : 'badge-ok',
      APPROVED        : 'badge-ok',
      PENDING         : 'badge-warn',
      PENDING_APPROVAL: 'badge-warn',
      REJECTED        : 'badge-err',
      INACTIVE        : 'badge-grey',
      ARCHIVED        : 'badge-grey',
    };
    return map[s] ?? 'badge-grey';
  }

  statusLabel(s: string): string {
    const map: Record<string, string> = {
      ACTIVE           : '✅ Approuvé',
      APPROVED         : '✅ Approuvé',
      PENDING          : '⏳ En attente',
      PENDING_APPROVAL : '⏳ En attente',
      REJECTED         : '❌ Rejeté',
      INACTIVE         : '📦 Inactif',
      ARCHIVED         : '📦 Archivé',
    };
    return map[s] ?? s;
  }

  // ── Galerie images ────────────────────────────────────────
  activeImageIndex: Record<string, number> = {};

  getActiveImage(p: any): string {
    const idx = this.activeImageIndex[p.id] ?? 0;
    return p.images?.[idx] || 'https://picsum.photos/seed/' + p.id + '/400/300';
  }

  setActiveImage(p: any, i: number): void {
    this.activeImageIndex[p.id] = i;
  }

  stars(): number[] { return Array(5).fill(0).map((_, i) => i); }
  trackById(_: number, p: Product): string { return p.id; }

  private resetAddForm(): void {
    this.addForm       = { name: '', description: '', soloPrice: 0, baseGroupPrice: 0, stock: 0, categoryId: '', imagesUrls: [] };
    this.imagePreviews = [];
    this.imageError    = '';
  }

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
      status          : p.status,
      createdAt       : new Date(p.createdAt ?? Date.now()),
      category: {
        id          : p.category?.id   ?? '',
        name        : p.category?.name ?? '—',
        icon        : p.category?.icon ?? 'fa-solid fa-tag',
        slug        : p.category?.slug ?? '',
        productCount: 0,
      },
      supplier: null as any,
    };
  }
}