import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-delivery',
  templateUrl: './delivery.component.html',
  styleUrls: ['./delivery.component.scss']
})
export class DeliveryComponent {
  zones = [
    { city: 'Ouagadougou (centre)',    delay: '2–4 jours',   price: 'Gratuit',       note: 'Commandes > 25 000 XOF' },
    { city: 'Ouagadougou (périphérie)',delay: '3–5 jours',   price: '1 000 XOF',     note: '' },
    { city: 'Bobo-Dioulasso',          delay: '4–6 jours',   price: '2 500 XOF',     note: '' },
    { city: 'Koudougou',               delay: '5–7 jours',   price: '2 000 XOF',     note: '' },
    { city: 'Ouahigouya',              delay: '5–8 jours',   price: '2 500 XOF',     note: '' },
    { city: 'Banfora',                 delay: '6–8 jours',   price: '3 000 XOF',     note: '' },
    { city: 'Dédougou',                delay: '6–9 jours',   price: '3 000 XOF',     note: '' },
    { city: 'Fada N\'Gourma',          delay: '7–10 jours',  price: '3 500 XOF',     note: '' },
    { city: 'Autres villes',           delay: '8–14 jours',  price: 'Sur devis',     note: 'Contactez le support' },
  ];

  faqs = [
    { q: 'Comment suivre ma commande ?', a: 'Depuis votre espace membre → Mes Commandes, accédez au suivi en temps réel avec les mises à jour du fournisseur.' },
    { q: 'Puis-je changer l\'adresse de livraison ?', a: 'Oui, avant l\'expédition uniquement. Connectez-vous à votre espace membre et modifiez l\'adresse depuis la commande concernée.' },
    { q: 'Que faire si le livreur est absent ?', a: 'Le livreur effectue 2 tentatives de livraison. En cas d\'absence, votre commande est conservée au point de dépôt le plus proche pendant 5 jours.' },
    { q: 'La livraison est-elle assurée ?', a: 'Oui, toutes les commandes sont assurées contre la perte et les dommages pendant le transport. En cas de problème, un remboursement intégral est effectué.' },
  ];

  openFaq = -1;
  toggleFaq(i: number): void { this.openFaq = this.openFaq === i ? -1 : i; }

  constructor(private router: Router) {}
  goContact(): void { this.router.navigate(['/contact']); }
}
