import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
  year = new Date().getFullYear();
  footerLinks = [
    { title:'Acheter', links:['Groupes actifs','Catalogue','Nouveautés','Promotions','Comment ça marche'] },
    { title:'Vendre', links:['Devenir fournisseur','Créer un groupe','Gérer vos produits','Conditions vendeur'] },
    { title:'Aide', links:['FAQ','Nous contacter','Politique retours','Livraison','Litiges'] },
  ];
}
