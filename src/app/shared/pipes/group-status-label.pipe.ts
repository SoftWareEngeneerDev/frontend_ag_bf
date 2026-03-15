import { Pipe, PipeTransform } from '@angular/core';
import { GroupStatus } from '../../core/models';

@Pipe({ name: 'groupStatusLabel' })
export class GroupStatusLabelPipe implements PipeTransform {
  transform(s: GroupStatus): string {
    const m: Record<GroupStatus, string> = {
      OPEN:'Ouvert', THRESHOLD_REACHED:'Seuil atteint',
      PAYMENT_PENDING:'Paiement en attente', PROCESSING:'En traitement',
      COMPLETED:'Terminé', CANCELLED:'Annulé', EXPIRED:'Expiré',
    };
    return m[s] || s;
  }
}
