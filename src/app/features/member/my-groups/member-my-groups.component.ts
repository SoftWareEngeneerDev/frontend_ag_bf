import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GroupService }  from '../../../core/services/group.service';
import { FormatService } from '../../../core/services/format.service';
import { Group } from '../../../core/models';

@Component({
  selector: 'app-my-groups',
  templateUrl: './member-my-groups.component.html',
  styleUrls:  ['./member-my-groups.component.scss']
})
export class MyGroupsComponent implements OnInit {
  groups:   Group[] = [];
  filtered: Group[] = [];
  loading = true;
  activeTab = 'all';
  tabList = [
    { key:'all',       icon:'fa-solid fa-list',         label:'Tous',        count:0 },
    { key:'open',      icon:'fa-solid fa-clock',        label:'Actifs',      count:0 },
    { key:'threshold', icon:'fa-solid fa-fire',         label:'Seuil atteint', count:0 },
    { key:'done',      icon:'fa-solid fa-circle-check', label:'Terminés',    count:0 },
  ];

  constructor(
    private groupService: GroupService,
    public  fmt: FormatService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.groupService.getMyGroups().subscribe(g => {
      this.groups   = g;
      this.filtered = g;
      this.loading  = false;
      this.tabList[0].count = g.length;
      this.tabList[1].count = g.filter(x => x.status === 'OPEN').length;
      this.tabList[2].count = g.filter(x => x.status === 'THRESHOLD_REACHED').length;
      this.tabList[3].count = g.filter(x => x.status === 'COMPLETED').length;
    });
  }

  setTab(key: string): void {
    this.activeTab = key;
    if (key === 'open')      this.filtered = this.groups.filter(g => g.status === 'OPEN');
    else if (key === 'threshold') this.filtered = this.groups.filter(g => g.status === 'THRESHOLD_REACHED');
    else if (key === 'done') this.filtered = this.groups.filter(g => g.status === 'COMPLETED');
    else                     this.filtered = this.groups;
  }

  pct(g: Group): number { return this.fmt.progressPercent(g.currentCount, g.minParticipants); }
  isHot(g: Group): boolean { return g.status === 'THRESHOLD_REACHED'; }

  onJoin(g: Group):    void { g.status === 'THRESHOLD_REACHED' ? this.router.navigate(['/member/payment']) : this.goDetail(g); }
  goDetail(g: Group):  void { this.router.navigate(['/groups', g.id]); }
}
