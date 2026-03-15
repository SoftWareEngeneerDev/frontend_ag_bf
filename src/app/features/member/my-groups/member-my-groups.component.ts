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
  activeTab = 'Tous';
  tabs = ['Tous (3)', 'Actifs (2)', 'Seuil atteint (1)', 'Terminés (0)'];

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
    });
  }

  setTab(t: string): void {
    this.activeTab = t;
    if (t.startsWith('Actifs'))        this.filtered = this.groups.filter(g => g.status === 'OPEN');
    else if (t.startsWith('Seuil'))    this.filtered = this.groups.filter(g => g.status === 'THRESHOLD_REACHED');
    else if (t.startsWith('Terminés')) this.filtered = this.groups.filter(g => g.status === 'COMPLETED');
    else                               this.filtered = this.groups;
  }

  pct(g: Group): number { return this.fmt.progressPercent(g.currentCount, g.minParticipants); }
  isHot(g: Group): boolean { return g.status === 'THRESHOLD_REACHED'; }

  goPayment(g: Group): void { this.router.navigate(['/member/payment']); }
  goDetail(g: Group):  void { this.router.navigate(['/groups', g.id]); }
}
