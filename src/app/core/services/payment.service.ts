import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Payment, PaymentMethod } from '../models';

export interface PaymentInitDto {
  groupId: string;
  type: 'DEPOSIT' | 'FINAL';
  method: PaymentMethod;
  phone?: string;
  amount: number;
}

export interface PaymentResult {
  success: boolean;
  reference: string;
  transactionId: string;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class PaymentService {

  initiate(dto: PaymentInitDto): Observable<PaymentResult> {
    return of({
      success: true,
      reference: 'TXN-' + Date.now(),
      transactionId: dto.method.slice(0,2) + '-' + Math.floor(Math.random()*10000),
      message: 'Paiement traité avec succès',
    }).pipe(delay(1200));
  }
}
