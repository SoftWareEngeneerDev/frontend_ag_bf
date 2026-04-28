import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { PaymentService } from '../../../core/services/payment.service';
import { GroupService }   from '../../../core/services/group.service';
import { FormatService }  from '../../../core/services/format.service';
import { PaymentMethod, Group } from '../../../core/models';

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
  paymentType   : 'DEPOSIT' | 'FINAL' = 'FINAL';

  private destroy$ = new Subject<void>();

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
    const params = this.route.snapshot.queryParams;

    this.groupId      = params['groupId']        ?? '';
    this.depositAmount = +(params['depositAmount'] ?? 0);
    this.currentPrice  = +(params['currentPrice']  ?? 0);
    this.paymentType   = this.depositAmount > 0 ? 'DEPOSIT' : 'FINAL';

    if (this.groupId) {
      this.groupService.getById(this.groupId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next  : (g) => { this.group = g; },
          error : () => {}
        });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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
          // Mode PROD → rediriger vers CinetPay
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
}