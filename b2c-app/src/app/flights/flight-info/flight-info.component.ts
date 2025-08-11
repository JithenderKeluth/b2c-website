import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Odo } from '../models/results/odo.model';
import {
  GetLapoverTime,
  getLayoverLabels,
  getStops,
  getStopsNum,
  getTechStopsBySegments,
  stopsWithLocations,
} from '../utils/search-results-itinerary.utils';
import { responsiveService } from './../../_core/services/responsive.service';

import { getAirportNames, getBaggageInfo, getTime, truncateAirlineName } from './../utils/odo.utils';
import { SharedFlightService } from '../service/sharedFlight.service';
import { getFlightResults } from '../utils/results.utils';
import { Subscription } from 'rxjs';
import { UniversalStorageService } from '@app/general/services/universal-storage.service';

@Component({
  selector: 'app-flight-info',
  templateUrl: './flight-info.component.html',
  styleUrls: [
    './flight-info.component.scss',
    './../flight-card/flight-card.component.scss',
    './../../../theme/stops-line.scss',
  ],
})
export class FlightInfoComponent implements OnInit {
  @Input() itinerary_info: any = [];
  public flightslist: any = [];
  @Output() notifyFlightCard: EventEmitter<any> = new EventEmitter<any>();
  public flightsList: any;
  flightsearchInfo: any;
  selectedItin$Subscription: Subscription;
  constructor(private sharedFlightService: SharedFlightService, public responsiveService: responsiveService, private storage: UniversalStorageService) {}

  ngOnInit(): void {
    if (this.storage.getItem('flightsearchInfo', 'session')) {
      this.flightsearchInfo = JSON.parse(this.storage.getItem('flightsearchInfo', 'session'));
    }
    this.selectedItin$Subscription = this.sharedFlightService.selectedItin$.subscribe((data: any) => {
      if (data) {
        this.flightslist = getFlightResults();
        this.itinerary_info = data;
      }
    });
    this.flightResults();
  }

  toggleDiv(itinerary: any, index: number) {
    this.notifyFlightCard.emit(itinerary);
  }

  public getAirportName(param: string) {
    if (this.responsiveService.screenWidth == 'sm' || this.responsiveService.screenWidth == 'md') {
      return param;
    } else {
      return getAirportNames(param, this.flightsList.airportInfos);
    }
  }

  public getStops(segments: any) {
    return getStopsNum(segments);
  }

  public getTimeInHours(ms: number) {
    return getTime(ms);
  }

  flightResults() {
    this.flightsList = getFlightResults();
  }

  public getBaggage(id: number, param: string): any {
    return getBaggageInfo(id, param, this.flightslist.baggageAllowanceInfos, true);
  }

  public getAirlinename(airline: string) {
    return this.responsiveService.screenWidth == 'sm' || this.responsiveService.screenWidth == 'md'
      ? truncateAirlineName(airline, true)
      : airline;
  }

  public getLayoverTxt(odo: Odo) {
    return getLayoverLabels(odo.segments);
  }

  public getLayoverTime(odo: Odo) {
    return GetLapoverTime(odo.segments, this.flightslist.airportInfos);
  }
  ngOnDestroy() {
    this.selectedItin$Subscription.unsubscribe();
  }

  /**Displaying the Technical stops */
  getTechStops(segments: any) {
    return getTechStopsBySegments(segments);
  }
  /**It returns the stops and locations */
  public getStopsWithLocations(odoList: any) {
    return stopsWithLocations(odoList);
  }
  /**It is to place the dots between the stop line based on technical stop locations */
  getStopPositions(count: number) {
    return getStops(count);
  }
}
