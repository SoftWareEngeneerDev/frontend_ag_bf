import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { GroupService } from '../../../core/services/group.service';
import { MockDataService } from '../../../core/services/mock-data.service';
import { SeoService } from '../../../core/services/seo.service';
import { Group } from '../../../core/models';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit, OnDestroy {
  groups:  Group[] = [];
  loading  = true;

  promosBanners = [
    { label: 'Électronique',  sub: 'Jusqu\'à -45%',    icon: 'fa-solid fa-laptop',           bg: 'linear-gradient(135deg,#1e3a5f,#2563eb)' },
    { label: 'Alimentation',  sub: 'Groupes actifs',   icon: 'fa-solid fa-basket-shopping',  bg: 'linear-gradient(135deg,#14532d,#16a34a)' },
    { label: 'Mobilier',      sub: 'Nouveaux groupes', icon: 'fa-solid fa-couch',             bg: 'linear-gradient(135deg,#7c2d12,#ea580c)' },
    { label: 'Mode & Textile',sub: 'Flash sale',       icon: 'fa-solid fa-shirt',             bg: 'linear-gradient(135deg,#4a044e,#a21caf)' },
  ];

  categoryFilters = ['Tous', 'Électronique', 'Alimentation', 'Mobilier', 'Mode'];
  activeCategory  = 'Tous';
  private allGroups: Group[] = [];

  membersCount = 0;
  savedAmount  = 0;
  private targets = { members: 5247, saved: 48500000 };
  private animTimer?: ReturnType<typeof setInterval>;

  testimonials = this.mock.testimonials;

  constructor(
    private groupService: GroupService,
    public  mock: MockDataService,
    private router: Router,
    private seo: SeoService,
  ) {}

  ngOnInit(): void {
    this.seo.setPage({
      title      : 'Accueil — Achats Groupés au Burkina Faso',
      description: 'Djula Market — Rejoignez des groupes d\'achat et économisez jusqu\'à 40% sur vos achats. Paiement Orange Money, Moov Money, Ligdicash.',
    });

    this.groupService.getAll({ status: 'OPEN' }).subscribe({
      next: (g: Group[]) => {
        this.allGroups = g;
        this.groups    = g.slice(0, 4);
        this.loading   = false;
      },
      error: () => { this.loading = false; }
    });

    this.startCounters();
  }

  ngOnDestroy(): void {
    if (this.animTimer) clearInterval(this.animTimer);
  }

  private startCounters(): void {
    let progress = 0;
    this.animTimer = setInterval(() => {
      progress += 0.03;
      if (progress >= 1) { progress = 1; clearInterval(this.animTimer); }
      const ease        = 1 - Math.pow(1 - progress, 3);
      this.membersCount = Math.floor(this.targets.members * ease);
      this.savedAmount  = Math.floor(this.targets.saved   * ease);
    }, 16);
  }

  filterByCategory(cat: string): void {
    this.activeCategory = cat;
    if (cat === 'Tous') {
      this.groups = this.allGroups.slice(0, 3);
    } else {
      this.groups = this.allGroups
        .filter(g => g.product?.category?.name?.toLowerCase().includes(cat.toLowerCase()))
        .slice(0, 4);
    }
  }

  goToGroups():     void { this.router.navigate(['/groups']); }
  goToCatalog():    void { this.router.navigate(['/catalog']); }
  goToRegister():   void { this.router.navigate(['/auth/register']); }
  goToHowItWorks(): void { this.router.navigate(['/how-it-works']); }

  onJoinGroup(group: Group): void { this.router.navigate(['/groups', group.id]); }

  formatSaved(): string {
    return (this.savedAmount / 1_000_000).toFixed(1) + 'M';
  }

  progressPct(group: Group): number {
    if (!group.minParticipants) return 0;
    return Math.min(100, Math.round((group.currentCount / group.minParticipants) * 100));
  }
}
