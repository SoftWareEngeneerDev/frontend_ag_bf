import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { LayoutModule }  from '../../layout/layout.module';

import { SupplierShellComponent }      from './supplier-shell/supplier-shell.component';
import { SupplierDashboardComponent }  from './dashboard/supplier-dashboard.component';
import { SupplierProductsComponent }  from './products/supplier-products.component';
import { SupplierGroupsComponent }    from './groups/supplier-groups.component';
import { SupplierOrdersComponent }    from './orders/supplier-orders.component';
import { SupplierRevenueComponent }   from './revenue/supplier-revenue.component';
import { ProfileComponent }           from './profile/profile.component';
import { SupplierWithdrawalComponent } from './withdrawal/supplier-withdrawal.component';

@NgModule({
  declarations: [
    SupplierShellComponent,
    SupplierDashboardComponent,
    SupplierProductsComponent,
    SupplierGroupsComponent,
    SupplierOrdersComponent,
    SupplierRevenueComponent,
    ProfileComponent,
    SupplierWithdrawalComponent,
  ],
  imports: [
    SharedModule,
    LayoutModule,
    RouterModule.forChild([
      {
        path: '',
        component: SupplierShellComponent,
        children: [
          { path: '',           component: SupplierDashboardComponent },
          { path: 'products',   component: SupplierProductsComponent },
          { path: 'groups',     component: SupplierGroupsComponent },
          { path: 'orders',     component: SupplierOrdersComponent },
          { path: 'revenue',    component: SupplierRevenueComponent },
          { path: 'profile',    component: ProfileComponent },
          { path: 'withdrawal', component: SupplierWithdrawalComponent },
        ]
      }
    ]),
  ],
})
export class SupplierModule {}
