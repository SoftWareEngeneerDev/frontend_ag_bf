import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { GroupService } from '../../../core/services/group.service';
import { Group } from '../../../core/models';

@Component({
  selector: 'app-groups',
  templateUrl: './groups.component.html',
  styleUrls: ['./groups.component.scss']
})
export class GroupsComponent implements OnInit {
  groups:   Group[] = [];
  filtered: Group[] = [];
  loading   = true;
  activeTab = 'Tous';
  search    = '';

  tabs = ['Tous', 'Seuil atteint', 'Expirent bientôt', 'Électronique', 'Alimentaire', 'Maison & Jardin'];

  constructor(
    private groupService: GroupService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    // Récupérer le productId depuis les query params si vient du catalogue
    const productId = this.route.snapshot.queryParams['productId'] as string | undefined;
    this.loadGroups(productId);
  }

  loadGroups(productId?: string): void {
    this.loading = true;

    // CORRECTION : passer productId séparément (pas dans le type params de getAll)
    this.groupService.getAll({ productId }).subscribe({
      next: (groups) => {
        this.groups  = groups;
        this.apply();
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  apply(): void {
    let data = [...this.groups];

    if (this.activeTab === 'Seuil atteint') {
      data = data.filter(g => g.status === 'THRESHOLD_REACHED');
    }
    if (this.activeTab === 'Expirent bientôt') {
      data = data.filter(g =>
        new Date(g.expiresAt).getTime() - Date.now() < 48 * 3600000
      );
    }
    if (this.activeTab === 'Électronique') {
      data = data.filter(g => g.product.category.name === 'Électronique');
    }
    if (this.activeTab === 'Alimentaire') {
      data = data.filter(g => g.product.category.name === 'Alimentaire');
    }
    if (this.activeTab === 'Maison & Jardin') {
      data = data.filter(g => g.product.category.name === 'Maison & Jardin');
    }

    if (this.search) {
      data = data.filter(g =>
        g.product.name.toLowerCase().includes(this.search.toLowerCase())
      );
    }

    this.filtered = data;
  }

  setTab(t: string): void   { this.activeTab = t; this.apply(); }
  onSearch(v: string): void { this.search = v; this.apply(); }

  onJoin(g: Group):    void { this.router.navigate(['/groups', g.id]); }
  onDetails(g: Group): void { this.router.navigate(['/groups', g.id]); }
}