import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';

const API = 'http://localhost:3000/api/v1';

@Injectable({ providedIn: 'root' })
export class AdminService {

  constructor(private http: HttpClient) {}

  // ── Dashboard & Analytics ─────────────────────────────────────

  getDashboard(): Observable<any> {
    return this.http.get<any>(`${API}/admin/analytics/dashboard`).pipe(
      map(res => res.data)
    );
  }

  getPaymentsAnalytics(params?: { days?: number; page?: number; limit?: number }): Observable<any> {
    return this.http.get<any>(`${API}/admin/analytics/payments`, {
      params: this.buildParams(params)
    }).pipe(map(res => res.data));
  }

  getGroupsAnalytics(params?: { days?: number }): Observable<any> {
    return this.http.get<any>(`${API}/admin/analytics/groups`, {
      params: this.buildParams(params)
    }).pipe(map(res => res.data));
  }

  getSystemHealth(): Observable<any> {
    return this.http.get<any>(`${API}/admin/system/health`).pipe(
      map(res => res.data)
    );
  }

  // ── Audit Logs ────────────────────────────────────────────────

  getAuditLogs(params?: { page?: number; limit?: number; action?: string; entity?: string }): Observable<any> {
    return this.http.get<any>(`${API}/admin/audit-logs`, {
      params: this.buildParams({ limit: params?.limit ?? 50, page: params?.page ?? 1, ...params })
    }).pipe(map(res => res.data ?? []));
  }

  // ── Utilisateurs ──────────────────────────────────────────────

  getUsers(params?: { status?: string; role?: string; search?: string; page?: number; limit?: number }): Observable<any[]> {
    return this.http.get<any>(`${API}/admin/users`, {
      params: this.buildParams(params)
    }).pipe(map(res => Array.isArray(res.data) ? res.data : []));
  }

  updateUserStatus(id: string, status: string, reason?: string): Observable<any> {
    return this.http.patch<any>(`${API}/admin/users/${id}/status`, { status, reason }).pipe(
      map(res => res.data)
    );
  }

  updateUserRole(id: string, role: string): Observable<any> {
    return this.http.put<any>(`${API}/admin/users/${id}/role`, { role }).pipe(
      map(res => res.data)
    );
  }

  // ── Fournisseurs ──────────────────────────────────────────────

  getSuppliers(status = 'ALL', limit = 20, page = 1): Observable<any[]> {
    return this.http.get<any>(`${API}/admin/suppliers`, {
      params: this.buildParams({ status, limit, page })
    }).pipe(map(res => Array.isArray(res.data) ? res.data : []));
  }

  validateSupplier(id: string, approved: boolean, reason?: string): Observable<any> {
    return this.http.patch<any>(`${API}/admin/suppliers/${id}/validate`, { approved, reason }).pipe(
      map(res => res.data)
    );
  }

  // ── Produits ──────────────────────────────────────────────────


  getAllProducts(params?: { status?: string; search?: string; page?: number; limit?: number }): Observable<any[]> {
    return this.http.get<any>(`${API}/admin/products`, {
      params: this.buildParams(params)
    }).pipe(map(res => Array.isArray(res.data) ? res.data : []));
  }

  getPendingProducts(limit = 20, page = 1): Observable<any[]> {
    return this.http.get<any>(`${API}/admin/products/pending`, {
      params: this.buildParams({ limit, page })
    }).pipe(map(res => Array.isArray(res.data) ? res.data : []));
  }

  validateProduct(id: string, approved: boolean, reason?: string): Observable<any> {
    return this.http.patch<any>(`${API}/admin/products/${id}/validate`, { approved, reason }).pipe(
      map(res => res.data)
    );
  }

  // ── Catégories ────────────────────────────────────────────────

  getCategories(): Observable<any[]> {
    return this.http.get<any>(`${API}/categories`).pipe(
      map(res => Array.isArray(res.data) ? res.data : [])
    );
  }

  createCategory(name: string, parentId?: string): Observable<any> {
    return this.http.post<any>(`${API}/admin/categories`, { name, parentId }).pipe(
      map(res => res.data)
    );
  }

  updateCategory(id: string, name: string, parentId?: string): Observable<any> {
    return this.http.put<any>(`${API}/admin/categories/${id}`, { name, parentId }).pipe(
      map(res => res.data)
    );
  }

  deleteCategory(id: string): Observable<any> {
    return this.http.delete<any>(`${API}/admin/categories/${id}`).pipe(
      map(res => res.data)
    );
  }

  // ── Groupes ───────────────────────────────────────────────────

  getGroups(params?: { status?: string; page?: number; limit?: number; search?: string }): Observable<any> {
    return this.http.get<any>(`${API}/admin/groups`, {
      params: this.buildParams(params)
    }).pipe(map(res => ({
      data: Array.isArray(res.data) ? res.data : [],
      meta: res.meta ?? {}
    })));
  }

  forceCloseGroup(id: string, reason: string): Observable<any> {
    return this.http.patch<any>(`${API}/admin/groups/${id}/close`, { reason }).pipe(
      map(res => res.data)
    );
  }

  // ── Litiges ───────────────────────────────────────────────────

  getDisputes(status = 'ALL', limit = 20, page = 1): Observable<any[]> {
    return this.http.get<any>(`${API}/admin/disputes`, {
      params: this.buildParams({ status, limit, page })
    }).pipe(map(res => Array.isArray(res.data) ? res.data : []));
  }

  takeChargeDispute(id: string): Observable<any> {
    return this.http.patch<any>(`${API}/admin/disputes/${id}/take-charge`, {}).pipe(
      map(res => res.data)
    );
  }

  resolveDispute(id: string, resolution: string): Observable<any> {
    return this.http.patch<any>(`${API}/admin/disputes/${id}/resolve`, { resolution }).pipe(
      map(res => res.data)
    );
  }

  // ── Paiements & Remboursements ────────────────────────────────

  getPayments(params?: { status?: string; page?: number; limit?: number }): Observable<any> {
    return this.http.get<any>(`${API}/admin/refunds`, {
      params: this.buildParams(params)
    }).pipe(map(res => Array.isArray(res.data) ? res.data : []));
  }

  refundPayment(paymentId: string, reason: string): Observable<any> {
    return this.http.post<any>(`${API}/admin/payments/refund`, { paymentId, reason }).pipe(
      map(res => res.data)
    );
  }

  processRefund(id: string): Observable<any> {
    return this.http.post<any>(`${API}/admin/refunds/${id}/process`, {}).pipe(
      map(res => res.data)
    );
  }

  // ── Commandes ─────────────────────────────────────────────────

  getOrders(params?: { status?: string; page?: number; limit?: number }): Observable<any> {
    return this.http.get<any>(`${API}/admin/orders`, {
      params: this.buildParams(params)
    }).pipe(map(res => Array.isArray(res.data) ? res.data : []));
  }

  updateOrderStatus(id: string, status: string): Observable<any> {
    return this.http.patch<any>(`${API}/admin/orders/${id}/status`, { status }).pipe(
      map(res => res.data)
    );
  }

  // ── Helper ────────────────────────────────────────────────────
  private buildParams(obj?: Record<string, any>): HttpParams {
    let params = new HttpParams();
    if (!obj) return params;
    Object.entries(obj).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        params = params.set(k, String(v));
      }
    });
    return params;
  }
}