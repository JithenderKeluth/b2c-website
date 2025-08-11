import { Component, EventEmitter, OnInit, Input, Output } from '@angular/core';
import { getAirportNames, getBaggageInfo, getCitiesNames, getTime } from '../utils/odo.utils';
import { Odo } from '../models/results/odo.model';
import {
  GetLapoverTime,
  getLayoverLabels,
  mergeDomesticFlights,
  displayItinPrice,
} from '../utils/search-results-itinerary.utils';
import { SharedFlightService } from '../service/sharedFlight.service';
import { ApiService } from '@app/general/services/api/api.service';
import { responsiveService } from '@core/services/responsive.service';
import { IframeWidgetService } from '@app/general/services/iframe-widget.service';
import { updateFareInfoTravellers } from '@app/booking/utils/traveller.utils';
import { B2bApiService } from '../../general/services/B2B-api/b2b-api.service';
import { UniversalStorageService } from '@app/general/services/universal-storage.service';
import { DiscountsDisplayModel, aggregateDiscounts } from '@app/flights/utils/discount.utils';
import { ResultsDetailComponent } from '../results-detail/results-detail.component';
import { MatDialog } from '@angular/material/dialog';
import { filter, take } from 'rxjs/operators';

@Component({
  selector: 'app-flight-details',
  templateUrl: './flight-details.component.html',
  styleUrls: ['./flight-details.component.scss', './../../../theme/flight-comm-styles.scss'],
})
export class FlightDetailsComponent implements OnInit {
  public itinOdoList: any = [];
  public selectedFlightDetails: any;
  public discounts?: DiscountsDisplayModel;
  public selectedTab: string = 'FLIGHT';
  public fareBreakdown: any = null;
  public flightTotalAmount: number = 0;
  public region: string;
  @Output() selectedDomFlight: EventEmitter<any> = new EventEmitter<any>();

  @Input() flightslist: any;
  constructor(
    private sharedFlightService: SharedFlightService,
    public apiService: ApiService,
    public responsiveService: responsiveService,
    public Iframewidgetservice: IframeWidgetService,
    private b2bApiService: B2bApiService,
    private storage: UniversalStorageService,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.region = this.apiService.extractCountryFromDomain() || 'ZA';
    this.sharedFlightService.selectedDomFlight.subscribe((flight: any) => {
      this.selectedFlightDetails = flight;
      if (this.selectedFlightDetails?.outboundItineraries && this.selectedFlightDetails?.inboundItineraries) {
        this.getTotalAmount(flight);
        this.selectedFlightDetails.outboundItineraries.fareBreakdown = this.updateFareTravellers(
          this.selectedFlightDetails.outboundItineraries.fareBreakdown
        );
        this.selectedFlightDetails.inboundItineraries.fareBreakdown = this.updateFareTravellers(
          this.selectedFlightDetails.inboundItineraries.fareBreakdown
        );
        this.itinOdoList = [
          ...this.selectedFlightDetails.outboundItineraries.odoList,
          ...this.selectedFlightDetails.inboundItineraries.odoList,
        ];
      }

      if (this.selectedFlightDetails) {
        this.discounts = aggregateDiscounts([
          this.selectedFlightDetails.inboundItineraries,
          this.selectedFlightDetails.outboundItineraries,
        ]);
      }
    });
    this.selectedActive('FLIGHT');
  }
  public getCityName(param: string) {
    return getCitiesNames(param, this.flightslist.airportInfos);
  }
  public getTimeInHours(ms: number) {
    return getTime(ms);
  }
  public getAirportName(param: string) {
    return getAirportNames(param, this.flightslist.airportInfos);
  }
  public getBaggage(id: number, param: string): any {
    return getBaggageInfo(id, param, this.flightslist.baggageAllowanceInfos, true);
  }
  selectedActive(item: string) {
    this.selectedTab = item;
  }
  bookFlight(selectedDetails: any) {
    if(this.region === 'SB'){
      console.log(selectedDetails)
      this.reviewFlightDetails(selectedDetails);
    }else{
    this.selectedDomFlight.emit(selectedDetails);
    }
  }

  getTotalAmount(flightDetails: any) {
    if (this.Iframewidgetservice.isB2BApp()) {
      this.flightTotalAmount =
        flightDetails.inboundItineraries.amount +
        flightDetails.outboundItineraries.amount +
        flightDetails.additionalMarkup -
        flightDetails.dynamicDiscount;
    } else {
      this.flightTotalAmount = flightDetails.inboundItineraries.amount + flightDetails.outboundItineraries.amount;
    }
  }

  closeFlightDetails() {
    this.sharedFlightService.toggleFilters(true);
  }

  getTravellerCount() {
    let paxNum: number = 0;
    if (this.storage.getItem('flightsearchInfo', 'session')) {
      const flightInfo = JSON.parse(this.storage.getItem('flightsearchInfo', 'session'));
      paxNum =
        flightInfo.travellers.adults +
        flightInfo.travellers.youngAdults +
        flightInfo.travellers.children +
        flightInfo.travellers.infants;
    } else {
      paxNum = 1;
    }
    return paxNum;
  }
  public getLayoverTxt(odo: Odo) {
    return getLayoverLabels(odo.segments);
  }
  public getLayoverTime(odo: Odo) {
    return GetLapoverTime(odo.segments, this.flightslist.airportInfos);
  }

  /*
   *  edit price model section
   */
  hasPermissionToEditFlightPrice() {
    return this.Iframewidgetservice.isB2BApp() && this.b2bApiService.hasEditPricePermission();
  }
  /**To split fare breakdown based on youngadults case */
  updateFareTravellers(travellerList: any) {
    return updateFareInfoTravellers(travellerList);
  }

  /**for B2B open edit price modal */
  openDomesticEditPriceModel(flights: any) {
    let domesticFlight = mergeDomesticFlights(flights);
    this.sharedFlightService.editpriceModalValue(domesticFlight);
  }

  isEnableBNPL(amount: number): boolean {
    return this.region === 'ZA' && this.Iframewidgetservice.isFrameWidget() && !this.Iframewidgetservice.isB2BApp();
  }

  displayItnPrice(itinerary: any) {
    itinerary.discountAmount = -(
      itinerary?.outboundItineraries?.fareBreakdown?.discountAmount +
      itinerary?.inboundItineraries?.fareBreakdown?.discountAmount
    );
    itinerary.amount = this.flightTotalAmount;
    return displayItinPrice(itinerary,false,false,true);
  }
  /**To review the Flight for SB domestic flow */
  reviewFlightDetails(itinerary: any) {
    let itineraryData = { 
      odoList : itinerary.outboundItineraries.odoList.concat(itinerary.inboundItineraries.odoList)
    }
      const dialog = this.dialog.open(ResultsDetailComponent, {
        data: {
          flightslist: this.flightslist,
          itinerary: itineraryData,
        },
        panelClass: 'fullscreen-dialog', // Styled in whitelabel CSS file
        autoFocus: false, // Prevent automatic scrolling to the Confirm button
  
        // Size this to fullscreen to simulate a router navigation
        width: '100vw',
        maxWidth: '100vw',
        height: '100vh',
        maxHeight: '100vh',
  
        // Make this behave more like a screen transition than a popup
        disableClose: true,
        enterAnimationDuration: '0ms',
        exitAnimationDuration: '0ms'
      });
      dialog.afterClosed().pipe(
        take(1),
        filter(result => result),
      ).subscribe(() => {
        // Continue to booking
        this.selectedDomFlight.emit(itinerary);
      });
    }
}
