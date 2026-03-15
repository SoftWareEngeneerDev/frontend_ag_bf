import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { LayoutModule }  from '../../layout/layout.module';

import { LandingComponent }     from './landing/landing.component';
import { CatalogComponent }     from './catalog/catalog.component';
import { GroupsComponent }      from './groups/groups.component';
import { GroupDetailComponent } from './group-detail/group-detail.component';
import { HowItWorksComponent }  from './how-it-works/how-it-works.component';

@NgModule({
  declarations: [
    LandingComponent,
    CatalogComponent,
    GroupsComponent,
    GroupDetailComponent,
    HowItWorksComponent,
  ],
  imports: [
    SharedModule,
    LayoutModule,
    RouterModule.forChild([
      { path: '',             component: LandingComponent },
      { path: 'catalog',     component: CatalogComponent },
      { path: 'groups',      component: GroupsComponent },
      { path: 'groups/:id',  component: GroupDetailComponent },
      { path: 'how-it-works',component: HowItWorksComponent },
    ]),
  ],
})
export class PublicModule {}
