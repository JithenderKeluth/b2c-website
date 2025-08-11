import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PassengersComponent } from './passengers/passengers.component';
import { FlightsViewComponent } from './flights-view/flights-view.component';
import { ResultsViewComponent } from './results-view/results-view.component';
import { FlightCardComponent } from './flight-card/flight-card.component';

const routes: Routes = [
  {
    path: 'flights',
    component: FlightsViewComponent,
  },
  {
    path: 'results',
    component: FlightsViewComponent,
  },
  {
    path: 'results-view',
    component: ResultsViewComponent,
  },
  {
    path: 'flight-card',
    component: FlightCardComponent,
  },
  {
    path: 'pax',
    component: PassengersComponent,
  },
];

@NgModule({
  declarations: [],
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FlightsRoutingModule {}
