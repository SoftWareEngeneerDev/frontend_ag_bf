import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GroupService, JoinGroupResult } from '../../../core/services/group.service';
import { AuthService }   from '../../../core/services/auth.service';
import { FormatService } from '../../../core/services/format.service';
import { Group, PricingTier } from '../../../core/models';

@Component({
  selector: 'app-group-detail',
  templateUrl: './group-detail.component.html',
  styleUrls: ['./group-detail.component.scss']
})
export class GroupDetailComponent implements OnInit {
  group?:      Group;
  loading    = true;
  joining    = false;
  errorMsg   = '';
  activeImg  = 0;
  qty        = 1;
  descExpanded = false;

  memberAvatars = ['KT','MO','FD','AB','SC','ST','YT','BK'];
  avatarBgs     = ['#F5A623','#00D4FF','#10D98B','#7B2FBE','#FF4D6A','#FFB347','#F5A623','#00D4FF'];

  get productImages(): string[] {
    if (!this.group) return [];
    const imgs = this.group.product.images;
    return imgs.length >= 2 ? imgs : [
      ...imgs,
      `https://picsum.photos/seed/${this.group.product.id}-b/600/600`,
      `https://picsum.photos/seed/${this.group.product.id}-c/600/600`,
      `https://picsum.photos/seed/${this.group.product.id}-d/600/600`,
    ];
  }

  get descShort(): string {
    const d = this.group?.product.description || '';
    return d.length > 120 ? d.slice(0, 120) + '...' : d;
  }

  stars(rating: number): boolean[] {
    return [1, 2, 3, 4, 5].map(i => i <= Math.round(rating));
  }

  constructor(
    private route:        ActivatedRoute,
    private groupService: GroupService,
    public  auth:         AuthService,
    public  fmt:          FormatService,
    private router:       Router,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) { this.router.navigate(['/groups']); return; }

    this.groupService.getById(id).subscribe({
      next: (g) => {
        this.group   = g;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.router.navigate(['/groups']);
      }
    });
  }

  get pct(): number {
    if (!this.group) return 0;
    return this.fmt.progressPercent(this.group.currentCount, this.group.minParticipants);
  }

  get isThreshold(): boolean {
    return this.group?.status === 'THRESHOLD_REACHED';
  }

  currentTierIndex(tiers: PricingTier[]): number {
    if (!this.group) return 0;
    let idx = 0;
    for (let i = 0; i < tiers.length; i++) {
      if (this.group.currentCount >= tiers[i].minParticipants) idx = i;
    }
    return idx;
  }

  // ── Rejoindre le groupe → POST /groups/:id/join ───────────────
  joinGroup(): void {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/auth/login'], {
        queryParams: { returnUrl: this.router.url }
      });
      return;
    }

    if (!this.group) return;

    this.joining  = true;
    this.errorMsg = '';

    this.groupService.joinGroup(this.group.id).subscribe({
      next: (result: JoinGroupResult) => {  // CORRECTION : type explicite
        this.joining = false;
        this.router.navigate(['/member/payment'], {
          queryParams: {
            groupId:       result.groupId,
            depositAmount: result.depositAmount,  // CORRECTION : propriétés correctes
            currentPrice:  result.currentPrice,
          }
        });
      },
      error: (err) => {
        this.joining  = false;
        const msg     = err?.error?.error?.message;
        this.errorMsg = msg || 'Impossible de rejoindre ce groupe. Réessayez.';
      }
    });
  }

  goBack(): void { this.router.navigate(['/groups']); }
}