import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Subject, takeUntil } from 'rxjs';
import { GroupService }   from '../../../core/services/group.service';
import { FormatService }  from '../../../core/services/format.service';
import { Group, Product } from '../../../core/models';

const API = 'http://localhost:3000/api/v1';

const TAB_STATUS_MAP: Record<string, string> = {
  'Ouverts'       : 'OPEN',
  'Seuil atteint' : 'THRESHOLD_REACHED',
  'En traitement' : 'PROCESSING',
  'Terminés'      : 'COMPLETED',
};

@Component({
  selector: 'app-supplier-groups',
  templateUrl: './supplier-groups.component.html',
  styleUrls:  ['./supplier-groups.component.scss']
})
export class SupplierGroupsComponent implements OnInit, OnDestroy {
  groups     : Group[]   = [];
  filtered   : Group[]   = [];
  myProducts : Product[] = [];
  loading         = true;
  creating        = false;
  activeTab       = 'Tous';
  showCreateModal = false;
  successMsg      = '';
  errorMsg        = '';

  readonly tabs = ['Tous', 'Ouverts', 'Seuil atteint', 'En traitement', 'Terminés'];

  private destroy$ = new Subject<void>();

  // ── Formulaire création groupe ────────────────────────────
  newGroup = {
    productId       : '',
    minParticipants : 10,
    maxParticipants : 100,
    durationDays    : 7,
    depositPercent  : 0.10,
    pricingTiers    : [
      { participantCount: 5,  discountPercent: 10 },
      { participantCount: 10, discountPercent: 20 },
      { participantCount: 20, discountPercent: 30 },
    ],
  };

  constructor(
    private http        : HttpClient,
    private groupService: GroupService,
    public  fmt         : FormatService,
    private router      : Router,
  ) {}

  ngOnInit(): void {
    this.loadGroups();
    this.loadMyProducts();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Charger les groupes ───────────────────────────────────
  private loadGroups(): void {
    this.loading = true;
    this.http.get<any>(`${API}/supplier/groups`, { params: { limit: '100' } })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          const data    = res.data ?? [];
          this.groups   = data.map((g: any) => this.groupService.mapGroup(g));
          this.applyFilter();
          this.loading  = false;
        },
        error: () => { this.loading = false; }
      });
  }

  // ── Charger mes produits approuvés ────────────────────────
  private loadMyProducts(): void {
    this.http.get<any>(`${API}/supplier/products`, { params: { status: 'ACTIVE', limit: '50' } })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.myProducts = res.data ?? [];
          if (this.myProducts.length > 0) {
            this.newGroup.productId = (this.myProducts[0] as any).id ?? '';
          }
        },
        error: () => {}
      });
  }

  // ── Créer un groupe ───────────────────────────────────────
  createGroup(): void {
    if (!this.newGroup.productId || this.creating) return;
    this.creating = true;

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + this.newGroup.durationDays);

    this.http.post<any>(`${API}/supplier/groups`, {
      productId      : this.newGroup.productId,
      minParticipants: this.newGroup.minParticipants,
      maxParticipants: this.newGroup.maxParticipants,
      depositPercent : this.newGroup.depositPercent,
      expiresAt      : expiresAt.toISOString(),
      pricingTiers   : this.newGroup.pricingTiers,
    })
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (res) => {
        const newG = this.groupService.mapGroup(res.data);
        this.groups.unshift(newG);
        this.applyFilter();
        this.showCreateModal = false;
        this.creating        = false;
        this.showSuccess('Groupe créé avec succès !');
      },
      error: (err) => {
        this.creating = false;
        this.showError(err?.error?.error?.message ?? 'Erreur lors de la création du groupe');
      }
    });
  }

  // ── Filtre ────────────────────────────────────────────────
  private applyFilter(): void {
    if (this.activeTab === 'Tous') {
      this.filtered = this.groups;
    } else {
      const status  = TAB_STATUS_MAP[this.activeTab];
      this.filtered = this.groups.filter(g => g.status === status);
    }
  }

  setTab(t: string): void { this.activeTab = t; this.applyFilter(); }

  // ── Compteurs par onglet ──────────────────────────────────
  tabCount(t: string): number {
    if (t === 'Tous') return this.groups.length;
    const status = TAB_STATUS_MAP[t];
    return this.groups.filter(g => g.status === status).length;
  }

  // ── Helpers ───────────────────────────────────────────────
  pct(g: Group)    : number  { return this.fmt.progressPercent(g.currentCount, g.minParticipants); }
  isHot(g: Group)  : boolean { return g.status === 'THRESHOLD_REACHED'; }
  trackById(_: number, g: Group): string { return g.id; }

  goDetail(g: Group): void { this.router.navigate(['/supplier/orders']); }

  private showSuccess(msg: string): void {
    this.successMsg = msg; this.errorMsg = '';
    setTimeout(() => { this.successMsg = ''; }, 3000);
  }

  private showError(msg: string): void {
    this.errorMsg = msg; this.successMsg = '';
    setTimeout(() => { this.errorMsg = ''; }, 4000);
  }
}