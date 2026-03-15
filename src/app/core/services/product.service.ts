import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Product } from '../models';
import { MockDataService } from './mock-data.service';

@Injectable({ providedIn: 'root' })
export class ProductService {
  constructor(private mock: MockDataService) {}

  getAll(params?: { categoryId?: string; search?: string; status?: string }): Observable<Product[]> {
    let data = this.mock.products;
    if (params?.categoryId) data = data.filter(p => p.category.id === params.categoryId);
    if (params?.search)     data = data.filter(p => p.name.toLowerCase().includes(params.search!.toLowerCase()));
    if (params?.status)     data = data.filter(p => p.status === params.status);
    return of(data).pipe(delay(300));
  }

  getById(id: string): Observable<Product | undefined> {
    return of(this.mock.products.find(p => p.id === id)).pipe(delay(200));
  }
}
