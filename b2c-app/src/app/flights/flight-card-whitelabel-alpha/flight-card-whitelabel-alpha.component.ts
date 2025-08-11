import {
  Component,
  EventEmitter,
  Output,
} from '@angular/core';

import { FlightCardBase } from '../flight-card/flight-card-base';
import { B2bApiService } from '@app/general/services/B2B-api/b2b-api.service';
import { ApiService } from '@app/general/services/api/api.service';
import { IframeWidgetService } from '@app/general/services/iframe-widget.service';
import { SharedFlightService } from '../service/sharedFlight.service';
import { responsiveService } from '@core/services/responsive.service';

@Component({
  selector: 'app-flight-card-whitelabel-alpha',
  templateUrl: './flight-card-whitelabel-alpha.component.html',
  styleUrls: ['./flight-card-whitelabel-alpha.component.scss'],
})
export class FlightCardWhitelabelAlphaComponent extends FlightCardBase {

  @Output()
  viewDetails = new EventEmitter<any>();

  flags: { flagType: string, flagText: string }[] = [];

  constructor(
    sharedFlightService: SharedFlightService,
    responsiveService: responsiveService,
    apiService: ApiService,
    Iframewidgetservice: IframeWidgetService,
    b2bApiService: B2bApiService,
  ) {
    super(
      sharedFlightService,
      responsiveService,
      apiService,
      Iframewidgetservice,
      b2bApiService
    );
  }

  ngOnInit(): void {
    super.ngOnInit();

    if (this.itinerary) {
      const seatCount = this.getSeatscount(this.itinerary);
      if (Array.isArray(this.itinerary.flagTypes)) {
        this.flags = this.itinerary.flagTypes.map((flagType: string) => ({
          flagType: flagType,
          flagText: flagType,
        }));
      }
      if (seatCount === 1) {
        this.flags.push({
          flagType: 'Seats',
          flagText: this.region === 'SB' ? 'Only 1 seat available' : 'Only 1 Seat left!',
        });
      } else if (seatCount > 1) {
        this.flags.push({
          flagType: 'Seats',
          flagText: this.region === 'SB' ? `Only ${seatCount} seats available` : `Only ${seatCount} seats left at this price!`,
        });
      } 
    }
  }

  onViewDetails() {
    if (this.itinerary) {
      this.viewDetails.next(this.itinerary);
    }
  }

}
