import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

interface UserDetail {
  id: string;
  name: string;
  phone: string;
  role: string;
  status: string;
  score: number;
  groups: number;
  joined: string;
  email: string;
  city: string;
  totalSaved: number;
  referralCount: number;
  ordersCount: number;
  paymentsTotal: number;
}

@Component({
  selector: 'app-admin-user-detail',
  templateUrl: './admin-user-detail.component.html',
  styleUrls: ['./admin-user-detail.component.scss']
})
export class AdminUserDetailComponent implements OnInit {

  private allUsers: UserDetail[] = [
    { id:'USR-001', name:'Kofi Traoré',       phone:'+22676528609', role:'MEMBER',   status:'ACTIVE',    score:95, groups:3,  joined:'15 sept. 2023', email:'kofi.traore@email.com',       city:'Ouagadougou', totalSaved:120000, referralCount:4,  ordersCount:12, paymentsTotal:350000 },
    { id:'USR-002', name:'Aminata Sawadogo',  phone:'+22670112233', role:'MEMBER',   status:'ACTIVE',    score:88, groups:5,  joined:'2 oct. 2023',   email:'aminata.sawadogo@email.com',   city:'Bobo-Dioulasso', totalSaved:85000, referralCount:2, ordersCount:8,  paymentsTotal:210000 },
    { id:'USR-003', name:'Moussa Traoré',     phone:'+22671445566', role:'MEMBER',   status:'ACTIVE',    score:72, groups:1,  joined:'20 nov. 2023',  email:'moussa.traore@email.com',      city:'Koudougou',   totalSaved:30000, referralCount:1,  ordersCount:3,  paymentsTotal:75000  },
    { id:'USR-004', name:'Ibrahim Ouédraogo', phone:'+22600000002', role:'SUPPLIER', status:'ACTIVE',    score:98, groups:47, joined:'1 juin 2023',   email:'ibrahim.ouedraogo@techbf.com', city:'Ouagadougou', totalSaved:0,      referralCount:0,  ordersCount:0,  paymentsTotal:1250000},
    { id:'USR-005', name:'Fatimata Compaoré', phone:'+22670998877', role:'SUPPLIER', status:'ACTIVE',    score:95, groups:23, joined:'15 juil. 2023', email:'fatimata.compaore@agri.com',   city:'Ouagadougou', totalSaved:0,      referralCount:0,  ordersCount:0,  paymentsTotal:680000 },
    { id:'USR-006', name:'Adama Kaboré',      phone:'+22676223344', role:'MEMBER',   status:'SUSPENDED', score:12, groups:0,  joined:'5 janv. 2024',  email:'adama.kabore@email.com',       city:'Dédougou',    totalSaved:0,      referralCount:0,  ordersCount:1,  paymentsTotal:5000   },
    { id:'USR-007', name:'Salimata Ouédraogo',phone:'+22677001122', role:'MEMBER',   status:'ACTIVE',    score:80, groups:2,  joined:'8 fév. 2024',   email:'salimata.ouedraogo@email.com', city:'Banfora',     totalSaved:45000, referralCount:3,  ordersCount:6,  paymentsTotal:130000 },
  ];

  user: UserDetail | null = null;

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.user = this.allUsers.find(u => u.id === id) ?? null;
  }

  goBack(): void {
    this.router.navigate(['/admin/users']);
  }

  get roleLabel(): string {
    return this.user?.role === 'SUPPLIER' ? 'Fournisseur' : 'Membre';
  }

  get roleBadge(): string {
    return this.user?.role === 'SUPPLIER' ? 'badge-cyan' : 'badge-grey';
  }

  get statusLabel(): string {
    return this.user?.status === 'ACTIVE' ? 'Actif' : 'Suspendu';
  }

  get statusBadge(): string {
    return this.user?.status === 'ACTIVE' ? 'badge-ok' : 'badge-err';
  }

  get avatarBg(): string {
    return this.user?.role === 'SUPPLIER' ? '#00D4FF' : '#F5A623';
  }

  formatXOF(val: number): string {
    return val.toLocaleString('fr-FR') + ' XOF';
  }
}
