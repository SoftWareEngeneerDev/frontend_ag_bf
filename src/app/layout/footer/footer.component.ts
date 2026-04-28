import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
  year = new Date().getFullYear();

  footerLinks = [
    {
      title: 'Acheter',
      links: [
        { label: 'Groupes actifs',      route: '/groups' },
        { label: 'Catalogue',           route: '/catalog' },
        { label: 'Comment ça marche',   route: '/how-it-works' },
      ]
    },
    {
      title: 'Vendre',
      links: [
        { label: 'Devenir fournisseur', route: '/auth/register' },
        { label: 'Créer un groupe',     route: '/auth/register' },
      ]
    },
    {
      title: 'Aide',
      links: [
        { label: 'FAQ',                 route: '/faq' },
        { label: 'Nous contacter',      route: '/contact' },
        { label: 'Politique retours',   route: '/retours' },
        { label: 'Livraison',           route: '/livraison' },
        { label: 'Litiges',             route: '/litiges' },
      ]
    },
  ];
}
