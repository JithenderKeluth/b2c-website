import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FooterComponent } from './../_shared/components/footer/footer.component';
import { HeaderComponent } from './components/header/header.component';
import { TsPlusHeadComponent } from '../travelstart-plus/ts-plus-head/ts-plus-head.component';

import { CustomMaterialModule } from './../custom-material/custom-material.module';
import { Routes, RouterModule } from '@angular/router';
import { AuthModule } from './../auth/auth.module';
import { FlightsLoaderComponent } from './components/flights-loader/flights-loader.component';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { HotelDealsComponent } from './components/hotel-deals/hotel-deals.component';
import { ServerErrComponent } from './components/server-err/server-err.component';
import { ErrorMessageComponent } from '../booking/error-message/error-message.component';
import { GroupByPipe } from './pipes/groupby.pipe';
import { CardFormatterPipe } from './pipes/card-formatter.pipe';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { NgbModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { WhatDoesTravelstartComponent } from './components/what-does-travelstart/what-does-travelstart.component';
import { RecentSearchesComponent } from './components/recent-searches/recent-searches.component';

import { CurrencyCodePipe } from './pipes/currency-code.pipe';
import { TravelRestrictionsComponent } from './components/travel-restrictions/travel-restrictions.component';
import { TranslateModule } from '@ngx-translate/core';
import { I18nModule } from './../i18n/i18n.module';
import { TravelAdviceComponent } from './travel-advice/travel-advice.component';
import { LoaderComponent } from './components/loader/loader.component';
import { PaymentErrorDialogComponent } from './../booking/payment-error-dialog/payment-error-dialog.component';
import { NumbersonlyDirective } from './directives/numbersonly.directive';
import { SideNavComponent } from './../general/components/side-nav/side-nav.component';
import { CloseCollapseStripDirective } from './directives/close-collapse-strip.directive';
import { ProgressbarLoaderComponent } from './components/progressbar-loader/progressbar-loader.component';
import { SvgIconComponent } from './components/svg-icon/svg-icon.component';
import { ImageSrcDirective } from './directives/ImageSrcDirective';
import { EditPriceModalComponent } from './components/edit-price-modal/edit-price-modal.component';
import { ClassSelectorComponent } from './components/class-selector/class-selector.component';
import { MealSelectorComponent } from './components/meal-selector/meal-selector.component';
import { EditPriceFormComponent } from './components/edit-price-modal/edit-price-form/edit-price-form.component';
import { FlightDetailsViewComponent } from './components/edit-price-modal/flight-details-view/flight-details-view.component';
import { EditPriceQuoteComponent } from './components/edit-price-modal/edit-price-quote/edit-price-quote.component';
import { NgxMaskModule, IConfig } from 'ngx-mask';
import { CreditCardInputDirective } from './directives/credit-card-input.directive';

const maskConfig: Partial<IConfig> = {
  validation: true,
};
import { BookWithTravelstartComponent } from './components/book-with-travelstart/book-with-travelstart.component';
import { ViewYourBookingsComponent } from './components/view-your-bookings/view-your-bookings.component';
import { TravellerPageLoaderComponent } from './components/traveller-page-loader/traveller-page-loader.component';
import { FlightDetailsInfoComponent } from './components/flight-details-info/flight-details-info.component';
import { TbiFareComponent } from './components/tbi-fare/tbi-fare.component';
import { ForceRedirectionComponent } from './force-redirection/force-redirection.component';
import { BookingFlowCountdownComponent } from './components/booking-flowcoundown/booking-flowcoundown.component';
import { TravelAppComponent } from './components/travel-app/travel-app.component';
import { NoFlightsComponent } from './no-flights/no-flights.component';
import { FsHeaderComponent } from './components/fs-header/fs-header.component';
import { FsFooterComponent } from './components/fs-footer/fs-footer.component';
import { HomeBenefitsTilesComponent } from './components/home-benefits-tiles/home-benefits-tiles.component';
import { MeiliEmbedComponent } from '@app/general/components/meili-embed/meili-embed.component';
import { B2bMeiliWidgetComponent } from './components/b2b-meili-widget/b2b-meili-widget.component';
import { ErrorPopupComponent } from './components/error-popup/error-popup.component';
import { BackButtonComponent } from './components/back-button/back-button.component';
import { FlightDetailsInfoAlternativeComponent } from './components/flight-details-info-alternative/flight-details-info-alternative.component';
import { NgxIntlTelInputModule } from 'ngx-intl-tel-input';
import { AiTravelAgentComponent } from './components/ai-travel-agent/ai-travel-agent.component';
import { MemberDealsBenefitsComponent } from '../travelstart-plus/member-deals-benefits/member-deals-benefits.component';
import {TsPlusSubscribeComponent} from '../travelstart-plus/ts-plus-subscribe/ts-plus-subscribe.component';
import { CarouselModule } from 'ngx-owl-carousel-o';

import { CouponsInfoComponent } from './../booking/coupons-info/coupons-info.component';

const routes: Routes = [
  {
    path: 'travel-restrictions',
    component: TravelRestrictionsComponent,
  },
  {
    path: 'B2B-meili-widget',
    component: B2bMeiliWidgetComponent,
  },
];

@NgModule({
  imports: [
    CommonModule,
    CustomMaterialModule,
    RouterModule.forChild(routes),
    RouterModule,
    AuthModule,
    NgxSkeletonLoaderModule,
    NgbTooltipModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    NgbModule,
    I18nModule,
    NgxMaskModule.forRoot(maskConfig),
    NgxIntlTelInputModule,
    CarouselModule
  ],
  declarations: [
    SvgIconComponent,
    FooterComponent,
    FlightsLoaderComponent,
    HeaderComponent,
    HotelDealsComponent,
    ServerErrComponent,
    GroupByPipe,
    CardFormatterPipe,
    WhatDoesTravelstartComponent,
    RecentSearchesComponent,
    CurrencyCodePipe,
    TravelRestrictionsComponent,
    TravelAdviceComponent,
    ErrorMessageComponent,
    LoaderComponent,
    PaymentErrorDialogComponent,
    SideNavComponent,
    NumbersonlyDirective,
    CloseCollapseStripDirective,
    ProgressbarLoaderComponent,
    ImageSrcDirective,
    EditPriceModalComponent,
    ClassSelectorComponent,
    MealSelectorComponent,
    EditPriceFormComponent,
    FlightDetailsViewComponent,
    EditPriceQuoteComponent,
    BookWithTravelstartComponent,
    BookWithTravelstartComponent,
    ViewYourBookingsComponent,
    TravellerPageLoaderComponent,
    FlightDetailsInfoComponent,
    TbiFareComponent,
    ForceRedirectionComponent,
    BookingFlowCountdownComponent,
    TravelAppComponent,
    NoFlightsComponent,
    FsHeaderComponent,
    FsFooterComponent,
    HomeBenefitsTilesComponent,
    MeiliEmbedComponent,
    B2bMeiliWidgetComponent,
    ErrorPopupComponent,
    AiTravelAgentComponent,
    BackButtonComponent,
    FlightDetailsInfoAlternativeComponent,
    CreditCardInputDirective,
    TsPlusHeadComponent,
    MemberDealsBenefitsComponent,
    TsPlusSubscribeComponent,
    CouponsInfoComponent
  ],
  exports: [
    SvgIconComponent,
    FooterComponent,
    HeaderComponent,
    FlightsLoaderComponent,
    HotelDealsComponent,
    ServerErrComponent,
    GroupByPipe,
    CardFormatterPipe,
    ErrorMessageComponent,
    PaymentErrorDialogComponent,
    WhatDoesTravelstartComponent,
    RecentSearchesComponent,
    CurrencyCodePipe,
    TravelAdviceComponent,
    LoaderComponent,
    SideNavComponent,
    NumbersonlyDirective,
    CloseCollapseStripDirective,
    ProgressbarLoaderComponent,
    ImageSrcDirective,
    EditPriceModalComponent,
    ClassSelectorComponent,
    MealSelectorComponent,
    BookWithTravelstartComponent,
    BookWithTravelstartComponent,
    ViewYourBookingsComponent,
    TravellerPageLoaderComponent,
    FlightDetailsInfoComponent,
    ForceRedirectionComponent,
    BookingFlowCountdownComponent,
    TravelAppComponent,
    NoFlightsComponent,
    FsHeaderComponent,
    FsFooterComponent,
    HomeBenefitsTilesComponent,
    MeiliEmbedComponent,
    ErrorPopupComponent,
    AiTravelAgentComponent,
    BackButtonComponent,
    FlightDetailsInfoAlternativeComponent,
    CreditCardInputDirective,
    TsPlusHeadComponent,
    MemberDealsBenefitsComponent,
    TsPlusSubscribeComponent,
    CouponsInfoComponent
  ],
  providers: [DatePipe, I18nModule],
})
export class SharedModule {}
