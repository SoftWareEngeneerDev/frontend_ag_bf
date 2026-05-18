import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject, takeUntil } from 'rxjs';
import { environment } from '../../../../environments/environment';

const API = environment.apiUrl;

@Component({
  selector: 'app-member-disputes',
  templateUrl: './member-disputes.component.html',
  styleUrls: ['./member-disputes.component.scss']
})
export class MemberDisputesComponent implements OnInit, OnDestroy {
  disputes: any[] = [];
  loading    = true;
  submitting = false;

  // Tabs
  activeTab = 'all';
  readonly tabs = [
    { key: 'all',       label: 'Tous',      icon: 'fa-solid fa-list' },
    { key: 'OPEN',      label: 'Ouverts',   icon: 'fa-solid fa-circle-exclamation' },
    { key: 'IN_REVIEW', label: 'En cours',  icon: 'fa-solid fa-clock' },
    { key: 'RESOLVED',  label: 'Résolus',   icon: 'fa-solid fa-circle-check' },
  ];

  // Formulaire
  showForm    = false;
  orderId     = '';
  subject     = '';
  description = '';

  successMsg = '';
  errorMsg   = '';

  private destroy$ = new Subject<void>();

  constructor(private http: HttpClient) {}

  ngOnInit(): void { this.loadDisputes(); }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadDisputes(): void {
    this.loading = true;
    this.http.get<any>(`${API}/disputes/me`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.disputes = Array.isArray(res.data) ? res.data : [];
          this.loading  = false;
        },
        error: () => { this.disputes = []; this.loading = false; }
      });
  }

  get filtered(): any[] {
    if (this.activeTab === 'all') return this.disputes;
    return this.disputes.filter(d => d.status === this.activeTab);
  }

  tabCount(key: string): number {
    if (key === 'all') return this.disputes.length;
    return this.disputes.filter(d => d.status === key).length;
  }

  setTab(key: string): void { this.activeTab = key; }

  openForm(): void {
    this.showForm   = true;
    this.orderId    = '';
    this.subject    = '';
    this.description = '';
    this.errorMsg   = '';
  }

  cancelForm(): void { this.showForm = false; }

  submitDispute(): void {
    if (!this.subject.trim() || !this.description.trim() || this.submitting) return;
    this.submitting = true;
    this.errorMsg   = '';

    const body: any = {
      subject:     this.subject.trim(),
      description: this.description.trim(),
    };
    if (this.orderId.trim()) body.orderId = this.orderId.trim();

    this.http.post<any>(`${API}/disputes`, body)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (res.data) this.disputes.unshift(res.data);
          this.submitting = false;
          this.showForm   = false;
          this.showSuccess('Litige ouvert — notre équipe vous contactera dans 24h.');
        },
        error: (err) => {
          this.submitting = false;
          this.errorMsg   = err?.error?.error?.message ?? 'Erreur lors de la soumission.';
        }
      });
  }

  statusClass(status: string): string {
    const m: Record<string, string> = {
      OPEN:      'badge-red',
      IN_REVIEW: 'badge-yellow',
      RESOLVED:  'badge-ok',
      CLOSED:    'badge-grey',
    };
    return m[status] ?? 'badge-grey';
  }

  statusLabel(status: string): string {
    const m: Record<string, string> = {
      OPEN:      'Ouvert',
      IN_REVIEW: 'En cours',
      RESOLVED:  'Résolu',
      CLOSED:    'Clôturé',
    };
    return m[status] ?? status;
  }

  statusIcon(status: string): string {
    const m: Record<string, string> = {
      OPEN:      'fa-solid fa-circle-exclamation',
      IN_REVIEW: 'fa-solid fa-clock',
      RESOLVED:  'fa-solid fa-circle-check',
      CLOSED:    'fa-solid fa-circle-xmark',
    };
    return m[status] ?? 'fa-solid fa-circle';
  }

  trackById(_: number, d: any): string { return d.id; }

  private showSuccess(msg: string): void {
    this.successMsg = msg;
    setTimeout(() => { this.successMsg = ''; }, 4500);
  }
}
