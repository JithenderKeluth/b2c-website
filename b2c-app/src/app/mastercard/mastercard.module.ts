import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MastercardRoutingModule } from './mastercard-routing.module';
import { MastercardLandingComponent } from './landing-page/mastercard-landing.component';
import { MastercardRegistrationComponent } from './registration/mastercard-registration.component';
import { SubmissionSuccessModalComponent } from './registration/submission-success-modal.component';
import { SubscriptionSlotsMissedModalComponent } from './registration/subscription-slots-missed-modal.component';
import { TermsConditionsPageComponent } from './terms-conditions-page/terms-conditions-page.component';
import { SharedModule } from '../_shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';
import { HowItWorksComponent } from './how-it-works/how-it-works.component';
import { MoreBenefitsComponent } from './more-benefits/more-benefits.component';
import { CuratedStaysComponent } from './curated-stays/curated-stays.component';
import { ConciergeSupportComponent } from './concierge-support/concierge-support.component';
/*
import { TravelstartPlusModule } from '../travelstart-plus/travelstart-plus.module';
import { AuthModule } from '../auth/auth.module'; */


@NgModule({
  declarations: [
    MastercardLandingComponent,
    MastercardRegistrationComponent,
    SubmissionSuccessModalComponent,
    SubscriptionSlotsMissedModalComponent,
    TermsConditionsPageComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MastercardRoutingModule,
    SharedModule,
    TranslateModule,
    HowItWorksComponent,
    MoreBenefitsComponent,
    CuratedStaysComponent,
    ConciergeSupportComponent, /*
    TravelstartPlusModule,
    AuthModule */
  ],
  exports: [
    MastercardLandingComponent
  ],
  providers: [
    // PeachPaymentsService
  ]
})
export class MastercardModule { }
