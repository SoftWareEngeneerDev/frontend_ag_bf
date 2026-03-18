import { Component, OnInit } from '@angular/core';
import { FormatService } from '../../../core/services/format.service';

@Component({
  selector: 'app-supplier-orders',
  templateUrl: './supplier-orders.component.html',
  styleUrls:  ['./supplier-orders.component.scss']
})
export class SupplierOrdersComponent implements OnInit {
  orders: any[] = [];
  filtered: any[] = [];
  activeTab = 'Toutes';
  tabs = ['Toutes','À confirmer','En préparation','Expédiées','Livrées'];

  mockOrders = [
    { id:'CMD-2024-0901', group:'Groupe Samsung A55',    product:'Samsung Galaxy A55 5G', icon:'fa-solid fa-mobile-screen-button', qty:10, amount:1886000, status:'CREATED',    buyer:'Kofi Traoré',      date:'2024-03-15' },
    { id:'CMD-2024-0887', group:'Groupe TV 4K',          product:'TV LED 55" 4K',         icon:'fa-solid fa-tv',                   qty:5,  amount:1075000, status:'CONFIRMED',   buyer:'Moussa Ouédraogo', date:'2024-03-14' },
    { id:'CMD-2024-0856', group:'Groupe Climatiseur',    product:'Climatiseur 12000 BTU', icon:'fa-solid fa-wind',                 qty:6,  amount:780000,  status:'PROCESSING',  buyer:'Aminata Sawadogo', date:'2024-03-12' },
    { id:'CMD-2024-0823', group:'Groupe Riz Basmati',    product:'Riz Local 50kg',        icon:'fa-solid fa-wheat-awn',            qty:20, amount:330000,  status:'SHIPPED',     buyer:'Fatou Compaoré',   date:'2024-03-08' },
    { id:'CMD-2024-0791', group:'Groupe Bogolan',        product:'Tenue Bogolan Femme',   icon:'fa-solid fa-shirt',               qty:8,  amount:200000,  status:'DELIVERED',   buyer:'Ibrahim Kaboré',   date:'2024-03-05' },
  ];

  constructor(public fmt: FormatService) {}

  ngOnInit(): void { this.orders = this.filtered = this.mockOrders; }

  setTab(t: string): void {
    this.activeTab = t;
    const map: Record<string,string> = {
      'À confirmer':'CREATED', 'En préparation':'PROCESSING',
      'Expédiées':'SHIPPED',   'Livrées':'DELIVERED'
    };
    this.filtered = t === 'Toutes' ? this.orders : this.orders.filter(o => o.status === map[t]);
  }

  statusClass(s: string): string {
    return this.fmt.orderStatusClass(s as any);
  }
  statusLabel(s: string): string {
    return this.fmt.orderStatusLabel(s as any);
  }

  nextAction(s: string): string {
    const m: Record<string,string> = { CREATED:'Confirmer', CONFIRMED:'Préparer', PROCESSING:'Expédier', SHIPPED:'Marquer livré' };
    return m[s] || '';
  }
}
