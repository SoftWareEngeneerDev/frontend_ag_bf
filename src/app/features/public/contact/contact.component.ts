import { Component, OnInit } from '@angular/core';
import { SeoService } from '../../../core/services/seo.service';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent implements OnInit {
  constructor(private seo: SeoService) {}

  ngOnInit(): void {
    this.seo.setPage({
      title      : 'Contact — Djula Market',
      description: 'Contactez l\'équipe Djula Market pour toute question ou assistance.',
    });
  }

  subjects = [
    'Question générale',
    'Problème de paiement',
    'Problème de livraison',
    'Litige avec un fournisseur',
    'Devenir fournisseur',
    'Bug ou problème technique',
    'Autre',
  ];

  form = { name: '', phone: '', email: '', subject: '', message: '' };
  sent = false;
  loading = false;

  send(): void {
    if (!this.form.name || !this.form.phone || !this.form.message) return;
    this.loading = true;
    setTimeout(() => {
      this.loading = false;
      this.sent = true;
    }, 1200);
  }
}
