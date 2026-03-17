import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Group } from '../../../core/models';
import { FormatService } from '../../../core/services/format.service';

@Component({
  selector: 'app-group-card',
  templateUrl: './group-card.component.html',
  styleUrls: ['./group-card.component.scss']
})
export class GroupCardComponent {
  @Input() group!: Group;
  /** true = vue membre (déjà inscrit) : CTA adapté */
  @Input() memberView = false;
  @Output() join    = new EventEmitter<Group>();
  @Output() details = new EventEmitter<Group>();

  constructor(public fmt: FormatService) {}

  get pct():    number  { return this.fmt.progressPercent(this.group.currentCount, this.group.minParticipants); }
  get isHot():  boolean { return this.group.status === 'THRESHOLD_REACHED'; }

  get imageUrl(): string {
    return this.group.product.images?.[0] ?? `https://picsum.photos/seed/${this.group.product.id}/600/420`;
  }

  /** Returns array of 5 elements: 'full' | 'half' | 'empty' for star rendering */
  get stars(): ('full' | 'half' | 'empty')[] {
    const r = this.group.product.rating ?? 0;
    return [1, 2, 3, 4, 5].map(i => {
      if (r >= i)       return 'full';
      if (r >= i - 0.5) return 'half';
      return 'empty';
    });
  }
}
