import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Product, Category } from '../models';

const API = 'http://localhost:3000/api/v1';

@Injectable({ providedIn: 'root' })
export class ProductService {

  constructor(private http: HttpClient) {}

  // ── GET /products ─────────────────────────────────────────────
  getAll(params?: {
    categoryId?: string;
    search?:     string;
    minPrice?:   number;
    maxPrice?:   number;
    sort?:       string;
    inStock?:    boolean;
    page?:       number;
    limit?:      number;
  }): Observable<Product[]> {

    // Construire les query params
    const query: any = { limit: 100 };
    if (params?.categoryId) query['category'] = params.categoryId;
    if (params?.search)     query['search']   = params.search;
    if (params?.minPrice)   query['minPrice'] = params.minPrice;
    if (params?.maxPrice)   query['maxPrice'] = params.maxPrice;
    if (params?.sort)       query['sort']     = params.sort;
    if (params?.inStock)    query['inStock']  = params.inStock;
    if (params?.page)       query['page']     = params.page;

    return this.http.get<any>(`${API}/products`, { params: query }).pipe(
      map(res => (res.data ?? []).map((p: any) => this.mapProduct(p)))
    );
  }

  // ── GET /products/:id ─────────────────────────────────────────
  getById(id: string): Observable<Product> {
    return this.http.get<any>(`${API}/products/${id}`).pipe(
      map(res => this.mapProduct(res.data))
    );
  }

  // ── GET /categories ───────────────────────────────────────────
  getCategories(): Observable<Category[]> {
    return this.http.get<any>(`${API}/categories`).pipe(
      map(res => (res.data ?? []).map((c: any) => this.mapCategory(c)))
    );
  }

  // ── Helper : mapper backend → modèle Product front ───────────
  private mapProduct(p: any): Product {
    return {
      id:              p.id,
      name:            p.name,
      description:     p.description ?? '',
      images:          p.imagesUrls  ?? [],   // backend: imagesUrls → front: images
      emoji:           '📦',
      soloPrice:       p.soloPrice,
      minGroupPrice:   p.baseGroupPrice,       // backend: baseGroupPrice → front: minGroupPrice
      category:        this.mapCategory(p.category),
      supplier:        p.supplier ? {
        id:            p.supplier.id ?? '',
        companyName:   p.supplier.companyName,
        contactName:   '',
        phone:         '',
        email:         '',
        address:       '',
        city:          '',
        status:        'APPROVED',
        rating:        0,
        reviewCount:   0,
        totalGroups:   0,
        successRate:   0,
        createdAt:     new Date(),
        user:          null as any,
      } : null as any,
      status:          p.status === 'APPROVED' ? 'ACTIVE' : 'PENDING',
      stock:           p.stock ?? 0,
      rating:          p._count?.reviews > 0 ? 4.5 : 0,  // valeur par défaut
      reviewCount:     p._count?.reviews ?? 0,
      activeGroupCount: p._count?.groups ?? 0,
      createdAt:       new Date(p.createdAt ?? Date.now()),
    };
  }

  // ── Helper : mapper backend → modèle Category front ──────────
  private mapCategory(c: any): Category {
    if (!c) return { id: '', name: 'Autre', icon: 'fa-solid fa-tag', slug: '', productCount: 0 };
    return {
      id:           c.id,
      name:         c.name,
      icon:         'fa-solid fa-tag', // icône par défaut
      slug:         c.slug ?? c.name?.toLowerCase(),
      productCount: c._count?.products ?? 0,
    };
  }
}