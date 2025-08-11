import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { responsiveService } from './../../_core/services/responsive.service';
import { getAirportNames } from '../utils/odo.utils';
import { getFlightResults } from '../utils/results.utils';
import ngDomesticAirlines from '../utils/Ng-domestic-airlines.json';
import { UniversalStorageService } from '@app/general/services/universal-storage.service';
declare const $: any;

@Component({
  selector: 'app-ng-domestic-offline-card',
  templateUrl: './ng-domestic-offline-card.component.html',
  styleUrls: [
    './ng-domestic-offline-card.component.scss',
    '../../../app/flights/flight-card/flight-card.component.scss',
  ],
})
export class NgDomesticOfflineCardComponent implements OnInit {
  @Input() itinerary: any = [];
  selectedItin_details: any = [];
  public flightSearchData: any;
  public flightsList: any;
  public outBIndex: number;
  public inBIndex: number;
  public applicableAirlines: any;
  public selectedAirline: any;
  constructor(public responsiveService: responsiveService, private storage: UniversalStorageService) {}

  ngOnInit(): void {
    this.flightSearchData = JSON.parse(this.storage.getItem('flightsearchInfo', 'session'));
    this.flightsList = getFlightResults();
    this.applicableAirlines = this.getApplicableAirlines();
  }

  public dana_air_modal(selectedAirline: any) {
    this.selectedAirline = selectedAirline;
    $('#dana_air_modal').modal('show');
  }

  ngOnChanges(changes: SimpleChanges) {
    for (let property in changes) {
      if (property === 'itinerary') {
        this.itinerary = changes[property].currentValue;
        this.selectedItin_details = this.itinerary;
      }
    }
  }
  public getAirportName(param: string) {
    if (this.responsiveService.screenWidth === 'sm' || this.responsiveService.screenWidth === 'md') {
      return param;
    } else {
      return getAirportNames(param, this.flightsList.airportInfos);
    }
  }
  isMobile(): boolean {
    return this.responsiveService.screenWidth === 'sm' || this.responsiveService.screenWidth === 'md' ? true : false;
  }
  isWeb(): boolean {
    return this.responsiveService.screenWidth === 'sm' || this.responsiveService.screenWidth === 'md' ? false : true;
  }
  isUnBundleFlight(): boolean {
    return this.itinerary.flightType === 'outBound' || this.itinerary.flightType === 'inBound' ? true : false;
  }
  isBundleFlight(): boolean {
    return this.itinerary.flightType === 'outBound' || this.itinerary.flightType === 'inBound' ? false : true;
  }
  showPerson_Price() {
    const paxCount =
      this.flightSearchData.travellers.adults +
      this.flightSearchData.travellers.youngAdults +
      this.flightSearchData.travellers.children +
      this.flightSearchData.travellers.infants;
    return paxCount > 1;
  }
  private getApplicableAirlines() {
    const deptCity = this.flightSearchData.itineraries[0].dept_city.code;
    const arrCity = this.flightSearchData.itineraries[this.flightSearchData.itineraries.length - 1].arr_city.code;
    const domesticAirlines = ngDomesticAirlines;
    return domesticAirlines.filter((airline: any) => {
      const airportCodes = airline.airports.map((airport: any) => airport.code);
      return airportCodes.includes(deptCity) && airportCodes.includes(arrCity);
    });
  }
}
