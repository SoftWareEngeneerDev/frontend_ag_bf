import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { Product, Category } from '../../../core/models';

@Component({
  selector: 'app-catalog',
  templateUrl: './catalog.component.html',
  styleUrls: ['./catalog.component.scss']
})
export class CatalogComponent implements OnInit {
  products:   Product[]  = [];
  filtered:   Product[]  = [];
  categories: Category[] = [];
  loading = true;
  search  = '';
  selCat  = '';
  sortBy  = 'popular';

  sorts = [
    { val: 'popular',    label: 'Popularité' },
    { val: 'price_asc',  label: 'Prix croissant' },
    { val: 'price_desc', label: 'Prix décroissant' },
    { val: 'newest',     label: 'Nouveauté' },
  ];

  constructor(
    private productService: ProductService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    // ── Charger les catégories depuis le backend ───────────────
    this.productService.getCategories().subscribe({
      next: (cats) => { this.categories = cats; },
      error: () => {}
    });

    // ── Charger les produits depuis le backend ─────────────────
    this.loadProducts();
  }

  // ── Charger les produits avec les filtres actuels ─────────────
  loadProducts(): void {
    this.loading = true;

    // Mapping sort front → backend
    const sortMap: Record<string, string> = {
      'popular':    'popular',
      'price_asc':  'price_asc',
      'price_desc': 'price_desc',
      'newest':     'price_asc', // pas de sort newest côté backend, on trie côté front
    };

    this.productService.getAll({
      categoryId: this.selCat   || undefined,
      search:     this.search   || undefined,
      sort:       sortMap[this.sortBy],
    }).subscribe({
      next: (products) => {
        this.products = products;
        this.apply();
        this.loading  = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  // ── Filtrage et tri côté front (après chargement) ─────────────
  apply(): void {
    let data = [...this.products];

    // Filtre catégorie (déjà fait côté backend mais on garde pour la réactivité)
    if (this.selCat) data = data.filter(p => p.category.id === this.selCat);

    // Filtre search (déjà fait côté backend mais on garde pour la réactivité)
    if (this.search) data = data.filter(p =>
      p.name.toLowerCase().includes(this.search.toLowerCase())
    );

    // Tri côté front
    if (this.sortBy === 'price_asc')  data.sort((a, b) => a.soloPrice - b.soloPrice);
    if (this.sortBy === 'price_desc') data.sort((a, b) => b.soloPrice - a.soloPrice);
    if (this.sortBy === 'newest')     data.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    this.filtered = data;
  }

  onSearch(v: string): void {
    this.search = v;
    // Recherche locale immédiate + rechargement backend
    this.apply();
    if (v.length === 0 || v.length >= 3) this.loadProducts();
  }

  onCat(id: string): void {
    this.selCat = id;
    this.loadProducts();
  }

  onSort(v: string): void {
    this.sortBy = v;
    this.apply(); // tri local uniquement
  }

  goDetail(p: Product): void {
    this.router.navigate(['/catalog', p.id]);
  }

  goGroups(p: Product): void {
    this.router.navigate(['/groups'], { queryParams: { productId: p.id } });
  }

  discount(p: Product): number {
    if (!p.minGroupPrice) return 0;
    return Math.round((1 - p.minGroupPrice / p.soloPrice) * 100);
  }

  imageUrl(p: Product): string {
    return p.images?.[0] ?? `https://picsum.photos/seed/${p.id}/600/420`;
  }

  stars(n: number): ('full' | 'half' | 'empty')[] {
    return [1, 2, 3, 4, 5].map(i => {
      if (n >= i)        return 'full';
      if (n >= i - 0.5)  return 'half';
      return 'empty';
    });
  }
}