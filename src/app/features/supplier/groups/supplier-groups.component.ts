import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GroupService }  from '../../../core/services/group.service';
import { FormatService } from '../../../core/services/format.service';
import { Group } from '../../../core/models';

@Component({
  selector: 'app-supplier-groups',
  templateUrl: './supplier-groups.component.html',
  styleUrls:  ['./supplier-groups.component.scss']
})
export class SupplierGroupsComponent implements OnInit {
  groups:   Group[] = [];
  filtered: Group[] = [];
  loading = true;
  activeTab = 'Tous';
  tabs = ['Tous','Ouverts','Seuil atteint','Terminés'];
  showCreateModal = false;

  constructor(
    private groupService: GroupService,
    public  fmt: FormatService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.groupService.getAll().subscribe(g => {
      this.groups = this.filtered = g;
      this.loading = false;
    });
  }

  setTab(t: string): void {
    this.activeTab = t;
    const map: Record<string,string> = { 'Ouverts':'OPEN', 'Seuil atteint':'THRESHOLD_REACHED', 'Terminés':'COMPLETED' };
    this.filtered = t === 'Tous' ? this.groups : this.groups.filter(g => g.status === map[t]);
  }

  pct(g: Group): number { return this.fmt.progressPercent(g.currentCount, g.minParticipants); }
  isHot(g: Group): boolean { return g.status === 'THRESHOLD_REACHED'; }
}
