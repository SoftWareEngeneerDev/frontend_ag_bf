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

  /* ── Slider ─────────────────────────────────────────────────── */
  currentSlide = 0;
  isAnimating  = false;
  private slideTimer?: ReturnType<typeof setInterval>;

  slides: Slide[] = [
    {
      badge:     '🔥 Offres du moment',
      title:     'Achetez ensemble,',
      highlight: 'économisez jusqu\'à 40%',
      sub:       'Rejoignez un groupe actif et bénéficiez de prix de gros dès aujourd\'hui.',
      cta:       'Voir les offres',
      ctaSec:    'Créer un compte',
      tag:       'Électronique',
      tagIcon:   'fa-solid fa-mobile-screen-button',
      discount:  '-40%',
      bg:        'linear-gradient(140deg, #0DA487 0%, #07836C 45%, #064E3B 100%)',
      accent:    '#FFD700',
      emoji:     '📱',
      stat1Val: '5 247', stat1Lbl: 'Membres actifs',
      stat2Val: '48.5M XOF', stat2Lbl: 'Économisés',
    },
    {
      badge:     '⚡ Flash Deal — 24h seulement',
      title:     'Électroménager premium',
      highlight: 'au prix de gros',
      sub:       'Climatiseurs, réfrigérateurs, cuisinières — groupez votre achat et économisez gros.',
      cta:       'Rejoindre le groupe',
      ctaSec:    'Voir le catalogue',
      tag:       'Électroménager',
      tagIcon:   'fa-solid fa-blender',
      discount:  '-35%',
      bg:        'linear-gradient(140deg, #1a0533 0%, #7B2FBE 55%, #4C1D95 100%)',
      accent:    '#C4B5FD',
      emoji:     '🏠',
      stat1Val: '320+', stat1Lbl: 'Groupes réussis',
      stat2Val: '89%',  stat2Lbl: 'Taux de succès',
    },
    {
      badge:     '📦 Livraison groupée',
      title:     'Alimentation & produits',
      highlight: 'de première nécessité',
      sub:       'Riz, huile, sucre, farine — achetez en gros avec vos voisins et divisez les coûts.',
      cta:       'Voir les groupes',
      ctaSec:    'Comment ça marche ?',
      tag:       'Alimentation',
      tagIcon:   'fa-solid fa-wheat-awn',
      discount:  '-27%',
      bg:        'linear-gradient(140deg, #92400E 0%, #D97706 50%, #FF8C00 100%)',
      accent:    '#FDE68A',
      emoji:     '🌾',
      stat1Val: '10j',     stat1Lbl: 'Délai livraison moy.',
      stat2Val: 'Gratuit', stat2Lbl: 'Frais d\'inscription',
    },
    {
      badge:     '💳 Orange Money & Moov',
      title:     'Paiement 100% mobile,',
      highlight: 'sécurisé & instantané',
      sub:       'Réglez votre dépôt en quelques secondes depuis votre téléphone. Simple, rapide, fiable.',
      cta:       'S\'inscrire gratuitement',
      ctaSec:    'Voir les groupes',
      tag:       'Paiement facile',
      tagIcon:   'fa-solid fa-shield-halved',
      discount:  '100%',
      bg:        'linear-gradient(140deg, #0f172a 0%, #1e3a5f 50%, #1d4ed8 100%)',
      accent:    '#93C5FD',
      emoji:     '💳',
      stat1Val: '4',        stat1Lbl: 'Modes de paiement',
      stat2Val: '< 2 min',  stat2Lbl: 'Durée inscription',
    },
  ];

  /* ── Produits ───────────────────────────────────────────────── */
  allGroups:     Group[] = [];
  groups:        Group[] = [];
  loading        = true;
  activeCategory = 'Tous';

  promosBanners = [
    { label:'🔥 Offres Flash',      sub:'Jusqu\'à -48%',       bg:'linear-gradient(135deg,#E63946,#C1121F)', icon:'fa-solid fa-bolt' },
    { label:'📦 Livraison offerte',  sub:'Groupes 10+ membres', bg:'linear-gradient(135deg,#0DA487,#065F46)', icon:'fa-solid fa-truck' },
    { label:'💳 Orange Money',       sub:'Paiement en 1 clic',  bg:'linear-gradient(135deg,#FF8C00,#FF6B00)', icon:'fa-solid fa-mobile-screen-button' },
  ];

  private animTimer?: ReturnType<typeof setInterval>;

  constructor(
    private groupService: GroupService,
    public  mock: MockDataService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.groupService.getActiveGroups().subscribe(g => {
      this.allGroups = g;
      this.groups    = g;
      this.loading   = false;
    });
    this.startSlider();
  }

  ngOnDestroy(): void {
    this.stopSlider();
    if (this.animTimer) clearInterval(this.animTimer);
  }

  /* ── Slider logic ───────────────────────────────────────────── */
  private startSlider(): void {
    this.slideTimer = setInterval(() => this.nextSlide(), 5000);
  }

  private stopSlider(): void {
    if (this.slideTimer) clearInterval(this.slideTimer);
  }

  goToSlide(index: number): void {
    if (this.isAnimating || index === this.currentSlide) return;
    this.stopSlider();
    this.isAnimating = true;
    this.currentSlide = index;
    setTimeout(() => { this.isAnimating = false; this.startSlider(); }, 600);
  }

  nextSlide(): void {
    const next = (this.currentSlide + 1) % this.slides.length;
    this.goToSlide(next);
  }

  prevSlide(): void {
    const prev = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
    this.goToSlide(prev);
  }

  onSlideAction(slide: Slide): void {
    if (slide.tag === 'Paiement facile') { this.router.navigate(['/auth/register']); }
    else { this.router.navigate(['/groups']); }
  }

  onSlideSecAction(slide: Slide): void {
    if (slide.ctaSec.includes('compte')) { this.router.navigate(['/auth/register']); }
    else if (slide.ctaSec.includes('marche')) { this.router.navigate(['/how-it-works']); }
    else { this.router.navigate(['/catalog']); }
  }

  /* ── Filtres catégories ─────────────────────────────────────── */
  get categoryFilters(): string[] {
    return ['Tous', ...new Set(this.allGroups.map(g => g.product.category.name))];
  }

  filterByCategory(cat: string): void {
    this.activeCategory = cat;
    this.groups = cat === 'Tous'
      ? this.allGroups
      : this.allGroups.filter(g => g.product.category.name === cat);
  }

  /* ── Navigation ─────────────────────────────────────────────── */
  goToGroups():   void { this.router.navigate(['/groups']); }
  goToCatalog():  void { this.router.navigate(['/catalog']); }
  goToRegister(): void { this.router.navigate(['/auth/register']); }
  onJoinGroup(group: Group): void { this.router.navigate(['/groups', group.id]); }
}
