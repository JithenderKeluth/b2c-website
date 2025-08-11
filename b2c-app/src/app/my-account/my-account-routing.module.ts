import { ViewHotelBookingDetailsComponent } from './view-hotel-booking-details/view-hotel-booking-details.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthenticationGuard } from '@app/auth/authentication.guard';
import { DashboardComponent } from './dashboard/dashboard.component';
import { EditPassengerDetailsComponent } from './edit-passenger-details/edit-passenger-details.component';
import { ItinaryViewComponent } from './itinary-view/itinary-view.component';
import { ManageBookingsComponent } from './manage-bookings/manage-bookings.component';
import { QueryRecordComponent } from './query-record/query-record.component';

const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    canActivate: [AuthenticationGuard],
  },
  {
    path: 'view-booking',
    component: ItinaryViewComponent,
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
  },
  {
    path: 'dashboards',
    component: DashboardComponent,
  },
  {
    path: 'manage-booking',
    component: ManageBookingsComponent,
  },
  {
    path: 'edit-passenger-details',
    component: EditPassengerDetailsComponent,
  },
  {
    path: 'query-record',
    component: QueryRecordComponent,
  },
  {
    path: 'wallet',
    component: DashboardComponent,
  },
  {
    path: 'hotel-booking-details',
    component: ViewHotelBookingDetailsComponent,
  },
  {
    path: 'help',
    component: DashboardComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MyAccountRoutingModule {}
