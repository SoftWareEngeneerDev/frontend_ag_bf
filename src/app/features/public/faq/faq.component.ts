import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.scss']
})
export class FaqComponent {
  categories: { icon: string; label: string; items: { q: string; a: string }[] }[] = [
    {
      icon: 'fa-solid fa-users',
      label: 'Groupes d\'achat',
      items: [
        { q: 'Comment rejoindre un groupe d\'achat ?', a: 'Parcourez le catalogue, choisissez un produit et cliquez sur "Rejoindre le groupe". Payez le dépôt de 10% pour verrouiller votre place.' },
        { q: 'Comment créer mon propre groupe ?', a: 'Rendez-vous sur la page d\'un produit et cliquez "Créer un groupe". Définissez le seuil minimum et la date limite. Une fois le seuil atteint, les commandes sont traitées automatiquement.' },
        { q: 'Puis-je rejoindre plusieurs groupes simultanément ?', a: 'Oui, sans limite. Vous pouvez rejoindre autant de groupes que vous souhaitez en même temps.' },
        { q: 'Que se passe-t-il si le seuil n\'est pas atteint ?', a: 'Votre dépôt de 10% vous est intégralement remboursé dans les 3 à 5 jours ouvrés via le même mode de paiement utilisé lors de l\'achat.' },
        { q: 'Comment voir le nombre de membres dans un groupe ?', a: 'La barre de progression sur chaque groupe indique le nombre de membres actuels et le seuil minimum à atteindre en temps réel.' },
      ]
    },
    {
      icon: 'fa-solid fa-credit-card',
      label: 'Paiements',
      items: [
        { q: 'Quels modes de paiement acceptez-vous ?', a: 'Nous acceptons Orange Money, Moov Money, Ligdicash et les cartes bancaires (Visa/Mastercard) via CinetPay.' },
        { q: 'Comment fonctionne le dépôt de 10% ?', a: 'Le dépôt sécurise votre place dans le groupe. Il est conservé en escrow sécurisé et ne sera définitivement débité qu\'à l\'atteinte du seuil minimum.' },
        { q: 'Comment demander un remboursement ?', a: 'Les remboursements sont automatiques si le groupe n\'atteint pas son seuil. Pour les autres cas (litige, annulation), contactez le support depuis votre espace membre.' },
        { q: 'Mes données bancaires sont-elles sécurisées ?', a: 'Oui. Nous ne stockons aucune donnée bancaire sur nos serveurs. Tous les paiements transitent par des opérateurs agréés (CinetPay, Orange, Moov).' },
        { q: 'Puis-je payer en plusieurs fois ?', a: 'Le système fonctionne en deux étapes : dépôt de 10% pour rejoindre, puis solde final une fois le seuil atteint. Il n\'y a pas d\'autre fractionnement.' },
      ]
    },
    {
      icon: 'fa-solid fa-truck',
      label: 'Livraison',
      items: [
        { q: 'Où livrez-vous au Burkina Faso ?', a: 'Nous livrons à Ouagadougou, Bobo-Dioulasso, Koudougou, Ouahigouya, Banfora et dans les principales villes. Les zones éloignées peuvent nécessiter un délai supplémentaire.' },
        { q: 'Quel est le délai de livraison moyen ?', a: 'Entre 5 et 10 jours ouvrés après confirmation du paiement final, selon le fournisseur et la zone de livraison.' },
        { q: 'Comment suivre ma commande ?', a: 'Depuis votre espace membre → Mes Commandes, vous pouvez suivre l\'état de chaque commande en temps réel avec les mises à jour du fournisseur.' },
        { q: 'Que faire si ma commande est en retard ?', a: 'Si le délai est dépassé de plus de 3 jours, ouvrez un litige depuis votre espace membre. Notre équipe intervient sous 24h.' },
      ]
    },
    {
      icon: 'fa-solid fa-shield-halved',
      label: 'Sécurité & Fournisseurs',
      items: [
        { q: 'Comment les fournisseurs sont-ils sélectionnés ?', a: 'Chaque fournisseur est vérifié manuellement : RCCM, documents légaux, références commerciales et historique client avant toute approbation sur la plateforme.' },
        { q: 'Que faire en cas de problème avec un fournisseur ?', a: 'Ouvrez un litige depuis votre espace membre. Notre équipe de médiation intervient dans les 48h pour trouver une solution équitable.' },
        { q: 'Mes données personnelles sont-elles protégées ?', a: 'Oui, conformément à la législation burkinabè sur la protection des données. Vos informations ne sont jamais revendues ni partagées avec des tiers sans votre consentement.' },
      ]
    },
    {
      icon: 'fa-solid fa-user',
      label: 'Mon compte',
      items: [
        { q: 'Comment créer un compte ?', a: 'Cliquez sur "Créer mon compte" depuis la page d\'accueil. Renseignez votre numéro de téléphone, un mot de passe et validez avec le code OTP reçu par SMS.' },
        { q: 'J\'ai oublié mon mot de passe, que faire ?', a: 'Sur la page de connexion, cliquez "Mot de passe oublié". Vous recevrez un code OTP par SMS pour réinitialiser votre mot de passe.' },
        { q: 'Comment devenir fournisseur ?', a: 'Créez un compte et sélectionnez le rôle "Fournisseur" lors de l\'inscription. Votre dossier sera examiné par notre équipe dans les 3 jours ouvrés.' },
        { q: 'Comment supprimer mon compte ?', a: 'Contactez notre support par email ou depuis l\'espace membre → Profil → Supprimer mon compte. La suppression est effective sous 30 jours.' },
      ]
    },
  ];

  activeCategory = 0;
  openItem: string | null = null;

  toggle(key: string): void {
    this.openItem = this.openItem === key ? null : key;
  }

  isOpen(key: string): boolean {
    return this.openItem === key;
  }

  constructor(private router: Router) {}
  goContact(): void { this.router.navigate(['/contact']); }
}
