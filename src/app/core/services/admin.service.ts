import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';

const API = 'http://localhost:3000/api/v1';

@Injectable({ providedIn: 'root' })
export class AdminService {

  constructor(private http: HttpClient) {}

  // ── Analytics ─────────────────────────────────────────────────

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

  // ── Audit logs ────────────────────────────────────────────────
  // paginated() retourne { success, data: [...], meta: {} }
  // on retourne data directement = tableau des logs

  getAuditLogs(params?: { page?: number; limit?: number }): Observable<any> {
    return this.http.get<any>(`${API}/admin/audit-logs`, {
      params: this.buildParams({ limit: params?.limit ?? 10, page: params?.page ?? 1 })
    }).pipe(map(res => res.data ?? []));
  }

  // ── Fournisseurs ──────────────────────────────────────────────
  // paginated() retourne { success, data: [...], meta: {} }

  getSuppliers(status = 'PENDING', limit = 20, page = 1): Observable<any[]> {
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

  // ── Utilisateurs ──────────────────────────────────────────────
  // paginated() retourne { success, data: [...], meta: {} }
  // res.data = tableau des utilisateurs directement

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

  // ── Groupes ───────────────────────────────────────────────────

  getGroups(params?: { status?: string; page?: number; limit?: number; search?: string }): Observable<any> {
    return this.http.get<any>(`${API}/admin/groups`, {
      params: this.buildParams(params)
    }).pipe(map(res => ({
      data : Array.isArray(res.data) ? res.data : [],
      meta : res.meta ?? {}
    })));
  }

  forceCloseGroup(id: string, reason: string): Observable<any> {
    return this.http.patch<any>(`${API}/admin/groups/${id}/close`, { reason }).pipe(
      map(res => res.data)
    );
  }

  // ── Litiges ───────────────────────────────────────────────────

  getDisputes(status = 'OPEN', limit = 20, page = 1): Observable<any[]> {
    return this.http.get<any>(`${API}/admin/disputes`, {
      params: this.buildParams({ status, limit, page })
    }).pipe(map(res => Array.isArray(res.data) ? res.data : []));
  }

  resolveDispute(id: string, resolution: string): Observable<any> {
    return this.http.patch<any>(`${API}/admin/disputes/${id}/resolve`, { resolution }).pipe(
      map(res => res.data)
    );
  }

  takeChargeDispute(id: string): Observable<any> {
    return this.http.patch<any>(`${API}/admin/disputes/${id}/take-charge`, {}).pipe(
      map(res => res.data)
    );
  }

  // ── Paiements ─────────────────────────────────────────────────

  getPayments(params?: { status?: string; page?: number; limit?: number }): Observable<any> {
    return this.http.get<any>(`${API}/admin/payments`, {
      params: this.buildParams(params)
    }).pipe(map(res => res.data ?? []));
  }

  refundPayment(paymentId: string, reason: string): Observable<any> {
    return this.http.post<any>(`${API}/admin/payments/refund`, { paymentId, reason }).pipe(
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