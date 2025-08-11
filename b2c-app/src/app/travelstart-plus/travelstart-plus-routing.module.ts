import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TsPlusBenefitsComponent } from './ts-plus-benefits/ts-plus-benefits.component';
import { TsPlusPaymentsComponent } from './ts-plus-payments/ts-plus-payments.component';
import { TsPlusBookingConfirmationComponent } from './ts-plus-booking-confirmation/ts-plus-booking-confirmation.component';
import { TsPlusProcessSubscriptionComponent } from './ts-plus-process-subscription/ts-plus-process-subscription.component';
import { TsPlusRenewalComponent } from './ts-plus-renewal/ts-plus-renewal.component';
import { AuthenticationGuard } from '@app/auth/authentication.guard';

const routes: Routes = [
  {
    path: 'ts-plus-benefits',
    component: TsPlusBenefitsComponent,
  },
  {
    path: 'ts-plus-payments',
    component: TsPlusPaymentsComponent,
    canActivate: [AuthenticationGuard],
  },
  {
    path: 'Processing-Subscription',
    component: TsPlusProcessSubscriptionComponent,
    canActivate: [AuthenticationGuard],
  },
  {
    path: 'subscriptionSuccess',
    component: TsPlusBookingConfirmationComponent,
    canActivate: [AuthenticationGuard],
  },
  {
    path: 'ts-plus-renewal',
    component: TsPlusRenewalComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TravelstartPlusRoutingModule {}
