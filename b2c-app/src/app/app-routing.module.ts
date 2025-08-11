import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AuthenticationGuard } from './auth/authentication.guard';
import { RedirectgatewayComponent } from './payment/redirectgateway/redirectgateway.component';
import { DeeplinkComponent } from './deeplink/deeplink.component';
import { FindItineraryComponent } from './payment/find-itinerary/find-itinerary.component';
import { NotFoundComponent } from './general/components/not-found.component';
import { MemberDetailsComponent } from './general/components/member-details/member-details.component';
import { HotelsWidgetComponent } from './general/components/hotels-widget/hotels-widget.component';
import { BlankComponent } from './general/components/blank-component/blank.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: 'start',
    component: HomeComponent,
  },
  {
    path: 'home',
    component: HomeComponent,
  },
  {
    path: 'website-services/api/redirect-callback/redirect-gateway',
    component: RedirectgatewayComponent,
  },
  {
    path: 'account/personal/reset-password',
    component: HomeComponent,
  },
  {
    path: 'account/personal/activation',
    component: HomeComponent,
  },
  {
    path: 'auth',
    loadChildren: () => import('src/app/auth/auth.module').then((m) => m.AuthModule),
  },
  {
    path: 'flights',
    loadChildren: () => import('src/app/flights/flights.module').then((m) => m.FlightsModule),
  },
  {
    path: 'booking',
    loadChildren: () => import('src/app/booking/booking.module').then((m) => m.BookingModule),
  },
  {
    path: 'payments',
    loadChildren: () => import('src/app/payment/payment.module').then((m) => m.PaymentModule),
  },
  {
    path: 'my-account',
    loadChildren: () => import('src/app/my-account/my-account.module').then((m) => m.MyAccountModule),
    canActivate: [AuthenticationGuard],
  },
  {
    path: 'ts-plus',
    loadChildren: () => import('src/app/travelstart-plus/travelstart-plus.module').then((m) => m.TravelstartPlusModule),
  },
  // {
  //   path: 'lp',
  //   loadChildren: () => import('src/app/lp/lp-module').then((m) => m.LpModule),
  // },
  {
    path: 'contact-us',
    loadChildren: () => import('src/app/contact/contact.module').then((m) => m.ContactModule),
  },
  {
    path: 'mastercard',
    loadChildren: () => import('src/app/mastercard/mastercard.module').then((m) => m.MastercardModule),
  },
  {
    path: 'redirectgateway',
    component: RedirectgatewayComponent,
  },
  {
    path: 'search',
    component: DeeplinkComponent,
  },
  {
    path: 'search-on-index',
    component: DeeplinkComponent,
  },
  {
    path: 'price-on-index',
    component: DeeplinkComponent,
  },
  {
    path: 'find-itinerary',
    component: FindItineraryComponent,
  },
  {
    path: 'members',
    component: MemberDetailsComponent,
  },
  {
    path: 'hotels',
    component: HotelsWidgetComponent,
  },
  {
    path: 'absa-complete-journey',
    component: BlankComponent,
  },
  // Landing Pages: STRAPI CMS
  // {
  //   path: 'lp/airlines/:slug',
  //   component: AirlinePageComponent,
  // },
  // {
  //   path: 'lp/airlines',
  //   component: AirlinesComponent,
  // },

  // 404 Page
  {
    path: '**',
    component: NotFoundComponent,
  },
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
    initialNavigation: 'enabledBlocking',
    scrollPositionRestoration: 'enabled',
    anchorScrolling: 'enabled',
    preloadingStrategy: PreloadAllModules
}),
  ],
  exports: [RouterModule],
  providers: [],
})
export class AppRoutingModule {}
