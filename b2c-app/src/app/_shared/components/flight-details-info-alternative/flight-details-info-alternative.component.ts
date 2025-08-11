import { Component, Input, OnInit } from '@angular/core';
import { responsiveService } from '@app/_core';
import { AppSessionService } from '@app/_shared/session/app-session.service';
import { Odo } from '@app/flights/models/results/odo.model';
import { SearchService } from '@app/flights/service/search.service';
import { getAirportNames, getTime } from '@app/flights/utils/odo.utils';
import { getFlightResults } from '@app/flights/utils/results.utils';
import {
  getLayoverLabels,
  GetLapoverTime,
} from '@app/flights/utils/search-results-itinerary.utils';
import { ApiService } from '@app/general/services/api/api.service';
import { UniversalStorageService } from './../../../general/services/universal-storage.service';
declare let $: any;

@Component({
  selector: 'app-flight-details-info-alternative',
  templateUrl: './flight-details-info-alternative.component.html',
  styleUrls: ['./flight-details-info-alternative.component.scss', './../../../../theme/stops-line.scss'],
})
export class FlightDetailsInfoAlternativeComponent implements OnInit {
  @Input() itineraryData: any = {};
  public flightsList: any = [];
  flightsearchInfo: any;
  airlineCode: any;
  fareOdoList: any;
  tripType: any = null;
  locationsInfo: any = [];
  airports: any;
  load = false;
  isExpandedCardMap = new Map<string, boolean>();
  locationCodeToAirportMap = new Map<string, string>();

  constructor(
    public responsiveService: responsiveService,
    public apiService: ApiService,
    public appSessionService: AppSessionService,
    private readonly searchService: SearchService,
    private storage: UniversalStorageService,
  ) {}

  ngOnInit() {
    this.flightsList = getFlightResults();
    if (this.storage.getItem('flightsearchInfo', 'session')) {
      this.flightsearchInfo = JSON.parse(this.storage.getItem('flightsearchInfo', 'session') ?? '');
      this.tripType = this.flightsearchInfo.tripType;
    } else {
      this.tripType = this.itineraryData?.bookingInformation?.tripType;
    }
    this.extractAllTechnicalStopLocationsWithAirportNames(this.itineraryData.itineraries);

    this.itineraryData.itineraries.forEach((itinerary: any, parentIndex: number) => {
      itinerary.odoList.forEach((odo: any, index: number) => {
        this.isExpandedCardMap.set(this.getIsExpandedMapKey(parentIndex, index), false);  
      });
    });
  }

  toggleIsExpandedCard(parentIndex: number, index: number) {
    const key = this.getIsExpandedMapKey(parentIndex, index);
    this.isExpandedCardMap.set(key, !this.isExpandedCardMap.get(key));
  }

  getIsExpandedMapKey(parentIndex: number, index: number): string {
    return `${parentIndex},${index}`;
  }

  getIsExpandedValue(parentIndex: number, index: number): boolean {
    return this.isExpandedCardMap.get(this.getIsExpandedMapKey(parentIndex, index)) ?? true;
  }

  public getAirportName(param: string) {
    if (!this.flightsList?.airportInfos) {
      return param;
    } else {
      return getAirportNames(param, this.flightsList.airportInfos);
    }
  }

  public getTimeInHours(ms: number) {
    return getTime(ms);
  }

  public getLayoverTxt(odo: Odo) {
    return getLayoverLabels(odo.segments);
  }

  public getLayoverTime(odo: Odo) {
    return GetLapoverTime(odo.segments, this.flightsList?.airportInfos);
  }
  openTBIFareRules(selectedOdolList: any, param: any) {
    this.airlineCode = param;
    this.fareOdoList = selectedOdolList;
    $('#TBI_fare_rules_Modal').modal('show');
  }
  public baggageDes(bag: any) {
    if (bag.includes('hand baggage')) {
      return bag.slice(0, bag.indexOf('hand baggage'));
    } else {
      return bag;
    }
  }

  handBag(bag: any) {
    return bag.includes('hand baggage');
  }
  baggageDesc(bag: any) {
    if (bag.includes('hand baggage') && bag !== 'No baggage allowance') {
      return 'Hand baggage';
    } else if (bag !== 'No baggage allowance') {
      return 'Checked baggage';
    } else if (bag == 'No baggage allowance') {
      return 'No baggage';
    }
  }

  /**getting airports list */
  async getTechnicalAirportName(airportCode: string) {
    this.searchService.getAirports(airportCode).subscribe((airports: any) => {
      if (airports) {
        this.airports = airports;
      }
    });
  }

  /**Extracing all the technical airports */
  public extractAllTechnicalStopLocationsWithAirportNames(itineraries: any[]): any {
    let airportName: any;
    itineraries.forEach((itinerary: any) =>
      itinerary.odoList.forEach((odo: any) =>
        odo.segments.forEach((segment: any) => {
          if (segment.technicalStopLocations && segment.technicalStopLocations.length > 0) {
            for (const stop of segment.technicalStopLocations) {
              this.getTechnicalAirportName(stop.location);
              setTimeout(() => {
                airportName = this.airports.find((airport: any) => airport.code === stop.location);
                this.locationsInfo.push({
                  ...stop,
                  airportName: airportName?.airport,
                });
                return this.locationsInfo;
              }, 1000);
            }
          }
        })
      )
    );
  }
}
