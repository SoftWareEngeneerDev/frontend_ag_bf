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
import { AdminUserDetailComponent }    from './users/admin-user-detail/admin-user-detail.component';
import { AdminProductDetailComponent } from './products/admin-product-detail/admin-product-detail.component';
import { AdminGroupDetailComponent }   from './groups/admin-group-detail/admin-group-detail.component';

@NgModule({
  declarations: [
    AdminShellComponent,
    AdminDashboardComponent,
    AdminUsersComponent,
    AdminUserDetailComponent,
    AdminSuppliersComponent,
    AdminProductsComponent,
    AdminProductDetailComponent,
    AdminGroupsComponent,
    AdminGroupDetailComponent,
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
          { path: 'users/:id', component: AdminUserDetailComponent },
          { path: 'suppliers', component: AdminSuppliersComponent },
          { path: 'products',     component: AdminProductsComponent },
          { path: 'products/:id', component: AdminProductDetailComponent },
          { path: 'groups',       component: AdminGroupsComponent },
          { path: 'groups/:id',   component: AdminGroupDetailComponent },
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
