import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { GroupService }    from '../../../core/services/group.service';
import { ProductService }  from '../../../core/services/product.service';
import { FormatService }   from '../../../core/services/format.service';
import { Group, Product } from '../../../core/models';

const API = 'http://localhost:3000/api/v1';

@Component({
  selector: 'app-supplier-groups',
  templateUrl: './supplier-groups.component.html',
  styleUrls:  ['./supplier-groups.component.scss']
})
export class SupplierGroupsComponent implements OnInit {
  groups:   Group[] = [];
  filtered: Group[] = [];
  myProducts: Product[] = [];
  loading         = true;
  creating        = false;
  activeTab       = 'Tous';
  tabs            = ['Tous', 'Ouverts', 'Seuil atteint', 'Terminés'];
  showCreateModal = false;

  // ── Formulaire création groupe ────────────────────────────────
  newGroup = {
    productId:       '',
    minParticipants: 10,
    maxParticipants: 100,
    durationDays:    7,
    depositPercent:  0.10,
    pricingTiers:    [
      { participantCount: 5,  discountPercent: 10 },
      { participantCount: 10, discountPercent: 20 },
      { participantCount: 20, discountPercent: 30 },
    ],
  };

  constructor(
    private http:           HttpClient,
    private groupService:   GroupService,
    private productService: ProductService,
    public  fmt:            FormatService,
    private router:         Router,
  ) {}

  ngOnInit(): void {
    this.loadGroups();
    this.loadMyProducts();
  }

  // ── GET /supplier/groups ──────────────────────────────────────
  private loadGroups(): void {
    this.loading = true;
    this.http.get<any>(`${API}/supplier/groups`, { params: { limit: 100 } }).subscribe({
      next: (res) => {
        const data     = res.data?.groups ?? res.data ?? [];
        this.groups    = data.map((g: any) => this.groupService.mapGroup(g));
        this.filtered  = this.groups;
        this.loading   = false;
      },
      error: () => { this.loading = false; }
    });
  }

  // ── GET /supplier/products → pour le select du modal ─────────
  private loadMyProducts(): void {
    this.http.get<any>(`${API}/supplier/products`, { params: { status: 'APPROVED', limit: 50 } }).subscribe({
      next: (res) => {
        this.myProducts = res.data?.products ?? res.data ?? [];
        if (this.myProducts.length > 0) {
          this.newGroup.productId = (this.myProducts[0] as any).id ?? '';
        }
      },
      error: () => {}
    });
  }

  // ── POST /supplier/groups ─────────────────────────────────────
  createGroup(): void {
    if (!this.newGroup.productId || this.creating) return;

    this.creating = true;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + this.newGroup.durationDays);

    const payload = {
      productId:       this.newGroup.productId,
      minParticipants: this.newGroup.minParticipants,
      maxParticipants: this.newGroup.maxParticipants,
      depositPercent:  this.newGroup.depositPercent,
      expiresAt:       expiresAt.toISOString(),
      pricingTiers:    this.newGroup.pricingTiers,
    };

    this.http.post<any>(`${API}/supplier/groups`, payload).subscribe({
      next: (res) => {
        const newG = this.groupService.mapGroup(res.data);
        this.groups.unshift(newG);
        this.filtered = this.groups;
        this.showCreateModal = false;
        this.creating = false;
      },
      error: () => { this.creating = false; }
    });
  }

  setTab(t: string): void {
    this.activeTab = t;
    const map: Record<string, string> = {
      'Ouverts':       'OPEN',
      'Seuil atteint': 'THRESHOLD_REACHED',
      'Terminés':      'COMPLETED',
    };
    this.filtered = t === 'Tous'
      ? this.groups
      : this.groups.filter(g => g.status === map[t]);
  }

  pct(g: Group): number     { return this.fmt.progressPercent(g.currentCount, g.minParticipants); }
  isHot(g: Group): boolean  { return g.status === 'THRESHOLD_REACHED'; }

  goDetail(g: Group): void  { this.router.navigate(['/supplier/groups', g.id]); }
}