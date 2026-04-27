import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { LayoutModule }  from '../../layout/layout.module';
import { LoginComponent }              from './login/login.component';
import { RegisterComponent }           from './register/register.component';
import { OtpComponent }                from './otp/otp.component';
import { ForgotPasswordComponent }     from './forgot-password/forgot-password.component';
import { WelcomeComponent }            from './welcome/welcome.component';

@NgModule({
  declarations: [
    LoginComponent,
    RegisterComponent,
    OtpComponent,
    ForgotPasswordComponent,
    WelcomeComponent,
    
  ],
  imports: [
    SharedModule,
    // LayoutModule,
    RouterModule.forChild([
      { path: 'login',               component: LoginComponent },
      { path: 'register',            component: RegisterComponent },
      { path: 'otp',                 component: OtpComponent },
      { path: 'forgot-password',     component: ForgotPasswordComponent },
      { path: 'welcome',             component: WelcomeComponent },
      // { path: '', redirectTo: 'login', pathMatch: 'full' },
    ]),
  ],
  exports: [
    LoginComponent,
    RegisterComponent,
  ]
})
export class AuthModule {}