import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TravelstartPlusRoutingModule } from './travelstart-plus-routing.module';
import { TsPlusBenefitsComponent } from './ts-plus-benefits/ts-plus-benefits.component';
import { AuthModule } from '../auth/auth.module';
import { TsPlusPaymentsComponent } from './ts-plus-payments/ts-plus-payments.component';
import { TsPlusBookingConfirmationComponent } from './ts-plus-booking-confirmation/ts-plus-booking-confirmation.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { I18nModule } from '@app/i18n/i18n.module';
import { TsPlusHeadComponent } from './ts-plus-head/ts-plus-head.component';
import { CustomMaterialModule } from '@app/custom-material/custom-material.module';
import {TsPlusSubscribeComponent} from '../../app/travelstart-plus/ts-plus-subscribe/ts-plus-subscribe.component';
import { TsPlusProcessSubscriptionComponent } from './ts-plus-process-subscription/ts-plus-process-subscription.component';
import { PeachPaymentsService } from './service/peach-payments.service';
import { SharedModule } from '../../app/_shared/shared.module';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { MemberDealsBenefitsComponent } from './member-deals-benefits/member-deals-benefits.component';
import { TsPlusRenewalComponent } from './ts-plus-renewal/ts-plus-renewal.component';


@NgModule({
  declarations: [
    TsPlusBenefitsComponent,
    TsPlusPaymentsComponent,
    TsPlusBookingConfirmationComponent,
    TsPlusSubscribeComponent,
    TsPlusHeadComponent,
    TsPlusProcessSubscriptionComponent,
    MemberDealsBenefitsComponent,
    TsPlusRenewalComponent],
  imports: [
    CommonModule,
    AuthModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    I18nModule,
    TravelstartPlusRoutingModule,
    CustomMaterialModule,
    SharedModule,
    CarouselModule
  ],
  providers: [
    PeachPaymentsService
  ]
})
export class TravelstartPlusModule { }
