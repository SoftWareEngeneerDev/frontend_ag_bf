import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
  year = new Date().getFullYear();

  legalInfo = {
    rccm:    'BF OUA 2013 A4048',
    ifu:     '00049036A',
    address: 'Av Larlé Naaba, Ouagadougou Secteur 10',
    email:   'mamadi776@gmail.com',
    phone:   '+226 05 33 23 10',
  };

  footerLinks = [
    {
      title: 'Plateforme',
      links: [
        { label: 'Groupes actifs',    route: '/groups' },
        { label: 'Catalogue',         route: '/catalog' },
        { label: 'Comment ça marche', route: '/how-it-works' },
      ]
    },
    {
      title: 'Entreprise',
      links: [
        { label: 'Fournisseur',       route: '/auth/register' },
        { label: 'Carrières',         route: '/carrieres' },
        { label: 'Blog',              route: '/blog' },
      ]
    },
    {
      title: 'Aide',
      links: [
        { label: 'FAQ',               route: '/faq' },
        { label: 'Nous contacter',    route: '/contact' },
        { label: 'Politique retours', route: '/retours' },
        { label: 'Livraisons',        route: '/livraison' },
        { label: 'Litiges',           route: '/litiges' },
      ]
    },
  ];
}
