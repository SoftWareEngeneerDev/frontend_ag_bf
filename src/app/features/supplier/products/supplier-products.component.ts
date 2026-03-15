import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../../core/services/product.service';
import { AuthService }    from '../../../core/services/auth.service';
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
  showAddModal = false;

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

  stars(n: number): number[] { return Array(5).fill(0).map((_,i) => i); }
}
