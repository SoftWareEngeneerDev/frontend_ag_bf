import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-how-it-works',
  templateUrl: './how-it-works.component.html',
  styleUrls: ['./how-it-works.component.scss']
})
export class HowItWorksComponent {
  steps = [
    { n:'01', icon:'fa-solid fa-magnifying-glass', title:'Parcourez le catalogue',      desc:'Découvrez des centaines de produits organisés par catégorie. Électronique, alimentaire, mode, maison et plus encore.', detail:'Utilisez les filtres pour trouver rapidement ce que vous cherchez. Chaque produit affiche le prix solo et le meilleur prix de groupe possible.' },
    { n:'02', icon:'fa-solid fa-users',            title:'Rejoignez ou créez un groupe', desc:'Choisissez un groupe existant ou créez-en un nouveau pour un produit qui vous intéresse.', detail:'Chaque groupe a un nombre minimum de participants à atteindre. Plus il y a de membres, plus le prix baisse automatiquement.' },
    { n:'03', icon:'fa-solid fa-mobile-screen-button', title:'Payez votre dépôt (10%)', desc:'Verrouillez votre place en payant seulement 10% du prix via Orange Money, Moov Money ou Ligdicash.', detail:"Votre dépôt est sécurisé en escrow. Si le groupe n'atteint pas le seuil, vous êtes intégralement remboursé." },
    { n:'04', icon:'fa-solid fa-bullseye',         title:'Le seuil est atteint',         desc:'Quand assez de membres rejoignent, le prix final est calculé automatiquement selon le palier atteint.', detail:'Vous recevez une notification immédiate et avez 48h pour payer le solde final.' },
    { n:'05', icon:'fa-solid fa-sack-dollar',      title:'Payez le solde final',         desc:'Réglez le montant restant dès que le seuil est atteint pour confirmer votre commande.', detail:"Paiement sécurisé via CinetPay. Votre argent reste en escrow jusqu'à confirmation de livraison." },
    { n:'06', icon:'fa-solid fa-box-open',         title:'Recevez votre produit',        desc:'Le fournisseur prépare et expédie votre commande. Suivez-la en temps réel.', detail:'Livraison à Ouagadougou et dans les principales villes du Burkina. Délai moyen : 5-10 jours.' },
  ];

  faqs = [
    { q:"Que se passe-t-il si le groupe n'atteint pas le seuil ?", a:'Votre dépôt de 10% vous est intégralement remboursé dans les 3-5 jours ouvrés.' },
    { q:'Comment sont sélectionnés les fournisseurs ?',             a:"Chaque fournisseur est vérifié manuellement (documents légaux, historique) avant d'être approuvé." },
    { q:'Puis-je rejoindre plusieurs groupes en même temps ?',      a:"Oui, il n'y a pas de limite. Vous pouvez rejoindre autant de groupes que vous souhaitez." },
    { q:'Comment fonctionne le remboursement ?',                    a:"Les remboursements sont traités via le même mode de paiement utilisé lors de l'achat." },
  ];

  openFaq = -1;

  constructor(private router: Router) {}
  toggleFaq(i: number): void { this.openFaq = this.openFaq === i ? -1 : i; }
  goRegister(): void { this.router.navigate(['/auth/register']); }
}
