import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http'; // ← AJOUT HTTP_INTERCEPTORS
import { CoreModule }       from './core/core.module';
import { SharedModule }    from './shared/shared.module';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent }     from './app.component';
import { AuthInterceptor }  from './core/interceptors/auth.interceptor'; // ← AJOUT

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    CoreModule,
    SharedModule,
    AppRoutingModule,
  ],
  providers: [
    // ── Interceptor JWT — token automatique sur toutes les requêtes ──
    {
      provide:  HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi:    true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}