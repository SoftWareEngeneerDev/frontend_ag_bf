import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Order } from '../models';
import { MockDataService } from './mock-data.service';

@Injectable({ providedIn: 'root' })
export class OrderService {
  constructor(private mock: MockDataService) {}

  getMyOrders(): Observable<Order[]> {
    return of(this.mock.orders).pipe(delay(300));
  }

  getById(id: string): Observable<Order | undefined> {
    return of(this.mock.orders.find(o => o.id === id)).pipe(delay(200));
  }
}
