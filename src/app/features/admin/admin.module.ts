import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { LayoutModule }  from '../../layout/layout.module';

import { AdminShellComponent }    from './admin-shell/admin-shell.component';
import { AdminDashboardComponent } from './dashboard/admin-dashboard.component';
import { AdminUsersComponent }    from './users/admin-users.component';
import { AdminSuppliersComponent } from './suppliers/admin-suppliers.component';
import { AdminProductsComponent } from './products/admin-products.component';
import { AdminGroupsComponent }   from './groups/admin-groups.component';
import { AdminPaymentsComponent } from './payments/admin-payments.component';
import { AdminDisputesComponent } from './disputes/admin-disputes.component';
import { AdminAnalyticsComponent } from './analytics/admin-analytics.component';
import { AdminLogsComponent }     from './logs/admin-logs.component';

@NgModule({
  declarations: [
    AdminShellComponent,
    AdminDashboardComponent,
    AdminUsersComponent,
    AdminSuppliersComponent,
    AdminProductsComponent,
    AdminGroupsComponent,
    AdminPaymentsComponent,
    AdminDisputesComponent,
    AdminAnalyticsComponent,
    AdminLogsComponent,
  ],
  imports: [
    SharedModule,
    LayoutModule,
    RouterModule.forChild([
      {
        path: '',
        component: AdminShellComponent,
        children: [
          { path: '',          component: AdminDashboardComponent },
          { path: 'users',     component: AdminUsersComponent },
          { path: 'suppliers', component: AdminSuppliersComponent },
          { path: 'products',  component: AdminProductsComponent },
          { path: 'groups',    component: AdminGroupsComponent },
          { path: 'payments',  component: AdminPaymentsComponent },
          { path: 'disputes',  component: AdminDisputesComponent },
          { path: 'analytics', component: AdminAnalyticsComponent },
          { path: 'logs',      component: AdminLogsComponent },
        ]
      }
    ]),
  ],
})
export class AdminModule {}
