import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BookingViewComponent } from './booking-view/booking-view.component';

const routes: Routes = [
  {
    path: '',
    component: BookingViewComponent,
  },
  {
    path: 'flight-details',
    component: BookingViewComponent,
  },
  {
    path: 'products',
    component: BookingViewComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BookingRoutingModule {}
