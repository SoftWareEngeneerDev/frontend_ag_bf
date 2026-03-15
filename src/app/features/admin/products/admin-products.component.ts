import { Component } from '@angular/core';
import { MockDataService } from '../../../core/services/mock-data.service';
import { Product } from '../../../core/models';

@Component({
  selector: 'app-admin-products',
  templateUrl: './admin-products.component.html',
  styleUrls: ['./admin-products.component.scss']
})
export class AdminProductsComponent {
  search = '';
  activeTab = 'Tous';
  tabs = ['Tous', 'Actifs', 'En attente', 'Rejetés', 'Inactifs'];

  products: Product[];

  constructor(public mock: MockDataService) {
    this.products = mock.products;
  }

  get filtered(): Product[] {
    const statusMap: Record<string, string> = {
      'Actifs': 'ACTIVE', 'En attente': 'PENDING',
      'Rejetés': 'REJECTED', 'Inactifs': 'INACTIVE'
    };
    return this.products.filter(p => {
      const matchSearch = !this.search ||
        p.name.toLowerCase().includes(this.search.toLowerCase()) ||
        p.supplier.companyName.toLowerCase().includes(this.search.toLowerCase());
      const matchTab = this.activeTab === 'Tous' || p.status === statusMap[this.activeTab];
      return matchSearch && matchTab;
    });
  }

  get activeCount(): number   { return this.products.filter(p => p.status === 'ACTIVE').length; }
  get pendingCount(): number  { return this.products.filter(p => p.status === 'PENDING').length; }
  get rejectedCount(): number { return this.products.filter(p => p.status === 'REJECTED').length; }

  statusClass(s: string): string {
    if (s === 'ACTIVE')   return 'badge-ok';
    if (s === 'PENDING')  return 'badge-warn';
    if (s === 'REJECTED') return 'badge-err';
    return 'badge-grey';
  }

  statusLabel(s: string): string {
    if (s === 'ACTIVE')   return 'Actif';
    if (s === 'PENDING')  return 'En attente';
    if (s === 'REJECTED') return 'Rejeté';
    return 'Inactif';
  }

  formatXOF(val: number): string {
    return val.toLocaleString('fr-FR') + ' XOF';
  }

  starsArray(): number[] {
    return Array.from({ length: 5 }, (_, i) => i);
  }
}
