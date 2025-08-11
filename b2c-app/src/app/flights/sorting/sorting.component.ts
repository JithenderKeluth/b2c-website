import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { orderListBy } from './../utils/search-results-itinerary.utils';
import { getTime } from './../utils/odo.utils';
import { SearchResultsSortOption } from '../models/results/search-results-sort-option.model';
import { responsiveService } from './../../_core/services/responsive.service';
import { shouldShowPerPersonPrice } from '../utils/search-data.utils';
import { getCitiesNames } from '../utils/odo.utils';
import { getStorageData } from '@app/general/utils/storage.utils';
import { UniversalStorageService } from '@app/general/services/universal-storage.service';
import {ApiService} from '@app/general/services/api/api.service';

@Component({
  selector: 'app-sorting',
  templateUrl: './sorting.component.html',
  styleUrls: ['./sorting.component.scss'],
})
export class SortingComponent implements OnInit {
  @Input() flightslist: any;
  @Input() switchDomFilght: any;
  @Output() sortEvent = new EventEmitter<{}>();
  @Output() baggageEvent = new EventEmitter<{}>();
  @Input() public sortOption: EventEmitter<any>;
  selected: any;
  currency_Code: string = 'ZAR';
  flightsListToSort: any;
  flightResultsInfo: any;
  flightSearchData: any;
  selected_sort_Option: any;
  selectedSort: string;
  region: string;
  constructor(public responsiveService: responsiveService, private cdRef: ChangeDetectorRef, private apiService: ApiService, private storage: UniversalStorageService) {}

  ngOnInit(): void {
    this.flightResultsInfo = JSON.parse(getStorageData('flightResults'));
    this.flightSearchData = JSON.parse(this.storage.getItem('flightsearchInfo', 'session'));

    this.region = this.apiService.extractCountryFromDomain();
    this.setFlightsByOrder('priceAsc', 'Cheapest', true);
    if (this.sortOption) {
      this.sortOption.subscribe((data: any) => {
        this.setFlightsByOrder(data.id, data.display);
      });
    }
  }

  public getCityName(param: string) {
    return getCitiesNames(param, this.flightResultsInfo?.airportInfos);
  }

  public getDomesticFlightsByfilter() {
    if (this.flightslist) {
      this.flightsListToSort = this.flightslist;
    }
    return this.flightsListToSort;
  }

  public getCheapestPrice(param: string) {
    const flightsToSort = this.getDomesticFlightsByfilter();
    const order = orderListBy(flightsToSort, param);
    if (order[0]) {
      if (order[0].currencyCode) {
        this.currency_Code = order[0].currencyCode;
        if (shouldShowPerPersonPrice(this.flightSearchData)) {
          return order[0].ppsAmount;
        } else {
          return order[0].amount;
        }
      }
    } else {
      return;
    }
  }

  public getFastestFlight(param: string) {
    const flightsToSort = this.getDomesticFlightsByfilter();
    const order = orderListBy(flightsToSort, param);
    if (order[0]) {
      if (order[0].odoList) {
        return getTime(order[0].odoList[0].duration);
      }
    }
  }

  public getEarliestFlight(param: string) {
    const flightsToSort = this.getDomesticFlightsByfilter();
    const order = orderListBy(flightsToSort, param);
    if (order[0]) {
      if (order[0].odoList) {
        return new Date(order[0].odoList[0].segments[0].departureDateTime).toLocaleTimeString('en-GB');
      }
    }
  }
  // TODO if we sort based on arrival time
  // public getLatestFlight(param: string) {
  //   const flightsToSort = this.getDomesticFlightsByfilter();
  //   const order = orderListBy(flightsToSort, param);
  //   if (order[0]) {
  //     if (order[0].odoList) {
  //       return new Date(order[0].odoList[0].segments[0].departureDateTime).toLocaleTimeString('en-GB');
  //     }
  //   }
  // }

  public setFlightsByOrder(paramId: string, parmDisplay: string, isIntialSort?: boolean): void {
    let sort_Option = new SearchResultsSortOption(paramId, parmDisplay);
    this.selected = paramId;
    this.selectedSort = parmDisplay;
    this.selected_sort_Option = sort_Option;
    if (isIntialSort || this.responsiveService.screenWidth === 'sm' || this.responsiveService.screenWidth === 'md') {
      if (!this.flightResultsInfo?.isBundled) {
        this.sortEvent.emit(sort_Option);
      }
    } else {
      this.sortEvent.emit(sort_Option);
    }
  }

  applyMwebSorting() {
    this.selected == 'checkedBaggage' || this.selected == 'noBaggage'
      ? this.sortEvent.emit(this.selected)
      : this.sortEvent.emit(this.selected_sort_Option);
  }

  isActive(item: any) {
    return this.selected === item;
  }

  sortBaggage(event: any) {
    this.selected = event;
    if (this.responsiveService.screenWidth !== 'sm' && this.responsiveService.screenWidth !== 'md') {
      this.baggageEvent.emit(event);
    }
  }
  ngAfterViewInit() {
    this.cdRef.detectChanges();
  }

  // Added to get through SonarQube code quality checks
  emptyEvent() {

  }
}
