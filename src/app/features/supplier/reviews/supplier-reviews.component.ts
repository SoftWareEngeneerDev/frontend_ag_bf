import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject, takeUntil, forkJoin, catchError, of } from 'rxjs';
import { environment } from '../../../../environments/environment';

const API = environment.apiUrl;

interface ProductReviews {
  productId  : string;
  productName: string;
  avgRating  : number | null;
  total      : number;
  reviews    : any[];
  expanded   : boolean;
}

@Component({
  selector   : 'app-supplier-reviews',
  templateUrl: './supplier-reviews.component.html',
  styleUrls  : ['./supplier-reviews.component.scss'],
})
export class SupplierReviewsComponent implements OnInit, OnDestroy {
  loading = true;

  globalAvg    = 0;
  totalReviews = 0;
  productGroups: ProductReviews[] = [];

  private destroy$ = new Subject<void>();

  constructor(private http: HttpClient) {}

  ngOnInit(): void { this.loadReviews(); }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadReviews(): void {
    this.loading = true;

    this.http.get<any>(`${API}/supplier/products`, { params: { limit: '100' } })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          const products: any[] = res.data ?? [];
          if (products.length === 0) { this.loading = false; return; }

          const requests = products.map((p: any) =>
            this.http.get<any>(`${API}/products/${p.id}/reviews`, { params: { limit: '50' } })
              .pipe(catchError(() => of(null)))
          );

          forkJoin(requests)
            .pipe(takeUntil(this.destroy$))
            .subscribe((results) => {
              this.productGroups = products
                .map((p: any, i: number) => {
                  const res   = results[i];
                  const items = res?.data ?? [];
                  return {
                    productId  : p.id,
                    productName: p.name ?? 'Produit',
                    avgRating  : res?.averageRating ?? null,
                    total      : res?.total ?? 0,
                    reviews    : items,
                    expanded   : false,
                  };
                })
                .filter(g => g.total > 0);

              this.totalReviews = this.productGroups.reduce((s, g) => s + g.total, 0);
              if (this.totalReviews > 0) {
                const weighted = this.productGroups
                  .filter(g => g.avgRating !== null)
                  .reduce((s, g) => s + (g.avgRating! * g.total), 0);
                this.globalAvg = Math.round((weighted / this.totalReviews) * 10) / 10;
              }

              this.loading = false;
            });
        },
        error: () => { this.loading = false; }
      });
  }

  toggle(g: ProductReviews): void { g.expanded = !g.expanded; }

  stars(n: number | null): boolean[] {
    const rating = n ?? 0;
    return [1, 2, 3, 4, 5].map(i => i <= Math.round(rating));
  }

  trackById(_: number, g: ProductReviews): string { return g.productId; }
  trackByIdx(i: number): number { return i; }
}
