import { SharedModule } from './../_shared/shared.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
// OEM import { NgxPrintModule } from 'ngx-print';

import { MyAccountRoutingModule } from './my-account-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { BookingsComponent } from './bookings/bookings.component';
import { TravellersComponent } from './travellers/travellers.component';
import { PaymentsComponent } from './payments/payments.component';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { CustomMaterialModule } from './../custom-material/custom-material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxMaskModule, IConfig } from 'ngx-mask';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ModalModule } from 'ngx-bootstrap/modal';
import { UpdateTravellerComponent } from './update-traveller/update-traveller.component';
import { ProfileInfoComponent } from './profile-info/profile-info.component';
import { ItinaryViewComponent } from './itinary-view/itinary-view.component';
import { ManageBookingsComponent } from './manage-bookings/manage-bookings.component';
import { ChangeBookingDateComponent } from './change-booking-date/change-booking-date.component';
import { EditPassengerDetailsComponent } from './edit-passenger-details/edit-passenger-details.component';
import { QueryRecordComponent } from './query-record/query-record.component';
import { WalletComponent } from './wallet/wallet.component';
import { TranslateModule } from '@ngx-translate/core';
import { I18nModule } from '../i18n/i18n.module';
import { HotelBookingsListComponent } from './hotel-bookings-list/hotel-bookings-list.component';
import { ViewHotelBookingDetailsComponent } from './view-hotel-booking-details/view-hotel-booking-details.component';
import { FlightBookingListComponent } from './flight-booking-list/flight-booking-list.component';
import {ContactModule} from '@app/contact/contact.module';
import { SavedTravellersComponent } from './saved-travellers/saved-travellers.component';
import { AddTravellersComponent } from './add-travellers/add-travellers.component';
import { SavedCardsComponent } from './saved-cards/saved-cards.component';
import { DeleteModalComponent } from './delete-modal/delete-modal.component';
import { AddCardComponent } from './add-card/add-card.component';
import { NgxIntlTelInputModule } from 'ngx-intl-tel-input';

const maskConfig: Partial<IConfig> = {
  validation: true,
};
@NgModule({
  declarations: [
    DashboardComponent,
    BookingsComponent,
    TravellersComponent,
    PaymentsComponent,
    UpdateTravellerComponent,
    ProfileInfoComponent,
    ItinaryViewComponent,
    ManageBookingsComponent,
    ChangeBookingDateComponent,
    EditPassengerDetailsComponent,
    QueryRecordComponent,
    WalletComponent,
    HotelBookingsListComponent,
    ViewHotelBookingDetailsComponent,
    FlightBookingListComponent,
    SavedTravellersComponent,
    AddTravellersComponent,
    SavedCardsComponent,
    DeleteModalComponent,
    AddCardComponent,
  ],
  imports: [
    CommonModule,
    MyAccountRoutingModule,
    SharedModule,
    // OEM NgxPrintModule,
    NgxDatatableModule,
    CustomMaterialModule,
    FormsModule,
    NgbModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    ModalModule.forRoot(),
    NgxMaskModule.forRoot(maskConfig),
    TranslateModule,
    I18nModule,
    ContactModule,
    NgxIntlTelInputModule,
  ],
})
export class MyAccountModule {}
