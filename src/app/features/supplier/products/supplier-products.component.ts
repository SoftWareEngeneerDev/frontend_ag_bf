import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../../core/services/product.service';
import { FormatService }  from '../../../core/services/format.service';
import { Product } from '../../../core/models';

@Component({
  selector: 'app-supplier-products',
  templateUrl: './supplier-products.component.html',
  styleUrls:  ['./supplier-products.component.scss']
})
export class SupplierProductsComponent implements OnInit {
  products: Product[] = [];
  filtered: Product[] = [];
  loading  = true;
  search   = '';
  activeTab = 'Tous';
  tabs = ['Tous','Approuvés','En attente','Rejetés'];

  showAddModal   = false;
  showEditModal  = false;
  showGroupModal = false;

  selectedProduct: Product | null = null;

  editForm = { name:'', description:'', soloPrice:0, minGroupPrice:0, stock:0, category:'' };

  groupForm = {
    minParticipants: 10,
    depositPercent:  10,
    expiresInDays:   7,
    tiers: [
      { minParticipants: 5,  discountPercent: 15 },
      { minParticipants: 10, discountPercent: 25 },
      { minParticipants: 15, discountPercent: 35 },
    ]
  };

  categories = ['Électronique','Alimentaire','Textile & Mode','Maison & Jardin','Santé & Beauté','Agriculture'];

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

  openCreateGroup(p: Product): void {
    this.selectedProduct = p;
    this.groupForm = {
      minParticipants: 10,
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

  constructor(
    private productService: ProductService,
    public  fmt: FormatService,
  ) {}

  ngOnInit(): void {
    this.productService.getAll().subscribe(p => {
      this.products = this.filtered = p;
      this.loading  = false;
    });
  }

  setTab(t: string): void {
    this.activeTab = t;
    const map: Record<string, string> = { 'Approuvés':'ACTIVE', 'En attente':'PENDING', 'Rejetés':'REJECTED' };
    this.filtered = t === 'Tous'
      ? this.products
      : this.products.filter(p => p.status === map[t]);
  }

  onSearch(v: string): void {
    this.search   = v;
    this.filtered = this.products.filter(p => p.name.toLowerCase().includes(v.toLowerCase()));
  }

  statusClass(s: string): string {
    return s === 'ACTIVE' ? 'badge-ok' : s === 'PENDING' ? 'badge-warn' : s === 'REJECTED' ? 'badge-err' : 'badge-grey';
  }

  statusLabel(s: string): string {
    return s === 'ACTIVE' ? 'Approuvé' : s === 'PENDING' ? 'En attente' : s === 'REJECTED' ? 'Rejeté' : s;
  }

  stars(): number[] { return Array(5).fill(0).map((_,i) => i); }
}
