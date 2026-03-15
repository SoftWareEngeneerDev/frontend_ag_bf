import { Component } from '@angular/core';
import { MockDataService } from '../../../core/services/mock-data.service';
import { Supplier } from '../../../core/models';

@Component({
  selector: 'app-admin-suppliers',
  templateUrl: './admin-suppliers.component.html',
  styleUrls:  ['./admin-suppliers.component.scss']
})
export class AdminSuppliersComponent {
  suppliers: Supplier[];
  activeTab = 'Tous';
  tabs = ['Tous','Approuvés','En attente','Suspendus'];

  constructor(public mock: MockDataService) {
    this.suppliers = mock.suppliers;
  }

  get pendingCount(): number { return this.suppliers.filter(s => s.status === 'PENDING').length; }

  get filtered(): Supplier[] {
    const map: Record<string,string> = { 'Approuvés':'APPROVED','En attente':'PENDING','Suspendus':'SUSPENDED' };
    return this.activeTab === 'Tous' ? this.suppliers : this.suppliers.filter(s => s.status === map[this.activeTab]);
  }

  statusClass(s: string): string {
    return s === 'APPROVED' ? 'badge-ok' : s === 'PENDING' ? 'badge-warn' : 'badge-err';
  }
  statusLabel(s: string): string {
    return s === 'APPROVED' ? '✓ Approuvé' : s === 'PENDING' ? '⏳ En attente' : '✗ Suspendu';
  }
}
