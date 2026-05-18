import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { LayoutModule }  from '../../layout/layout.module';

import { MemberShellComponent }      from './member-shell/member-shell.component';
import { MemberDashboardComponent }  from './dashboard/member-dashboard.component';
import { MyGroupsComponent }         from './my-groups/member-my-groups.component';
import { MemberCatalogueComponent }  from './catalogue/member-catalogue.component';
import { PaymentComponent }          from './payment/member-payment.component';
import { OrdersComponent }           from './orders/member-orders.component';
import { NotificationsComponent }    from './notifications/member-notifications.component';
import { ProfileComponent }          from './profile/member-profile.component';
import { MemberDisputesComponent }   from './disputes/member-disputes.component';

@NgModule({
  declarations: [
    MemberShellComponent,
    MemberDashboardComponent,
    MyGroupsComponent,
    MemberCatalogueComponent,
    PaymentComponent,
    OrdersComponent,
    NotificationsComponent,
    ProfileComponent,
    MemberDisputesComponent,
  ],
  imports: [
    SharedModule,
    LayoutModule,
    RouterModule.forChild([
      {
        path: '',
        component: MemberShellComponent,
        children: [
          { path: '',              component: MemberDashboardComponent },
          { path: 'groups',        component: MyGroupsComponent },
          { path: 'catalogue',     component: MemberCatalogueComponent },
          { path: 'payment',       component: PaymentComponent },
          { path: 'orders',        component: OrdersComponent },
          { path: 'notifications', component: NotificationsComponent },
          { path: 'profile',       component: ProfileComponent },
          { path: 'disputes',      component: MemberDisputesComponent },
        ]
      }
    ]),
  ],
})
export class MemberModule {}