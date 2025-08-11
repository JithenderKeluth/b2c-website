import { includes, split } from 'lodash';
import { Component, OnInit, Renderer2, Inject, PLATFORM_ID } from '@angular/core';
import { getCitiesNames, getTime, getBaggageInfo, getAirportNames } from './../../flights/utils/odo.utils';
import { Odo } from './../../flights/models/results/odo.model';
import { SearchResults } from './../../flights/models/results/search-results.model';
import { GetLapoverTime, getLayoverLabels } from './../../flights/utils/search-results-itinerary.utils';
import { DomSanitizer } from '@angular/platform-browser';
import { GoogleTagManagerServiceService } from './../../_core/tracking/services/google-tag-manager-service.service';
import { Router } from '@angular/router';
import { ApiService } from './../../general/services/api/api.service';
import { CredentialsService } from '@app/auth/credentials.service';
import { formatDate } from '@angular/common';
import { compareErrorCodes } from '@app/flights/utils/search.utils';
import { SessionStorageService } from 'ngx-webstorage';
import { SessionUtils } from '@app/general/utils/session-utils';
import { IframeWidgetService } from '@app/general/services/iframe-widget.service';
import { updateFareInfoTravellers } from '@app/booking/utils/traveller.utils';
import { getEventsSharedData, getNegtiveAmount, modifyProduct_Desc } from '../utils/payment-utils';
import { BookingCountdownService } from '@app/general/utils/bookingFlowCountdown';
import { getStorageData } from '@app/general/utils/storage.utils';
import { PaymentService } from '../service/payment.service';
import { UniversalStorageService } from '@app/general/services/universal-storage.service';
import { createEvent, EventAttributes } from 'ics';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { isPlatformBrowser } from '@angular/common';

declare const xmlPost: any;

@Component({
  selector: 'app-booking-confirmation',
  templateUrl: './booking-confirmation.component.html',
  styleUrls: ['./booking-confirmation.component.scss', './../../../theme/booking-res-conformation.scss'],
})
export class BookingConfirmationComponent implements OnInit {
  public bookingInformation: any;
  public flightsResultsResponse: SearchResults;
  public voucherCurrencyCode: any;
  qparms: any = '';
  iFrameReqUrl: any;
  travllerCount: number;
  public bookingInfo: any;
  public hostName: any = '';
  public seatError: boolean = false;
  public seat_error_msg: any = null;
  public paymentError: boolean = false;
  public region: string;

  flight_route = new Map<string, string>();
  book_Car_link: string = '';
  collapsedCardList = {
    bookingStatusCard_expanded: false,
    flightDetailsCard_expanded: false,
    paymentDetailsCard_expanded: false,
    travellerDetailsCard_expanded: false,
    invoiceDetailsCard_expanded: false,
  };
  hotelWidgetUrl: any = null;f
  public supplierCashOverride: any;
  nameAndTitle: string;
  shouldIncludeWhatsAppService: boolean = false;
  shouldIncludeSMSService: boolean = false;
  private isBrowser: boolean;

  constructor(
    private _sanitizationService: DomSanitizer,
    private googleTagManagerServiceService: GoogleTagManagerServiceService,
    private router: Router,
    public apiService: ApiService,
    public credentialsService: CredentialsService,
    public iframeWidget: IframeWidgetService,
    private renderer: Renderer2,
    private sessionStorageService: SessionStorageService,
    private bookingCountdownService: BookingCountdownService,
    public iframewidgetService: IframeWidgetService,
    public paymentService: PaymentService,
    private storage: UniversalStorageService,
    public _snackBar: MatSnackBar,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    /* enable if we want to redirect to home page when click browser back button
    router.events.subscribe((event: NavigationStart) => {
      if (event.navigationTrigger === 'popstate') {
        // Perform actions
        if (location.pathname == '/payments') {
          this.router.navigate(['/home']);

        }
      }
    });
    */
   this.isBrowser = isPlatformBrowser(this.platformId);
   if(this.isBrowser){
      window.history.pushState(null, null, window.location.href);
      window.onpopstate = function () {
        if (location.pathname == '/payments/bookingConfirm') {
          window.history.go(1);
        }
      };
    }

    this.region = this.apiService.extractCountryFromDomain();
  }

  ngOnInit(): void { 
     this.googleTagManagerServiceService.pushPageLoadEvent(
      '/bookingConfirm',
      'Search and Book Cheap Flights | Travelstart'
    );

    if (this.region === 'ABSA' || this.region === 'SB') {
      if (this.storage.getItem('credentials', 'local')) {
        const credentials = JSON.parse(this.storage.getItem('credentials', 'local') ?? '');
        this.nameAndTitle = `${credentials.data?.contactInfo?.personName?.nameTitle} ${credentials.data.firstName} ${credentials.data.surname}`;
      }
    }

    this.sessionStorageService.clear(SessionUtils.CORRELATION_ID);
    if(this.apiService.extractCountryFromDomain() !== 'MM'){
      this.bookingCountdownService.stopBookingFlowCountdown();
      this.storage.removeItem('booking_Countdown_EndTime');
    }
    if (this.isBrowser) {
      this.hostName = window.location.hostname;
      if (this.hostName.includes('www.')) {
        this.hostName = this.hostName.replace('www.', '');
      }
    }
    /*
     * checks if NG affiliates link and injects clickscripts
     */
    let urlParams = new URLSearchParams(location.search);
    if (urlParams && this.apiService.extractCountryFromDomain() === 'NG' && urlParams.has('affId')) {
      this.addJsToElement('https://cdn1.travelstart.com/assets/js/clickscript.js').onload = (teste) => {};
    }

    const storedBookingDetails = this.storage.getItem('bookingDetails', 'session');
    this.bookingInformation = storedBookingDetails ? JSON.parse(storedBookingDetails) : null;

    if(this.region === 'ABSA')
      this.checkIfShouldIncludeServicesSection();

    this.supplierCashOverride = this.bookingInformation?.bookingInformation?.selectedPaymentMethod?.supplierCashOverride;
    if (this.bookingInformation?.bookingInformation?.selectedPaymentMethod?.paymentOptionName == 'EFT') {
      this.expandCard('paymentDetailsCard_expanded');
    }
    if (this.iframeWidget.isB2BApp()) {
      this.expandCard('flightDetailsCard_expanded');
    }
    /*
     ** gtm service to push transaction success event
     */
    this.googleTagManagerServiceService.pushTransactionSuccessData(this.bookingInformation);
    if (JSON.parse(this.storage.getItem('bookingInfo', 'session'))) {
      this.bookingInfo = JSON.parse(this.storage.getItem('bookingInfo', 'session'));
    }
    this.flightsResultsResponse = JSON.parse(getStorageData('flightResults'));
    if (this.bookingInformation) {
      if (this.bookingInformation.passengers.adults) {
        this.travllerCount = +this.bookingInformation.passengers.adults.length;
      }
      if (this.bookingInformation.passengers.youngAdults) {
        this.travllerCount = +this.bookingInformation.passengers.youngAdults.length;
      }
      if (this.bookingInformation.passengers.children) {
        this.travllerCount = +this.bookingInformation.passengers.children.length;
      }
      if (this.bookingInformation.passengers.infants) {
        this.travllerCount = +this.bookingInformation.passengers.infants.length;
      }
      this.googleTagManagerServiceService.pushConfirmationData(this.bookingInformation);
      this.hotelWidgetData(this.bookingInformation);
      /** get flight itinarary based on flight number */
      this.bookingInformation.itineraries.forEach((itin: any) => {
        itin.odoList.forEach((a: any) => {
          a.segments.forEach((x: any) => {
            this.flight_route.set(x.flightNumber, x.origCode + ' - ' + x.destCode);
          });
        });
      });
      if (this.bookingInformation.itineraries.length > 1) {
        for (let itin of this.bookingInformation.itineraries) {
          this.updateFareTravellers(itin?.fareBreakdown);
        }
      } else {
        this.updateFareTravellers(this.bookingInformation.itineraries[0]?.fareBreakdown);
      }
    }
    this.voucherCurrencyCode = JSON.parse(this.storage.getItem('voucherAmount', 'session'));
    this.updateWalletBalance();
    /*
     * NG Affiliate Tracking
     */
    if (urlParams && this.apiService.extractCountryFromDomain() === 'NG' && urlParams.has('affId')) {
      setTimeout(() => {
        xmlPost();
      }, 1500);
    }
    this.checkPaymentStatus();
    this.triggerEvents();
    if (
      this.apiService.extractCountryFromDomain() != 'IB' &&
      this.bookingInformation &&
      this.bookingInformation.promotionals &&
      this.bookingInformation.promotionals.staticLinks &&
      this.bookingInformation.promotionals.staticLinks.CARS
    ) {
      this.book_Car_link = this.bookingInformation.promotionals.staticLinks.CARS;
      this.iFrameReqUrl =
        this.bookingInformation.promotionals &&
        this.bookingInformation.promotionals.widgetLinks &&
        this.bookingInformation.promotionals.widgetLinks.CARS
          ? this._sanitizationService.bypassSecurityTrustResourceUrl(
              this.bookingInformation.promotionals.widgetLinks.CARS
            )
          : '';
      return;
    } else if (this.apiService.extractCountryFromDomain() == 'IB') {
      this.book_Car_link = 'https://car.travelbyinvestec.co.za';
    }

    this.storage.removeItem('bookingSummaryAmt');
    this.storage.removeItem('contactInfo');
    this.storage.removeItem('travellerDetails');
  }
  /** to check payment was success or not in iframe returned*/
  checkPaymentStatus() {
    if (
      this.bookingInformation.bookingInformation &&
      (this.bookingInformation.bookingInformation.selectedPaymentOption.paymentOptionGroup == 'MOBICRED' ||
        this.bookingInformation.bookingInformation.selectedPaymentOption.paymentOptionGroup == 'PAYSTACK' ||
        this.bookingInformation.bookingInformation.selectedPaymentOption.paymentOptionGroup == 'IPAY' ||
        this.bookingInformation.bookingInformation.selectedPaymentOption.paymentOptionGroup == 'PAYFLEX' ||
        (this.bookingInformation.bookingInformation.selectedPaymentOption.paymentOptionGroup == 'CC' &&
          this.bookingInformation.bookingInformation.selectedPaymentOption.isRedirectGateway)) &&
      !this.bookingInformation.transactionId
    ) {
      this.paymentError = true;
    }
    if (this.bookingInformation.errors) {
      for (let x in this.bookingInformation.errors) {
        if (
          this.bookingInformation.errors[x].errorWarningAttributeGroup.code == '1052' ||
          this.bookingInformation.errors[x].errorWarningAttributeGroup.code == '1051'
        ) {
          this.seatError = true;
          this.seat_error_msg = compareErrorCodes(this.bookingInformation.errors[x].errorWarningAttributeGroup.code);
        } else {
          this.paymentError = true;
        }
      }
    }
  }

  updateWalletBalance(): void {
    const walletId = this.bookingInfo?.WalletData?.walletId;
    if (!walletId || !this.bookingInformation) {
      return;
    }
    const walletUpdateReq: any = {
      token: this.bookingInfo?.WalletData?.token || '',
      userId: null,
      email: this.bookingInformation.bookingInformation?.confirmationEmailAddress || '',
      walletId: walletId || '',
      currency: this.bookingInformation.bookingInformation?.selectedPaymentMethod?.currencyCode || 'ZAR',
      market: this.apiService.extractCountryFromDomain() || '',
      bookingReference: this.bookingInformation.bookingInformation?.bookingReferenceNo || '',
      notes: 'Some notes for this update',
    };
    this.paymentService.walletBalanceUpdate(walletUpdateReq).subscribe(
      (response: any) => {
        console.log('Wallet balance updated successfully');
      },
      (error: any) => {
        console.error('Error updating wallet balance', error);
      }
    );
  }

  /*
   *Injecting script for ng affiliate tracking
   */
  public addJsToElement(src: string): HTMLScriptElement {
    if(!this.isBrowser) return;
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = src;
    this.renderer.appendChild(document.head, script);
    return script;
  }

  public getCityName(param: string) {
    if (this.flightsResultsResponse && this.flightsResultsResponse.airportInfos) {
      return getCitiesNames(param, this.flightsResultsResponse.airportInfos);
    } else {
      return param;
    }
  }

  public getAirportName(param: string) {
    if (this.flightsResultsResponse && this.flightsResultsResponse.airportInfos) {
      return getAirportNames(param, this.flightsResultsResponse.airportInfos);
    } else {
      return param;
    }
  }

  public getLayoverTime(odo: Odo) {
    //return getDurationDays(odo) + ' days';
    return GetLapoverTime(odo.segments);
  }

  public getBaggage(id: number, param: string) {
    return getBaggageInfo(id, param, this.flightsResultsResponse.baggageAllowanceInfos);
  }

  // formate time from minutes
  public getTimeInHours(ms: number) {
    return getTime(ms);
  }
  public getBaggageTxt(param: any) {
    if (param.includes('hand baggage')) {
      return param.replace('h', 'H');
    }
    if (param.includes('checked baggage')) {
      return param.replace('c', 'C');
    }
    if (param.includes('for')) {
      return param.slice(0, param.indexOf('for')) + ' Checked baggage';
    } else {
      return param + ' Checked baggage';
    }
  }
  getPassengerFares(itineraries: any, passenger: string) {
    let amount = 0;
    for (let i = 0; i < itineraries.length; i++) {
      if (passenger == 'adults') {
        amount += itineraries[i].fareBreakdown.adults.baseFare;
      } else if (passenger == 'youngAdults') {
        amount += itineraries[i].fareBreakdown.youngAdults.baseFare;
      } else if (passenger == 'children') {
        amount += itineraries[i].fareBreakdown.children.baseFare;
      } else if (passenger == 'infants') {
        amount += itineraries[i].fareBreakdown.infants.baseFare;
      }
    }
    return amount;
  }
  goToMyAccount() {
    this.router.navigate(['/my-account/dashboard'], { queryParamsHandling: 'preserve' });
  }
  goToHomePage() {
    this.router.navigate(['/'], { queryParamsHandling: 'preserve' });
  }
  goToContactpage() {
    if (!this.isBrowser) return;
    let url = window.location.origin + '/contact-us';
    window.open(url, '_blank');
  }
  seatsInfo(seatDetails: any) {
    return seatDetails.some((x: any) => x.seatNumber && x.seatNumber != '');
  }
  public getLayoverTxt(odo: Odo) {
    return getLayoverLabels(odo.segments);
  }
  /**To split fare breakdown based on youngadults case */
  updateFareTravellers(farebreakdown: any) {
    updateFareInfoTravellers(farebreakdown);
  }
  /**To expand and collapse cards */
  expandCard(param: any) {
    this.collapsedCardList[param] = !this.collapsedCardList[param];
  }
  public hotelWidgetData(bookingInformation: any) {
    if (bookingInformation) {
      let itinerary = bookingInformation.itineraries;
      let departDate = formatDate(itinerary[0].odoList[0].segments[0].departureDateTime, 'yyyy-MM-dd', 'en_US');
      let arrivalDate = formatDate(
        itinerary[0].odoList[0].segments[itinerary[0].odoList[0].segments.length - 1].arrivalDateTime,
        'yyyy-MM-dd',
        'en_US'
      );
      let departAirport = itinerary[0].odoList[0].segments[0].origCode;
      let arrivalAirport = itinerary[0].odoList[0].segments[itinerary[0].odoList[0].segments.length - 1].destCode;
      let adultQty = itinerary[0]?.fareBreakdown?.adults?.qty ? itinerary[0].fareBreakdown.adults.qty : 0;
      let youngAdtQty = itinerary[0]?.fareBreakdown?.youngAdults?.qty ? itinerary[0].fareBreakdown.youngAdults.qty : 0;
      let childQty = itinerary[0]?.fareBreakdown?.children?.qty ? itinerary[0].fareBreakdown.children.qty : 0;
      let infantQty = itinerary[0]?.fareBreakdown?.infants?.qty ? itinerary[0].fareBreakdown.infants.qty : 0;
      let currencyCode = itinerary[0]?.currencyCode ? itinerary[0]?.currencyCode : 'ZAR';
      this.qparms = `outbounddate=${departDate}&inbounddate=${arrivalDate}&nrofadults=${adultQty}&nrofyoungadults=${youngAdtQty}&nrofchildren=${childQty}&nrofinfants=${infantQty}&airportdeparture=${departAirport}&airportarrival=${arrivalAirport}`;
      let reqUrl = `https://hotel.travelstart.com/listing/widget?${this.qparms}&isformail=false&sourceId=9250&utm_Source=Travelstart&utm_Medium=Partner&utm_Campaign=EmailWidget&bookingref=${this.bookingInformation.bookingInformation.bookingReferenceNo}&currency=${currencyCode}`;
      this.hotelWidgetUrl = this._sanitizationService.bypassSecurityTrustResourceUrl(reqUrl);
    }
  }
  /**To modify description of products */
  modifyDescription(productDesc: any) {
    return modifyProduct_Desc(productDesc);
  }
  getMinusAmt(amount: any) {
    return getNegtiveAmount(amount);
  }
  /**this is method is used for B2B if user select reserve option then if click on Bookings on hold link we are redirectd to reserve list in parent URL   */
  navigateToReservedList() {
    if (!this.isBrowser) return;
    if (window?.top?.parent) {
      window.top.parent.postMessage({ type: 'navigateToReservedList' }, '*');
    }
  }
  /**here to check is B2B flightsite organization or not  */
  isFlightSiteOrg() {
    return Boolean(this.iframewidgetService.b2bOrganization() == 'TS_FS');
  }
  /**here to check is B2B Clubhub organization or not  */
  isClubHubOrg() {
    return Boolean(this.iframewidgetService.b2bOrganization() == 'TS_CT');
  }
  /**This is to showing the Watermark */
  showNGNotValidVisa() {
    return (
      this.iframewidgetService.isFrameWidget() &&
      this.flightsResultsResponse?.isIntl &&
      this.apiService.extractCountryFromDomain() === 'NG'
    );
  }
  /**This method is to showing cars Iframe*/
  showCarsIframe() {
    return (
      this.apiService.extractCountryFromDomain() !== 'SB' &&
      this.apiService.extractCountryFromDomain() !== 'IB' &&
      this.apiService.extractCountryFromDomain() !== 'FS' &&
      this.apiService.extractCountryFromDomain() !== 'ZA' &&
      this.apiService.extractCountryFromDomain() !== 'GI' &&
      this.apiService.extractCountryFromDomain() !== 'NG' &&
      this.apiService.extractCountryFromDomain() !== 'MM' &&
      this.apiService.extractCountryFromDomain() !== 'ABSA' &&
      !this.iframeWidget.isB2BApp() &&
      this.bookingInformation?.promotionals?.widgetLinks?.CARS
    );
  }
  /**showing the cars widget*/
  showCarsWidget() {
    return (
      this.bookingInformation?.itineraries &&
      this.apiService.extractCountryFromDomain() == 'ZA' &&
      !this.iframeWidget.isB2BApp()
    );
  }
  /**showing the hotels */
  showHotels() {
    return (
      this.apiService.extractCountryFromDomain() !== 'SB' &&
      this.apiService.extractCountryFromDomain() != 'ZA' &&
      this.apiService.extractCountryFromDomain() !== 'IB' &&
      this.apiService.extractCountryFromDomain() !== 'FS' &&
      this.apiService.extractCountryFromDomain() !== 'GI' &&
      this.apiService.extractCountryFromDomain() !== 'MM' &&
      this.apiService.extractCountryFromDomain() !== 'ABSA' &&
      !this.iframeWidget.isB2BApp() &&
      this.bookingInformation?.promotionals?.staticLinks?.HOTELS
    );
  }
  /**showing the APP banner */
  showAppBanner() {
    return (
      !this.iframeWidget.isB2BApp() &&
      this.iframewidgetService.isFrameWidget() &&
      this.apiService.extractCountryFromDomain() !== 'SB' &&
      this.apiService.extractCountryFromDomain() !== 'FS' &&
      this.apiService.extractCountryFromDomain() !== 'GI' &&
      this.apiService.extractCountryFromDomain() !== 'MM' &&
      this.apiService.extractCountryFromDomain() !== 'ABSA'
    );
  }
  /**here we are checking amount is postive or negetive if its negetive(voucher case) then return 0 value  */
  bookingTotalAmount(totalAmt :any){
    return totalAmt > 0 ? totalAmt : 0;
  }

  bookAnotherFlight() {
    this.router.navigate(['/'], { queryParamsHandling: 'preserve' });
  }

  checkIfShouldIncludeServicesSection() {
    this.bookingInformation.products.forEach((product: any) => {
      if(product.name.toLowerCase().includes('alerts to sms')) {
        this.shouldIncludeSMSService = true;
      } else if (product.name.toLowerCase().includes('whatsapp')) {
        this.shouldIncludeWhatsAppService = true;
      }
    });
  }

  addFlightToCalendar() {
    const destCode = this.bookingInformation.itineraries[0].odoList[0].segments[0].destCode;
    const departureDateTime = new Date(this.bookingInformation.itineraries[0].odoList[0].segments[0].departureDateTime);

    const duration = this.getTimeInHours(this.bookingInformation.itineraries[0].odoList[0].segments[0].duration).replace('hrs', '').replace('min', '');
    const durationHour = +duration.split(' ')[0];
    const durationMin = +duration.split(' ')[1];

    const bookingEvent: EventAttributes = {
      title: `Flight to ${this.getCityName(destCode)}`,
      description: 'Your flight booking',
      location: this.getAirportName(destCode),
      start: [
        departureDateTime.getFullYear(),
        departureDateTime.getMonth() + 1, //getMonth() returns an index that starts at 0 for January, hence need for +1
        departureDateTime.getDate(),
        departureDateTime.getHours(),
        departureDateTime.getMinutes()
      ], // Year, Month, Day, Hour, Minute
      duration: {
        hours: durationHour,
        minutes: durationMin
      }
    }

    createEvent(bookingEvent, (error, value) => {
      if(!this.isBrowser) return;
      if (error) {
        this._snackBar.open('Something went wrong with creating a calendar event.', '');
        return;
      }
      const blob = new Blob([value], { type: 'text/calendar;charset=utf-8' });

      const a = document.createElement('a');
      const objectUrl = URL.createObjectURL(blob);
      a.href = objectUrl;
      a.download = 'booking.ics';
      a.click();
      URL.revokeObjectURL(objectUrl);
      a.remove();
    });
  }
  triggerPaymentEvent(eventName:any){
     const eventsSharedData = this.getEventsData();
    this.googleTagManagerServiceService.pushFlight_PaymentFail_OR_SuccessEvent(eventName,eventsSharedData,this.bookingInformation);
  }
  getVoucherInfo(){
    return this.bookingInformation.products.find((x:any)=> x.name.includes('Voucher'));
  }
  getEventsData(){
    const eventsCommonData = getEventsSharedData();
      let addMoreData = {
      coupon: this.getVoucherInfo()?.name?.split('-')[1] ?? '',
      paymentGatewayData : this.bookingInformation?.bookingInformation?.selectedPaymentOption?.paymentOptionName ?? '',
      vatInfo : false,
      voucherAmount : this.getVoucherInfo()?.amount ?? 0
    };
     eventsCommonData.additionalDataInfo = {...addMoreData,...eventsCommonData.additionalDataInfo};
     return eventsCommonData;

  }
  triggerEvents(){
     const eventsSharedData = this.getEventsData();
    if(this.paymentError){
      this.triggerPaymentEvent('Flight_PaymentFail');
      this.googleTagManagerServiceService.pushFlight_BookingFailEvent(eventsSharedData,this.bookingInformation);
    }else{
      this.triggerPaymentEvent('Flight_PaymentSuccess');
       this.googleTagManagerServiceService.pushFlight_BookingSuccess(eventsSharedData,this.bookingInformation)
    }
  }
}
