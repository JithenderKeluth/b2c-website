import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideNgxWebstorage, withLocalStorage, withSessionStorage } from 'ngx-webstorage';
import { NgxIntlTelInputModule } from 'ngx-intl-tel-input';
import { AppModule } from './app.module';
import { AppComponent } from './app.component';

@NgModule({
  imports: [
    AppModule,
    BrowserModule.withServerTransition({ appId: 'b2c-app' }),
    BrowserAnimationsModule,
    NgxIntlTelInputModule,
  ],
  providers: [
    provideNgxWebstorage(withLocalStorage(), withSessionStorage()),
  ],
  bootstrap: [AppComponent],
})
export class AppBrowserModule {}
