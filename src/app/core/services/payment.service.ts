import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { PaymentMethod } from '../models';

const API = 'http://localhost:3000/api/v1';

export interface PaymentInitDto {
  groupId: string;
  type:    'DEPOSIT' | 'FINAL';
  method:  PaymentMethod;
  phone?:  string;
  amount:  number;
}

export interface PaymentResult {
  success:        boolean;
  reference:      string;
  transactionId:  string;
  message:        string;
  paymentUrl?:    string; // URL CinetPay si redirection nécessaire
}

@Injectable({ providedIn: 'root' })
export class PaymentService {

  constructor(private http: HttpClient) {}

  // ── Initier un dépôt → POST /payments/deposit ─────────────────
  // ── Initier le solde final → POST /payments/final ─────────────
  initiate(dto: PaymentInitDto): Observable<PaymentResult> {
    const endpoint = dto.type === 'DEPOSIT'
      ? `${API}/payments/deposit`
      : `${API}/payments/final`;

    const payload = {
      groupId: dto.groupId,
      method:  dto.method,
    };

    return this.http.post<any>(endpoint, payload).pipe(
      map(res => ({
        success:       true,
        reference:     res.data?.transactionRef    ?? 'TXN-' + Date.now(),
        transactionId: res.data?.transactionId     ?? '',
        message:       res.data?.message           ?? 'Paiement initié',
        paymentUrl:    res.data?.paymentUrl        ?? res.data?.checkoutUrl ?? '',
      }))
    );
  }

  // ── Statut d'un paiement → GET /payments/:id/status ──────────
  getStatus(paymentId: string): Observable<any> {
    return this.http.get<any>(`${API}/payments/${paymentId}/status`).pipe(
      map(res => res.data)
    );
  }

  // ── Historique paiements → GET /payments/me ───────────────────
  getMyPayments(page = 1, limit = 20): Observable<any> {
    return this.http.get<any>(`${API}/payments/me`, { params: { page, limit } }).pipe(
      map(res => res)
    );
  }

  // ── Simulation DEV → POST /payments/simulate/:ref ────────────
  simulate(transactionRef: string, success = true): Observable<any> {
    return this.http.post<any>(
      `${API}/payments/simulate/${transactionRef}`,
      { success }
    ).pipe(map(res => res.data));
  }
}