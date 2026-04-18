import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Group, PricingTier } from '../models';

const API = 'http://localhost:3000/api/v1';

// ── Type retour de joinGroup ──────────────────────────────────────
export interface JoinGroupResult {
  depositAmount: number;
  currentPrice:  number;
  message:       string;
  groupId:       string;
}

@Injectable({ providedIn: 'root' })
export class GroupService {

  constructor(private http: HttpClient) {}

  // ── GET /groups ───────────────────────────────────────────────
  getAll(params?: {
    status?:    string;
    productId?: string;
    page?:      number;
    limit?:     number;
  }): Observable<Group[]> {
    const query: any = { limit: 100 };
    if (params?.status)    query['status']    = params.status;
    if (params?.productId) query['productId'] = params.productId;
    if (params?.page)      query['page']      = params.page;

    return this.http.get<any>(`${API}/groups`, { params: query }).pipe(
      map(res => (res.data ?? []).map((g: any) => this.mapGroup(g)))
    );
  }

  // ── GET /groups/:id ───────────────────────────────────────────
  getById(id: string): Observable<Group> {
    return this.http.get<any>(`${API}/groups/${id}`).pipe(
      map(res => this.mapGroup(res.data))
    );
  }

  // ── GET /groups/:id/progress ──────────────────────────────────
  getProgress(id: string): Observable<any> {
    return this.http.get<any>(`${API}/groups/${id}/progress`).pipe(
      map(res => res.data)
    );
  }

  // ── POST /groups/:id/join ─────────────────────────────────────
  // CORRECTION : type de retour explicite JoinGroupResult
  joinGroup(groupId: string): Observable<JoinGroupResult> {
    return this.http.post<any>(`${API}/groups/${groupId}/join`, {}).pipe(
      map(res => ({
        depositAmount: res.data?.depositAmount ?? 0,
        currentPrice:  res.data?.currentPrice  ?? 0,
        message:       res.data?.message       ?? '',
        groupId:       groupId,
      }))
    );
  }

  // ── DELETE /groups/:id/leave ──────────────────────────────────
  leaveGroup(groupId: string): Observable<{ refundAmount: number }> {
    return this.http.delete<any>(`${API}/groups/${groupId}/leave`).pipe(
      map(res => ({ refundAmount: res.data?.refundAmount ?? 0 }))
    );
  }

  // ── GET /users/me/groups ──────────────────────────────────────
  getMyGroups(): Observable<any> {
    return this.http.get<any>(`${API}/users/me/groups`).pipe(
      map(res => res.data)
    );
  }

  // ── Helper : mapper backend → modèle Group front ─────────────
  mapGroup(g: any): Group {
    const product  = g.product  ?? {};
    const supplier = g.supplier ?? {};

    const soloPrice   = product.soloPrice ?? 0;
    const currPrice   = g.currentPrice    ?? soloPrice;
    const discountPct = soloPrice > 0
      ? Math.round((1 - currPrice / soloPrice) * 100)
      : 0;

    const pricingTiers: PricingTier[] = (g.pricingTiers ?? []).map((t: any) => ({
      minParticipants: t.participantCount,
      discountPercent: t.discountPercent,
      price:           t.priceAtTier,
    }));

    return {
      id:              g.id,
      status:          this.mapStatus(g.status),
      currentCount:    g.currentCount    ?? 0,
      minParticipants: g.minParticipants ?? 0,  // CORRECTION : supprimé maxParticipants (pas dans le modèle front)
      currentPrice:    currPrice,
      discountPercent: discountPct,
      depositAmount:   Math.ceil(currPrice * (g.depositPercent ?? 0.1)),
      expiresAt:       new Date(g.expiresAt),
      thresholdReachedAt: g.reachedAt ? new Date(g.reachedAt) : undefined,
      pricingTiers,
      createdAt:       new Date(g.createdAt ?? Date.now()),

      product: {
        id:               product.id           ?? '',
        name:             product.name         ?? '',
        description:      product.description  ?? '',
        images:           product.imagesUrls   ?? [],
        emoji:            '📦',
        soloPrice:        product.soloPrice    ?? 0,
        minGroupPrice:    product.baseGroupPrice ?? currPrice,
        stock:            product.stock        ?? 0,
        rating:           product.rating       ?? 0,
        reviewCount:      product._count?.reviews ?? 0,
        activeGroupCount: product._count?.groups  ?? 1,
        status:           'ACTIVE' as any,
        createdAt:        new Date(product.createdAt ?? Date.now()),
        category: {
          id:           product.category?.id   ?? '',
          name:         product.category?.name ?? '',
          icon:         product.category?.icon ?? 'fa-solid fa-tag',
          slug:         product.category?.slug ?? '',
          productCount: 0,
        },
        supplier: {
          id:           supplier.id            ?? '',
          companyName:  supplier.companyName   ?? supplier.user?.name ?? '',
          contactName:  supplier.user?.name    ?? '',
          phone:        supplier.user?.phone   ?? '',
          email:        supplier.user?.email   ?? '',
          address:      '',
          city:         supplier.user?.city    ?? 'Ouagadougou',
          status:       'APPROVED'             as any,
          rating:       supplier.rating        ?? 0,
          reviewCount:  supplier.reviewCount   ?? 0,
          totalGroups:  supplier._count?.groups ?? 0,
          successRate:  supplier.successRate   ?? 0,
          createdAt:    new Date(supplier.createdAt ?? Date.now()),
          user:         null as any,
        },
      },

      supplier: {
        id:           supplier.id            ?? '',
        companyName:  supplier.companyName   ?? supplier.user?.name ?? '',
        contactName:  supplier.user?.name    ?? '',
        phone:        supplier.user?.phone   ?? '',
        email:        supplier.user?.email   ?? '',
        address:      '',
        city:         supplier.user?.city    ?? 'Ouagadougou',
        status:       'APPROVED'             as any,
        rating:       supplier.rating        ?? 0,
        reviewCount:  supplier.reviewCount   ?? 0,
        totalGroups:  supplier._count?.groups ?? 0,
        successRate:  supplier.successRate   ?? 0,
        createdAt:    new Date(supplier.createdAt ?? Date.now()),
        user:         null as any,
      },
    };
  }

  private mapStatus(status: string): any {
    const map: Record<string, string> = {
      'OPEN':              'OPEN',
      'THRESHOLD_REACHED': 'THRESHOLD_REACHED',
      'CLOSED':            'COMPLETED',
      'FAILED':            'EXPIRED',
      'CANCELLED':         'CANCELLED',
    };
    return map[status] ?? 'OPEN';
  }
}