import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Order } from '../models';

const API = 'http://localhost:3000/api/v1';

@Injectable({ providedIn: 'root' })
export class OrderService {

  constructor(private http: HttpClient) {}

  // ── GET /orders/me ────────────────────────────────────────────
  getMyOrders(): Observable<Order[]> {
    return this.http.get<any>(`${API}/orders/me`).pipe(
      map(res => (res.data ?? []).map((o: any) => this.mapOrder(o)))
    );
  }

  // ── GET /orders/:id/tracking ──────────────────────────────────
  getById(id: string): Observable<Order | undefined> {
    return this.http.get<any>(`${API}/orders/${id}/tracking`).pipe(
      map(res => res.data ? this.mapOrder(res.data) : undefined)
    );
  }

  // ── Helper : mapper backend → modèle Order front ─────────────
  private mapOrder(o: any): Order {
    return {
      id:          o.id,
      status:      o.status,
      trackingCode: o.trackingCode,
      deliveredAt: o.deliveredAt ? new Date(o.deliveredAt) : undefined,
      createdAt:   new Date(o.createdAt ?? Date.now()),
      amount:      o.totalAmount ?? 0,
      group:       o.group,
      product:     o.group?.product,
      member:      null as any,
    };
  }
}