import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-litiges',
  templateUrl: './litiges.component.html',
  styleUrls: ['./litiges.component.scss']
})
export class LitigesComponent {
  types = [
    { icon: 'fa-solid fa-box-open',        color: 'var(--orange)', title: 'Produit non reçu',         desc: 'Votre commande n\'est pas arrivée après le délai maximum prévu.' },
    { icon: 'fa-solid fa-triangle-exclamation', color: 'var(--red)', title: 'Produit défectueux',      desc: 'L\'article reçu est endommagé, cassé ou ne fonctionne pas.' },
    { icon: 'fa-solid fa-arrows-rotate',   color: 'var(--cyan)',   title: 'Produit non conforme',      desc: 'L\'article reçu ne correspond pas à la description du groupe.' },
    { icon: 'fa-solid fa-sack-xmark',      color: 'var(--purple)', title: 'Remboursement non reçu',   desc: 'Votre remboursement n\'a pas été crédité après annulation du groupe.' },
    { icon: 'fa-solid fa-user-slash',      color: '#888',          title: 'Problème avec le fournisseur', desc: 'Le fournisseur est injoignable ou refuse de traiter votre demande.' },
  ];

  steps = [
    { n: '01', icon: 'fa-solid fa-right-to-bracket', title: 'Connectez-vous',         desc: 'Accédez à votre espace membre pour ouvrir un litige officiel.' },
    { n: '02', icon: 'fa-solid fa-file-pen',         title: 'Déclarez le litige',      desc: 'Sélectionnez la commande concernée, le type de problème et joignez des preuves (photos, captures).' },
    { n: '03', icon: 'fa-solid fa-magnifying-glass', title: 'Analyse sous 24h',        desc: 'Notre équipe de médiation examine votre dossier et contacte le fournisseur.' },
    { n: '04', icon: 'fa-solid fa-comments',         title: 'Médiation',               desc: 'Nous facilitons la communication entre vous et le fournisseur pour trouver une solution à l\'amiable.' },
    { n: '05', icon: 'fa-solid fa-gavel',            title: 'Décision sous 7 jours',   desc: 'Si aucun accord n\'est trouvé, notre équipe tranche et applique la décision (remboursement, échange ou autre).' },
  ];

  faqs = [
    { q: 'Combien de temps ai-je pour ouvrir un litige ?', a: 'Vous avez 14 jours après la date de livraison prévue pour ouvrir un litige. Au-delà, la commande est considérée comme acceptée.' },
    { q: 'Quelles preuves dois-je fournir ?', a: 'Photos du colis à la réception, captures d\'écran de la commande, et tout échange avec le fournisseur. Plus vous avez de preuves, plus la résolution sera rapide.' },
    { q: 'Que se passe-t-il si le fournisseur ne répond pas ?', a: 'Si le fournisseur ne répond pas sous 48h, la décision est automatiquement en votre faveur et un remboursement est initié.' },
    { q: 'Puis-je faire appel d\'une décision ?', a: 'Oui, vous avez 72h après la décision pour soumettre un appel avec de nouvelles preuves. Une équipe senior réexaminera le dossier.' },
  ];

  openFaq = -1;
  toggleFaq(i: number): void { this.openFaq = this.openFaq === i ? -1 : i; }

  constructor(private router: Router) {}
  goLogin(): void   { this.router.navigate(['/auth/login']); }
  goContact(): void { this.router.navigate(['/contact']); }
}
