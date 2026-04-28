import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { LayoutModule }  from '../../layout/layout.module';

import { LandingComponent }     from './landing/landing.component';
import { CatalogComponent }     from './catalog/catalog.component';
import { GroupsComponent }      from './groups/groups.component';
import { GroupDetailComponent } from './group-detail/group-detail.component';
import { HowItWorksComponent }  from './how-it-works/how-it-works.component';
import { FaqComponent }         from './faq/faq.component';
import { ContactComponent }     from './contact/contact.component';
import { ReturnsComponent }     from './returns/returns.component';
import { DeliveryComponent }    from './delivery/delivery.component';
import { LitigesComponent }     from './litiges/litiges.component';

@NgModule({
  declarations: [
    LandingComponent,
    CatalogComponent,
    GroupsComponent,
    GroupDetailComponent,
    HowItWorksComponent,
    FaqComponent,
    ContactComponent,
    ReturnsComponent,
    DeliveryComponent,
    LitigesComponent,
  ],
  imports: [
    SharedModule,
    LayoutModule,
    RouterModule.forChild([
      { path: '',              component: LandingComponent },
      { path: 'catalog',      component: CatalogComponent },
      { path: 'groups',       component: GroupsComponent },
      { path: 'groups/:id',   component: GroupDetailComponent },
      { path: 'how-it-works', component: HowItWorksComponent },
      { path: 'faq',          component: FaqComponent },
      { path: 'contact',      component: ContactComponent },
      { path: 'retours',      component: ReturnsComponent },
      { path: 'livraison',    component: DeliveryComponent },
      { path: 'litiges',      component: LitigesComponent },
    ]),
  ],
})
export class PublicModule {}
