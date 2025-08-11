import { CommonModule } from '@angular/common';
import { NgModule, Injector, APP_INITIALIZER, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { provideHttpClient, withInterceptorsFromDi, withFetch } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CustomMaterialModule } from './custom-material/custom-material.module';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { PreloadAllModules, Routes, RouterModule } from '@angular/router';

import { CoreModule } from './_core';
import { SharedModule } from './_shared/shared.module';
import { AuthModule } from './auth/auth.module';
import { AppRoutingModule } from './app-routing.module';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideMessaging, getMessaging } from '@angular/fire/messaging';
import { environment } from '@env/environment';
import { FlightsModule } from './flights/flights.module';

import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { HomePageBannersComponent } from './_shared/components/home-page-banners/home-page-banners.component';
import { McTermsConditionsComponent } from './_shared/components/mc-terms-conditions/mc-terms-conditions.component';
import { DeeplinkComponent } from './deeplink/deeplink.component';
import { NotFoundComponent } from './general/components/not-found.component';
import { WhiteLabelComponent } from './white-label/white-label.component';
import { WebViewComponent } from './web-view/web-view.component';
import { WebViewHeaderComponent } from './general/components/web-view-header/web-view-header.component';
import { MemberDetailsComponent } from './general/components/member-details/member-details.component';
import { HotelsWidgetComponent } from './general/components/hotels-widget/hotels-widget.component';

import { AppSessionService } from './_shared/session/app-session.service';
import { ApiService } from './general/services/api/api.service';
import { DeepLinkService } from './general/deeplinks/deep-link.service';
import { LocationService } from './general/services/locations/location.service';
import { QueryStringAffid } from './general/utils/querystringAffid-utils';
import { SearchDataValidator } from './general/services/validations/search-data.validator';
import { LocationValidator } from './general/services/validations/location.validator';
import { DateValidator } from './general/services/validations/date.validator';
import { SeatmapService } from './booking/services/seatmap.service';
import { CookieService } from 'ngx-cookie-service';
import { AffiliateService } from './general/services/affiliate.service';
import { MeiliIntegrationService } from './../app/general/services/meili-integration.service';
import { SessionUtils } from './../app/general/utils/session-utils';
import { NgIdleKeepaliveModule } from '@ng-idle/keepalive';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { AbsaAuthService } from './general/services/absa-auth.service';
import { BlankComponent } from './general/components/blank-component/blank.component';
import { appInitializerFactory } from './_core/tokens/appInitializerFactory';

import { WINDOW } from './_core/tokens/window.token';
import { WINDOW_PROVIDER } from './../assets/window.providers';
import { MastercardModule } from './mastercard/mastercard.module';

// export function initializeAbsaAuth(absaAuthService: AbsaAuthService){
//   return () => absaAuthService.fetchSessionId();
// }

const routes: Routes = [];

@NgModule({ 
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    // ServiceWorkerModule.register('./ngsw-worker.js', { enabled: false }),
    FormsModule,
    ReactiveFormsModule,
    TranslateModule.forRoot(),
    NgbModule,
    CoreModule,
    SharedModule,
    AuthModule,
    FlightsModule,
    AppRoutingModule, // must be imported as the last module as it contains the fallback route
    CustomMaterialModule,
    CarouselModule,
    RouterModule,
    MastercardModule,
    RouterModule.forRoot(routes, {
      anchorScrolling: 'enabled',
      enableTracing: false,
      preloadingStrategy: PreloadAllModules,
      scrollPositionRestoration: 'enabled',
      scrollOffset: [0, 0],
      onSameUrlNavigation: 'reload'
    }),
    NgIdleKeepaliveModule.forRoot(),
    CommonModule,
    MatDialogModule,
  ], 
  exports: [RouterModule],
  providers: [
    SessionUtils,
    {
      provide: APP_INITIALIZER,
      useFactory: appInitializerFactory,
      deps: [Injector],
      multi: true,
    },
    // {
    //   provide: APP_INITIALIZER,
    //   useFactory: initializeAbsaAuth,
    //   deps: [AbsaAuthService],
    //   multi: true,
    // },
    provideHttpClient(withInterceptorsFromDi(), withFetch()),
    AppSessionService,
    ApiService,
    DeepLinkService,
    LocationService,
    QueryStringAffid,
    SearchDataValidator,
    LocationValidator,
    DateValidator,
    SeatmapService,
    CookieService,
    AffiliateService,
    MeiliIntegrationService,
    provideHttpClient(withInterceptorsFromDi()),
    {
      provide: WINDOW,
      useFactory: () => (typeof window !== 'undefined' ? window : {} as any)
    },
    ...WINDOW_PROVIDER,
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideMessaging(() => getMessaging()),
  ],
  declarations: [
    AppComponent,
    HomePageBannersComponent,
    HomeComponent,
    DeeplinkComponent,
    McTermsConditionsComponent,
    DeeplinkComponent,
    NotFoundComponent,
    WhiteLabelComponent,
    WebViewComponent,
    WebViewHeaderComponent,
    MemberDetailsComponent,
    HotelsWidgetComponent,
    BlankComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
