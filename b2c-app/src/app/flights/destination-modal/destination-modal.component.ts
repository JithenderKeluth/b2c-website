import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { getAirportNames } from '../utils/odo.utils';
import { responsiveService } from './../../_core/services/responsive.service';
import { getStorageData } from '@app/general/utils/storage.utils';
import { ApiService } from '../../general/services/api/api.service';

@Component({
  selector: 'app-destination-modal',
  templateUrl: './destination-modal.component.html',
  styleUrls: ['./destination-modal.component.scss'],
})
export class DestinationModalComponent implements OnInit {
  @Input() public listofAirports: EventEmitter<any>;
  @Input() public transitVisa: EventEmitter<boolean>;
  @Output() public continueFlight: EventEmitter<any> = new EventEmitter<any>();
  @Output() public continueDomFlight: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() public continueTransitVisaFlight: EventEmitter<boolean> = new EventEmitter<boolean>();
  public airportsArray: any;
  public isDomesticFlight: boolean;
  public flightslist: any;
  public showTransitVisa: boolean = false;
  public country: string;
  constructor(public responsiveService: responsiveService,
    public apiservice: ApiService
  ) {
    this.country = apiservice.extractCountryFromDomain();
  }

  ngOnInit(): void {
    this.listofAirports.subscribe((data: any) => {
      if (getStorageData('flightResults')) {
        this.flightslist = JSON.parse(getStorageData('flightResults'));
      }
      if (data) {
        this.airportsArray = data.airports;
        this.showTransitVisa = false;
      }
    });
    this.checkTransitVisa();
  }
  /**continue international flight */
  continueFlightSelection(value: string) {
    if (value === 'airport') {
      this.continueFlight.emit(value);
    } else {
      this.continueTransitVisaFlight.emit(true);
    }
  }
  /**returns full name of airport */
  public getAirportName(param: string) {
    if (this.responsiveService.screenWidth == 'sm' || this.responsiveService.screenWidth == 'md') {
      return param;
    } else if (this.flightslist && this.flightslist.airportInfos) {
      return getAirportNames(param, this.flightslist.airportInfos);
    }
  }
  public checkTransitVisa() {
    if (this.transitVisa) {
      this.transitVisa.subscribe((value: boolean) => {
        this.showTransitVisa = value;
      });
    }
  }
}
