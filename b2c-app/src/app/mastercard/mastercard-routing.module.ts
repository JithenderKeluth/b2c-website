import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MastercardLandingComponent } from './landing-page/mastercard-landing.component';
import { MastercardRegistrationComponent } from './registration/mastercard-registration.component';
import { TermsConditionsPageComponent } from './terms-conditions-page/terms-conditions-page.component';
import { TsPlusBookingConfirmationComponent } from '../travelstart-plus/ts-plus-booking-confirmation/ts-plus-booking-confirmation.component';
import { AuthenticationGuard } from '../auth/authentication.guard';

const routes: Routes = [
  {
    path: 'landing',
    component: MastercardLandingComponent,
  },
  {
    path: 'registration',
    component: MastercardRegistrationComponent,
    canActivate: [AuthenticationGuard],
  },
  {
    path: 'terms',
    component: TermsConditionsPageComponent,
  },
   {
     path: 'subscriptionSuccess',
     component: TsPlusBookingConfirmationComponent,
     canActivate: [AuthenticationGuard],
   },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MastercardRoutingModule {}
