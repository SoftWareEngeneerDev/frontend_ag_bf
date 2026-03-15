import { Component } from '@angular/core';
import { MockDataService } from '../../../core/services/mock-data.service';

@Component({
  selector: 'app-admin-analytics',
  templateUrl: './admin-analytics.component.html',
  styleUrls:  ['./admin-analytics.component.scss']
})
export class AdminAnalyticsComponent {
  activeRange = '3 mois';
  ranges = ['7 jours','30 jours','3 mois','1 an'];

  kpis = [
    { val:'3.24M XOF', label:'Revenus',          color:'#F5A623', delta:'+18%' },
    { val:'226 800 XOF',label:'Commissions',     color:'#10D98B', delta:'+18%' },
    { val:'847',       label:'Nouveaux membres', color:'#00D4FF', delta:'+34%' },
    { val:'89%',       label:'Taux de succès',   color:'#10D98B', delta:'+3pts' },
  ];

  categories = [
    { name:'Électronique',  pct:78, icon:'📱' },
    { name:'Alimentaire',   pct:62, icon:'🌾' },
    { name:'Textile & Mode',pct:45, icon:'👗' },
    { name:'Maison & Jardin',pct:38,icon:'🏠' },
    { name:'Santé & Beauté',pct:22, icon:'💊' },
  ];

  gauges = [
    { val:'89%',  label:'Taux succès',   color:'#10D98B', pct:89 },
    { val:'4.7/5',label:'Satisfaction',  color:'#F5A623', pct:94 },
    { val:'72',   label:'NPS score',     color:'#00D4FF', pct:72 },
  ];

  topSuppliers = [
    { name:'Tech Ouaga SARL',  rev:'2.45M XOF', groups:'12 groupes' },
    { name:'Confort BF',       rev:'890k XOF',  groups:'5 groupes'  },
    { name:'Agri Faso',        rev:'654k XOF',  groups:'8 groupes'  },
  ];

  constructor(public mock: MockDataService) {}
}
