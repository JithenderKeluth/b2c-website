import {
  Component,
  OnInit,
  Input,
  Output,
  SimpleChanges,
  EventEmitter,
  ElementRef,
  ViewChild,
  OnDestroy,
} from '@angular/core';
import { getDurationDays, getAirportNames, getTime, getBaggageInfo } from './../utils/odo.utils';

import { SharedFlightService } from './../service/sharedFlight.service';
import { getAirlinePromo_info, getFlightResults, getItineraryBestRank } from '../utils/results.utils';
import { responsiveService } from './../../_core/services/responsive.service';
import { shouldShowPerPersonPrice } from '../utils/search-data.utils';
import { getAirline } from '../utils/segment.utils';
import {
  checkSeatsNum,
  getStops,
  getStopsNum,
  getTechStopsByOdoList,
  offLineNgBanner,
  stopsWithLocations,
  displayItinPrice,
} from '../utils/search-results-itinerary.utils';
import { ApiService } from '@app/general/services/api/api.service';
import { IframeWidgetService } from '@app/general/services/iframe-widget.service';
import { B2bApiService } from '../../general/services/B2B-api/b2b-api.service';
import { Subscription } from 'rxjs';
import { UniversalStorageService } from '@app/general/services/universal-storage.service';
declare let $: any;

@Component({
  selector: 'app-flight-card',
  templateUrl: './flight-card.component.html',
  styleUrls: ['./flight-card.component.scss', './../../../theme/stops-line.scss'],
})
export class FlightCardComponent implements OnInit, OnDestroy {
  public region: string;
  @Input() itinerary: any = [];
  @Output() selectedItinerary: EventEmitter<any> = new EventEmitter();
  @Input() isMoreFlightsAvl: number;
  @Output() viewMoreFlights: EventEmitter<any> = new EventEmitter();
  public selectedValue: any;
  public flightsList: any;
  @Input() seletedOutBoundItin: any;
  @Input() selectedInBoundItin: any;

  selectedItin_details: any = [];

  ExpandedFlightDetails: any = -1;
  @ViewChild('collapseFlightDetails') collapseFlightDetails: ElementRef;

  activeFlight: number = -1;

  public domesticFlight: any;
  public flightSearchData: any;
  public isshowFlightDetails: boolean = false;

  itineraryToBeEdited: any = null;
  selectedTripType: any = 'return';
  flightsPriceToBeUpdated: any = null;
  private activeFlightSubjectSubscription: Subscription;
  private flightHandlersSubscription: Subscription;

  constructor(
    private sharedFlightService: SharedFlightService,
    public responsiveService: responsiveService,
    public apiService: ApiService,
    public Iframewidgetservice: IframeWidgetService,
    private b2bApiService: B2bApiService,
    private storage: UniversalStorageService
  ) {
    this.activeFlightSubjectSubscription = this.sharedFlightService.activeFlightSubject$.subscribe((itin) => {
      this.ExpandedFlightDetails = itin;
    });
  }

  ngOnInit(): void {
    this.region = this.apiService.extractCountryFromDomain() || 'ZA';
    this.flightSearchData = JSON.parse(this.storage.getItem('flightsearchInfo', 'session'));
    this.flightHandlersSubscription = this.sharedFlightService.flightHandlers$.subscribe((data) => {
      this.flightResults();
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    for (let property in changes) {
      if (property === 'groupedItineraries') {
        this.itinerary = changes[property].currentValue;
        this.selectedItin_details = this.itinerary;
      }
    }
  }
  public isActive(itinerary: any) {
    return (
      (this.seletedOutBoundItin && this.seletedOutBoundItin.id == itinerary.id) ||
      (this.selectedInBoundItin && this.selectedInBoundItin.id == itinerary.id)
    );
  }

  public isDomesticFlight(itinerary: any) {
    if (this.domesticFlight && this.domesticFlight.id == itinerary.id) {
      return true;
    }
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

  public getCityName(param: string) {
    // return getCitiesNames(param, this.flightslist.airportInfos);
  }
  public getAirlinename(airline: string) {
    return airline.length > 12 &&
      this.isUnBundleFlight() &&
      (this.responsiveService.screenWidth == 'sm' || this.responsiveService.screenWidth == 'md')
      ? airline.slice(0, 10).concat('...')
      : airline;
  }

  public getTimeInHours(ms: number) {
    return getTime(ms);
  }

  selectFlight(itinerary: any) {
    this.sharedFlightService.viewSelectedFlightDetails(false);
    this.sharedFlightService.updateSelectedFlight(itinerary);
    this.storage.removeItem('selectedFlight');
    this.storage.setItem('selectedFlight', JSON.stringify(itinerary), 'session');
  }

  selectDomesticFlight(itinerary: any) {
    this.domesticFlight = itinerary;
    this.selectedItinerary.emit(itinerary);
  }

  /*
   ** displays the Flight details button only for segments length greater than 0
   */
  showFlightDetails(odoList: any[]): boolean {
    for (let segment of odoList) {
      const numStops = parseInt(segment?.segments?.length) - 1;
      if (numStops > 0) {
        return true;
      }
    }
    return false;
  }

  /**
   * this method is called when hide flight details from flight info componet as event handler
   */
  notifyFlightsCard(argument: any) {
    this.activeFlight = -1;
    this.isshowFlightDetails = false;
  }

  toggleFlightDetails(itinerary: any, index: any) {
    this.sharedFlightService.setActiveFlight(itinerary.id);
    this.sharedFlightService.updateSelectedItin(itinerary);
    this.activeFlight = index;
    this.isshowFlightDetails = true;
  }

  isDetailsOpen(index: any): boolean {
    return this.activeFlight === index;
  }

  flightResults() {
    this.flightsList = getFlightResults();
  }

  public getBaggage(id: number, param: string): any {
    return getBaggageInfo(id, param, this.flightsList.baggageAllowanceInfos, true);
  }
  getPromoText(promotext: string) {
    if (
      promotext.length > 30 &&
      !this.flightsList.itineraries &&
      this.responsiveService.screenWidth != 'sm' &&
      this.responsiveService.screenWidth != 'md'
    ) {
      return promotext.slice(0, 30).concat('...');
    } else {
      return promotext;
    }
  }
  viewFlightDetails(itinerary: any) {
    this.sharedFlightService.updateSelectedFlight(itinerary);
    this.sharedFlightService.viewSelectedFlightDetails(true);
  }
  viewMoreFlight() {
    this.viewMoreFlights.emit();
  }

  /**further we need to optimize the below code */
  isMobile(): boolean {
    return this.responsiveService.screenWidth == 'sm' || this.responsiveService.screenWidth == 'md' ? true : false;
  }
  isWeb(): boolean {
    return this.responsiveService.screenWidth == 'sm' || this.responsiveService.screenWidth == 'md' ? false : true;
  }
  isUnBundleFlight(): boolean {
    return this.itinerary.flightType == 'outBound' || this.itinerary.flightType == 'inBound' ? true : false;
  }
  isBundleFlight(): boolean {
    return this.itinerary.flightType == 'outBound' || this.itinerary.flightType == 'inBound' ? false : true;
  }
  showPerson_Price() {
    return shouldShowPerPersonPrice(this.flightSearchData) && !this.Iframewidgetservice.isB2BApp();
  }
  getAirlinePromo_txt(airlineCode: string, param: string) {
    return getAirlinePromo_info(airlineCode, param);
  }
  /**checking the number of seats available */
  getSeatscount(flightsObj: any) {
    return checkSeatsNum(flightsObj);
  }
  public getDurationDays(segment: any) {
    return getDurationDays(segment);
  }

  /*
   *  edit price model section
   */
  hasPermissionToEditFlightPrice() {
    return this.Iframewidgetservice.isB2BApp() && this.isBundleFlight() && this.b2bApiService.hasEditPricePermission();
  }

  /**for B2B open modal for edit price */
  openEditPriceModelHandler(flights: any) {
    this.flightsPriceToBeUpdated = flights;
    this.itineraryToBeEdited = flights;
    this.sharedFlightService.editpriceModalValue(flights);
    $('#editprice_modal').modal('show');
  }

  ngOnDestroy() {
    this.sharedFlightService.editpriceModalValue(null);
    this.activeFlightSubjectSubscription.unsubscribe();
    this.flightHandlersSubscription.unsubscribe();
  }

  public getBestRank(itinerary: any) {
    let showRecommended = false;
    let bestRankItins: any[] = [];
    bestRankItins = getItineraryBestRank(itinerary);
    showRecommended = bestRankItins.some((item) => item.rank === '1');
    return showRecommended;
  }
  /**It checks for the presence of a validating carrier. If a validating carrier is specified,
    it returns the code for that carrier. Otherwise, it returns the airline code for the first segment*/
  public getAirlineCode(odoList: any) {
    return getAirline(odoList);
  }
  getItinerary(itineray: any, flightType: string) {
    itineray['flightType'] = flightType;
    return itineray;
  }
  offlineNgAirline() {
    return false;//!this.Iframewidgetservice.isB2BApp() && this.region === 'NG' && offLineNgBanner(this.flightSearchData);
  }

  /**It is to place the dots between the stop line based on technical stop locations */
  getStopPositions(count: number) {
    return getStops(count);
  }

  /**It returns the Technical stops text along with locations */
  public getTechStopsTxt(odoList: any) {
    return getTechStopsByOdoList(odoList);
  }
  /**It returns the stops and locations */
  public getStopsWithLocations(odoList: any) {
    return stopsWithLocations(odoList);
  }

  isEnableBNPL(amount: number): boolean {
    const isSouthAfrica = this.region === 'ZA';
    const isNotInIframe = this.Iframewidgetservice.isFrameWidget();
    const isB2B = !this.Iframewidgetservice.isB2BApp();
    return isSouthAfrica && isNotInIframe && isB2B;
  }

  displayItnPrice(itinerary: any) {
    itinerary.discountAmount = itinerary.fareBreakdown?.discountAmount || 0;
    return displayItinPrice(itinerary, this.showPerson_Price(), this.flightsList.isIntl,this.flightsList.isBundled);
  }
}
