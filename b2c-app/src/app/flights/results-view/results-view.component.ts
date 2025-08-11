import {
  Component,
  OnInit,
  Input,
  SimpleChanges,
  OnDestroy,
  ViewChild,
  HostListener,
  EventEmitter,
  Inject, 
  PLATFORM_ID
} from '@angular/core';
import { SearchResultsItinerary } from '../models/results/search-results-itinerary.model';
import { NavigationService } from './../../general/services/navigation.service';
import { responsiveService } from '@core/services/responsive.service';
import { SearchService } from './../service/search.service';
import { offLineNgBanner, orderListBy } from './../utils/search-results-itinerary.utils';
import { getFlightResults } from '../utils/results.utils';
import { IframeWidgetService } from '@app/general/services/iframe-widget.service';
import { FlightCardComponent } from '../flight-card/flight-card.component';
import { ApiService } from '@app/general/services/api/api.service';
import { SharedFlightService } from '../service/sharedFlight.service';
import { Subscription } from 'rxjs';
import { getCitiesNames } from './../utils/odo.utils';
import { Router } from '@angular/router';
import { UniversalStorageService } from '@app/general/services/universal-storage.service';
import { isPlatformBrowser } from '@angular/common';

declare const $: any;

@Component({
  selector: 'app-results-view',
  templateUrl: './results-view.component.html',
  styleUrls: ['./results-view.component.scss', './../../../theme/bottom-wrapper.scss'],
})
export class ResultsViewComponent implements OnInit, OnDestroy {
  @Input() groupedItineraries: any = [];
  @Input() outboundItineraries: any = [];
  @Input() inboundItineraries: any = [];
  @Input() labeled_Itinerary: any = {};
  @Input() display_label_itin: boolean;

  outboundItinerariess: any = [];
  inboundItinerariess: any = [];

  @Input() flightslist: any = [];
  public currentFlights: number = 0 - 1;
  public selected: SearchResultsItinerary;
  public displayCount: number = 0;
  showWidget: boolean = false;
  public outBoundItins: any = [];
  public inBoundItins: any = [];
  public selectedOutBound: any;
  public selectedInBound: any;
  public resultSort_option = {
    id: 'priceAsc',
    display: 'Cheapest',
  };
  private isFiltersShowSubscription: Subscription;

  public isShowFilter: boolean = false;
  @ViewChild('flightCard') public flightCard: FlightCardComponent;
  public flightSearchData: any;
  @Input() destroy = false;
  public sendEvent: EventEmitter<any> = new EventEmitter();
  public sendSort: EventEmitter<any> = new EventEmitter();
  public moreFlights_Expanded_Id: number = 0 - 1;
  public ngOfflineItinerary: any;
  private isBrowser: boolean;
  country: string;

  constructor(
    private navService: NavigationService,
    public responsiveService: responsiveService,
    private searchService: SearchService,
    public iframewidgetService: IframeWidgetService,
    public apiService: ApiService,
    private sharedFlightService: SharedFlightService,
    private router: Router,
    private storage: UniversalStorageService,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) { 
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.country = apiService.extractCountryFromDomain();
  }

  ngOnInit(): void {
    this.flightResults();
    this.isFiltersShowSubscription = this.sharedFlightService.isFiltersShow$.subscribe((val: boolean) => {
      this.isShowFilter = false;
    });
    this.flightSearchData = JSON.parse(this.storage.getItem('flightsearchInfo', 'session'));
    // Optionally, send a response back to the parent
    const response = { isSearchTriggered: true };
    if (this.isBrowser && window?.parent && typeof window.parent.postMessage === 'function') {
      window.parent.postMessage(JSON.stringify(response), '*');
    }
  }

  ngOnDestroy() {
    if (this.isFiltersShowSubscription) {
      this.isFiltersShowSubscription.unsubscribe();
    }
    this.flightCard?.ngOnDestroy();
  }

  ngOnChanges(changes: SimpleChanges) {
    for (let property in changes) {
      if (property === 'groupedItineraries') {
        this.groupedItineraries = changes[property].currentValue;
      }
      if (property === 'outboundItineraries') {
        this.outboundItineraries = changes[property].currentValue;
      }
      if (property === 'inboundItineraries') {
        this.inboundItineraries = changes[property].currentValue;
      }
      if (property === 'flightslist') {
        this.flightslist = changes[property].currentValue;
      }
    }
  }

  flightResults() {
    this.flightslist = getFlightResults();
  }

  slice(idx: any) {
    return idx;
  }

  getItinerary(itineray: any, flightType: string) {
    itineray['flightType'] = flightType;
    this.ngOfflineItinerary = itineray;
    return itineray;
  }
  /**To Display more flights(same airline & price ) of perticular grouped itinerary */
  showMore(flights: any) {
    this.moreFlights_Expanded_Id = flights?.groupId;
    flights.isMoreFlightsExpanded = true;
    this.displayCount = flights?.itineraries?.length;
    this.showWidget = true;
    this.navService.setShowNav(true);
    this.flightCard?.notifyFlightsCard('');
    this.sortMoreFlightsbyDeptDate(flights);
  }
  /**To Hide the expanded flights of perticular grouped itinerary */
  showLessFlights(flights: any) {
    this.moreFlights_Expanded_Id = 0 - 1;
    flights.isMoreFlightsExpanded = false;
    this.displayCount = flights?.itineraries?.length;
    this.showWidget = false;
    this.navService.setShowNav(false);
    let ele = document.getElementById('moreFlightsSection');
    ele.scrollIntoView({ behavior: 'auto', block: 'center' });
    this.flightCard?.notifyFlightsCard('');
    this.sortMoreFlightsbyDeptDate(flights);
  }

  public getFlightsByOrder(sortevent: any, param?: string): void {
    this.selected = null;
    this.resultSort_option = sortevent;
    this.currentFlights = 0 - 1;
    if (this.flightslist.outboundItineraries && this.flightslist.outboundItineraries.length > 0) {
      if (param === 'inBound') {
        this.applyInBSorting(this.flightslist.inboundItineraries, sortevent);
      } else if (param === 'outBound') {
        this.applyOutBSorting(this.flightslist.outboundItineraries, sortevent);
      }
    }
    this.isItinararySelect(param);
  }

  public applyOutBSorting(flights: any, event: any): void {
    this.searchService.changeoutBoundSortingValue(event);
    this.flightslist.outboundItineraries = flights;
    if (
      this.flightslist.outboundItineraries &&
      (this.responsiveService.screenWidth === 'sm' || this.responsiveService.screenWidth === 'md')
    ) {
      this.outboundItinerariess = orderListBy(this.outboundItineraries, event);
    } else {
      this.outboundItineraries = orderListBy(this.outboundItineraries, event);
    }
  }

  public applyInBSorting(flights: any, event: any): void {
    this.searchService.changeInBoundSortingValue(event);
    this.flightslist.inboundItineraries = flights;
    if (
      this.flightslist.inboundItineraries &&
      (this.responsiveService.screenWidth === 'sm' || this.responsiveService.screenWidth === 'md')
    ) {
      this.inboundItinerariess = orderListBy(this.inboundItineraries, event);
    } else {
      this.inboundItineraries = orderListBy(this.inboundItineraries, event);
    }
  }

  updateSortResults() {
    this.outboundItineraries = this.outboundItinerariess;
    this.inboundItineraries = this.inboundItinerariess;
    $('#res_sorting').modal('hide');
  }

  selectDomesticFlight(itinerary: any) {
    if (itinerary.flightType == 'outBound') {
      this.selectedOutBound = itinerary;
    } else if (itinerary.flightType == 'inBound') {
      this.selectedInBound = itinerary;
    }
    this.updateDomsession();
    this.sharedFlightService.toggleFilters(false);
  }

  public getCityName(param: string) {
    return getCitiesNames(param, this.flightslist.airportInfos);
  }
  showFilters(param: boolean) {
    this.isShowFilter = false;
    this.sharedFlightService.toggleFilters(this.isShowFilter);
  }
  isItinararySelect(param: string) {
    if (param == 'outBound' && !this.selectedOutBound && this.outboundItineraries.length > 0) {
      this.selectedOutBound = this.outboundItineraries[0];
    }
    if (param == 'inBound' && !this.selectedInBound && this.inboundItineraries.length > 0) {
      this.selectedInBound = this.inboundItineraries[0];
    }
    this.updateDomsession(true);
  }
  updateDomsession(isDefault?: boolean) {
    let selectedDomFlight: any = {
      inboundItineraries: this.selectedInBound,
      outboundItineraries: this.selectedOutBound,
    };
    if (this.iframewidgetService.isB2BApp()) {
      selectedDomFlight['additionalMarkup'] = 0;
      selectedDomFlight['dynamicDiscount'] = 0;
    }
    if (isDefault) {
      this.storage.removeItem('selectedDomesticFlight');
      this.storage.setItem('selectedDomesticFlight', JSON.stringify(selectedDomFlight), 'session');
    }
    this.sharedFlightService.changeSelectedDomesticFlight(selectedDomFlight);
  }

  checkMoreFlights(itineraries: any) {
    return itineraries.length;
  }

  page = 0;
  perPage = this.responsiveService.screenWidth === 'sm' || this.responsiveService.screenWidth === 'md' ? 5 : 10;
  loadMoreResults() {
    this.page += 1;
  }

  isShow_MoreBtn() {
    if (this.groupedItineraries.length > 0) {
      return this.groupedItineraries.length > (this.page + 1) * this.perPage ? true : false;
    } else {
      return false;
    }
  }

  getGroupedItIn(itineraries: any) {
    if (this.display_label_itin && itineraries) {
      let Itins = itineraries.filter(
        (x: any) => x.id != this.labeled_Itinerary?.cheapest?.id && x.id != this.labeled_Itinerary?.fastest?.id && x.id != this.labeled_Itinerary?.recommended?.id
      );
      return Itins;
    } else {
      return itineraries;
    }
  }

  toggleFiltersModal(itinType: any): void {
    this.sharedFlightService.closeTabFade({
      itin_Type: itinType,
      selected: true,
    });
  }

  @HostListener('window:scroll', ['$event'])
  onWindowScroll() {
    if (!this.isBrowser) return;
    let pageScrollHeight = window.innerHeight + window.scrollY;
    let maxPageHeight = document.documentElement.scrollHeight;
    if (
      ((pageScrollHeight + 1).toFixed() == maxPageHeight.toFixed() ||
        pageScrollHeight == maxPageHeight ||
        (pageScrollHeight - 1).toFixed() == maxPageHeight.toFixed() ||
        pageScrollHeight.toFixed() == maxPageHeight.toFixed()) &&
      this.isShow_MoreBtn()
    ) {
      this.loadMoreResults();
    } else if (window.scrollY == 0) {
      this.page = 0;
    }
  }

  isShowTsPlusBanner() {
    return this.apiService.isShowTSPLUSLabel();
  }

  offlineNgAirline() {
    return false;
    // (
    //   !this.iframewidgetService.isB2BApp() &&
    //   this.apiService.extractCountryFromDomain() === 'NG' &&
    //   offLineNgBanner(this.flightSearchData)
    // );
  }

  trackByGroupId(index: number, flights: any) {
    return flights.groupId;
  }

  trackByFlightId(index: number, itineraries: any) {
    return itineraries.id;
  }

  trackByDomesticFlights(index: number, flight: any) {
    return flight.id;
  }

  /**Sorting the flights on clicking more flights button */
  sortMoreFlightsbyDeptDate(flights: any) {
    const expanded = flights?.isMoreFlightsExpanded;
    if (flights?.itineraries) {
      flights.itineraries = [
        flights?.itineraries[0],
        ...flights?.itineraries.slice(1).sort((a: any, b: any) => {
          const aDeparture = new Date(a.odoList[0].segments[0].departureDateTime).getTime();
          const bDeparture = new Date(b.odoList[0].segments[0].departureDateTime).getTime();
          return expanded ? aDeparture - bDeparture : bDeparture - aDeparture;
        }),
      ];
    }
  }
  tsPlus() {
    if (!this.isBrowser) return;
    const routeUrl = this.router.createUrlTree(['/ts-plus/ts-plus-benefits'], { 
      queryParams: {
        utm_source: 'srp',
        utm_medium: 'banner',
        utm_campaign: 'ts-plus',
        utm_content: 'tsplus-srp'
      }, 
      queryParamsHandling: 'merge'
    });
  
    const fullUrl = `${window.location.origin}${this.router.serializeUrl(routeUrl)}`;
    window.open(fullUrl, '_blank');
  }

  trackById(index: number, item: any): any {
    return item.id; // or any unique identifier for your items
  }
}
