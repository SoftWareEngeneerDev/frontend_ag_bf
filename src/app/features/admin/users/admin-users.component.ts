import { Component } from '@angular/core';
import { MockDataService } from '../../../core/services/mock-data.service';

@Component({
  selector: 'app-admin-users',
  templateUrl: './admin-users.component.html',
  styleUrls:  ['./admin-users.component.scss']
})
export class AdminUsersComponent {
  search = '';
  activeTab = 'Tous';
  tabs = ['Tous','Membres','Fournisseurs','Suspendus'];

  users = [
    { name:'Kofi Traoré',      phone:'+22676528609', role:'MEMBER',   status:'ACTIVE',    score:95, groups:3, joined:'15 sept. 2023' },
    { name:'Aminata Sawadogo', phone:'+22670112233', role:'MEMBER',   status:'ACTIVE',    score:88, groups:5, joined:'2 oct. 2023'  },
    { name:'Moussa Traoré',    phone:'+22671445566', role:'MEMBER',   status:'ACTIVE',    score:72, groups:1, joined:'20 nov. 2023' },
    { name:'Ibrahim Ouédraogo',phone:'+22600000002', role:'SUPPLIER', status:'ACTIVE',    score:98, groups:47,joined:'1 juin 2023'  },
    { name:'Fatimata Compaoré',phone:'+22670998877', role:'SUPPLIER', status:'ACTIVE',    score:95, groups:23,joined:'15 juil. 2023'},
    { name:'Adama Kaboré',     phone:'+22676223344', role:'MEMBER',   status:'SUSPENDED', score:12, groups:0, joined:'5 janv. 2024' },
    { name:'Salimata Ouédraogo',phone:'+22677001122',role:'MEMBER',   status:'ACTIVE',    score:80, groups:2, joined:'8 fév. 2024'  },
  ];

  get filtered() {
    return this.users.filter(u => {
      const matchSearch = !this.search || u.name.toLowerCase().includes(this.search.toLowerCase()) || u.phone.includes(this.search);
      const matchTab =
        this.activeTab === 'Tous'         ? true :
        this.activeTab === 'Membres'      ? u.role === 'MEMBER' :
        this.activeTab === 'Fournisseurs' ? u.role === 'SUPPLIER' :
        this.activeTab === 'Suspendus'    ? u.status === 'SUSPENDED' : true;
      return matchSearch && matchTab;
    });
  }
}
