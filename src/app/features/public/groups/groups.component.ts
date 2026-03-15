import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GroupService } from '../../../core/services/group.service';
import { MockDataService } from '../../../core/services/mock-data.service';
import { Group, Category, GroupStatus } from '../../../core/models';

@Component({
  selector: 'app-groups',
  templateUrl: './groups.component.html',
  styleUrls: ['./groups.component.scss']
})
export class GroupsComponent implements OnInit {
  groups: Group[]   = [];
  filtered: Group[] = [];
  categories: Category[] = [];
  loading = true;

  activeTab = 'Tous';
  selCat    = '';
  search    = '';

  tabs = ['Tous', 'Seuil atteint', 'Expirent bientôt', 'Électronique', 'Alimentaire', 'Maison & Jardin'];

  constructor(
    private groupService: GroupService,
    private mock: MockDataService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.categories = this.mock.categories;
    this.groupService.getAll().subscribe(g => {
      this.groups = g;
      this.apply();
      this.loading = false;
    });
  }

  apply(): void {
    let data = [...this.groups];
    if (this.activeTab === 'Seuil atteint')     data = data.filter(g => g.status === 'THRESHOLD_REACHED');
    if (this.activeTab === 'Expirent bientôt')  data = data.filter(g => new Date(g.expiresAt).getTime() - Date.now() < 48*3600000);
    if (this.activeTab === 'Électronique')       data = data.filter(g => g.product.category.name === 'Électronique');
    if (this.activeTab === 'Alimentaire')        data = data.filter(g => g.product.category.name === 'Alimentaire');
    if (this.activeTab === 'Maison & Jardin')    data = data.filter(g => g.product.category.name === 'Maison & Jardin');
    if (this.search) data = data.filter(g => g.product.name.toLowerCase().includes(this.search.toLowerCase()));
    this.filtered = data;
  }

  setTab(t: string): void  { this.activeTab = t; this.apply(); }
  onSearch(v: string): void { this.search = v; this.apply(); }

  onJoin(g: Group):    void { this.router.navigate(['/groups', g.id]); }
  onDetails(g: Group): void { this.router.navigate(['/groups', g.id]); }
}
