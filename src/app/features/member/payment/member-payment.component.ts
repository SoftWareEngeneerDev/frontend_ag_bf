import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { PaymentService } from '../../../core/services/payment.service';
import { GroupService }   from '../../../core/services/group.service';
import { FormatService }  from '../../../core/services/format.service';
import { PaymentMethod, Group } from '../../../core/models';

@Component({
  selector: 'app-payment',
  templateUrl: './member-payment.component.html',
  styleUrls:  ['./member-payment.component.scss']
})
export class PaymentComponent implements OnInit {
  step      = 1;
  selMethod: PaymentMethod | '' = '';
  phone     = '';
  loading   = false;
  errorMsg  = '';
  ref       = '';
  now       = new Date();
  today     = "Aujourd'hui";

  // ── Groupe chargé depuis les query params ─────────────────────
  group!: Group;
  groupId      = '';
  depositAmount = 0;
  currentPrice  = 0;
  paymentType: 'DEPOSIT' | 'FINAL' = 'FINAL';

  methods = [
    { id: 'ORANGE_MONEY' as PaymentMethod, icon: 'fa-solid fa-mobile-screen-button', color: '#FF6B00', name: 'Orange Money',   sub: 'Le plus utilisé au BF' },
    { id: 'MOOV_MONEY'   as PaymentMethod, icon: 'fa-solid fa-mobile-screen-button', color: '#0066CC', name: 'Moov Money',     sub: 'Rapide et sécurisé' },
    { id: 'LIGDICASH'    as PaymentMethod, icon: 'fa-solid fa-mobile-screen-button', color: '#00A651', name: 'Ligdicash',      sub: 'Paiement numérique' },
    { id: 'CARD'         as PaymentMethod, icon: 'fa-solid fa-credit-card',          color: '#6B7280', name: 'Carte bancaire', sub: 'Visa / Mastercard' },
  ];

  constructor(
    private payService:   PaymentService,
    private groupService: GroupService,
    public  fmt:          FormatService,
    private router:       Router,
    private route:        ActivatedRoute,
  ) {}

  ngOnInit(): void {
    // ── Récupérer les params depuis la navigation ──────────────
    // Vient de group-detail.component après joinGroup()
    const params = this.route.snapshot.queryParams;

    this.groupId      = params['groupId']       ?? '';
    this.depositAmount = +(params['depositAmount'] ?? 0);
    this.currentPrice  = +(params['currentPrice']  ?? 0);

    // Déterminer le type de paiement
    this.paymentType = this.depositAmount > 0 ? 'DEPOSIT' : 'FINAL';

    // ── Charger le groupe depuis le backend ────────────────────
    if (this.groupId) {
      this.groupService.getById(this.groupId).subscribe({
        next: (g) => { this.group = g; },
        error: () => {}
      });
    }
  }

  get finalAmount(): number {
    if (this.depositAmount > 0) return this.depositAmount;
    if (!this.group) return 0;
    return this.group.currentPrice - this.group.depositAmount;
  }

  get needsPhone():  boolean { return this.selMethod !== 'CARD' && this.selMethod !== ''; }
  get methodLabel(): string  { return this.methods.find(m => m.id === this.selMethod)?.name || ''; }

  // ── Initier le paiement ───────────────────────────────────────
  pay(): void {
    if (!this.selMethod || !this.groupId) return;

    this.loading  = true;
    this.errorMsg = '';
    this.step     = 3; // Afficher l'écran de traitement

    this.payService.initiate({
      groupId: this.groupId,
      type:    this.paymentType,
      method:  this.selMethod,
      phone:   this.phone || undefined,
      amount:  this.finalAmount,
    }).subscribe({
      next: (r) => {
        this.ref     = r.reference;
        this.loading = false;

        // ── Mode DEV : simuler le paiement automatiquement ────
        if (r.reference && r.reference !== 'TXN-' + Date.now()) {
          this.payService.simulate(r.reference, true).subscribe({
            next: () => { this.step = 4; },
            error: () => { this.step = 4; } // Passer à la confirmation même si simulation échoue
          });
        } else {
          // ── Mode PROD : rediriger vers CinetPay ───────────
          if (r.paymentUrl) {
            window.location.href = r.paymentUrl;
          } else {
            setTimeout(() => { this.step = 4; }, 1500);
          }
        }
      },
      error: (err) => {
        this.loading  = false;
        this.step     = 2; // Revenir à la sélection méthode
        const msg     = err?.error?.error?.message;
        this.errorMsg = msg || 'Une erreur est survenue. Réessayez.';
      }
    });
  }

  goHome(): void { this.router.navigate(['/member']); }
}