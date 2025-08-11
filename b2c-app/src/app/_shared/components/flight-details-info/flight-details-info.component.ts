import { Component, Input, OnInit } from '@angular/core';
import { responsiveService } from '@app/_core';
import { AppSessionService } from '@app/_shared/session/app-session.service';
import { Odo } from '@app/flights/models/results/odo.model';
import { SearchService } from '@app/flights/service/search.service';
import { getAirportNames, getTime, truncateAirlineName } from '@app/flights/utils/odo.utils';
import { getFlightResults } from '@app/flights/utils/results.utils';
import {
  getLayoverLabels,
  GetLapoverTime,
  getStops,
  stopsWithLocations,
  getStopsNum,
} from '@app/flights/utils/search-results-itinerary.utils';
import { ApiService } from '@app/general/services/api/api.service';
import { UniversalStorageService } from '@app/general/services/universal-storage.service';
declare let $: any;
@Component({
  selector: 'app-flight-details-info',
  templateUrl: './flight-details-info.component.html',
  styleUrls: ['./flight-details-info.component.scss', './../../../../theme/stops-line.scss'],
})
export class FlightDetailsInfoComponent implements OnInit {
  @Input() itinerary_Data_Info: any = {};
  public flightsList: any = [];
  flightsearchInfo: any;
  airlineCode: any;
  fareOdoList: any;
  tripType: any = null;
  locationsInfo: any = [];
  airports: any;
  load = false;

  constructor(
    public responsiveService: responsiveService,
    public apiService: ApiService,
    public appSessionService: AppSessionService,
    private readonly searchService: SearchService,
    private storage: UniversalStorageService
  ) {}

  ngOnInit() {
    this.flightsList = getFlightResults();
    if (this.storage.getItem('flightsearchInfo', 'session')) {
      this.flightsearchInfo = JSON.parse(this.storage.getItem('flightsearchInfo', 'session'));
      this.tripType = this.flightsearchInfo.tripType;
    } else {
      this.tripType = this.itinerary_Data_Info?.bookingInformation?.tripType;
    }
    this.extractAllTechnicalStopLocationsWithAirportNames(this.itinerary_Data_Info.itineraries);
  }

  public getAirportName(param: string) {
    if (
      this.responsiveService.screenWidth === 'sm' ||
      this.responsiveService.screenWidth === 'md' ||
      !this.flightsList?.airportInfos
    ) {
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
  public getAirlinename(airline: string) {
    return this.responsiveService.screenWidth === 'sm' || this.responsiveService.screenWidth === 'md'
      ? truncateAirlineName(airline, true)
      : airline;
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
  bagageDesc(bag: any) {
    if (bag.includes('hand baggage') && bag !== 'No baggage allowance') {
      return 'Hand baggage';
    } else if (bag !== 'No baggage allowance') {
      return 'Checked baggage';
    } else if (bag == 'No baggage allowance') {
      return 'No baggage';
    }
  }

  /**Displaying the Technical stops by segment level */
  getTechStopsContent(segments: any) {
    const stopDetails = segments.technicalStopLocations.map((stop: any) => {
      const durationFormatted = this.getTimeInHours(stop.duration);
      return `${this.getTechStopAirportName(stop.location)} | ${durationFormatted}`;
    });
    const locationList = stopDetails.join(', ');
    if (segments?.aircraftType !== 'Train') {
      return segments.technicalStops > 1
        ? `${segments.technicalStops} Technical stops at ${locationList}`
        : `${segments.technicalStops} Technical stop at ${locationList}`;
    }
    return '';
  }

  /**It is to place the dots between the stop line based on technical stop locations */
  getStopPositions(count: number) {
    return getStops(count);
  }
  /**It returns the stops and locations */
  public getStopsWithLocations(odoList: any) {
    return stopsWithLocations(odoList);
  }

  /**getting the airport names from location API or airports list from results */
  public getTechStopAirportName(airportCode: string) {
    let airportName: any;
    airportName = getAirportNames(airportCode, this.flightsList.airportInfos);
    if (!airportName) {
      for (let i in this.locationsInfo) {
        if (this.locationsInfo[i]?.location === airportCode) {
          airportName = this.locationsInfo[i]?.airportName;
          this.load = true;
          return airportName || airportCode;
        }
      }
    }
    if (airportName) {
      this.load = true;
      return airportName || airportCode;
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
