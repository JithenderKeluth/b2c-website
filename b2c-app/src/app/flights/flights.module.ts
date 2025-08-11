import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlightsRoutingModule } from './flights-routing.module';
import { SharedModule } from './../_shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PassengersComponent } from './passengers/passengers.component';
import { CustomMaterialModule } from './../custom-material/custom-material.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SearchComponent } from './search/search.component';
// import { SessionUtils } from './../general/utils/session-utils';
import { SortingComponent } from './sorting/sorting.component';
import { MulticityFlightResultsComponent } from './multicity-flight-results/multicity-flight-results.component';
import { AirlineSearchPipe } from './pipes/airlineSearchPipe';
import { NoFiltersErrorComponent } from './no-filters-error/no-filters-error.component';
import { TranslateModule } from '@ngx-translate/core';
import { I18nModule } from './../i18n/i18n.module';
import { SrpMwebHeaderComponent } from './srp-mweb-header/srp-mweb-header.component';
// import { SideNavComponent } from './../general/components/side-nav/side-nav.component';
import { CitySelectionComponent } from './city-selection/city-selection.component';
import { DateSelectionComponent } from './date-selection/date-selection.component';
import { CabinClassErrorComponent } from './cabin-class-error/cabin-class-error.component';
import { TimeDifferenceModalComponent } from './time-difference-modal/time-difference-modal.component';
import { DestinationModalComponent } from './destination-modal/destination-modal.component';
import { BaggageErrorModalComponent } from './baggage-error-modal/baggage-error-modal.component';
import { FlightsViewComponent } from './flights-view/flights-view.component';
import { ResultsViewComponent } from './results-view/results-view.component';
import { FlightDetailsComponent } from './flight-details/flight-details.component';
import { FlightCardComponent } from './flight-card/flight-card.component';
import { FlightInfoComponent } from './flight-info/flight-info.component';
import { FlightPromoInfoComponent } from './flight-promo-info/flight-promo-info.component';
import { EKHClassModalComponent } from './ekh-class-modal/ekh-class-modal.component';
import { FlightFiltersComponent } from './flight-filters/flight-filters.component';
import { SearchService } from './service/search.service';
import { SharedFlightService } from './service/sharedFlight.service';
import { NgDomesticOfflineCardComponent } from './ng-domestic-offline-card/ng-domestic-offline-card.component';
import { NgDomesticOfflineFormComponent } from './ng-domestic-offline-form/ng-domestic-offline-form.component';
import { BnplMessageComponent } from '@app/general/components/bnpl-message/bnpl-message.component';
import { UserTravellersComponent } from './user-travellers/user-travellers.component';
import { NgxIntlTelInputModule } from 'ngx-intl-tel-input';

@NgModule({
  declarations: [
    PassengersComponent,
    SearchComponent,
    MulticityFlightResultsComponent,
    SortingComponent,
    AirlineSearchPipe,
    NoFiltersErrorComponent,
    SrpMwebHeaderComponent,
    // SideNavComponent,
    CitySelectionComponent,
    DateSelectionComponent,
    CabinClassErrorComponent,
    TimeDifferenceModalComponent,
    DestinationModalComponent,
    BaggageErrorModalComponent,
    FlightsViewComponent,
    ResultsViewComponent,
    FlightDetailsComponent,
    FlightCardComponent,
    FlightInfoComponent,
    FlightPromoInfoComponent,
    EKHClassModalComponent,
    FlightFiltersComponent,
    NgDomesticOfflineCardComponent,
    NgDomesticOfflineFormComponent,
    BnplMessageComponent,
    UserTravellersComponent,
  ],
  imports: [
    CommonModule,
    FlightsRoutingModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    CustomMaterialModule,
    NgbModule,
    TranslateModule,
    I18nModule,
    NgxIntlTelInputModule,
  ],
  exports: [
    PassengersComponent,
    SearchComponent,
    FlightFiltersComponent,
    SortingComponent,
    MulticityFlightResultsComponent,
    SrpMwebHeaderComponent,
    CitySelectionComponent,
    FlightInfoComponent,
    UserTravellersComponent,
  ],
  providers: [SearchService, SharedFlightService],
})
export class FlightsModule {}
