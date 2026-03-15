import { Injectable } from '@angular/core';
import { GroupStatus, OrderStatus, PaymentMethod } from '../models';

@Injectable({ providedIn: 'root' })
export class FormatService {

  currency(n: number | null | undefined): string {
    if (n == null) return '— XOF';
    return n.toLocaleString('fr-FR') + ' XOF';
  }

  percent(n: number): string { return n + '%'; }

  initials(name: string): string {
    return (name || 'U').split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase();
  }

  timeAgo(date: Date | string): string {
    const diff = Date.now() - new Date(date).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1)  return "À l'instant";
    if (m < 60) return `il y a ${m} min`;
    const h = Math.floor(m / 60);
    if (h < 24) return `il y a ${h}h`;
    const d = Math.floor(h / 24);
    return `il y a ${d} jour${d > 1 ? 's' : ''}`;
  }

  groupStatusLabel(s: GroupStatus): string {
    const m: Record<GroupStatus, string> = {
      OPEN:              '● Ouvert',
      THRESHOLD_REACHED: '● Seuil atteint',
      PAYMENT_PENDING:   '● Paiement en attente',
      PROCESSING:        '● En traitement',
      COMPLETED:         '● Terminé',
      CANCELLED:         '● Annulé',
      EXPIRED:           '● Expiré',
    };
    return m[s] || s;
  }

  groupStatusClass(s: GroupStatus): string {
    const m: Record<GroupStatus, string> = {
      OPEN:              'badge-ok',
      THRESHOLD_REACHED: 'badge-gold',
      PAYMENT_PENDING:   'badge-warn',
      PROCESSING:        'badge-cyan',
      COMPLETED:         'badge-ok',
      CANCELLED:         'badge-err',
      EXPIRED:           'badge-grey',
    };
    return m[s] || 'badge-grey';
  }

  orderStatusLabel(s: OrderStatus): string {
    const m: Record<OrderStatus, string> = {
      CREATED:   'Créée',    CONFIRMED: 'Confirmée',
      PROCESSING:'En préparation', SHIPPED:'Expédiée',
      DELIVERED: 'Livrée',  DISPUTED:  'Litige', CANCELLED: 'Annulée',
    };
    return m[s] || s;
  }

  orderStatusClass(s: OrderStatus): string {
    const m: Record<OrderStatus, string> = {
      CREATED:'badge-grey', CONFIRMED:'badge-cyan', PROCESSING:'badge-cyan',
      SHIPPED:'badge-gold', DELIVERED:'badge-ok',   DISPUTED:'badge-err', CANCELLED:'badge-err',
    };
    return m[s] || 'badge-grey';
  }

  paymentMethodLabel(m: PaymentMethod): string {
    const labels: Record<PaymentMethod, string> = {
      ORANGE_MONEY:'Orange Money', MOOV_MONEY:'Moov Money',
      LIGDICASH:'Ligdicash', CARD:'Carte bancaire',
    };
    return labels[m] || m;
  }

  paymentMethodIcon(m: PaymentMethod): string {
    const icons: Record<PaymentMethod, string> = {
      ORANGE_MONEY:'🟠', MOOV_MONEY:'🔵', LIGDICASH:'🟢', CARD:'💳',
    };
    return icons[m] || '💰';
  }

  progressPercent(current: number, total: number): number {
    return Math.min(100, Math.round((current / total) * 100));
  }
}
