import { Component, OnInit, ViewChild, ChangeDetectorRef, ElementRef, HostListener, Inject, PLATFORM_ID } from '@angular/core';
import { head } from 'lodash';
import { DatePipe, isPlatformBrowser } from '@angular/common';
import { BookingService } from './../services/booking.service';
import { TravellerInfoComponent } from './../traveller-info/traveller-info.component';
import { ContactInfoComponent } from './../contact-info/contact-info.component';
import { FareInfoComponent } from './../fare-info/fare-info.component';
import { Router, NavigationStart } from '@angular/router';
import { SearchResultsItinerary } from '../../flights/models/results/search-results-itinerary.model';
import { getFirstOdoAirlineCode, mergeDomesticFlights } from './../../flights/utils/search-results-itinerary.utils';
import { SearchResults } from './../../flights/models/results/search-results.model';
import { NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { SearchService } from '@app/flights/service/search.service';
import { GoogleTagManagerServiceService } from './../../_core/tracking/services/google-tag-manager-service.service';
import { generateUUID } from '@app/general/utils/id-utils';
import { DeepLinkService } from '@app/general/deeplinks/deep-link.service';
import { responsiveService } from './../../_core/services/responsive.service';
import { getFormattedDate } from '@app/flights/utils/odo.utils';
import { UntypedFormControl, Validators } from '@angular/forms';
import { BaggageSelectionComponent } from './../baggage-selection/baggage-selection.component';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { NavigationService } from './../../general/services/navigation.service';
import { ApiService } from '@app/general/services/api/api.service';
import { SeatmapService } from './../services/seatmap.service';
import { SeatmapsComponent } from './../../booking/seatmaps/seatmaps.component';
import { SessionStorageService } from 'ngx-webstorage';
import { formatExpDate } from '@app/flights/utils/search-data.utils';
import {
  checkPaxNameLengthValidation,
  checkPaxNames,
  getCountriesArray,
  getTravellerType,
  removeDiacriticsAndHyphens,
  updateFareInfoTravellers,
} from '../utils/traveller.utils';
import { IframeWidgetService } from '@app/general/services/iframe-widget.service';
import { SharedFlightService } from '@app/flights/service/sharedFlight.service';
import { isCheckedbaggageAvl } from '../utils/products.utils';
import { AddCheckInBaggageComponent } from '../add-check-in-baggage/add-check-in-baggage.component';
import { getFrequentFlyerCode } from '../utils/booking-data-traveller.utils';
import { getStorageData } from '@app/general/utils/storage.utils';
import { TravelOptionsComponent } from './../travel-options/travel-options.component';
import { UniversalStorageService } from '@app/general/services/universal-storage.service';
import { AffiliateService } from '../../general/services/affiliate.service';

declare let $: any;
@Component({
  selector: 'app-booking-view',
  templateUrl: './booking-view.component.html',
  styleUrls: [
    './booking-view.component.scss',
    './../../../theme/booking-view-extras.scss',
    './../../../theme/page-loader.scss',
  ],
})
export class BookingViewComponent implements OnInit {
  public flightsearchInfo: any;
  public isEnable_Addons_View = false;
  public isShowTravellerDetails = false;
  public flightsResultsResponse: SearchResults;
  public selectedFlight: SearchResultsItinerary;
  public pricedResult_data: any;
  public showMask = true;
  public bookingInfo: any = {};
  public isLoading = false;
  public traveller_list: any;
  public contactFormData: any;
  public showUpIcon = false;
  public flightNotFound = false;
  public showNoflight = false;
  public tryDiffrntFligt = false;
  public selected: any = 'Standard';
  public showPaymentError = false;
  public showCouponsInfo = false;
  public showDownIcon = false;
  public deepLink = false;
  page: number = 1;
  public url: any;
  mwebTotalPrice: number = 0;
  viewpriceUpIcon = true;
  viewpriceDownIcon = false;
  @ViewChild('traveller') public traveller: TravellerInfoComponent;
  @ViewChild('seatData') public seatData: SeatmapsComponent;
  @ViewChild('contact') public contact: ContactInfoComponent;
  @ViewChild('travelOptions') public travelOptions: TravelOptionsComponent;
  @ViewChild('checkedBaggage') public checkedBaggage: BaggageSelectionComponent;
  @ViewChild('checkInBaggage') public checkInBaggage: AddCheckInBaggageComponent;
  @ViewChild('fares') public fares: FareInfoComponent;
  selectedSeatsData: any = [];
  public frequentFlyer: any = [];
  public add_onsArray: any = [];
  public priceDeeplink = false;
  showWidget = false;
  totalSeatCost: number = 0;

  smsAlertData: any;
  baggageFee: number = 0;
  show_fare = false;
  totalTripAmount: any;
  public frequentFlyerDetails: any = [];
  public baggage_Data: any = [];
  public show_SeatnotSelectedModal = false;
  public paymentInfo: any;
  isAddons_expanded = false;
  collapseCardList: any = {
    travellerCard_Expanded: true,
    baggageCard_Expanded: true,
    seatCard_Expanded: false,
    add_onsCard_Expanded: false,
  };
  travellerList: any = [];
  showMwebSeats = false;
  seatMapData: any = {};
  public isConnected = false;
  isShowFlexiOptMessage: boolean = false;
  isBrowser: boolean;
  travelOptionsOpt: any = {
    flexiProduct: {},
    isShowFlexiOptMessage: false,
    isMetaCpy_Source: false,
    selectedTravelOptionsCategory: 'flexi',
  };

  country: string;
  isSeatSelectionDone: boolean = false;

  backButtonNavLink = '';


  constructor(
    private bookingService: BookingService,
    public router: Router,
    private cdref: ChangeDetectorRef,
    private searchService: SearchService,
    private datePipe: DatePipe,
    private deepLinkService: DeepLinkService,
    private ngbDateParserFormatter: NgbDateParserFormatter,
    private googleTagManagerServiceService: GoogleTagManagerServiceService,
    public responsiveService: responsiveService,
    public apiservice: ApiService,
    private _snackBar: MatSnackBar,
    public navService: NavigationService,
    private seatmapService: SeatmapService,
    private sessionStorageService: SessionStorageService,
    public iframeWidgetService: IframeWidgetService,
    private sharedFlightService: SharedFlightService,
    private el: ElementRef,
    private storage: UniversalStorageService,
    @Inject(PLATFORM_ID) private platformId: Object,
     private affiliateService: AffiliateService,
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.country = apiservice.extractCountryFromDomain();

    this.url = decodeURIComponent(this.router.url);
    router.events.subscribe((event: NavigationStart) => {
      if (location.pathname === '/booking/flight-details') {
        this.backButtonNavLink = '/flights/results'
      } else if (location.pathname === '/booking/products') {
        this.backButtonNavLink = 'booking/flight-details';
      }

      if (event.navigationTrigger === 'popstate') {
        this.searchService.changeNewSearch(null);
        // when user change data and go to back page then we can store the updated data
        if (location.pathname === '/booking/flight-details') {
          if (this.storage.getItem('bookingInfo', 'session')) {
            let updatedBookInfo = JSON.parse(this.storage.getItem('bookingInfo', 'session'));
            if (this.traveller?.travellerForm?.value) {
              this.traveller.updateFormValue();
              updatedBookInfo.travellerDetails = this.traveller.travellerForm.value;
            }
            this.storage.setItem('bookingInfo', JSON.stringify(updatedBookInfo), 'session');
          }
        }
      }
    });
    this.showCouponsInfo = true;
    this.checkNetworkConnection();
  }
  public products: any;
  standardAmount: number = 0;
  smsamount: number = 0;
  flexiAmount: number = 0;
  booknowSelected = false;
  selectedwtsup = true;
  public countriesArray: any[] = [];
  agreeTerms = new UntypedFormControl(false, Validators.required);
  submitted: boolean = false;
  showAddons_param: string = null;
  sidenavLoaded: boolean = false;
  duplicateBookingInfo: any = null;
  ngOnInit(): void {
    this.googleTagManagerServiceService.pushPageLoadEvent(
      '/booking/flight-details',
      'Search and Book Cheap Flights | Travelstart'
    );
    $('#first_name_length_Modal').modal('hide');
    this.storage.removeItem('voucherAmount');
    if (JSON.parse(this.storage.getItem('deepLinkRequest', 'session'))) {
      this.deepLink = JSON.parse(this.storage.getItem('deepLinkRequest', 'session'));
    }

    this.isRedirect();
    this.flightsearchInfo = JSON.parse(this.storage.getItem('flightsearchInfo', 'session'));
    this.flightsResultsResponse = JSON.parse(getStorageData('flightResults'));
    this.selectedFlight = JSON.parse(this.storage.getItem('selectedFlight', 'session'));
    let standardamount = JSON.parse(this.storage.getItem('standardAmount', 'session'));
    if (standardamount) {
      this.standardAmount = standardamount;
    }
    let deeplinkPriceError: any;
    this.deepLinkService.currentPriceError.subscribe((value: string) => {
      deeplinkPriceError = value;
      if (this.isBrowser && value === 'priceResponseErrors') {
        $('#price_failed').modal('hide');
        $('#payment_methods_error').modal('hide');
        $('#noFlightsModal').modal('show');
        return;
      } else if (this.isBrowser && value === 'priceApiFailed') {
        $('#noFlightsModal').modal('hide');
        $('#price_failed').modal('show');
        return;
      }
      return;
    });
    this.checkExpandedCards();
    this.deepLinkService.currentIsPriceDeepLink.subscribe((value: boolean) => {
      if (value) {
        this.priceDeeplink = value;
      }
    });

    this.searchService.currentNewSearch.subscribe((data: any) => {
      if (data?.updatePrice) {
        this.priceRequest(undefined, true);
      }
    });
    let seatsSubscription = this.bookingService.isSeatsToBeExpanded.subscribe((isExpanded: any) => {
      this.sidenavLoaded = isExpanded;
      this.showMwebSeats = false;
      if (isExpanded) {
        this.showMwebSeats = true;
        setTimeout(() => {
          seatsSubscription.unsubscribe();
          this.expandCard('seatCard_Expanded');
        }, 2000);
      }
    });
    if (!deeplinkPriceError && !this.storage.getItem('priceData', 'session')) {
      this.priceRequest();
    } else {
      this.pricedResult_data = JSON.parse(this.storage.getItem('priceData', 'session'));
      this.updateFareTravellers(this.pricedResult_data?.fareBreakdown);
      this.showMask = false;
      if (this.storage.getItem('travelOptionsOpt', 'session')) {
        this.travelOptionsOpt = JSON.parse(this.storage.getItem('travelOptionsOpt', 'session'));
      } else {
        this.setTravelOptionsCategory();
      }
    }
    this.countriesArray = getCountriesArray();
    if (this.storage.getItem('travellerPagequeryStringParams', 'session')) {
      let queryparams = JSON.parse(this.storage.getItem('travellerPagequeryStringParams', 'session'));
      this.storage.setItem('queryStringParams', JSON.stringify(queryparams), 'session');
    }
    this.removeSessionData();
    /**retrive seatInfo from storage service and display selected seats data
    /**retrive seatInfo from storage service and display selected seats data */
    if (this.isBrowser && 
      this.sessionStorageService.retrieve('seatInfo') &&
      Object.keys(this.sessionStorageService.retrieve('seatInfo').seats_Info).length !== 0
    ) {
      this.selectedSeatsData = this.sessionStorageService.retrieve('seatInfo').seats_Info;
      this.seatMapData.travellerList = this.selectedSeatsData;
      this.totalSeatCost = this.sessionStorageService.retrieve('seatInfo').totalSeatCost;
      //this.seatData.groupedSeatData = this.selectedSeatsData;
    } else {
      this.selectedSeatsData = [];
      this.totalSeatCost = 0;
    }
    /**To clear voucher data in session & observable when user come back from payment page  */
    this.storage.removeItem('voucherAmount');
    this.bookingService.changeVoucherInfo(null);
    this.bookingService.changeVoucheramount(0);
  }

  /* check required data for this component if data not available its redirect to home page */
  public isRedirect() {
    if (!this.storage.getItem('flightsearchInfo', 'session') || !getStorageData('flightResults')) {
      this.router.navigate([''], { queryParamsHandling: 'preserve' });
    }
  }
  // mweb select booktype
  selectBookType(param: boolean, select: string) {
    this.booknowSelected = param;
    this.selected = select;
  }

  canProceedToNext() {
    this.checkWithTravelOptions();
    this.continueToAddons();
  }

  flight_results() {
    this.router.navigate(['/flights/results'], { queryParamsHandling: 'preserve' });
  }
  getDeptDate(deptDate: any) {
    let departureDate: any;
    if (typeof deptDate === 'object') {
      let date = this.ngbDateParserFormatter.format(deptDate);
      departureDate = this.datePipe.transform(date, 'd MMM yyyy');
    } else {
      departureDate = this.datePipe.transform(deptDate, 'd MMM yyyy');
    }
    return departureDate;
  }
  goToSearchPage() {
    this.router.navigate(['/'], { queryParamsHandling: 'preserve' });
  }
  priceRequest(param?: any, is_repricing?: boolean) {
    this.showMask = true;
    if (param !== undefined && param) {
      this._snackBar.open('Baggage added', '');
      this.googleTagManagerServiceService.isBaggagechecked('Yes');
    } else if (param !== undefined && param == false) {
      this._snackBar.open('Baggage removed ', '');
      this.googleTagManagerServiceService.isBaggagechecked('No');
    } else {
      this.googleTagManagerServiceService.isBaggagechecked('No');
    }

    let bookInfo = JSON.parse(this.storage.getItem('bookingInfo', 'session'));
    let priceApiData = JSON.parse(this.storage.getItem('priceData', 'session'));
    if ((!bookInfo && !priceApiData) || param !== undefined || is_repricing) {
      this.triggerPriceAPI(param, bookInfo);
    } else if (!bookInfo && priceApiData) {
      this.showMask = false;
      this.pricedResult_data = priceApiData;
    } else {
      this.showMask = false;
      this.pricedResult_data = bookInfo.itineraryData;
    }
  }
  triggerPriceAPI(param: any, bookInfo: any) {
    let rePriceData: any = null;
    /**here we are checking selected flight info and send to price API */
    if (this.storage.getItem('selectedDomesticFlight', 'session')) {
      const domesticFlight = JSON.parse(this.storage.getItem('selectedDomesticFlight', 'session'));
      rePriceData = {
        data: this.flightsResultsResponse.data,
        outboundItineraryId: (() => {
          if (domesticFlight.outboundItineraries) {
            return domesticFlight.outboundItineraries.id;
          } else if (domesticFlight.outboundItineraryId !== null || domesticFlight.outboundItineraryId !== undefined) {
            return domesticFlight.outboundItineraryId;
          }
        })(),
        inboundItineraryId: (() => {
          if (domesticFlight.inboundItineraries) {
            return domesticFlight.inboundItineraries.id;
          } else if (domesticFlight.inboundItineraryId !== null || domesticFlight.inboundItineraryId !== undefined) {
            return domesticFlight.inboundItineraryId;
          }
        })(),
      };
      if (this.iframeWidgetService.isB2BApp()) {
        rePriceData = {
          ...rePriceData,
          ...this.addExtraPriceParams(domesticFlight),
        };
      }
    }
    if (this.storage.getItem('selectedFlight', 'session')) {
      let selectedFlight = JSON.parse(this.storage.getItem('selectedFlight', 'session'));
      rePriceData = {
        data: this.flightsResultsResponse.data,
        outboundItineraryId: (() => {
          if (this.flightsResultsResponse?.priceResponse?.selectedOutboundItineraryId) {
            return this.flightsResultsResponse.priceResponse.selectedOutboundItineraryId;
          } else {
            return selectedFlight.id;
          }
        })(),
      };
      if (this.iframeWidgetService.isB2BApp()) {
        rePriceData = {
          ...rePriceData,
          ...this.addExtraPriceParams(this.selectedFlight),
        };
      }
    }
    if (param || !param) {
      rePriceData.includeBaggage = param;
    }

    // To Do

    /* const selectedFlight = [this.selectedFlight];
    this.googleTagManagerServiceService.pushSelectedFlightData(
      this.flightsResultsResponse.airlineNames,
      selectedFlight,
      this.flightsearchInfo.tripType
    ); */
    if (rePriceData && rePriceData.outboundItineraryId != null) {
      this.storage.removeItem('priceData');
      this.storage.removeItem('seatMapInfoObject');
      this.storage.removeItem('travelOptionsOpt');
      this.bookingService.getPricing(rePriceData).subscribe(
        (res: any) => {
          if (res.itineraries) {
            this.storage.setItem('priceData', JSON.stringify(res), 'session');
            this.googleTagManagerServiceService.pushSelectedFlightData(
              this.flightsResultsResponse,
              this.flightsearchInfo,
              res,
              this.flightsResultsResponse.airlineNames,
              res.itineraries,
              this.flightsearchInfo.tripType
            );

            /**
             * start of addToCart: mainCart[]
             */
            const originAirport = this.flightsearchInfo.itineraries[0].dept_city.code;
            const destinationAirport = this.flightsearchInfo.itineraries[0].arr_city.code;
            const flightRoute = `${this.flightsearchInfo.itineraries[0].dept_city.iata}-${this.flightsearchInfo.itineraries[0].arr_city.iata}`;
            const flightSector = `${this.flightsearchInfo.itineraries[0].dept_city.iata}_${this.flightsearchInfo.itineraries[0].arr_city.iata}`;
            const cityPairName = `${this.flightsearchInfo.itineraries[0].dept_city.city}-${this.flightsearchInfo.itineraries[0].arr_city.city}`;
            const pax =
              this.flightsearchInfo.travellers.adults +
              this.flightsearchInfo.travellers.youngAdults +
              this.flightsearchInfo.travellers.children +
              this.flightsearchInfo.travellers.infants;

            const airlineNames = res.airlineNames || undefined;
            const airline = airlineNames
              ? (Object as any).values(airlineNames)[0]
              : this.getAirlineName(getFirstOdoAirlineCode(head(res.itineraries)));

            const mainCart = {
              currency: res.currencyCode,
              tripType: this.flightsearchInfo.tripType,
              airlineName: airline,
              route: flightRoute,
              sector: flightSector,
              cityPair: cityPairName,
              originAirportCode: originAirport,
              destinationAirportCode: destinationAirport,
              departureDate: this.flightsearchInfo.itineraries[0].dept_date,
              destinationIATA: this.flightsearchInfo.itineraries[0].arr_city.iata,
              destinationCityName: this.flightsearchInfo.itineraries[0].arr_city.city,
              originIATA: this.flightsearchInfo.itineraries[0].dept_city.iata,
              originCityName: this.flightsearchInfo.itineraries[0].dept_city.city,
              returnDate: this.flightsearchInfo.tripType ? this.flightsearchInfo.itineraries[0].arr_date : undefined,
              numberAdults: this.flightsearchInfo.travellers.adults,
              numberyoungAdults: this.flightsearchInfo.travellers.youngAdults,
              numberChildren: this.flightsearchInfo.travellers.children,
              numberInfants: this.flightsearchInfo.travellers.infants,
              paxTotal: pax,
              flightPrice: res.totalAmount - res.fareBreakdown.taxAmount,
              taxAmount: res.fareBreakdown.taxAmount,
              transactionTotal: res.totalAmount,
            };

            this.googleTagManagerServiceService.pushAddToCartData(mainCart, res.itineraries);

            this.googleTagManagerServiceService.pushGFPriceAccuracyTag('view_item', res.totalAmount, res.currencyCode);

            /**
             * End of addToCart: mainCart[]
             */
          }
          this.pricedResult_data = res;
          this.updateFareTravellers(this.pricedResult_data?.fareBreakdown);
          if (bookInfo) {
            bookInfo.itineraryData = this.pricedResult_data;
            this.storage.setItem('bookingInfo', JSON.stringify(bookInfo), 'session');
          }

          if (this.isBrowser && this.pricedResult_data.errors) {
            $('#noFlightsModal').modal('show');
            return;
          }
          if (
            location.pathname === '/booking/flight-details' &&
            this.pricedResult_data &&
            this.pricedResult_data.priceIncrease &&
            (param == undefined || param == null)
          ) {
            if(this.isBrowser){
              $('#fare_increased_Modal').modal('show');
            }
            this.show_fare = true;
            this.googleTagManagerServiceService.pushFareIncreseTag(this.pricedResult_data?.priceIncrease);
          }
          if (this.pricedResult_data.products && param === undefined) {
            this.storage.setItem('products', JSON.stringify(this.pricedResult_data.products), 'session');
            this.bookingService.changeProducts(this.pricedResult_data.products);
            this.setTravelOptionsCategory();
          }
          if ((this.pricedResult_data.products && param == true) || param == false) {
            if (this.storage.getItem('products', 'session')) {
              let prods = JSON.parse(this.storage.getItem('products', 'session'));
              prods.forEach((y: any) => {
                this.pricedResult_data.products.forEach((z: any) => {
                  if (y.id == z.id) {
                    y.amount = z.amount;
                  }
                });
              });
              this.storage.removeItem('products');
              this.storage.setItem('products', JSON.stringify(prods), 'session');
              this.bookingService.changeProducts(prods);
              this.setTravelOptionsCategory();
            }
          }
          if (this.isBrowser && this.pricedResult_data?.errors?.length > 0) {
            this.showMask = false;
            $('#noFlightsModal').modal('show');
          }
          this.showMask = false;
          this._snackBar.dismiss();
        },
        (error) => {
          if (error) {
            if (error.error && this.isConnected) {
              if (this.isBrowser && error.error.code === 404) {
                this.showMask = false;
                $('#priceError_modal').modal('show');
                // this.router.navigate(['/']);
                this.googleTagManagerServiceService.pushGFPriceAccuracyTagError(
                  'view_item',
                  'FLIGHT_NOT_FOUND',
                  error.error
                );
                return;
              }
              this.bookingService.changeflightNotavail(true);
              this.searchService.changeNoFilters(false);
              this.tryDiffrntFligt = true;
              this.showNoflight = true;
              this.showMask = false;
              this._snackBar.dismiss();
            }
          }
        }
      );
    } else {
      this.router.navigate([''], { queryParamsHandling: 'preserve' });
    }
  }
  getPassengers(travellers: number, param: string) {
    return getTravellerType(travellers, param);
  }

  private getAirlineName = (airlineCode: string) => this.flightsResultsResponse.airlineNames[airlineCode];

  ngAfterContentChecked() {
    this.cdref.detectChanges();
  }

  get_baggageAmount(amount: number) {
    if (amount) {
      this.baggageFee = amount;
    } else {
      this.baggageFee = 0;
    }
  }

  private getPaxInfo(passengerInfo: any, idx: number) {
    this.frequentFlyerDetails = [];
    this.baggage_Data = [];
    let paxInfo: any;
    passengerInfo.specialRequests.frequentFlyerDetailsList.forEach((x: any) => {
      this.frequentFlyerDetails.push({
        airlineCode: x.airlineCode,
        frequentFlyerCode: getFrequentFlyerCode(x.frequentFlyerCode, x.airlineCode),
      });
    });
    if (
      this.checkInBaggage?.baggageAssignedPaxList?.length > 0 &&
      this.checkInBaggage?.baggageAssignedPaxList[idx] &&
      this.checkInBaggage?.baggageAssignedPaxList[idx].baggageData?.length > 0
    ) {
      this.checkInBaggage.baggageAssignedPaxList[idx].baggageData.forEach((x: any) => {
        if (x.preSelected) {
          this.baggage_Data.push({
            id: x.id,
            selected: true,
          });
        }
      });
    } else {
      this.baggage_Data = [];
    }
    paxInfo = {
      id: generateUUID(),
      email: '',
      firstName: removeDiacriticsAndHyphens(passengerInfo.firstName),
      middleName: removeDiacriticsAndHyphens(passengerInfo.middleName),
      lastName: removeDiacriticsAndHyphens(passengerInfo.lastName),
      documentType: <any>null,
      documentNumber: <any>null,
      passportNumber: passengerInfo.passportNumber.trim(),
      passportCountry: passengerInfo.passPortCountry,
      nationality: passengerInfo.nationality,
      isShowPassport: (() => {
        if (passengerInfo.passportExpiry) {
          return true;
        } else {
          return false;
        }
      })(),
      dob: (() => {
        if (passengerInfo.dob) {
          const day = parseInt(passengerInfo.dob.substring(0, 2));
          const month = parseInt(passengerInfo.dob.substring(3, 5));
          const year = parseInt(passengerInfo.dob.substring(6, 10));
          return { day: day, month: month, year: year };
        } else {
          return {};
        }
      })(),
      dobFormatted: (() => {
        if (passengerInfo.dob) {
          return getFormattedDate(passengerInfo.dob);
        }
      })(),
      type: passengerInfo.type,
      title: passengerInfo.gender,
      passportExpiryFormatted: (() => {
        if (passengerInfo.passportExpiry) {
          if (typeof passengerInfo.passportExpiry === 'string') {
            return getFormattedDate(passengerInfo.passportExpiry);
          } else if (typeof passengerInfo.passportExpiry === 'object') {
            let expiryDate = formatExpDate(passengerInfo.passportExpiry);
            return expiryDate;
          }
        } else {
          return {};
        }
      })(),
      passportExpiry: (() => {
        if (passengerInfo.passportExpiry) {
          if (typeof passengerInfo.passportExpiry === 'string') {
            const d = new Date(passengerInfo.passportExpiry);
            const month = parseInt(passengerInfo.passportExpiry.slice(3, 5));
            const day = parseInt(passengerInfo.passportExpiry.slice(0, 2));
            const year = parseInt(passengerInfo.passportExpiry.slice(6, 10));
            return { day: day, month: month, year: year };
          } else if (typeof passengerInfo.passportExpiry === 'object') {
            return {
              day: passengerInfo.passportExpiry.day,
              month: passengerInfo.passportExpiry.month,
              year: passengerInfo.passportExpiry.year,
            };
          }
        } else {
          return {};
        }
      })(),
      specialRequests: {
        frequentFlyerDetailsList: this.frequentFlyerDetails,
        mealSelection: passengerInfo.specialRequests.mealValue,
        //seatDetails: <any>[],
        seatDetails: (() => {
          if (this.seatMapData?.travellerList && this.seatMapData?.travellerList[idx] && this.seatMapData?.travellerList[idx]?.specialRequests) {
            return this.assignSeatDetails(this.seatMapData.travellerList[idx].specialRequests.seatDetails);
          } else {
            return null;
          }
        })(),
        // seatDetail: this.seatData.travellerList[idx].specialRequests.seatDetails,
      },
      baggageSelection: this.baggage_Data, // To Do
    };
    return paxInfo;
  }
  assignSeatDetails(seatData: any) {
    return seatData?.length > 0 ? seatData.filter((x: any) => x.seatNumber != '') : [];
  }
  private passengersList() {
    let adults = [];
    let youngAdults = [];
    const children = [];
    const infants = [];
    if (this.traveller.travellerForm.value.travellersList) {
      for (let i = 0; i < this.traveller.travellerForm.value.travellersList.length; i++) {
        let pax = this.getPaxInfo(this.traveller.travellerForm.value.travellersList[i], i);
        if (pax.type === 'ADULT') {
          adults.push(pax);
        } else if (pax.type === 'YOUNGADULT') {
          youngAdults.push(pax);
        } else if (pax.type === 'CHILD') {
          children.push(pax);
        } else if (pax.type === 'INFANT') {
          infants.push(pax);
        }
      }
    }
    if (this.pricedResult_data?.fareBreakdown?.youngAdults?.isModified && youngAdults?.length > 0) {
      youngAdults.forEach((x: any) => {
        x.type = 'ADULT';
      });
      adults = adults.concat(youngAdults);
      youngAdults = [];
    }
    const passengers = {
      infants: infants,
      adults: adults,
      youngAdults: youngAdults,
      children: children,
    };
    return passengers;
  }

  private getContactDetails() {
    const contact = {
      email: this.contact.contactForm.value.email,
      firstName: this.traveller.travellerForm?.value?.travellersList[0]?.firstName,
      title: this.traveller.travellerForm?.value?.travellersList[0]?.gender,
      lastName: this.traveller.travellerForm?.value?.travellersList[0]?.lastName,
      mobileCode: (() => {
        if (this.contact.contactForm.value.dialCode) {
          return typeof this.contact.contactForm.value.dialCode == 'object'
            ? this.contact.contactForm.value.dialCode.dialCode
            : this.contact.contactForm.value.dialCode;
        } else {
          return '1';
        }
      })(),
      mobileNo: this.contact.contactForm?.value?.phone?.split(' ').join('').replace(/[+]/g, ''),
    };
    return contact;
  }

  private getselectedProducts() {
    const selectedProducts = [];
    if (this.bookingInfo.productDetails && this.bookingInfo.productDetails.length > 0) {
      for (let i = 0; i < this.bookingInfo.productDetails.length; i++) {
        if (this.bookingInfo.productDetails[i].id) {
          const product = {
            id: this.bookingInfo.productDetails[i].id,
            selectedValue: this.bookingInfo.productDetails[i].initSelected,
          };
          selectedProducts.push(product);
        }
      }
    }
    return selectedProducts;
  }
  /** to check any product is selected or not except SMS and whatsapp */
  isSelectedAncilliaries() {
    let productsInfo = JSON.parse(this.storage.getItem('products', 'session'));
    productsInfo =
      productsInfo && productsInfo.length > 0
        ? productsInfo.filter((x: any) => x.id != 'SMS' && x.id != 'WHATSAPP' && x.id != 'MEALS')
        : [];
    return productsInfo && productsInfo.length > 0 ? productsInfo.some((x: any) => x.initSelected) : false;
  }
  public proceedToPaymet(ignoreDuplicateBooking: boolean, ignoreSeats?: boolean) {
    this.contact.updateContactForm();
    if(this.isBrowser){
      $('#seat_are_Notselected').modal('hide');
      $('#ancilliaries_Notselected').modal('hide');
    }
    this.contact.mobileNumLengthFailed = false;
    this.contact.invalidEmail = false;
    this.show_SeatnotSelectedModal = false;
    this.bookingService.changeContactDetailsvalid(null);
    this.storage.removeItem('bookingInfo');
    this.storage.removeItem('paymentReqInfo');
    this.submitted = true;
    this.traveller_list = this.traveller.travellerForm.value.travellersList;
    let productsInfo = JSON.parse(this.storage.getItem('products', 'session'));
    this.updateBaggage();
    if (
      (this.checktravellerFormData() &&
        this.apiservice.extractCountryFromDomain() !== 'NG' &&
        this.apiservice.extractCountryFromDomain() !== 'GI') ||
      (this.checktravellerFormData() &&
        (this.apiservice.extractCountryFromDomain() === 'NG' || this.apiservice.extractCountryFromDomain() === 'GI') &&
        this.agreeTerms.value)
    ) {
      this.bookingInfo = {
        itineraryData: this.pricedResult_data,
        contactDetails: this.contact.contactForm.value,
        travellerDetails: this.traveller.travellerForm.value,
        productDetails: (() => {
          if (productsInfo && productsInfo.length) {
            return productsInfo;
          } else {
            return [];
          }
        })(),
      };
      this.storage.setItem('bookingInfo', JSON.stringify(this.bookingInfo), 'session');
    } else {
      this.isLoading = false;
      return;
    }
    /**To disable seat not selected modal when user at addons section
     * if (
      this.isSelectedAncilliaries() &&
      !ignoreDuplicateBooking &&
      !ignoreSeats && this.isShowSeatOption() &&
      this.selectedSeatsData.length == 0
    ) {
      this.show_SeatnotSelectedModal = true;
      $('#seat_are_Notselected').modal('show');
    }
    */
    /**here disable popup for  impact on live without add ons selection testing after testing is done we can enable it again
        *
        * if (!ignoreDuplicateBooking && !this.isSelectedAncilliaries() && this.isConnected && this.isAddonsAvilable()) {
      let productsAmount: any;
      productsAmount = checkProductsAmount(productsInfo);
      return productsAmount
        ? $('#ancilliaries_Notselected').modal('show')
        : this.continueToPayment(ignoreDuplicateBooking);
    } else if (this.isConnected) {
      this.continueToPayment(ignoreDuplicateBooking);
    }
      */

    if (this.isConnected) {
      this.continueToPayment(ignoreDuplicateBooking);
    }
  }
  continueToPayment(ignoreDuplicateBooking: boolean) {
    if(this.isBrowser){
      $('#duplicateBookingModal').modal('hide'); 
    }
    this.isLoading = true;
    let paymentInfo = {
      products: this.getselectedProducts(),
      contact: this.getContactDetails(),
      passengers: this.passengersList(),
      data: this.bookingInfo.itineraryData.data,
      ignoreDuplicateBookings: ignoreDuplicateBooking,
    };
    const cartTravellerObj = {
      title: paymentInfo.contact.title,
      firstName: paymentInfo.contact.firstName,
      lastName: paymentInfo.contact.lastName,
      dob: (() => {
        if (paymentInfo.passengers.adults && paymentInfo.passengers.adults[0] && paymentInfo.passengers.adults[0].dob) {
          return paymentInfo.passengers.adults[0].dob;
        }
      })(),
    };
    if (this.iframeWidgetService.isB2BApp()) {
      paymentInfo = {
        ...paymentInfo,
        ...this.addUpdatefareReference(this.pricedResult_data),
      };
    }
    this.googleTagManagerServiceService.pushPaymentMethodsRequestEvent();
    this.googleTagManagerServiceService.pushPaymentMethodsValidationRequestEvent();
    let travellerPageInfo = this.gtmTravellerPageData();
    travellerPageInfo['agree_terms_conditions'] = this.agreeTerms.value;
    this.googleTagManagerServiceService.pushFlight_SummaryEvent(this.pricedResult_data, travellerPageInfo,this.flightsResultsResponse,this.flightsearchInfo,)
    this.bookingService.getPaymentMethods(paymentInfo).subscribe(
      (res: any) => {
        // To Do GTM Event
        this.totalTripAmount = this.fares.getTotalPrice(
          this.pricedResult_data.currencyCode,
          this.pricedResult_data.totalAmount,
          this.pricedResult_data.products,
          this.baggageFee,
          this.selected
        );

        this.googleTagManagerServiceService.pushCartProductsData(
          this.getSelectedAddAncilliaries(this.bookingInfo.productDetails),
          this.totalTripAmount,
          cartTravellerObj
        );

        let payment_Data = res;
                this.googleTagManagerServiceService.pushBookingReference(
          (() => {
            if (payment_Data && payment_Data.tccReference) {
              return payment_Data.tccReference;
            } else if (
              payment_Data.additionalErrorResponse &&
              payment_Data.additionalErrorResponse.tccBookingReference
            ) {
              return payment_Data.additionalErrorResponse.tccBookingReference;
            } else {
              return '';
            }
          })()
        );
        this.googleTagManagerServiceService.pushPaymentMethodsResponseEvent();
        if (payment_Data.errors) {
          let isDuplicateBookingError = payment_Data.errors.some((x:any)=>x?.errorWarningAttributeGroup?.code === '48399');
          if (isDuplicateBookingError && payment_Data?.additionalErrorResponse?.tccBookingReference) {
            this.duplicateBookingInfo = payment_Data?.additionalErrorResponse;
            $('#duplicateBookingModal').modal('show');
          } else {
            $('#payment_methods_error').modal('show');
          }
        }
        if (payment_Data && payment_Data.paymentOptions && !payment_Data.validationResults) {
          this.storage.setItem('paymentReqInfo', JSON.stringify(paymentInfo), 'session');
          this.showMask = false;
          this.isLoading = false;
          this.storage.setItem('paymentMethods', JSON.stringify(res), 'session');
          if (this.iframeWidgetService.isB2BApp()) {
            this.router.navigate(['/payments/wallet-pay'], { queryParamsHandling: 'preserve' });
          } else {
            this.router.navigate(['/payments'], { queryParamsHandling: 'preserve' });
          }
          return;
        } else {
          this.traveller.invalidPassportExpiry = false;
          this.traveller.duplicateNameErr = false;
          this.contact.mobileCodeInvalid = false;
          this.isLoading = false;
          if (payment_Data.validationResults) {
            this.googleTagManagerServiceService.pushPaymentMethodsValidationResponseEvent();
            if (payment_Data.validationResults.contactDetailsValidationResults.isValid == false) {
              this.checkContactDetailsValidation(payment_Data.validationResults.contactDetailsValidationResults);
              if (!payment_Data.validationResults.contactDetailsValidationResults.additionalParams.maximumNameLength) {
                this.router.navigate(['/booking/flight-details'], { queryParamsHandling: 'preserve' });
              } else if ( this.isBrowser && 
                payment_Data.validationResults.contactDetailsValidationResults.additionalParams.maximumNameLength
              ) {
                $('#first_name_length_Modal').modal('show');
              }
              this.bookingService.changeContactDetailsvalid(
                payment_Data.validationResults.contactDetailsValidationResults
              );
            }
            if (
              payment_Data.validationResults.passengersValidationResults &&
              payment_Data.validationResults.passengersValidationResults.isValid == false
            ) {
              for (
                let i = 0;
                i <= payment_Data.validationResults.passengersValidationResults.passengerValidationResults.length;
                i++
              ) {
                let psngrValidation =
                  payment_Data.validationResults.passengersValidationResults.passengerValidationResults;
                if (psngrValidation[i] && psngrValidation[i].validationResults) {
                  if (psngrValidation[i].validationResults.invalidFields.passportExpiryValid == false) {
                    this.traveller.travellerForm
                      .get('travellersList')
                      ['controls'][i].get('passportExpiry')
                      .setErrors({ invalid: true });
                    this.traveller.travellerForm
                      .get('travellersList')
                      ['controls'][i].get('showPsExpiryErr')
                      .setValue(true);
                    this.traveller.scrollInput('paxType', i);
                    return;
                  }
                  if (psngrValidation[i].validationResults.invalidFields.nationalityValid == false) {
                    this.traveller.travellerForm
                      .get('travellersList')
                      ['controls'][i].get('invalidnationality')
                      .setValue(true);
                    return;
                  }
                  if (psngrValidation[i].validationResults.invalidFields.passportCountryValid == false) {
                    this.traveller.travellerForm
                      .get('travellersList')
                      ['controls'][i].get('invalidPscountry')
                      .setValue(true);
                    return;
                  }
                  if (
                    !psngrValidation[i].validationResults.isValid &&
                    psngrValidation[i].validationResults.invalidFields &&
                    psngrValidation[i].validationResults.invalidFields.dobAgeValid == false
                  ) {
                    this.traveller.travellerForm.get('travellersList')['controls'][i].get('showError').setValue(true);
                    return;
                  }
                }
                if (
                  psngrValidation.some((x: any) => x.validationResults.invalidFields.passengersDuplicateValid == false)
                ) {
                  this.traveller.duplicateNameErr = true;
                }
              }
            }
          }
          return;
        }
      },
      (error) => {
        if (error) {
          if (error.error && this.isConnected) {
            if (this.isBrowser && error.error.code === 404) {
              $('#payment_error_modal').modal('show');
            } else {
              this.isLoading = false;
              this.showNoflight = true;
              return;
            }
          }
        }
      }
    );
  }

  //**To Validate contact form */
  public validateContactForm(): void {
    this.storage.removeItem('contactInfo');
    this.contact.submitForm = true;
    this.contact.mobileNumLengthFailed = false;
    this.contact.mobileCodeInvalid = false;
    if (this.contact.contactForm.status === 'VALID' && this.contact.contactForm.get('email').value) {
      this.contact.mobileNumLengthFailed = false;
      this.showCouponsInfo = true;
      this.storage.setItem('contactInfo', JSON.stringify(this.contact.contactForm.value), 'session');
    } else {
      this.isLoading = false;
      this.contact.saveContactDetails();
      this.contactFormData = this.contact.contactForm.value;
      if (this.contact.contactForm.get('phone').valid && !this.contact.contactForm.get('email').value) {
        this.contact.contactForm.get('email').setErrors({ invalid: true });
        document.getElementById('email').focus();
      }
    }
    // To Do window.scrollTo(0, 0);
    this.totalTripAmount = this.fares.getTotalPrice(
      this.pricedResult_data.currencyCode,
      this.pricedResult_data.totalAmount,
      this.pricedResult_data.products,
      this.baggageFee
    );

    //To cart traveller event
    const cartTravellerObj = {
      email: this.contact.contactForm.value.email,
      phone: this.contact.contactForm.value.phone,
    };
    this.googleTagManagerServiceService.pushCartTravellerData(cartTravellerObj);
  }
  // get the list of selected ancilliaries
  getSelectedAddAncilliaries(products: any) {
    let selectedAddOns = [];
    if (products && products.length > 0) {
      for (var i = 0; i < products.length; i++) {
        if (products[i].initSelected) {
          selectedAddOns.push(products[i]);
        }
      }
    }
    return selectedAddOns;
  }
  FlexiTicketTerms() {
    if(this.isBrowser){
      $('#flexi_ticket_terms_Condtions').modal('show');
    }
  }
  refreshFlight() {
    this.priceRequest();
  }
  ngOnDestroy() {
    if(!this.isBrowser) return;
    $('#flexi_ticket_terms_Condtions').modal('hide');
    $('#fare_increased_Modal').modal('hide');
    $('#noFlightsModal').modal('hide');
    $('#priceError_modal').modal('hide');
    $('#payment_error_modal').modal('hide');
    $('#duplicateBookingModal').modal('hide');
    $('#seat_are_Notselected').modal('hide');
    $('#ancilliaries_Notselected').modal('hide');
    $('#editpricing_modal_').modal('hide');
    $('#seatNotselected').modal('hide');
    $('#fare_rules_Modal').modal('hide');
    this._snackBar.dismiss();
  }
  getAmount(val: number) {
    this.mwebTotalPrice = val;
  }

  showPriceIcon() {
    this.viewpriceUpIcon = !this.viewpriceUpIcon;
    this.viewpriceDownIcon = !this.viewpriceDownIcon;
  }

  toggleSideNav(param?: string) {
    this.show_SeatnotSelectedModal = false;
    if (this.traveller?.travellerForm?.value) {
      this.seatmapService.updateTravellers(this.traveller.travellerForm.value);
    }
    this.showWidget = true;
    this.showMwebSeats = true;
    if (this.responsiveService.screenWidth == 'sm' || this.responsiveService.screenWidth == 'md') {
      this.navService.setShowNav(true);
      this.showWidget = false;
    }
  }

  closeSideNav() {
    this.navService.setShowNav(false);
    this.continueToAddons_products();
  }

  getSeatDetails(seatData: any) {
    if (this.seatData?.travellerList && this.seatData?.travellerList?.length !== 0) {
      this.selectedSeatsData = this.seatData.travellerList;
    } else {
      this.selectedSeatsData = [];
    }
    if (this.seatData) {
      this.seatMapData = this.seatData;
      this.traveller.travellerForm.value.travellersList = this.seatData.travellerList;
    }

    this.totalSeatCost = this.seatData?.totalSeatsCost;
    setTimeout(() => {
      const seatInfo = {
        isSeatSelected: true,
        showSeatLabel: true,
        totalSeatCost: this.totalSeatCost,
        seats_Info: this.selectedSeatsData,
      };
      if(this.isBrowser){
        this.sessionStorageService.clear('seatInfo');
        this.sessionStorageService.store('seatInfo', seatInfo);
      }
      this.seatmapService.updateSeatData(seatInfo);
    }, 2000);
  }

  showPriceWithAddons() {
    return this.fares && this.fares.showAddons() ? this.fares.showAddons() : false;
  }

  /**for B2B to Open edit price modal for  */
  openEditPriceModal() {
    if(this.isBrowser){
      $('#editpricing_modal_').modal('show');
    }
    if (this.storage.getItem('selectedFlight', 'session')) {
      let itinerary = JSON.parse(this.storage.getItem('selectedFlight', 'session'));
      this.sharedFlightService.editpriceModalValue(itinerary);
    } else if (this.storage.getItem('selectedDomesticFlight', 'session')) {
      let domflights = JSON.parse(this.storage.getItem('selectedDomesticFlight', 'session'));
      let domesticFlight = mergeDomesticFlights(domflights);
      this.sharedFlightService.editpriceModalValue(domesticFlight);
    }
  }
  on_EditPriceModalSubmit(res: any) {
    if(this.isBrowser){
      $('#editpricing_modal_').modal('hide');
    }
    this.pricedResult_data.dynamicDiscount = res.dynamicDiscount;
    this.pricedResult_data.additionalMarkup = res.additionalMarkup;
    this.pricedResult_data.totalAmount = res.updatedTotalAmount;
    this.storage.setItem('priceData', JSON.stringify(this.pricedResult_data), 'session');
    if (this.storage.getItem('selectedFlight', 'session')) {
      let itinerary = JSON.parse(this.storage.getItem('selectedFlight', 'session'));
      itinerary.dynamicDiscount = res.dynamicDiscount;
      itinerary.additionalMarkup = res.additionalMarkup;
      itinerary.amount = res.updatedTotalAmount;
      this.storage.setItem('selectedFlight', JSON.stringify(itinerary), 'session');
    } else if (this.storage.getItem('selectedDomesticFlight', 'session')) {
      let domflights = JSON.parse(this.storage.getItem('selectedDomesticFlight', 'session'));
      domflights.dynamicDiscount = res.dynamicDiscount;
      domflights.additionalMarkup = res.additionalMarkup;
      this.storage.setItem('selectedDomesticFlight', JSON.stringify(domflights), 'session');
    }
  }
  closeEditPriceModal() {
    if(this.isBrowser){
      $('#editpricing_modal_').modal('hide');
    }
  }
  /**add extra parameters in price payload */
  addExtraPriceParams(data: any) {
    const params = {
      additionalMarkup: data.additionalMarkup,
      isFromEditPriceList: false,
      isPriceIncrease: false,
      discountPrice: data.dynamicDiscount,
    };
    return params;
  }
  /**To split fare breakdown based on youngadults case */
  updateFareTravellers(travellerList: any) {
    if (this.pricedResult_data) {
      this.pricedResult_data.fareBreakdown = updateFareInfoTravellers(travellerList);
    }
  }
  /**To check itin has checked baggage or not */
  isShowCheckedBaggage() {
    if (this.storage.getItem('baggageInfo', 'session')) {
      const baggateData = JSON.parse(this.storage.getItem('baggageInfo', 'session'));
      return baggateData.isEnable;
    } else {
      return isCheckedbaggageAvl(this.pricedResult_data);
    }
  }
  /**To check traveller form validation and name length and duplicate names  */
  checktravellerFormData() {
    let nameLengthFailed = checkPaxNameLengthValidation(this.traveller.travellerForm, this.traveller.travllerInfoForm);
    if (this.isBrowser && nameLengthFailed) {
      $('#first_name_length_Modal').modal('show');
    }
    return this.traveller.travellerForm.status === 'VALID' && !this.traveller.paxDuplicateNameErr && !nameLengthFailed;
  }
  /**To validate Traveller Form */
  validateTravellerForm() {
    this.traveller.getTravellerInfo();
    const totalPaxValues = this.traveller.travellerForm.controls.travellersList.value;
    this.traveller.paxDuplicateNameErr = checkPaxNames(totalPaxValues);
  }
  /***this is for validate contact form and traveller form and enable next sections */
  continueToAddons() {
    if (!this.checkWithTravelOptions()) {
      return;
    }

    this.validateTravellerForm();
    this.validateContactForm();
    this.isEnable_Addons_View = Boolean(this.contact.contactForm.status === 'VALID' && this.checktravellerFormData());
    this.showAddons_param =
      this.contact.contactForm.status === 'VALID' && this.checktravellerFormData() ? 'traveller_Addons' : null;
    if (
      this.contact.contactForm.status === 'VALID' &&
      this.checktravellerFormData() &&
      (this.responsiveService.screenWidth == 'sm' || this.responsiveService.screenWidth == 'md')
    ) {
      this.isShowTravellerDetails = true;
      if (this.storage.getItem('bookingInfo', 'session')) {
        const bookInfoData = JSON.parse(this.storage.getItem('bookingInfo', 'session'));
        bookInfoData['travellerDetails'] = this.traveller.travellerForm.value;
        this.storage.setItem('bookingInfo', JSON.stringify(bookInfoData), 'session');
      }
      if (this.isAddonsAvilable() || this.isShowSeatOption()) {
        this.router.navigate(['/booking/products'], { queryParamsHandling: 'preserve' });
      }
    }
    if (this.contact.contactForm.status === 'VALID' && this.checktravellerFormData()) {
      this.storage.setItem(
        'travellerFormData',
        JSON.stringify(this.traveller.travellerForm.controls.travellersList.value), 'session'
      );
      const travellerPageInfo = this.gtmTravellerPageData();
      this.googleTagManagerServiceService.pushFlightTravellerEvent(this.pricedResult_data, travellerPageInfo,this.flightsResultsResponse,this.flightsearchInfo)
      this.travellerList = this.traveller.travellerForm.value.travellersList;
      this.collapseCardList['travellerCard_Expanded'] = !this.isAddonsAvilable() && !this.isShowSeatOption();
      this.collapseCardList['baggageCard_Expanded'] = !this.isAddonsAvilable() && !this.isShowSeatOption();
      this.collapseCardList['add_onsCard_Expanded'] = false;
      /**currently we are disable open seatmap after traveller we just open addons only if want to open seats firest we need uncomment code
       * if(this.isShowSeatOption()){
        this.expandCard('seatCard_Expanded');
      }else if(this.isAddonsAvilable()){
        this.collapseCardList['travellerCard_Expanded'] = false;
        this.expandCard('add_onsCard_Expanded');
      }
        */
      this.checkNextSection();
      this.updateBaggage();
    }
  }
  /**To check need to expand which card  for next click on continue in traveller section */
  checkNextSection() {
    if (this.isShowSeatOption()) {
      this.scrollToElementWithClass('seatCard_Expanded');
      this.expandCard('seatCard_Expanded');
      if (this.responsiveService.screenWidth == 'sm' || this.responsiveService.screenWidth == 'md') {
        this.bookingService.seatToBeExpanded(true);
      }
    } else if (this.isAddonsAvilable()) {
      this.expandCard('add_onsCard_Expanded');
    } else {
      this.proceedToPaymet(false);
    }
  }
  showSeatMap(param: string, q?: boolean) {
    this.expandCard('seatCard_Expanded');
  }
  skipSeatSelection() {
    this.continueToAddons_products();
  }
  /** from seatmap we can expand addons section if we have addons*/
  continueToAddons_products() {
    this.isSeatSelectionDone = true;
    if (this.isAddonsAvilable()) {
      this.collapseCardList['add_onsCard_Expanded'] = false;
      this.expandCard('add_onsCard_Expanded');
      this.showWidget = false;
      this.navService.setShowNav(false);
    } else {
      //If there are no add-ons available, proceed to payment for ABSA
      if(this.country === 'ABSA') {
        this.proceedToPaymet(false);
      }
        
      this.collapseCardList['seatCard_Expanded'] = false;
      this.showWidget = false;
      this.navService.setShowNav(false);
    }
  }
  /**In Mweb flow user want to edit traveller details navigate to back again*/
  backToTravellerPage() {
    this.router.navigate(['/booking/flight-details'], { queryParamsHandling: 'preserve' });
  }
  /**To expand and collapse traveller section */
  expandCard(param: any, q?: boolean) {
    this.checkWithTravelOptions();

    this.scrollToElementWithClass(param);
    if (this.isShowTravellerDetails && (param == 'travellerCard_Expanded' || param == 'baggageCard_Expanded')) {
      this.showWidget = false;
      this.bookingService.seatToBeExpanded(false);
      this.backToTravellerPage();
    } else {
      this.collapseCardList[param] = !this.collapseCardList[param];
      Object.keys(this.collapseCardList).forEach((x: any) => {
        if (x !== param && this.collapseCardList[param]) {
          this.collapseCardList[x] = false;
        }
      });
      if (param == 'travellerCard_Expanded') {
        this.collapseCardList['baggageCard_Expanded'] = !this.collapseCardList['baggageCard_Expanded'];
      }
    }

    if (param === 'seatCard_Expanded') {
      if (q == undefined || this.responsiveService.screenWidth == 'sm' || this.responsiveService.screenWidth == 'md') {
        this.toggleSideNav('addseat');
      } else if (q === false) {
        this.showWidget = true;
      }
    } else {
      this.showWidget = false;
    }
    this.googleTagManagerServiceService.virtualPageview(param);
  }

  scrollToElementWithClass(className: string) {
    const element = this.el.nativeElement.querySelector(`.${className}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  checkContactDetailsValidation(value: any) {
    if (!value?.invalidFields?.emailValid && value?.invalidFields?.mobileNoLengthValid === undefined) {
      this.contact.invalidEmail = true;
      return this.expandCollapse();
    } else if (!value?.invalidFields?.mobileNoLengthValid && value?.invalidFields?.emailValid === undefined) {
      this.contact.mobileNumLengthFailed = true;
      this.contact.invalidEmail = false;
      return this.expandCollapse();
    } else if (!value?.invalidFields?.emailValid && !value?.invalidFields?.mobileNoLengthValid) {
      this.contact.mobileNumLengthFailed = true;
      this.contact.invalidEmail = true;
      return this.expandCollapse();
    }
  }

  expandCollapse() {
    this.collapseCardList['travellerCard_Expanded'] = true;
    this.collapseCardList['add_onsCard_Expanded'] = false;
  }
  /**To display seat option based on price response specialServiceAttributes.offerSeats */
  isShowSeatOption() {
    let isShowSeats = false;
    if (this.pricedResult_data?.itineraries) {
      this.pricedResult_data.itineraries.forEach((x: any) => {
        if (x?.specialServiceAttributes?.offerSeats) {
          isShowSeats = true;
        }
      });
    }
    return isShowSeats;
  }

  /**To check itin has check-in baggage or not */
  isShowCheckInBaggage() {
    return (
      this.pricedResult_data?.itineraries?.length > 0 &&
      this.pricedResult_data?.baggageOptions?.allBaggage?.length !== 0
    );
  }
  isOutBound_Check_InBaggage() {
    return this.pricedResult_data?.baggageOptions?.allBaggage?.some((x: any) => x.direction == 'OUTBOUND');
  }

  /**To check addons are avilable or not */
  isAddonsAvilable() {
    const excludedIds = ['SMS', 'MEALS', 'WHATSAPP'];
    // Add 'CNG_AST' to excludedIds if performMetaCpySourceCheck() returns true
    if (this.performMetaCpySourceCheck()) {
      excludedIds.push('CNG_AST');
    }
    // Check if products array exists and contains at least one product not in excludedIds
    return (
      this.pricedResult_data?.products?.length > 0 &&
      this.pricedResult_data.products.some((product: any) => !excludedIds.includes(product.id))
    );
  }

  addUpdatefareReference(param: any) {
    const data = {
      additionalMarkup: param.additionalMarkup,
      discountPrice: param.dynamicDiscount,
    };
    return data;
  }

  /**Updatebaggage */
  updateBaggage() {
    let baggageInfo = {
      isSelected: this.checkedBaggage?.isBaggageSelected ? this.checkedBaggage?.isBaggageSelected : false,
      isEnable: this.checkedBaggage?.enableCheckedBaggage ? this.checkedBaggage?.enableCheckedBaggage : false,
      baggageItin: this.checkedBaggage?.baggageItinerary ? this.checkedBaggage?.baggageItinerary : [],
      checkInBaggageData:
        this.checkInBaggage?.baggageAssignedPaxList?.length > 0 ? this.checkInBaggage?.baggageAssignedPaxList : null,
    };
    this.storage.removeItem('baggageInfo');
    this.storage.setItem('baggageInfo', JSON.stringify(baggageInfo), 'session');
  }
  /**checking the user internet */
  checkNetworkConnection() {
    this.apiservice.checkInternetConnection().subscribe((isConnected: boolean) => {
      this.isConnected = isConnected;
    });
  }
  checkExpandedCards() {
    if (this.isBrowser && window.location.pathname === '/booking/products') {
      this.isShowTravellerDetails = true;
      this.isEnable_Addons_View = true;
      this.collapseCardList['travellerCard_Expanded'] = false;
      this.collapseCardList['baggageCard_Expanded'] = false;
      this.collapseCardList['add_onsCard_Expanded'] = true;
      this.googleTagManagerServiceService.virtualPageview('add_onsCard_Expanded');
      this.showAddons_param = this.country === 'ABSA'? 'all_Addons': 'traveller_Addons';
    } else if (this.isBrowser && window.location.pathname === '/booking/flight-details') {
      this.isShowTravellerDetails = false;
      this.isEnable_Addons_View = false;
      this.bookingService.seatToBeExpanded(false);
      this.collapseCardList['travellerCard_Expanded'] = true;
      this.collapseCardList['baggageCard_Expanded'] = true;
      this.collapseCardList['add_onsCard_Expanded'] = false;
      this.googleTagManagerServiceService.virtualPageview('travellerCard_Expanded');
    }
    /**To renable when they want all tabs open back from payment page
     * if(sessionStorage.getItem('paymentMethods') && (this.responsiveService.screenWidth != 'sm' && this.responsiveService.screenWidth != 'md')){
      this.showAddons_param = 'all_Addons';
      this.isEnable_Addons_View = true;
      this.collapseCardList['travellerCard_Expanded'] = true;
      this.collapseCardList['add_onsCard_Expanded'] = true;
    }
     */
  }
  sidenavPageloaded() {
    setTimeout(() => {
      this.sidenavLoaded = false;
    }, 3000);
  }

  /* below collects and sends the data required to render the travel options */
  setTravelOptionsCategory() {
    this.storage.removeItem('travelOptionsOpt');
    if (!this.performMetaCpySourceCheck()) {
      return;
    }
    const products = this.storage.getItem('products', 'session') ? JSON.parse(this.storage.getItem('products', 'session')) : [];
    const cngAstProduct = products.find((product: any) => product.id === 'CNG_AST');

    if (cngAstProduct) {
      this.travelOptionsOpt.flexiProduct = cngAstProduct;
      this.travelOptionsOpt.isMetaCpy_Source = this.performMetaCpySourceCheck();
      this.travelOptionsOpt.selectedTravelOptionsCategory = this.travelOptionsOpt.isMetaCpy_Source ? 'basic' : 'flexi';
    }
    this.storage.setItem('travelOptionsOpt', JSON.stringify(this.travelOptionsOpt), 'session');
  }

  public performMetaCpySourceCheck() {
      return this.affiliateService.performMetaCpySourceCheck();
  }

  checkWithTravelOptions(): boolean {
    if (!this.iframeWidgetService.isB2BApp() && this.travelOptions) {
      const { selectedCategory, isFromMetaSource, checkboxValue } = this.travelOptions;
      if (selectedCategory !== 'flexi' && isFromMetaSource && !checkboxValue && this.performMetaCpySourceCheck()) {
        this.scrollToElementWithClass('payment-options');
        this.isShowFlexiOptMessage = true;
        return false;
      }
    }

    this.isShowFlexiOptMessage = false;
    return true;
  }

  /**Closing fare breakup when clickig the outside */
  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    const targetElement = event.target as HTMLElement;
    const modal = this.el.nativeElement.querySelector('#viewpriceBreakdownData');
    if (modal?.classList?.contains('show') && !modal?.contains(targetElement)) {
      modal.classList.remove('show');
    }
  }

  /**To remove payment page session data once user land on booking page  */
  removeSessionData() {
    this.storage.removeItem('paymentDeeplinkData');
    this.storage.removeItem('bookingDetails');
    this.storage.removeItem('selectedPayment');
    this.storage.removeItem('bookingSummaryAmt'); // b2b PBD handler
    this.storage.removeItem('redirectGatewaLoaded');
  }

  getPageTitle(): string {
    return this.isShowTravellerDetails ? 'Add-ons' : 'Review your flights';
  }
  /**here we are construct the data for GTM events in traveller page */
  gtmTravellerPageData(){
        const travellerContactData = {
        contactInfo : this.contact.contactForm.value,
        travellerInfo : this.traveller.travellerForm.controls.travellersList.value,
        addonsInfo : JSON.parse(this.storage.getItem('products', 'session'))
      }
      return travellerContactData;
  }
}
