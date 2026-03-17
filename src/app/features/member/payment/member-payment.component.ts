import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { PaymentService } from '../../../core/services/payment.service';
import { MockDataService } from '../../../core/services/mock-data.service';
import { FormatService }   from '../../../core/services/format.service';
import { PaymentMethod, Group } from '../../../core/models';

@Component({
  selector: 'app-payment',
  templateUrl: './member-payment.component.html',
  styleUrls:  ['./member-payment.component.scss']
})
export class PaymentComponent {
  step = 1;
  selMethod: PaymentMethod | '' = '';
  phone = '';
  loading = false;
  ref = '';

  group: Group = this.mock.groups[1]; // groupe seuil atteint

  methods = [
    { id:'ORANGE_MONEY' as PaymentMethod, icon:'fa-solid fa-mobile-screen-button', color:'#FF6B00', name:'Orange Money',  sub:'Le plus utilisé au BF' },
    { id:'MOOV_MONEY'   as PaymentMethod, icon:'fa-solid fa-mobile-screen-button', color:'#0066CC', name:'Moov Money',    sub:'Rapide et sécurisé' },
    { id:'LIGDICASH'    as PaymentMethod, icon:'fa-solid fa-mobile-screen-button', color:'#00A651', name:'Ligdicash',     sub:'Paiement numérique' },
    { id:'CARD'         as PaymentMethod, icon:'fa-solid fa-credit-card',          color:'#6B7280', name:'Carte bancaire',sub:'Visa / Mastercard' },
  ];

  now   = new Date();
  today = "Aujourd'hui";

  get finalAmount(): number { return this.group.currentPrice - this.group.depositAmount; }
  get needsPhone():  boolean { return this.selMethod !== 'CARD' && this.selMethod !== ''; }
  get methodLabel(): string  { return this.methods.find(m => m.id === this.selMethod)?.name || ''; }

  constructor(
    private payService: PaymentService,
    public  mock:       MockDataService,
    public  fmt:        FormatService,
    private router:     Router,
  ) {}

  pay(): void {
    if (!this.selMethod) return;
    this.loading = true;
    this.payService.initiate({
      groupId: this.group.id,
      type: 'FINAL',
      method: this.selMethod,
      phone: this.phone,
      amount: this.finalAmount,
    }).subscribe(r => {
      this.ref     = r.reference;
      this.loading = false;
      this.step    = 3;
      setTimeout(() => this.step = 4, 1500);
    });
  }

  goHome(): void { this.router.navigate(['/member']); }
}
