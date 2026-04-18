import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { GroupService } from '../../../core/services/group.service';
import { MockDataService } from '../../../core/services/mock-data.service';
import { Group } from '../../../core/models';

export interface Slide {
  badge:     string;
  title:     string;
  highlight: string;
  sub:       string;
  cta:       string;
  ctaSec:    string;
  tag:       string;
  tagIcon:   string;
  discount:  string;
  bg:        string;
  accent:    string;
  emoji:     string;
  stat1Val:  string; stat1Lbl: string;
  stat2Val:  string; stat2Lbl: string;
}

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit, OnDestroy {
  groups:  Group[] = [];
  loading  = true;

  // Animated counters
  membersCount = 0;
  groupsCount  = 0;
  savedAmount  = 0;
  private targets = { members: 5247, groups: 320, saved: 48500000 };
  private animTimer?: ReturnType<typeof setInterval>;

  testimonials = this.mock.testimonials;

  howItWorks = [
    { n: '01', icon: 'fa-solid fa-crosshairs',           title: 'Choisissez un groupe', desc: 'Parcourez les groupes actifs et trouvez le produit qui vous intéresse.' },
    { n: '02', icon: 'fa-solid fa-mobile-screen-button', title: 'Payez votre dépôt',   desc: 'Verrouillez votre place en payant seulement 10% via Orange Money.' },
    { n: '03', icon: 'fa-solid fa-users-line',           title: 'Le seuil est atteint', desc: 'Quand assez de membres rejoignent, le prix baisse automatiquement !' },
    { n: '04', icon: 'fa-solid fa-box-open',             title: 'Recevez votre produit', desc: 'Payez le solde et recevez votre commande à Ouagadougou.' },
  ];

  stats = [
    { val: '5 247+',    label: 'Membres actifs',  icon: 'fa-solid fa-users' },
    { val: '89%',       label: 'Taux de succès',  icon: 'fa-solid fa-trophy' },
    { val: '320+',      label: 'Groupes réussis', icon: 'fa-solid fa-circle-check' },
    { val: '48.5M XOF', label: 'Économisés',      icon: 'fa-solid fa-sack-dollar' },
  ];

  paymentMethods = [
    { label: 'Orange Money', icon: 'fa-solid fa-mobile-screen-button', color: '#FF6B00' },
    { label: 'Moov Money',   icon: 'fa-solid fa-mobile-screen-button', color: '#0066CC' },
    { label: 'Ligdicash',    icon: 'fa-solid fa-mobile-screen-button', color: '#00A651' },
    { label: 'Carte',        icon: 'fa-solid fa-credit-card',          color: '#6B7280' },
  ];

  private animTimer?: ReturnType<typeof setInterval>;

  constructor(
    private groupService: GroupService,
    public  mock: MockDataService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    // CORRECTION : getActiveGroups n'existe plus → utiliser getAll avec status OPEN
    this.groupService.getAll({ status: 'OPEN' }).subscribe({
      next: (g: Group[]) => {
        this.groups  = g.slice(0, 3); // Seulement 3 groupes sur la landing
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });

    this.startCounters();
  }

  ngOnDestroy(): void {
    this.stopSlider();
    if (this.animTimer) clearInterval(this.animTimer);
  }

  private startCounters(): void {
    let progress = 0;
    this.animTimer = setInterval(() => {
      progress += 0.03;
      if (progress >= 1) { progress = 1; clearInterval(this.animTimer); }
      const ease        = 1 - Math.pow(1 - progress, 3);
      this.membersCount = Math.floor(this.targets.members * ease);
      this.groupsCount  = Math.floor(this.targets.groups  * ease);
      this.savedAmount  = Math.floor(this.targets.saved   * ease);
    }, 16);
  }

  /* ── Navigation ─────────────────────────────────────────────── */
  goToGroups():   void { this.router.navigate(['/groups']); }
  goToCatalog():  void { this.router.navigate(['/catalog']); }
  goToRegister(): void { this.router.navigate(['/auth/register']); }

  onJoinGroup(group: Group): void { this.router.navigate(['/groups', group.id]); }

  formatSaved(): string {
    return (this.savedAmount / 1_000_000).toFixed(1) + 'M';
  }
}
