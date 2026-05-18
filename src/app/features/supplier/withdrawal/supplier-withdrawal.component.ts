import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject, takeUntil } from 'rxjs';
import { environment } from '../../../../environments/environment';

const API = environment.apiUrl;

const METHOD_LABELS: Record<string, string> = {
  ORANGE_MONEY: 'Orange Money',
  MOOV_MONEY  : 'Moov Money',
  LIGDICASH   : 'Ligdicash',
};

const STATUS_LABELS: Record<string, string> = {
  PENDING  : 'En attente',
  APPROVED : 'Approuvé',
  REJECTED : 'Refusé',
  PROCESSED: 'Traité',
};

@Component({
  selector: 'app-supplier-withdrawal',
  templateUrl: './supplier-withdrawal.component.html',
  styleUrls: ['./supplier-withdrawal.component.scss']
})
export class SupplierWithdrawalComponent implements OnInit, OnDestroy {
  requests: any[] = [];
  loading    = true;
  submitting = false;

  // Formulaire
  amount      = '';
  method      = 'ORANGE_MONEY';
  accountInfo = '';

  successMsg = '';
  errorMsg   = '';

  readonly methods = [
    { value: 'ORANGE_MONEY', label: 'Orange Money', icon: '🟠' },
    { value: 'MOOV_MONEY',   label: 'Moov Money',   icon: '🔵' },
    { value: 'LIGDICASH',    label: 'Ligdicash',     icon: '🟣' },
  ];

  private destroy$ = new Subject<void>();

  constructor(private http: HttpClient) {}

  ngOnInit(): void { this.loadRequests(); }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadRequests(): void {
    this.loading = true;
    this.http.get<any>(`${API}/supplier/withdrawals`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.requests = Array.isArray(res.data) ? res.data : [];
          this.loading  = false;
        },
        error: () => { this.requests = []; this.loading = false; }
      });
  }

  submitWithdrawal(): void {
    const amountNum = parseFloat(this.amount);
    if (!amountNum || amountNum < 1000 || !this.accountInfo.trim() || this.submitting) return;
    this.submitting = true;
    this.errorMsg   = '';

    this.http.post<any>(`${API}/supplier/withdrawal`, {
      amount     : amountNum,
      method     : this.method,
      accountInfo: this.accountInfo.trim(),
    }).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (res.data) this.requests.unshift(res.data);
          this.submitting = false;
          this.amount     = '';
          this.accountInfo = '';
          this.showSuccess('Demande de retrait soumise — traitement sous 48h ouvrées.');
        },
        error: (err) => {
          this.submitting = false;
          this.errorMsg   = err?.error?.error?.message ?? 'Erreur lors de la soumission.';
        }
      });
  }

  methodLabel(val: string): string  { return METHOD_LABELS[val] ?? val; }
  statusLabel(val: string): string  { return STATUS_LABELS[val] ?? val; }

  statusClass(status: string): string {
    const m: Record<string, string> = {
      PENDING  : 'badge-yellow',
      APPROVED : 'badge-primary',
      PROCESSED: 'badge-ok',
      REJECTED : 'badge-red',
    };
    return m[status] ?? 'badge-grey';
  }

  get canSubmit(): boolean {
    const n = parseFloat(this.amount);
    return !isNaN(n) && n >= 1000 && !!this.accountInfo.trim() && !this.submitting;
  }

  trackById(_: number, r: any): string { return r.id; }

  private showSuccess(msg: string): void {
    this.successMsg = msg;
    setTimeout(() => { this.successMsg = ''; }, 4500);
  }
}
