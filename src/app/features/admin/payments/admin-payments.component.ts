import { Component } from '@angular/core';

interface PaymentRow {
  id: string;
  reference: string;
  transactionId: string;
  user: string;
  phone: string;
  product: string;
  groupId: string;
  type: 'DEPOSIT' | 'FINAL' | 'REFUND' | 'COMMISSION';
  status: 'SUCCESS' | 'PENDING' | 'FAILED' | 'REFUNDED';
  method: 'ORANGE_MONEY' | 'MOOV_MONEY' | 'LIGDICASH' | 'CARD';
  amount: number;
  date: string;
}

@Component({
  selector: 'app-admin-payments',
  templateUrl: './admin-payments.component.html',
  styleUrls: ['./admin-payments.component.scss']
})
export class AdminPaymentsComponent {
  search = '';
  activeTab = 'Tous';
  tabs = ['Tous', 'Acomptes', 'Paiements finaux', 'Remboursements', 'Commissions'];

  payments: PaymentRow[] = [
    { id:'pay-001', reference:'TXN-2024-890123', transactionId:'OM-8912',  user:'Kofi Traoré',        phone:'+22676528609', product:'Samsung Galaxy A55 5G',       groupId:'grp-001', type:'DEPOSIT',    status:'SUCCESS',  method:'ORANGE_MONEY', amount:18860,  date:'10 mars 2024'  },
    { id:'pay-002', reference:'TXN-2024-891456', transactionId:'MM-7823',  user:'Aminata Sawadogo',   phone:'+22670112233', product:'Climatiseur Inverter 12000 BTU', groupId:'grp-002', type:'DEPOSIT',    status:'SUCCESS',  method:'MOOV_MONEY',   amount:13000,  date:'8 mars 2024'   },
    { id:'pay-003', reference:'TXN-2024-892371', transactionId:'OM-9234',  user:'Moussa Traoré',      phone:'+22671445566', product:'Climatiseur Inverter 12000 BTU', groupId:'grp-002', type:'FINAL',      status:'SUCCESS',  method:'ORANGE_MONEY', amount:117000, date:'15 mars 2024'  },
    { id:'pay-004', reference:'TXN-2024-893012', transactionId:'OM-9401',  user:'Salimata Ouédraogo', phone:'+22677001122', product:'Riz Local Basmati 50kg',        groupId:'grp-003', type:'DEPOSIT',    status:'SUCCESS',  method:'ORANGE_MONEY', amount:1650,   date:'12 mars 2024'  },
    { id:'pay-005', reference:'TXN-2024-893248', transactionId:'LD-4421',  user:'Adama Kaboré',       phone:'+22676223344', product:'TV LED 55" 4K Smart Android',   groupId:'grp-005', type:'DEPOSIT',    status:'FAILED',   method:'LIGDICASH',    amount:21500,  date:'9 mars 2024'   },
    { id:'pay-006', reference:'TXN-2024-893891', transactionId:'MM-8812',  user:'Fatimata Compaoré',  phone:'+22670998877', product:'Ensemble Bogolan 2 Pièces',     groupId:'grp-004', type:'DEPOSIT',    status:'SUCCESS',  method:'MOOV_MONEY',   amount:2500,   date:'13 mars 2024'  },
    { id:'pay-007', reference:'TXN-2024-894102', transactionId:'OM-9788',  user:'Ibrahim Ouédraogo',  phone:'+22600000002', product:'Samsung Galaxy A55 5G',         groupId:'grp-001', type:'COMMISSION', status:'SUCCESS',  method:'ORANGE_MONEY', amount:5658,   date:'15 mars 2024'  },
    { id:'pay-008', reference:'TXN-2024-894556', transactionId:'OM-9812',  user:'Kofi Traoré',        phone:'+22676528609', product:'TV LED 55" 4K Smart Android',   groupId:'grp-005', type:'FINAL',      status:'PENDING',  method:'ORANGE_MONEY', amount:193500, date:'15 mars 2024'  },
    { id:'pay-009', reference:'TXN-2024-894771', transactionId:'MM-9002',  user:'Moussa Traoré',      phone:'+22671445566', product:'Riz Local Basmati 50kg',        groupId:'grp-003', type:'REFUND',     status:'REFUNDED', method:'MOOV_MONEY',   amount:1650,   date:'14 mars 2024'  },
    { id:'pay-010', reference:'TXN-2024-895021', transactionId:'CARD-112', user:'Aminata Sawadogo',   phone:'+22670112233', product:'Kit Panneaux Solaires 200W',    groupId:'grp-006', type:'DEPOSIT',    status:'SUCCESS',  method:'CARD',         amount:17000,  date:'14 mars 2024'  },
  ];

  get filtered(): PaymentRow[] {
    const typeMap: Record<string, string> = {
      'Acomptes': 'DEPOSIT', 'Paiements finaux': 'FINAL',
      'Remboursements': 'REFUND', 'Commissions': 'COMMISSION'
    };
    return this.payments.filter(p => {
      const q = this.search.toLowerCase();
      const matchSearch = !this.search ||
        p.reference.toLowerCase().includes(q) ||
        p.user.toLowerCase().includes(q) ||
        p.product.toLowerCase().includes(q) ||
        p.transactionId.toLowerCase().includes(q);
      const matchTab = this.activeTab === 'Tous' || p.type === typeMap[this.activeTab];
      return matchSearch && matchTab;
    });
  }

  get totalSuccess(): number {
    return this.payments.filter(p => p.status === 'SUCCESS').reduce((s, p) => s + p.amount, 0);
  }
  get totalPending(): number {
    return this.payments.filter(p => p.status === 'PENDING').reduce((s, p) => s + p.amount, 0);
  }
  get totalRefunded(): number {
    return this.payments.filter(p => p.status === 'REFUNDED').reduce((s, p) => s + p.amount, 0);
  }
  get totalCommissions(): number {
    return this.payments.filter(p => p.type === 'COMMISSION').reduce((s, p) => s + p.amount, 0);
  }

  typeLabel(t: string): string {
    if (t === 'DEPOSIT')    return 'Acompte';
    if (t === 'FINAL')      return 'Paiement final';
    if (t === 'REFUND')     return 'Remboursement';
    return 'Commission';
  }
  typeClass(t: string): string {
    if (t === 'DEPOSIT')    return 'badge-cyan';
    if (t === 'FINAL')      return 'badge-ok';
    if (t === 'REFUND')     return 'badge-warn';
    return 'badge-gold';
  }

  statusLabel(s: string): string {
    if (s === 'SUCCESS')  return 'Succès';
    if (s === 'PENDING')  return 'En attente';
    if (s === 'FAILED')   return 'Échoué';
    return 'Remboursé';
  }
  statusClass(s: string): string {
    if (s === 'SUCCESS')  return 'badge-ok';
    if (s === 'PENDING')  return 'badge-warn';
    if (s === 'FAILED')   return 'badge-err';
    return 'badge-grey';
  }

  methodIcon(m: string): string {
    if (m === 'ORANGE_MONEY') return '🟠';
    if (m === 'MOOV_MONEY')   return '🔵';
    if (m === 'LIGDICASH')    return '🟢';
    return '💳';
  }
  methodLabel(m: string): string {
    if (m === 'ORANGE_MONEY') return 'Orange Money';
    if (m === 'MOOV_MONEY')   return 'Moov Money';
    if (m === 'LIGDICASH')    return 'LigdiCash';
    return 'Carte';
  }

  formatXOF(val: number): string {
    return val.toLocaleString('fr-FR') + ' XOF';
  }
}
