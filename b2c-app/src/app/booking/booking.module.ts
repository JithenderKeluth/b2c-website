import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookingViewComponent } from './booking-view/booking-view.component';
import { ItineraryInfoComponent } from './itinerary-info/itinerary-info.component';
import { FareInfoComponent } from './fare-info/fare-info.component';
// import { CouponsInfoComponent } from './coupons-info/coupons-info.component';
import { ContactInfoComponent } from './contact-info/contact-info.component';
import { TravellerInfoComponent } from './traveller-info/traveller-info.component';
import { BookingRoutingModule } from './booking-routing.module';
import { SharedModule } from './../_shared/shared.module';
import { CustomMaterialModule } from './../custom-material/custom-material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BaggageSelectionComponent } from './baggage-selection/baggage-selection.component';
import { AddOnSelectionComponent } from './add-on-selection/add-on-selection.component';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { NgxMaskModule, IConfig } from 'ngx-mask';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { CarouselModule } from 'ngx-bootstrap/carousel';

import { PricingFailedComponent } from './pricing-failed/pricing-failed.component';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { I18nModule } from './../i18n/i18n.module';
import { FlexiTicketTermsComponent } from './flexi-ticket-terms/flexi-ticket-terms.component';
import { SessionExpiredErrorComponent } from './session-expired-error/session-expired-error.component';

import { PaymentMethodsErrorComponent } from './payment-methods-error/payment-methods-error.component';
import { AutoTrimDirective } from './../_shared/directives/auto-trim.directive';
import { PriceStripComponent } from './price-strip/price-strip.component';

import { SeatmapService } from './services/seatmap.service';
import { SeatNotSelectedModalComponent } from './modals/seat-not-selected-modal/seat-not-selected-modal.component';
import { ProductsNotSelectedModalComponent } from './modals/products-not-selected-modal/products-not-selected-modal.component';
import { AddCheckInBaggageComponent } from './add-check-in-baggage/add-check-in-baggage.component';
import { TravelOptionsComponent } from './travel-options/travel-options.component';
import { DuplicateBookingModalComponent } from './modals/duplicate-booking-modal/duplicate-booking-modal.component';
import { SeatmapsComponent } from './seatmaps/seatmaps.component';
import { NgxIntlTelInputModule } from 'ngx-intl-tel-input';

const maskConfig: Partial<IConfig> = {
  validation: true,
};

@NgModule({
  declarations: [
    BookingViewComponent,
    ItineraryInfoComponent,
    FareInfoComponent,
    // CouponsInfoComponent,
    ContactInfoComponent,
    TravellerInfoComponent,
    BaggageSelectionComponent,
    PricingFailedComponent,
    AddOnSelectionComponent,
    FlexiTicketTermsComponent,
    SessionExpiredErrorComponent,
    PaymentMethodsErrorComponent,
    AutoTrimDirective,
    PriceStripComponent,
    SeatNotSelectedModalComponent,
    ProductsNotSelectedModalComponent,
    AddCheckInBaggageComponent,
    TravelOptionsComponent,
    DuplicateBookingModalComponent,
    SeatmapsComponent,
  ],
  imports: [
    CommonModule,
    BookingRoutingModule,
    SharedModule,
    NgbModule,
    CustomMaterialModule,
    FormsModule,
    ReactiveFormsModule,
    NgxSkeletonLoaderModule,
    NgxMaskModule.forRoot(maskConfig),
    NgbTooltipModule,
    CarouselModule,
    TranslateModule,
    I18nModule,
    NgxIntlTelInputModule,
  ],
  exports: [],
  providers: [SeatmapService],
})
export class BookingModule {}
