import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { MockDataService } from '../../../core/services/mock-data.service';
import { Product, Category } from '../../../core/models';

@Component({
  selector: 'app-catalog',
  templateUrl: './catalog.component.html',
  styleUrls: ['./catalog.component.scss']
})
export class CatalogComponent implements OnInit {
  products: Product[] = [];
  filtered: Product[] = [];
  categories: Category[] = [];
  loading = true;

  search   = '';
  selCat   = '';
  sortBy   = 'popular';

  sorts = [
    { val:'popular',  label:'Popularité' },
    { val:'price-asc',label:'Prix croissant' },
    { val:'price-desc',label:'Prix décroissant' },
    { val:'newest',   label:'Nouveauté' },
  ];

  constructor(
    private productService: ProductService,
    private mock: MockDataService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.categories = this.mock.categories;
    this.productService.getAll().subscribe(p => {
      this.products = p;
      this.apply();
      this.loading = false;
    });
  }

  apply(): void {
    let data = [...this.products];
    if (this.selCat)  data = data.filter(p => p.category.id === this.selCat);
    if (this.search)  data = data.filter(p => p.name.toLowerCase().includes(this.search.toLowerCase()));
    if (this.sortBy === 'price-asc')  data.sort((a,b) => a.soloPrice - b.soloPrice);
    if (this.sortBy === 'price-desc') data.sort((a,b) => b.soloPrice - a.soloPrice);
    if (this.sortBy === 'newest')     data.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    this.filtered = data;
  }

  onSearch(v: string): void  { this.search = v; this.apply(); }
  onCat(id: string): void    { this.selCat = id; this.apply(); }
  onSort(v: string): void    { this.sortBy = v; this.apply(); }

  goDetail(_p: Product): void { this.router.navigate(['/catalog']); }
  goGroups(_p: Product): void { this.router.navigate(['/groups']); }

  discount(p: Product): number {
    if (!p.minGroupPrice) return 0;
    return Math.round((1 - p.minGroupPrice / p.soloPrice) * 100);
  }

  imageUrl(p: Product): string {
    return p.images?.[0] ?? `https://picsum.photos/seed/${p.id}/600/420`;
  }

  stars(n: number): ('full' | 'half' | 'empty')[] {
    return [1, 2, 3, 4, 5].map(i => {
      if (n >= i)       return 'full';
      if (n >= i - 0.5) return 'half';
      return 'empty';
    });
  }
}
