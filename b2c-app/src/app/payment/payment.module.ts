import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentRoutingModule } from './payment-routing.module';

// import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PaymentViewComponent } from './payment-view/payment-view.component';
import { CustomMaterialModule } from './../custom-material/custom-material.module';
import { SharedModule } from './../_shared/shared.module';
import { PaymentCardsComponent } from './payment-cards/payment-cards.component';
import { NgxMaskModule, IConfig } from 'ngx-mask';
import { BookingSummaryComponent } from './booking-summary/booking-summary.component';
// import { BookingModule } from './../booking/booking.module';
import { BookingConfirmationComponent } from './booking-confirmation/booking-confirmation.component';
import { PaymentsFooterComponent } from './payments-footer/payments-footer.component';
import { TranslateModule } from '@ngx-translate/core';
import { I18nModule } from './../i18n/i18n.module';
import { MwebFlightTripSummaryComponent } from './mweb-flight-trip-summary/mweb-flight-trip-summary.component';
import { FindItineraryComponent } from './find-itinerary/find-itinerary.component';
import { FareBreakdownComponent } from './fare-breakdown/fare-breakdown.component';
import { AddOnsComponent } from './add-ons/add-ons.component';

import { PaymentErrorDeeplinkComponent } from './payment-error-deeplink/payment-error-deeplink.component';
import { MWebPaymentDeeplinkBookingSummaryComponent } from './m-web-payment-deeplink-booking-summary/m-web-payment-deeplink-booking-summary.component';
import { ViewItineraryErrorComponent } from './view-itinerary-error/view-itinerary-error.component';
import { RedirectgatewayComponent } from './redirectgateway/redirectgateway.component';
import { VocherproductComponent } from './vocherproduct/vocherproduct.component';
import { WalletComponent } from './wallet/wallet.component';
import { WalletDepositComponent } from './wallet-deposit/wallet-deposit.component';
import { PaystackPaymentComponent } from './paystack-payment/paystack-payment.component';
import { WalletViewComponent } from './wallet-view/wallet-view.component';
import { WalletHistoryComponent } from './wallet-history/wallet-history.component';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

import { CarWidgetComponent } from '@app/general/components/car-widget/car-widget.component';
import { CardPaymentsComponent } from './card-payments/card-payments.component';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { WalletVouchersComponent } from './wallet-vouchers/wallet-vouchers.component';
import { PeachCheckoutFormComponent } from './peach-checkout-form/peach-checkout-form.component';
import { NgxIntlTelInputModule } from 'ngx-intl-tel-input';

const maskConfig: Partial<IConfig> = {
  validation: true,
};

@NgModule({
  declarations: [
    PaymentViewComponent,
    PaymentCardsComponent,
    BookingSummaryComponent,
    BookingConfirmationComponent,
    PaymentsFooterComponent,
    MwebFlightTripSummaryComponent,
    FindItineraryComponent,
    FareBreakdownComponent,
    AddOnsComponent,

    PaymentErrorDeeplinkComponent,

    MWebPaymentDeeplinkBookingSummaryComponent,

    ViewItineraryErrorComponent,

    RedirectgatewayComponent,

    VocherproductComponent,

    WalletComponent,

    WalletDepositComponent,

    PaystackPaymentComponent,

    WalletViewComponent,

    WalletHistoryComponent,
    CarWidgetComponent,
    CardPaymentsComponent,
    WalletVouchersComponent,
    PeachCheckoutFormComponent,
  ],
  imports: [
    CommonModule,
    PaymentRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    CustomMaterialModule,
    SharedModule,
    NgxMaskModule.forRoot(maskConfig),
    // BookingModule,
    TranslateModule,
    I18nModule,
    NgxDatatableModule,
    NgbTooltipModule,
    NgxIntlTelInputModule,
  ],
  exports: [],
})
export class PaymentModule {}
