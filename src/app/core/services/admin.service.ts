import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

const API = 'http://localhost:3000/api/v1';

@Injectable({ providedIn: 'root' })
export class AdminService {

  constructor(private http: HttpClient) {}

  // ── GET /admin/analytics/dashboard ───────────────────────────
  getDashboard(): Observable<any> {
    return this.http.get<any>(`${API}/admin/analytics/dashboard`).pipe(
      map(res => res.data)
    );
  }

  // ── GET /admin/analytics/payments ────────────────────────────
  getPaymentsAnalytics(): Observable<any> {
    return this.http.get<any>(`${API}/admin/analytics/payments`).pipe(
      map(res => res.data)
    );
  }

  // ── GET /admin/analytics/groups ──────────────────────────────
  getGroupsAnalytics(): Observable<any> {
    return this.http.get<any>(`${API}/admin/analytics/groups`).pipe(
      map(res => res.data)
    );
  }

  // ── GET /admin/system/health ──────────────────────────────────
  getSystemHealth(): Observable<any> {
    return this.http.get<any>(`${API}/admin/system/health`).pipe(
      map(res => res.data)
    );
  }

  // ── GET /admin/audit-logs ─────────────────────────────────────
  getAuditLogs(params?: { page?: number; limit?: number }): Observable<any> {
    return this.http.get<any>(`${API}/admin/audit-logs`, {
      params: { limit: params?.limit ?? 10, page: params?.page ?? 1 }
    }).pipe(map(res => res));
  }

  // ── GET /admin/suppliers ──────────────────────────────────────
  getSuppliers(status = 'PENDING', limit = 4): Observable<any[]> {
    return this.http.get<any>(`${API}/admin/suppliers`, {
      params: { status, limit }
    }).pipe(map(res => res.data ?? []));
  }

  // ── GET /admin/products/pending ───────────────────────────────
  getPendingProducts(limit = 3): Observable<any[]> {
    return this.http.get<any>(`${API}/admin/products/pending`, {
      params: { limit }
    }).pipe(map(res => res.data ?? []));
  }

  // ── GET /admin/disputes ───────────────────────────────────────
  getDisputes(status = 'OPEN', limit = 3): Observable<any[]> {
    return this.http.get<any>(`${API}/admin/disputes`, {
      params: { status, limit }
    }).pipe(map(res => res.data ?? []));
  }

  // ── PATCH /admin/suppliers/:id/validate ──────────────────────
  validateSupplier(id: string, approved: boolean, reason?: string): Observable<any> {
    return this.http.patch<any>(`${API}/admin/suppliers/${id}/validate`, { approved, reason }).pipe(
      map(res => res.data)
    );
  }

  // ── PATCH /admin/products/:id/validate ───────────────────────
  validateProduct(id: string, approved: boolean, reason?: string): Observable<any> {
    return this.http.patch<any>(`${API}/admin/products/${id}/validate`, { approved, reason }).pipe(
      map(res => res.data)
    );
  }

  // ── GET /admin/users ──────────────────────────────────────────
  getUsers(params?: { status?: string; role?: string; search?: string; page?: number }): Observable<any> {
    return this.http.get<any>(`${API}/admin/users`, { params: params as any }).pipe(
      map(res => res)
    );
  }

  // ── PATCH /admin/users/:id/status ────────────────────────────
  updateUserStatus(id: string, status: string, reason?: string): Observable<any> {
    return this.http.patch<any>(`${API}/admin/users/${id}/status`, { status, reason }).pipe(
      map(res => res.data)
    );
  }

  // ── GET /admin/groups ─────────────────────────────────────────
  getGroups(params?: { status?: string; page?: number }): Observable<any> {
    return this.http.get<any>(`${API}/admin/groups`, { params: params as any }).pipe(
      map(res => res)
    );
  }

  // ── POST /admin/payments/refund ───────────────────────────────
  refundPayment(paymentId: string, reason: string): Observable<any> {
    return this.http.post<any>(`${API}/admin/payments/refund`, { paymentId, reason }).pipe(
      map(res => res.data)
    );
  }
}