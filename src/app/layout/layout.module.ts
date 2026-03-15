import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';

import { NavbarComponent }  from './navbar/navbar.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { TopbarComponent }  from './topbar/topbar.component';
import { FooterComponent }  from './footer/footer.component';

@NgModule({
  declarations: [NavbarComponent, SidebarComponent, TopbarComponent, FooterComponent],
  imports:  [SharedModule],
  exports:  [NavbarComponent, SidebarComponent, TopbarComponent, FooterComponent],
})
export class LayoutModule {}
