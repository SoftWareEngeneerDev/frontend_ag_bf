import { Pipe, PipeTransform } from '@angular/core';
import { OrderStatus } from '../../core/models';

@Pipe({ name: 'orderStatusLabel' })
export class OrderStatusLabelPipe implements PipeTransform {
  transform(s: OrderStatus): string {
    const m: Record<OrderStatus, string> = {
      CREATED:'Créée', PROCESSING:'En préparation',
      SHIPPED:'Expédiée', DELIVERED:'Livrée', CANCELLED:'Annulée',
    };
    return m[s] || s;
  }
}
