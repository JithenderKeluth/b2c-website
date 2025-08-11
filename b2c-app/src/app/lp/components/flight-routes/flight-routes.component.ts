import { CMSService } from './../../cms.service';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'lp-flight-routes',
  templateUrl: './flight-routes.component.html',
  styleUrls: ['./flight-routes.component.scss'],
})
export class FlightRoutesComponent {
  @Input() flightRoutes: any = {};
  termsExpanded = false;

  constructor(private cmsService: CMSService) {}

  getReturnDateParameter(route: any) {
    if (route.trip_type == 'ROUNDTRIP') {
      return `&return_date=${route.return_date}`;
    } else {
      return '';
    }
  }
  getAirlineParameter(route: any) {
    if (route.airline_code) {
      return `&airline=${route.airline_code}`;
    } else {
      return '';
    }
  }
  followLink(route: any) {
    const path = `/search?depart_date=${route.departure_date}&from=${route.departure_code}${this.getReturnDateParameter(
      route
    )}&to=${route.destination_code}${this.getAirlineParameter(route)}&search=true`;
    // For search link, set true
    this.cmsService.followLink(path, true);
  }

  toggle() {
    this.termsExpanded = !this.termsExpanded;
  }
}
