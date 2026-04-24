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

  // Slider
  currentSlide = 0;
  private slideTimer?: ReturnType<typeof setInterval>;

  slides: Slide[] = [
    {
      badge: 'Achat groupé · Burkina Faso', title: 'Achetez ensemble,', highlight: 'économisez plus',
      sub: 'Rejoignez des groupes d\'achat et profitez de prix réduits sur des centaines de produits.',
      cta: 'Voir les groupes', ctaSec: 'Comment ça marche ?',
      tag: 'Dès 10% de dépôt', tagIcon: 'fa-solid fa-bolt', discount: '-40%',
      bg: 'linear-gradient(135deg,#1a1a2e 0%,#16213e 100%)', accent: '#f97316',
      emoji: '🛍️', stat1Val: '5 247+', stat1Lbl: 'Membres actifs', stat2Val: '320+', stat2Lbl: 'Groupes réussis',
    },
    {
      badge: 'Orange Money · Moov Money', title: 'Payez facilement', highlight: 'en mobile money',
      sub: 'Orange Money, Moov Money, Ligdicash — payez votre dépôt en quelques secondes.',
      cta: 'Rejoindre un groupe', ctaSec: 'Voir le catalogue',
      tag: 'Paiement sécurisé', tagIcon: 'fa-solid fa-shield-halved', discount: '-35%',
      bg: 'linear-gradient(135deg,#0f2027 0%,#203a43 50%,#2c5364 100%)', accent: '#22d3ee',
      emoji: '📱', stat1Val: '48.5M', stat1Lbl: 'XOF économisés', stat2Val: '89%', stat2Lbl: 'Taux de succès',
    },
    {
      badge: 'Livraison · Ouagadougou', title: 'Recevez votre commande', highlight: 'à domicile',
      sub: 'Livraison rapide à Ouagadougou et dans les grandes villes du Burkina Faso.',
      cta: 'Découvrir les offres', ctaSec: 'S\'inscrire gratuitement',
      tag: 'Livraison incluse', tagIcon: 'fa-solid fa-truck', discount: '-50%',
      bg: 'linear-gradient(135deg,#1f1c2c 0%,#928dab 100%)', accent: '#a78bfa',
      emoji: '📦', stat1Val: '72h', stat1Lbl: 'Délai moyen', stat2Val: '4.8★', stat2Lbl: 'Note fournisseurs',
    },
  ];

  promosBanners = [
    { label: 'Électronique', sub: 'Jusqu\'à -45%', icon: 'fa-solid fa-laptop', bg: 'linear-gradient(135deg,#1e3a5f,#2563eb)' },
    { label: 'Alimentation', sub: 'Groupes actifs', icon: 'fa-solid fa-basket-shopping', bg: 'linear-gradient(135deg,#14532d,#16a34a)' },
    { label: 'Mobilier',     sub: 'Nouveaux groupes', icon: 'fa-solid fa-couch',           bg: 'linear-gradient(135deg,#7c2d12,#ea580c)' },
    { label: 'Mode & Textile', sub: 'Flash sale',    icon: 'fa-solid fa-shirt',            bg: 'linear-gradient(135deg,#4a044e,#a21caf)' },
  ];

  categoryFilters = ['Tous', 'Électronique', 'Alimentation', 'Mobilier', 'Mode'];
  activeCategory  = 'Tous';
  private allGroups: Group[] = [];

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

  constructor(
    private groupService: GroupService,
    public  mock: MockDataService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.groupService.getAll({ status: 'OPEN' }).subscribe({
      next: (g: Group[]) => {
        this.allGroups = g;
        this.groups    = g.slice(0, 3);
        this.loading   = false;
      },
      error: () => { this.loading = false; }
    });

    this.startCounters();
    this.startSlider();
  }

  ngOnDestroy(): void {
    this.stopSlider();
    if (this.animTimer) clearInterval(this.animTimer);
  }

  // ── Slider ────────────────────────────────────────────────────
  private startSlider(): void {
    this.slideTimer = setInterval(() => this.nextSlide(), 5000);
  }

  stopSlider(): void {
    if (this.slideTimer) { clearInterval(this.slideTimer); this.slideTimer = undefined; }
  }

  prevSlide(): void {
    this.stopSlider();
    this.currentSlide = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
    this.startSlider();
  }

  nextSlide(): void {
    this.currentSlide = (this.currentSlide + 1) % this.slides.length;
  }

  goToSlide(i: number): void {
    this.stopSlider();
    this.currentSlide = i;
    this.startSlider();
  }

  onSlideAction(slide: Slide): void {
    if (slide.cta.toLowerCase().includes('groupe')) this.router.navigate(['/groups']);
    else this.router.navigate(['/catalog']);
  }

  onSlideSecAction(slide: Slide): void {
    if (slide.ctaSec.toLowerCase().includes('inscri')) this.router.navigate(['/auth/register']);
    else if (slide.ctaSec.toLowerCase().includes('catalogue')) this.router.navigate(['/catalog']);
    else this.router.navigate(['/how-it-works']);
  }

  // ── Filtres catégories ─────────────────────────────────────────
  filterByCategory(cat: string): void {
    this.activeCategory = cat;
    if (cat === 'Tous') {
      this.groups = this.allGroups.slice(0, 3);
    } else {
      this.groups = this.allGroups
        .filter(g => g.product?.category?.name?.toLowerCase().includes(cat.toLowerCase()))
        .slice(0, 3);
    }
  }

  // ── Compteurs animés ───────────────────────────────────────────
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
