import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';

import { NavbarComponent }  from './navbar/navbar.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { TopbarComponent }  from './topbar/topbar.component';
import { FooterComponent }  from './footer/footer.component';
import { AuthModule } from '../features/auth/auth.module';

@NgModule({
  declarations: [NavbarComponent, SidebarComponent, TopbarComponent, FooterComponent],
  imports:  [SharedModule, AuthModule],
  exports:  [NavbarComponent, SidebarComponent, TopbarComponent, FooterComponent],
})
export class LayoutModule {}
