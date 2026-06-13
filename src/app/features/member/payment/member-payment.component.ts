import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { PaymentService } from '../../../core/services/payment.service';
import { GroupService }   from '../../../core/services/group.service';
import { FormatService }  from '../../../core/services/format.service';
import { PaymentMethod, Group } from '../../../core/models';

const PENDING_STORAGE_KEY = 'djula_pending_payment';

@Component({
  selector: 'app-payment',
  templateUrl: './member-payment.component.html',
  styleUrls:  ['./member-payment.component.scss']
})
export class PaymentComponent implements OnInit, OnDestroy {
  step      = 1;
  selMethod : PaymentMethod | '' = '';
  phone     = '';
  loading   = false;
  errorMsg  = '';
  ref       = '';
  now       = new Date();
  today     = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });

  group        !: Group;
  groupId       = '';
  depositAmount = 0;
  currentPrice  = 0;
  paymentType   : 'DEPOSIT' | 'FINAL_PAYMENT' = 'FINAL_PAYMENT';

  private destroy$        = new Subject<void>();
  private pollingInterval : any;

  readonly steps = ['Résumé', 'Méthode', 'Traitement', 'Confirmé'];

  readonly methods = [
    { id: 'ORANGE_MONEY' as PaymentMethod, icon: 'fa-solid fa-mobile-screen-button', color: '#FF6B00', name: 'Orange Money',   sub: 'Le plus utilisé au Burkina Faso' },
    { id: 'MOOV_MONEY'   as PaymentMethod, icon: 'fa-solid fa-mobile-screen-button', color: '#0066CC', name: 'Moov Money',     sub: 'Rapide et sécurisé' },
    { id: 'LIGDICASH'    as PaymentMethod, icon: 'fa-solid fa-mobile-screen-button', color: '#00A651', name: 'Ligdicash',      sub: 'Paiement numérique BF' },
    { id: 'CARD'         as PaymentMethod, icon: 'fa-solid fa-credit-card',          color: '#6B7280', name: 'Carte bancaire', sub: 'Visa / Mastercard' },
  ];

  constructor(
    private payService   : PaymentService,
    private groupService : GroupService,
    public  fmt          : FormatService,
    private router       : Router,
    private route        : ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (!params['groupId']) {
        this.router.navigate(['/member/catalogue']);
        return;
      }

      this.groupId       = params['groupId']        ?? '';
      this.depositAmount = +(params['depositAmount'] ?? 0);
      this.currentPrice  = +(params['currentPrice']  ?? 0);
      this.paymentType   = this.depositAmount > 0 ? 'DEPOSIT' : 'FINAL_PAYMENT';

      if (this.groupId) {
        this.groupService.getById(this.groupId)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next  : (g) => { this.group = g; },
            error : () => {}
          });
      }

      // Détecter retour depuis CinetPay (paiement en attente sauvegardé)
      this.resumePollingIfPending();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    clearInterval(this.pollingInterval);
  }

  // ── Getters ───────────────────────────────────────────────────
  get finalAmount(): number {
    if (this.depositAmount > 0) return this.depositAmount;
    if (!this.group) return 0;
    return this.group.currentPrice - this.group.depositAmount;
  }

  get needsPhone()  : boolean { return this.selMethod !== 'CARD' && this.selMethod !== ''; }
  get methodLabel() : string  { return this.methods.find(m => m.id === this.selMethod)?.name ?? ''; }
  get canPay()      : boolean { return !!this.selMethod && (!this.needsPhone || this.phone.length >= 8); }

  get productImage(): string {
    return this.group?.product?.images?.[0]
      ?? `https://picsum.photos/seed/${this.group?.product?.id ?? 'default'}/80/80`;
  }

  // ── Initier le paiement ───────────────────────────────────────
  pay(): void {
    if (!this.selMethod || !this.groupId || !this.canPay) return;

    this.loading  = true;
    this.errorMsg = '';
    this.step     = 3;

    this.payService.initiate({
      groupId : this.groupId,
      type    : this.paymentType,
      method  : this.selMethod,
      phone   : this.phone || undefined,
      amount  : this.finalAmount,
    })
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (r) => {
        this.ref     = r.reference;
        this.loading = false;
        this.now     = new Date();

        if (r.paymentUrl) {
          // Mode PROD → sauvegarder le paymentId puis rediriger vers CinetPay
          if (r.paymentId) {
            sessionStorage.setItem(PENDING_STORAGE_KEY, JSON.stringify({
              paymentId: r.paymentId,
              ref      : r.reference,
            }));
          }
          window.location.href = r.paymentUrl;
        } else if (r.reference) {
          // Mode DEV → simuler
          this.payService.simulate(r.reference, true)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next  : () => { this.step = 4; },
              error : () => { this.step = 4; }
            });
        } else {
          setTimeout(() => { this.step = 4; }, 1500);
        }
      },
      error: (err) => {
        this.loading  = false;
        this.step     = 2;
        this.errorMsg = err?.error?.error?.message
          ?? err?.error?.message
          ?? 'Une erreur est survenue. Réessayez.';
      }
    });
  }

  selectMethod(id: PaymentMethod): void {
    this.selMethod = id;
    this.phone     = '';
    this.errorMsg  = '';
  }

  goHome()   : void { this.router.navigate(['/member']); }
  goOrders() : void { this.router.navigate(['/member/orders']); }

  // ── Polling statut après retour CinetPay ─────────────────────

  private resumePollingIfPending(): void {
    const stored = sessionStorage.getItem(PENDING_STORAGE_KEY);
    if (!stored) return;

    try {
      const { paymentId, ref } = JSON.parse(stored);
      if (!paymentId) { sessionStorage.removeItem(PENDING_STORAGE_KEY); return; }
      this.ref  = ref ?? '';
      this.step = 3;
      this.startPolling(paymentId);
    } catch {
      sessionStorage.removeItem(PENDING_STORAGE_KEY);
    }
  }

  private startPolling(paymentId: string): void {
    let attempts = 0;
    const maxAttempts = 40; // 2 minutes à 3 s d'intervalle

    this.pollingInterval = setInterval(() => {
      attempts++;

      this.payService.getStatus(paymentId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (payment) => {
            if (payment?.status === 'COMPLETED' || payment?.status === 'ESCROWED') {
              clearInterval(this.pollingInterval);
              sessionStorage.removeItem(PENDING_STORAGE_KEY);
              this.now  = new Date();
              this.step = 4;
            } else if (payment?.status === 'FAILED') {
              clearInterval(this.pollingInterval);
              sessionStorage.removeItem(PENDING_STORAGE_KEY);
              this.step     = 2;
              this.errorMsg = 'Paiement échoué. Veuillez réessayer.';
            }
          },
          error: () => { /* ignorer les erreurs transitoires */ }
        });

      if (attempts >= maxAttempts) {
        clearInterval(this.pollingInterval);
        sessionStorage.removeItem(PENDING_STORAGE_KEY);
        this.step     = 2;
        this.errorMsg = 'Délai dépassé. Vérifiez votre historique de paiements.';
      }
    }, 3000);
  }
}
