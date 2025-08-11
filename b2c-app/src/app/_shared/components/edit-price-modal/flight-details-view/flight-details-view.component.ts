import { Component, Input, OnInit } from '@angular/core';
import { getAirportNames, getBaggageInfo, getStopsData, getTime } from '../../../../flights/utils/odo.utils';
import { Odo } from '@app/flights/models/results/odo.model';
import { GetLapoverTime, getLayoverLabels } from '@app/flights/utils/search-results-itinerary.utils';
import { responsiveService } from '@app/_core';
import { getFlightResults } from '@app/flights/utils/results.utils';
import { bagageDescLabel, baggageDesc, isHandBag } from '@app/booking/utils/products.utils';

@Component({
  selector: 'app-flight-details-view',
  templateUrl: './flight-details-view.component.html',
  styleUrls: ['./flight-details-view.component.scss'],
})
export class FlightDetailsViewComponent implements OnInit {
  flightsList: any = [];
  @Input() odoList: any;
  HAND: string = 'hand';
  CHECKED: string = 'checked';
  constructor(
    public responsiveService: responsiveService
  ) {}
  ngOnInit(): void {
    this.flightsList = getFlightResults();
  }

  public getAirportName(param: string) {
    if (this.responsiveService.screenWidth == 'sm' || this.responsiveService.screenWidth == 'md') {
      return param;
    } else {
      return getAirportNames(param, this.flightsList.airportInfos);
    }
  }

  public getStops(segments: any) {
    return getStopsData(segments);
  }
  public getBaggage(id: number, param: string): any {
    return getBaggageInfo(id, param, this.flightsList.baggageAllowanceInfos, true);
  }
  public getTimeInHours(ms: number) {
    return getTime(ms);
  }
  public getAirlinename(airline: string) {
    return airline?.length > 15 &&
      (this.responsiveService.screenWidth == 'sm' || this.responsiveService.screenWidth == 'md')
      ? airline.slice(0, 15).concat('...')
      : airline;
  }
  hangBag(bag: any) {
    return isHandBag(bag);
  }
  bagageDesc(bag: any) {
   return bagageDescLabel(bag)
  }
  public getLayoverTxt(odo: Odo) {
    return getLayoverLabels(odo.segments);
  }

  public getLayoverTime(odo: Odo) {
    return GetLapoverTime(odo.segments, this.flightsList.airportInfos);
  }
  public baggageDescription(bag: any) {
    return baggageDesc(bag);
  }

}
