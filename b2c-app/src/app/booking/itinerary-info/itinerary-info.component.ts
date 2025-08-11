import { Component, Input, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { getTime, getBaggageInfo, getAirportNames } from './../../flights/utils/odo.utils';
import { Odo } from './../../flights/models/results/odo.model';
import { SearchResults } from './../../flights/models/results/search-results.model';
import { ApiService } from '@app/general/services/api/api.service';
import {
  GetLapoverTime,
  getLayoverLabels,
  getStops,
  getStopsNum,
  getTechStopsByOdoList,
  stopsWithLocations,
} from './../../flights/utils/search-results-itinerary.utils';
import { bagageDescLabel, baggageDesc, isHandBag } from '../utils/products.utils';
import { responsiveService } from '@app/_core';
import { DeepLinkService } from '@app/general/deeplinks/deep-link.service';
import { getStorageData } from '@app/general/utils/storage.utils';
import { UniversalStorageService } from '@app/general/services/universal-storage.service';
import { isPlatformBrowser } from '@angular/common';
declare const $: any;
@Component({
  selector: 'app-itinerary-info',
  templateUrl: './itinerary-info.component.html',
  styleUrls: ['./itinerary-info.component.scss', './../../../theme/stops-line.scss'],
})
export class ItineraryInfoComponent implements OnInit {
  public flightsResultsResponse: SearchResults;
  public flightsearchInfo: any;
  public deepLink: any;
  @Input() pricedResult_data: any;
  itinerariesArray: any;
  airlineCode: string = '';
  isShowFlightDetails = false;
  country: string;
  private isBrowser: boolean;
  isPaymentPageView : boolean = false;

  constructor(
    public apiService: ApiService,
    private deepLinkService: DeepLinkService,
    public responsiveService: responsiveService,
    private storage: UniversalStorageService,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.country = this.apiService.extractCountryFromDomain();
  }

  ngOnInit(): void {
    this.deeplinkCheck();
    this.flightsResultsResponse = JSON.parse(getStorageData('flightResults'));
    this.flightsearchInfo = JSON.parse(this.storage.getItem('flightsearchInfo', 'session'));
    if (this.pricedResult_data && this.pricedResult_data.itineraries) {
      this.itinerariesArray = this.pricedResult_data.itineraries;
    }
    if(this.isBrowser){
      this.isPaymentPageView = Boolean(window.location.pathname.includes('payments'));
    }
  }

  public getCityName(param: string) {
    if (this.responsiveService.screenWidth === 'sm' || this.responsiveService.screenWidth === 'md') {
      return param;
    } else {
      return getAirportNames(param, this.flightsResultsResponse?.airportInfos);
    }
  }

  public getLayoverTime(odo: Odo) {
    //return getDurationDays(odo) + ' days';
    return GetLapoverTime(odo.segments, this.flightsResultsResponse?.airportInfos);
  }

  public getBaggage(id: number, param: string) {
    return getBaggageInfo(id, param, this.flightsResultsResponse?.baggageAllowanceInfos);
  }
  // formate time from minutes
  public getTimeInHours(ms: number) {
    return getTime(ms);
  }
  openFareRules() {
    $('#fare_rules_Modal').modal('show');
  }
  public baggageDes(bag: any) {
    return baggageDesc(bag);
  }
  handBag(bag: any) {
    return isHandBag(bag);
  }
  bagageDesc(bag: any) {
    return bagageDescLabel(bag);
  }
  public getLayoverTxt(odo: Odo) {
    return getLayoverLabels(odo.segments);
  }
  ngOnDestroy() {
    $('#fare_rules_Modal').modal('hide');
    $('#TBI_fare_rules_Modal').modal('hide');
  }
  /**To view and hide flight details */
  viewFlightDetails(param: boolean) {
    this.isShowFlightDetails = param;
  }
  deeplinkCheck() {
    if (!this.isBrowser) return;
    this.deepLink = this.deepLinkService.getRequestType(window.location.href);
    this.isShowFlightDetails = this.deepLink === 'PRICE';
  }

  /**It is to place the dots between the stop line based on technical stop locations */
  getStopsDots(count: number) {
    return getStops(count);
  }

  /**Displaying the stops based on segments */
  public getStops(segments: any) {
    return getStopsNum(segments);
  }

  /**It returns the Technical stops text along with locations */
  public getTechnicalStopsTxt(odoList: any) {
    if (getTechStopsByOdoList(odoList)) {
      return getTechStopsByOdoList(odoList);
    }
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
