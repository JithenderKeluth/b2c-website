import { Component, OnInit, ViewChild, Output, EventEmitter, ElementRef, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { Subscription } from 'rxjs';
import { responsiveService } from '../../../app/_core';
import { SearchData } from './../models/search/search-data.model';
import { normalizeSearchData, fetchFlightsJson } from './../utils/search-data.utils';
import { I18nService } from '@app/i18n';
import { NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '@app/general/services/api/api.service';
import { SearchService } from './../service/search.service';
import { getBestFlights, getGroupedItineraries } from './../utils/results.utils';
import { SearchComponent } from './../search/search.component';
import { BookingService } from '@app/booking/services/booking.service';
import { DeepLinkService } from '@app/general/deeplinks/deep-link.service';
import { SessionStorageService } from 'ngx-webstorage';
import { GoogleTagManagerServiceService } from '../../_core/tracking/services/google-tag-manager-service.service';
import { SharedFlightService } from '../service/sharedFlight.service';
import {
  checkAirlineParam,
  checkDestAirports,
  checkDestCabinClasses,
  checkEK_hFlight,
  checkSearchErrors,
  domesticDestAirportsCheck,
  hasItineraries,
  orderListBy,
  recentSearchesInfo,
  transitVisaCheck,
} from '../utils/search-results-itinerary.utils';
import { NavigationService } from '../../general/services/navigation.service';
import { IframeWidgetService } from '../../general/services/iframe-widget.service';
import { FilterServiceService } from '../service/filter-service.service';
import { BookingCountdownService } from '../../general/utils/bookingFlowCountdown';
import { StorageService } from '../../general/services/storage.service';
import { Router } from '@angular/router';
declare const $: any;
import { getStorageData, removeStorageData, setStorageData } from '../../general/utils/storage.utils';
import { SessionUtils } from '../../general/utils/session-utils';
import { UniversalStorageService } from '@app/general/services/universal-storage.service';
import { isPlatformBrowser } from '@angular/common';
import { UiStateService } from '@shared/services/ui-state.service';

@Component({
  selector: 'app-flights-view',
  templateUrl: './flights-view.component.html',
  styleUrls: ['./flights-view.component.scss', './../../../theme/bottom-wrapper.scss'],
})
export class FlightsViewComponent implements OnInit, OnDestroy {
  public flightSearchData: any = new SearchData();
  public searchData: any = new SearchData();
  public flightslist: any = null;
  public groupedItinerariesData: any = [];
  public inboundItineraries: any = [];
  public outboundItineraries: any = [];
  public airportsArray: any = [];
  public showmultiCity: boolean;
  public showSearch_page = false;
  public switchDomFilght = false;
  @ViewChild('Search') public Search: SearchComponent;
  @Output() flightDetailsData: EventEmitter<any> = new EventEmitter<any>();
  public airportsList: EventEmitter<any> = new EventEmitter();
  public transitVisaRequired: EventEmitter<boolean> = new EventEmitter();
  public sendEvent: EventEmitter<boolean> = new EventEmitter();
  public domSelected: EventEmitter<any> = new EventEmitter();
  public bookingFlight: any;
  public outBoundSelected: any;
  public inBoundSelected: any;
  public domesticItinerary: any;

  public showMask = false;
  public noFilters: boolean;

  public currentFlights: number = 0 - 1;
  public noFlightsMatch = false;
  public isErrorFromApi: any;

  region?: string;

  // Declare subscription variables
  private isFiltersShowSubscription: Subscription;
  private noFiltersMsgSubscription: Subscription;
  private currentSearchErrorSubscription: Subscription;
  private currentNewSearchSubscription: Subscription;
  private searchSubscription: Subscription;
  private selectedFlightSubscription: Subscription;
  private currOutBSortValSubs: Subscription;
  private currInbSortValSubs: Subscription;
  private getMobileStatusSubscription: Subscription;
  destroyChild = false;

  public resultSort_option = {
    id: 'priceAsc',
    display: 'Cheapest',
  };
  @ViewChild('flightsViewSection', { static: false }) flightsViewSection: ElementRef;
  public isShowFilters: boolean = false;
  showDomMwebStrip: boolean = false;
  flightHeight: number = 0;
  labeled_Itineraries: any = null;
  bestRank: any = [];
  labeled_OutboundItineraries: any = null;
  labeled_InboundItineraries: any = null;
  filtersSelected: boolean = false;
  searchErrorType: any;
  showtimeHoursDiff: EventEmitter<any> = new EventEmitter(false);
  flightsearchInfo?: any;
  constructor(
    public responsiveService: responsiveService,
    private i18Service: I18nService,
    private router: Router,
    private ngbDateParserFormatter: NgbDateParserFormatter,
    private apiService: ApiService,
    private searchService: SearchService,
    private sharedFlightService: SharedFlightService,
    private bookingService: BookingService,
    private deepLinkService: DeepLinkService,
    private sessionStorageService: SessionStorageService,
    private navService: NavigationService,
    private googleTagManagerServiceService: GoogleTagManagerServiceService,
    public iframewidgetService: IframeWidgetService,
    private filterServiceService: FilterServiceService,
    private logStorageService: StorageService,
    private bookingCountdownService: BookingCountdownService,
    private storage: UniversalStorageService,
    @Inject(PLATFORM_ID) private platformId: Object,
    public sessionUtils: SessionUtils,
    private uiState: UiStateService,
  ) {}

  ngOnInit(): void {
    this.region = this.apiService.extractCountryFromDomain();
    this.googleTagManagerServiceService.pushPageLoadEvent(
      '/flights/results',
      'Search and Book Cheap Flights | Travelstart',
    );
    this.storage.removeItem('priceData');    
    this.storage.removeItem('showInitAddons');
    this.storage.removeItem('selectedPrice');
    this.storage.removeItem('standardAmount');
    this.storage.removeItem('products');
    this.storage.removeItem('travellerPageproducts');
    this.storage.removeItem('travellerPagequeryStringParams');
    this.storage.removeItem('whatsappSelect');
    this.storage.removeItem('paymentDeeplinkData');
    this.storage.removeItem('baggageInfo');
    this.storage.removeItem('useTravlellers');
    this.storage.removeItem('bookingDetails');
    this.storage.removeItem('seatMapInfoObject');
    this.bookingService.changeBaggage(null);
    this.searchService.changeNewSearch(null);
    this.bookingService.changeVoucheramount(0);
    this.bookingService.changeVoucherData(null);
    this.bookingService.changeProducts([]);
    this.deepLinkService.changePriceError('');
    this.currentSearchErrorSubscription = this.deepLinkService.currentSearchError.subscribe((value: boolean) => {
      if (value) {
        this.isErrorFromApi = true;
      } else {
        this.isErrorFromApi = false;
      }
    });
    this.searchService.changeNewSearch(null);
    this.responsiveService.checkWidth();
    // $('#destination_Modal').modal('hide');
    this.isRedirected();
    this.checkTimeOutModal();
    this.flightSearchData = JSON.parse(this.storage.getItem('flightsearchInfo', 'session'));
    this.flightsearchInfo = JSON.parse(this.storage.getItem('flightsearchInfo', 'session'));
    this.searchService.currentsearch.subscribe((data: any) => {
      if (data) {
        this.flightsearchInfo = JSON.parse(this.storage.getItem('flightsearchInfo', 'session'));
      }
    })
    
    this.getMultiTripSearch(this.flightSearchData);
    if (getStorageData('flightResults')) {
      this.flightslist = JSON.parse(getStorageData('flightResults'));
      this.updateData(this.flightslist);
      this.getAllFlightsData();
    } else {
      this.flightSearch();
    }

    this.storage.removeItem('bookingInfo');
    this.storage.removeItem('paymentMethods');
    this.storage.removeItem('priceData');
    this.storage.removeItem('travelOptionsOpt');
    this.storage.removeItem('paymentReqInfo');
    this.storage.removeItem('bookingInfo');
    this.storage.removeItem('standardAmount');
    this.storage.removeItem('selectedPrice');
    this.storage.removeItem('dialCode');
    this.storage.removeItem('redirectGateWayResponse');
    this.storage.removeItem('redirectGatewaLoaded');
    this.responsiveService.checkWidth();
    if (isPlatformBrowser(this.platformId)){
      this.sessionStorageService.clear('seatInfo');
    }
    this.storage.removeItem('travellerFormData');
    this.storage.removeItem('voucherAmount');
    this.isFiltersShowSubscription = this.sharedFlightService.isFiltersShow$.subscribe((val: boolean) => {
      this.isShowFilters = val;
    });
    this.noFiltersMsgSubscription = this.searchService.currentnoFiltersMsg.subscribe((value: any) => {
      this.noFlightsMatch = value;
    });
    this.flightSelection();
    /* getting the device */
    this.getMobileStatusSubscription = this.responsiveService.getMobileStatus().subscribe((isMobile) => {
      if (isPlatformBrowser(this.platformId) && !isMobile) {
        //$('#res_filters').modal('hide');
        $('#res_sorting').modal('hide');
        this.hideSearchModal();
      }
    });
  }

  handleFreshSearch() {
    this.groupedItinerariesData = [];
    this.outboundItineraries = [];
    this.inboundItineraries = [];
    this.flightslist = null;
    removeStorageData('flightResults');
    // this.ngOnDestroy();
  }

  logStorage() {
    //this.logStorageService.logLocalStorage();
    //this.logStorageService.logSessionStorage();
  }

  /**TO hide search strip when reduce thewindow size */
  hideSearchModal() {
    if (isPlatformBrowser(this.platformId)) {
      $('#res_Modify').removeClass('show');
    }
    this.showDomMwebStrip = false;
    this.navService.setShowNav(false);
  }
  /* check required data for this component if data not available its redirect to home page */
  public isRedirected() {
    if (!this.storage.getItem('flightsearchInfo', 'session')) {
      this.router.navigate([''], { queryParamsHandling: 'preserve' });
    }
  }
  flightSearch() {
    this.unSubscriptionServ();
    this.logStorage();
    this.destroyChild = !this.destroyChild;
    this.collapseSrpHeader();
    this.noFlightsMatch = false;
    if (isPlatformBrowser(this.platformId)) {
      $('#destination_Modal').modal('hide');
    }
    this.searchService.changeNewSearch(null);
    this.noFlightsMatch = false;
    this.flightslist = null;
    this.labeled_Itineraries = null;
    this.bestRank = [];
    this.showMask = true;
    this.uiState.setShowMask(true);
    this.resultSort_option = {
      id: 'priceAsc',
      display: 'Cheapest',
    };
    if (this.flightSearchData) {
      this.flightSearchData.country = this.i18Service.language.split('-')[1];
    }
    this.isShowFilters = false;
    this.sharedFlightService.toggleFilters(false);
    this.isErrorFromApi = false;
    this.searchErrorType = '';
    const businessUserToken = '';
    const userEmail = '';
    this.currentFlights = 0 - 1;
    this.groupedItinerariesData = [];
    this.outboundItineraries = [];
    this.inboundItineraries = [];
    if (this.flightSearchData && this.flightSearchData.itineraries) {
      for (let i = 0; i < this.flightSearchData.itineraries.length; i++) {
        if (
          (this.flightSearchData.itineraries[i].dept_date != null ||
            this.flightSearchData.itineraries[i].dept_date != undefined) &&
          (this.flightSearchData.itineraries[i].arr_date != null ||
            this.flightSearchData.itineraries[i].arr_date != undefined)
        ) {
          if (typeof this.flightSearchData.itineraries[i].dept_date === 'object') {
            this.flightSearchData.itineraries[i].dept_date = this.ngbDateParserFormatter.format(
              this.flightSearchData.itineraries[i].dept_date,
            );
          }
          if (typeof this.flightSearchData.itineraries[i].arr_date === 'object') {
            this.flightSearchData.itineraries[i].arr_date = this.ngbDateParserFormatter.format(
              this.flightSearchData.itineraries[i].arr_date,
            );
          }
        }
        if (
          this.flightSearchData.itineraries[i].dept_date != null ||
          this.flightSearchData.itineraries[i].dept_date != undefined
        ) {
          if (typeof this.flightSearchData.itineraries[i].dept_date === 'object') {
            this.flightSearchData.itineraries[i].dept_date = this.ngbDateParserFormatter.format(
              this.flightSearchData.itineraries[i].dept_date,
            );
          }
        }
      }
    }
    if (isPlatformBrowser(this.platformId)) {
      recentSearchesInfo(this.flightSearchData);
    }
    this.searchData = fetchFlightsJson(this.flightSearchData);
    this.getMultiTripSearch(this.searchData);
    let normalizedSearchDataInfo = normalizeSearchData(this.searchData);
    if (
      this.storage.getItem('flightsearchInfo', 'session') &&
      JSON.parse(this.storage.getItem('flightsearchInfo', 'session')).tripType == 'multi' &&
      normalizedSearchDataInfo.tripType == 'return'
    ) {
      let searchInfo = JSON.parse(this.storage.getItem('flightsearchInfo', 'session'));
      searchInfo.itineraries[0].arr_date = searchInfo.itineraries[searchInfo.itineraries.length - 1].dept_date;
      searchInfo.itineraries.pop();
      this.flightSearchData = searchInfo;
      this.storage.setItem('flightsearchInfo', JSON.stringify(searchInfo), 'session');
      this.getMultiTripSearch(searchInfo);
    }
    if (this.flightSearchData?.country !== 'MM') {
      this.bookingCountdownService.stopBookingFlowCountdown();
    }
    this.googleTagManagerServiceService.pushIterableSearchData(normalizedSearchDataInfo,this.sessionUtils.getCorrelationId());
    this.searchSubscription = this.searchService
      .performFlightSearch(normalizedSearchDataInfo, userEmail, businessUserToken)
      .subscribe(
        (searchResults: any) => {
          this.isErrorFromApi = false;
          this.searchErrorType = '';
          this.flightslist = searchResults;

          
          setStorageData('flightResults', JSON.stringify(searchResults));
          this.updateData(this.flightslist); // to update the data for flight results
          this.triggerWebEngageEvents(normalizedSearchDataInfo);
          this.getAllFlightsData();
          this.showMask = false;
          this.uiState.setShowMask(false);
          this.updateFlightHandler();
          this.startBookingflowCoundownTimer();
          this.logStorage();
        },
        (searchError: any) => {
          this.showMask = false;
          this.uiState.setShowMask(false);
          this.isErrorFromApi = true;
          this.triggerWebEngageEvents(normalizedSearchDataInfo, searchError);
        },
      );
  }

  // Method to update data for the sake of filters
  updateData(newData: any) {
    this.filterServiceService.setFlightData(newData);
  }

  // getFilteredData() {
  //   this.filterServiceService.flightData$.subscribe((updatedData:any) => {
  //     // Handle updated data here
  //   });
  // }

  triggerWebEngageEvents(normalizedSearchDataInfo: any, errors?: any) {
    const startSearchDate = new Date();
    this.googleTagManagerServiceService.pushTimingInfo('searchResponseTime', startSearchDate);
    this.googleTagManagerServiceService.pushSearchData(normalizedSearchDataInfo);
    /* triggers NFF (no flight found) event to WE in case of empty results or error code is 48404 */
    if (errors) {
      if ((errors.errors && checkSearchErrors(errors?.errors)) || !hasItineraries(this.flightslist)) {
        this.searchErrorType = 'nff';
        this.googleTagManagerServiceService.pushNffData(normalizedSearchDataInfo,this.sessionUtils.getCorrelationId(), true, errors?.errors);
      } else if (errors) {
        this.searchErrorType = 'api';
        this.googleTagManagerServiceService.pushsearchAPIError('searchAPIError', errors);
      }
    }
  }

  flightSelection() {
    this.selectedFlightSubscription = this.sharedFlightService.selectedFlight$.subscribe((data) => {
      if (data) {
        this.bookingFlight = data;
        this.selectedFlight(data);
      }
    });
  }
  updateFlightHandler() {
    let flightHandler = {
      isWeb: true,
      isBundleFlight: true,
      isMobile: false,
      isUnBundleFlight: false,
    };
    if (this.responsiveService.screenWidth === 'sm') {
      flightHandler.isMobile = true;
      flightHandler.isWeb = false;
    } else {
      flightHandler.isWeb = true;
      flightHandler.isMobile = false;
    }
    if (this.flightslist?.outboundItineraries.length > 0 || this.flightslist?.inboundItineraries.length > 0) {
      flightHandler.isUnBundleFlight = true;
      flightHandler.isBundleFlight = false;
    } else {
      flightHandler.isBundleFlight = true;
      flightHandler.isUnBundleFlight = false;
    }
    this.sharedFlightService.updateFlightHandlers(flightHandler);
  }

  showSelectedFlightDetails() {
    if (isPlatformBrowser(this.platformId)) {
      $('#destination_Modal').modal('hide');
    }
  }

  selectedFlight(item: any) {
    if (checkDestAirports(item, this.flightSearchData.tripType).length) {
      this.airportsArray = checkDestAirports(item, this.flightSearchData.tripType);
      const destinAirports = {
        airports: this.airportsArray,
        isDomestic: false,
      };
      this.airportsList.emit(destinAirports);
      if (isPlatformBrowser(this.platformId)) {
        $('#destination_Modal').modal('show');
      }
    } else if (
      (this.flightSearchData?.country === 'NG' || this.flightSearchData?.country === 'GI') &&
      transitVisaCheck(this.flightSearchData, item)
    ) {
      this.checkVisaTransits(true);
    } else if (isPlatformBrowser(this.platformId) && checkDestCabinClasses(item)) {
      $('#destination_Modal').modal('hide');
      $('#cabinClass_Modal').modal('show');
    } else {
      this.continueFlightSelection();
    }
  }
  checkVisaTransits(event?: any) {
    if (isPlatformBrowser(this.platformId) && 
      (this.flightSearchData?.country === 'NG' || this.flightSearchData?.country === 'GI') &&
      transitVisaCheck(this.flightSearchData, this.bookingFlight)
    ) {
      this.airportsList.emit([]);
      this.transitVisaRequired.emit(true);
      $('#cabinClass_Modal').modal('hide');
      $('#destination_Modal').modal('show');
    } else {
      this.checkCabinClasses();
    }
  }
  checkCabinClasses() {
    if (isPlatformBrowser(this.platformId) && checkDestCabinClasses(this.bookingFlight)) {
      $('#destination_Modal').modal('hide');
      $('#cabinClass_Modal').modal('show');
      $('#time_modal').modal('hide');
    } else {
      this.continueFlightSelection();
    }
  }
  selectedDomesticFlight(itinerary: any) {
    this.domesticItinerary = itinerary;
    this.outBoundSelected = itinerary.outboundItineraries;
    this.inBoundSelected = itinerary.inboundItineraries;
    if (domesticDestAirportsCheck(this.outBoundSelected, this.inBoundSelected, this.flightSearchData.tripType).length) {
      this.airportsArray = domesticDestAirportsCheck(
        this.outBoundSelected,
        this.inBoundSelected,
        this.flightSearchData.tripType,
      );
      const destinAirports = {
        airports: this.airportsArray,
        isDomestic: true,
      };
      this.airportsList.emit(destinAirports);
      if (isPlatformBrowser(this.platformId)) {
        $('#destination_Modal').modal('show');
      }
    } else if (this.checkTimeDifference()) {
      this.domSelected.emit(itinerary);
      if (isPlatformBrowser(this.platformId)) {
        $('#time_modal').modal('show');
      }
    } else {
      this.continueFlightSelection();
    }
  }

  continueFlightSelection() {
    this.sharedFlightService.setFlightDetailsPopup(false);
    if (isPlatformBrowser(this.platformId) && checkEK_hFlight(this.bookingFlight)) {
      $('#EK_H_modal').modal('show');
    } else {
      this.continueFlight();
    }
  }

  continueFlight() {
    if (this.bookingFlight) {
      this.storage.removeItem('selectedFlight');
      this.storage.setItem('selectedFlight', JSON.stringify(this.bookingFlight), 'session');
      this.navigateFlightDetails();
    } else {
      this.storage.removeItem('selectedDomesticFlight');
      this.storage.setItem('selectedDomesticFlight', JSON.stringify(this.domesticItinerary), 'session');
      this.navigateFlightDetails();
    }
  }

  ngOnDestroy() {
    this.sharedFlightService?.toggleFilters(false);
    this.isFiltersShowSubscription?.unsubscribe();
    this.noFiltersMsgSubscription?.unsubscribe();
    this.currentSearchErrorSubscription?.unsubscribe();
    this.currentNewSearchSubscription?.unsubscribe();
    this.sharedFlightService?.updateSelectedFlight(null);
    this.hideAllModals();
    this.getMobileStatusSubscription?.unsubscribe();
    this.selectedFlightSubscription?.unsubscribe();

    // recheck
    this.transitVisaRequired?.unsubscribe();
    this.domSelected?.unsubscribe();
    this.airportsList?.unsubscribe();
    this.sendEvent?.unsubscribe();
    this.showtimeHoursDiff.unsubscribe();
    this.unSubscriptionServ();
  }

  unSubscriptionServ(): void {
    this.bookingService?.changeContactDetailsvalid(null);
    this.sharedFlightService?.editpriceModalValue(null);
    this.filterServiceService?.setFlightData(null);
    if (this.searchSubscription) {
      this.searchSubscription?.unsubscribe();
    }

    this.currOutBSortValSubs?.unsubscribe();
    this.currInbSortValSubs?.unsubscribe();
  }

  hideAllModals() {
    if(!isPlatformBrowser(this.platformId)) return;
    $('#destination_Modal').modal('hide');
    $('#cabinClass_Modal').modal('hide');
    $('#res_filters').modal('hide');
    $('#res_sorting').modal('hide');
    $('#more_Flights').modal('hide');
    $('#time_modal').modal('hide');
    $('#editprice_modal').modal('hide');
    $('#EK_H_modal').modal('hide');

    // recheck
    // $('#destination_Modal').modal('dispose');
    // $('#cabinClass_Modal').modal('dispose');
    // $('#res_filters').modal('dispose');
    // $('#res_sorting').modal('dispose');
    // $('#more_Flights').modal('dispose');
    // $('#time_modal').modal('dispose');
    // $('#editprice_modal').modal('dispose');
    // $('#EK_H_modal').modal('dispose');
  }

  public getFlightsByOrder(sortevent: any): void {
    this.resultSort_option = sortevent;
    this.currentFlights = 0 - 1;
    this.groupedItinerariesData = getGroupedItineraries(
      this.flightslist.itineraries,
      this.resultSort_option,
      this.flightSearchData,
      this.flightslist,
    );
  }

  public getFlightResults(param: any): void {
    this.flightSearchData = param;
    this.flightSearch();
  }

  public getFlightsByfilter(flightslist: any) {
    this.noFlightsMatch = false;
    if (flightslist.length !== 0) {
      this.flightslist.itineraries = flightslist;
      this.currentFlights = 0 - 1;
      this.groupedItinerariesData = getGroupedItineraries(
        flightslist,
        this.resultSort_option,
        this.flightSearchData,
        this.flightslist,
      );
    } else {
      this.flightslist.itineraries = flightslist;
      this.noFlightsMatch = true;
    }
    this.flightslist.outboundItineraries = [];
    this.flightslist.inboundItineraries = [];
  }

  getDomesticFlightsByfilter(flights: any): void {
    this.noFlightsMatch = false;
    this.flightslist.itineraries = null;
    let outBoundValue: any;
    let inBoundValue: any;
    this.currOutBSortValSubs = this.searchService.currentoutBoundSortingValue.subscribe((value: any) => {
      outBoundValue = value;
    });
    this.currInbSortValSubs = this.searchService.currentInBoundSortingValue.subscribe((value: any) => {
      inBoundValue = value;
    });
    if (flights.outboundItineraries.length == 0 || flights.inboundItineraries.length == 0) {
      this.noFlightsMatch = true;
    }
    if (
      flights.outboundItineraries &&
      flights.outboundItineraries.length != 0 &&
      flights.inboundItineraries.length != 0
    ) {
      this.outboundItineraries = flights.outboundItineraries;
      this.inboundItineraries = flights.inboundItineraries;
      if (outBoundValue) {
        this.outboundItineraries = orderListBy(this.outboundItineraries, outBoundValue);
      }
      if (inBoundValue) {
        this.inboundItineraries = orderListBy(this.inboundItineraries, inBoundValue);
      }
      this.noFilters = false;
    } else {
      this.noFilters = true;
      this.outboundItineraries = [];
      this.inboundItineraries = [];
    }
  }

  noFiltersMacth(event: any) {
    if (event) {
      this.noFilters = true;
      this.sendEvent.emit(true);
      this.showDomMwebStrip = true;
    } else if (event == false) {
      this.noFilters = false;
      this.showDomMwebStrip = false;
    }
  }
  showFilters(param: boolean) {
    let showFiltervalue: boolean = false;
    if (this.responsiveService.screenWidth != 'sm' && this.responsiveService.screenWidth != 'md') {
      showFiltervalue = param;
    }
    this.isShowFilters = showFiltervalue;
    this.sharedFlightService?.toggleFilters(showFiltervalue);
  }

  showSearchPage(event: any) {
    if (event) {
      this.showSearch_page = true;
      this.showmultiCity = false;
      this.showDomMwebStrip = true;
      return;
    } else {
      this.showSearch_page = false;
      this.showmultiCity = true;
      this.showDomMwebStrip = false;
    }
  }
  showMultiCity_box(): void {
    this.showmultiCity = true;
    this.showSearch_page = false;
  }

  collapseSrpHeader() {
    if(isPlatformBrowser(this.platformId)){
      $('#res_Modify').collapse('hide');
      $('#more_Flights').modal('hide');
      $('#res_filters').modal('hide');
      $('#res_sorting').modal('hide');
    }
    this.showDomMwebStrip = false;
  }

  domFlights(): boolean {
    if (
      this.flightslist &&
      ((this.flightslist.outboundItineraries &&
        this.flightslist.outboundItineraries.length > 0 &&
        this.flightslist.inboundItineraries &&
        this.flightslist.inboundItineraries.length > 0) ||
        this.flightslist.itineraries == null)
    ) {
      return true;
    } else {
      return false;
    }
  }

  getMultiTripSearch(searchData: any) {
    if (searchData && searchData.tripType == 'multi') {
      this.showSearch_page = false;
      this.showmultiCity = true;
    } else {
      this.showSearch_page = true;
      this.showmultiCity = false;
    }
  }
  getAllFlightsData() {
    if (this.flightslist?.itineraries.length > 0) {
      this.groupedItinerariesData = getGroupedItineraries(
        this.flightslist.itineraries,
        this.resultSort_option,
        this.flightSearchData,
        this.flightslist,
      );
      let labelItinResults = getBestFlights(
        this.flightslist.itineraries,
        this.flightslist,
        'outBound',
        this.flightslist?.isIntl,
      );
      this.labeled_Itineraries = labelItinResults;
    } else if (this.flightslist?.outboundItineraries.length > 0 && this.flightslist?.inboundItineraries.length > 0) {
      this.outboundItineraries = this.flightslist.outboundItineraries;
      this.inboundItineraries = this.flightslist.inboundItineraries;
      /**TO enable for display labels for domestic unbundle flights
     *  let labelOutbountItinResults = getBestFlights(this.flightslist.outboundItineraries,this.flightslist,'outBound');
    this.labeled_OutboundItineraries = labelOutbountItinResults;
    let labelInbountItinResults = getBestFlights(this.flightslist.inboundItineraries,this.flightslist,'outBound');
    this.labeled_InboundItineraries = labelInbountItinResults;
     */
    }
  }

  // update the price of selected Flight & Add discount amount.
  onSubmit(res: any) {
    if (isPlatformBrowser(this.platformId)) {
      $('#editprice_modal').modal('hide');
    }
    if (res?.itinerary?.flightType == 'isBundled' && this.flightslist?.itineraries?.length > 0) {
      this.flightslist.itineraries.forEach((x: any) => {
        if (x.id == res.itinerary.id) {
          x.amount = res.updatedTotalAmount;
          x.additionalMarkup = res.additionalMarkup;
          x.dynamicDiscount = res.dynamicDiscount;
        }
      });
      this.labeled_Itineraries = getBestFlights(
        this.flightslist.itineraries,
        this.flightslist,
        'outBound',
        this.flightslist?.isIntl,
      );
      this.sharedFlightService?.editpriceModalValue(null);
    } else if (res && res.itinerary?.flightType == 'isUnBundle') {
      let domesticFlightData = JSON.parse(this.storage.getItem('selectedDomesticFlight', 'session'));
      domesticFlightData.additionalMarkup = res.additionalMarkup;
      domesticFlightData.dynamicDiscount = res.dynamicDiscount;
      this.sharedFlightService?.changeSelectedDomesticFlight(domesticFlightData);
      this.storage.setItem('selectedDomesticFlight', JSON.stringify(domesticFlightData), 'session');
    }
  }
  closeEditPriceModal() {
    $('#editprice_modal').modal('hide');
    this.sharedFlightService.editpriceModalValue(null);
  }

  /**It is checking the idle session modal is opened, if it is in SRP we are refreshing results*/
  checkTimeOutModal() {
    this.currentNewSearchSubscription = this.searchService.currentNewSearch.subscribe((value) => {
      if (value?.isIdleTimeoutOpen) {
        this.hideAllModals();
      } else if (value?.refreshResults) {
        this.hideAllModals();
        this.flightSearch();
      }
    });
  }
  display_label_itin() {
    return this.resultSort_option.id !== 'priceAsc' || this.filtersSelected ? false : true;
  }
  isFiltersSelected(event: any) {
    this.filtersSelected = event;
  }

  navigateFlightDetails() {
    let params = checkAirlineParam();
    if (params?.airline) {
      this.storage.removeItem('queryStringParams');
      this.storage.setItem('queryStringParams', JSON.stringify(params), 'session');
      this.router.navigate(['/booking/flight-details'], { queryParamsHandling: 'preserve' });
    } else {
      this.router.navigate(['/booking/flight-details'], { queryParamsHandling: 'preserve' });
    }
  }
  /**To start coundown 30 mins for bookingflow   */
  startBookingflowCoundownTimer() {
    if (this.flightSearchData?.country !== 'MM') {
      this.storage.removeItem('booking_Countdown');
      this.bookingCountdownService.resetCountdown();
    }
  }
  /**To check time difference for selected domestic flights here we are displaying popup if selected inbound flight depart before outbound flight arrives
   * (or) time gap between to flights less then 2 hours  */
  checkTimeDifference() {
    this.showtimeHoursDiff.emit(false);
    let ishaveTimeDifference: boolean;
    let outBoundArrivalDate: any = new Date(
      this.outBoundSelected?.odoList[this.outBoundSelected?.odoList?.length - 1].segments[
        this.outBoundSelected?.odoList[this.outBoundSelected?.odoList?.length - 1]?.segments.length - 1
      ]?.arrivalDateTime,
    );
    let inboundDepatureDate: any = new Date(this.inBoundSelected?.odoList[0]?.segments[0]?.departureDateTime);
    if (this.outBoundSelected && this.inBoundSelected && outBoundArrivalDate >= inboundDepatureDate) {
      ishaveTimeDifference = true;
    } else if (
      outBoundArrivalDate < inboundDepatureDate &&
      (inboundDepatureDate - outBoundArrivalDate) / 1000 / 60 / 60 < 2
    ) {
      ishaveTimeDifference = true;
      this.showtimeHoursDiff.emit(true);
    }
    return ishaveTimeDifference;
  }

  
handleModifyClick(event: Event): void {
  // Stop propagation to prevent back button navigation
  event.stopPropagation();
  event.preventDefault();

  // Collapse other sections
  $('#res_filters').collapse('hide');
  $('#more_Flights').modal('hide');
  $('#res_sorting').collapse('hide');
  
  // Show the modify search section
  $('#res_Modify').collapse('show');
  
  // Update the search display based on trip type
  // if (this.flightsearchInfo?.tripType === 'multi' || this.flightSearchData?.tripType === 'multi') {
  //   this.showmultiCity = true;
  //   this.showSearch_page = true;
  // } else {
  //   this.showSearch_page = false;
  //   this.showmultiCity = false;
  // }

  this.showSearch_page = true;
  this.showmultiCity = false;
  
  // Set the DOM strip flag for mobile
  this.showDomMwebStrip = true;
}

}
