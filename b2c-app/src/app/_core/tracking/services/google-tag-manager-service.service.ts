import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  parseAffiliateId,
  parseCorrelationId,
  parseLocaleData,
  parseUserType,
  parseLoginData,
  parseSignupData,
  parseSearchData,
  parseNewsletterSubscribeData,
  parseTimingInfo,
  parseSelectedSeatData,
  clearProductsData,
  parseCartProductsData,
  parseBookingReference,
  parseVoucherData,
  parseCartPaymentData,
  parseTransactionData,
  parseConfirmationData,
  parseFlightTravellerData,
  parseFlight_SelectedData,
  parseFlightSummaryData,
  parseFlightSoldOutData,
  parseFlightBookingFailData,
  parsePaymentValidation_RequestData,
  parseFlightPaymentFail_OR_SuccessData,
  parseBookingSuccessData,
  parseMyAccountData,
} from './../utils/data-layer-parser.utils';
import * as gtm from './../utils/data-layer-parser.gtm.utils';
import { SessionUtils } from './../../../general/utils/session-utils';
import { StorageService } from '@app/general/services/storage.service';
import { WindowReferenceService } from '@core/services/window-reference.service';
import { IterableService } from './iterable.service';
import { ApiService } from '../../../general/services/api/api.service';
import { getUserCredentials } from '../../../general/utils/common-utils';
import { GTM_DATA_LAYER_KEYS } from '../models/gtm-data-layer-keys.constant';
import { ITERABLE_DATA_LAYER_KEYS } from '../models/iterable-data-layer-keys.constant';

@Injectable({
  providedIn: 'root',
})
export class GoogleTagManagerServiceService {
  private isBrowser: boolean;
  private window: any;

  constructor(
    private sessionUtils: SessionUtils,
    private storageService: StorageService,
    private _windowRef: WindowReferenceService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private iterableService: IterableService,
    private apiService: ApiService
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.window = this.isBrowser ? this._windowRef.nativeWindow : undefined;
  }

  private pingGTM(obj: any): void {
    if (this.isBrowser && obj && this.window?.dataLayer) {
      this.window.dataLayer.push(obj);
    }
  }

  private pingIterable(obj: any): void {
    this.iterableService.trackEvent(obj?.event, obj);
  }

  public resetDataLayer(): void {
    if (!this.isBrowser) return;
    this.window.dataLayer = [];
    this.window.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
  }

  public clearDataLayerExcept(eventsToKeep: string[]): void {
    if (this.isBrowser && this.window?.dataLayer) {
      const preservedEvents = this.window.dataLayer.filter((e: any) => eventsToKeep.includes(e.event));
      this.window.dataLayer.length = 0; // Clear the dataLayer
      preservedEvents.forEach((event: any) => this.window.dataLayer.push(event)); // Add back the preserved events
     
    }
  }

  public pushUserType(userType: string): void {
    this.pingGTM(gtm.parseUserType(userType));
    this.pingIterable(parseUserType(userType));
  }
  public setUserEmail(email?: any){ 
     this.iterableService.setUserEmail(email);
  }
  public pushLoginData(userProfileDetails: any): void {
    this.pingGTM(gtm.parseLoginData(userProfileDetails));
    this.pingIterable({...parseLoginData(userProfileDetails), ...this.iterableCommonData()});
  }

  public pushLogoutEvent(): void {
    this.iterableService.logout();
    this.pingGTM({ event: 'logout' });
    this.pingIterable(this.iterableCommonData('Logged_Out'));
  }

  // "signup"
  public pushSignupData(userProfileDetails: any): void { 
    this.pingGTM(gtm.parseSignupData(userProfileDetails));
    this.pingIterable({ ...parseSignupData(userProfileDetails), ...this.iterableCommonData() });
  }
  public pushProfileEvent(){
     this.pingIterable(this.iterableCommonData('Profile',true));
  }
  public pushMyTripsEvent(){
     this.pingIterable(this.iterableCommonData('My Trips',true));
  }
  public pushManageBookingEvent(){
    this.pingIterable(this.iterableCommonData('Manage_Booking',true));
  }
  public pushSupportEvent(){
    this.pingIterable(this.iterableCommonData('Support',true));
  }
  // "newsletter subscribe"
  public pushNewsletterSubscribeData(credentials: any): void {
    this.pingGTM(gtm.parseNewsletterSubscribeData(credentials)); 
  }

  public pushNewsletterSubscribeEvent(): void {
    this.pingGTM({ event: 'newsletterSubscribe' }); 
  }

  public pushNewsletterSubscribeFailedEvent(): void {
    this.pingGTM({ event: 'newsletterSubscribeFailed' }); 
  }

  public pushAffiliateId(affiliateId: string): void {
    this.pingGTM(gtm.parseAffiliateId(affiliateId)); 
  }

  public pushCorrelationId(correlationId: string): void {
    this.pingGTM(gtm.parseCorrelationId(correlationId));
    this.pingIterable(parseCorrelationId(correlationId));
  }

  public pushLocaleData(languageCode: string, countryCode: string, locale: any): void {
    this.pingGTM(gtm.parseLocaleData(languageCode, countryCode, locale));
    this.pingIterable(parseLocaleData(languageCode, countryCode, locale));
  }

  public pushFlappLinkEvent(phone: string): void {
    this.pingGTM({ event: 'flappLink', phone: phone }); 
  }

  public pushVisitedLink(param: string) {
    this.pingGTM(this.commonData(param,true)); 
  }

  public pushDeviceId(param: string): void {
    this.pingGTM({ App_Type: param });
    this.pingIterable({ App_Type: param });
  }
  /**here we are trigger this event when user click on header tiles like(flights,cars,hotels..etc) */
  public pushHeaderTilesEvent(){
     this.pingIterable(this.iterableCommonData('Logged_Out'));
  }
  // trigger after click on searchFlights CTA

  // "searchSuccess"
  public pushSearchData(searchData: any): void {
   this.pingGTM(gtm.parseSearchData(searchData, 'ZA')); 
  }
  public pushIterableSearchData(searchData: any,correlationId:string): void {
    this.pingIterable({...parseSearchData(searchData,correlationId,'ZA'),...this.iterableCommonData()});
  }

  public searchResponseTime(restime: any): void {
    this.pingGTM({ search_response_time: restime });
    this.pingIterable({ search_response_time: restime });
  }

  public pushTimingInfo(timingEventName: string, startDate: Date): void {
    this.pingGTM(gtm.parseTimingInfo(timingEventName, startDate));
    this.pingIterable(parseTimingInfo(timingEventName, startDate));
  }

  public pushsearchAPIError(errorName: string, errorData: any): void {
    const correlation_id = this.sessionUtils.getCorrelationId();
    this.pingGTM({
      event: 'searchAPIError',
      searchApi_error: errorData,
      search_Correlation_id: correlation_id,
      localStorage: this.storageService.calculateMemoryUsage(localStorage),
      sessionStorage: this.storageService.calculateMemoryUsage(sessionStorage),
    });
  }

  public pushNffData(nff: any, errors: any, searchData: any,correlationId:string): void {
    let eventData = {...parseSearchData(searchData,correlationId,'ZA'),...this.commonData()}
    eventData.event = 'NFF';
    
    this.pingIterable(eventData);
    
    if (nff) {
      const correlation_id = this.sessionUtils.getCorrelationId();
      this.pingGTM({
        event: 'NFF',
        searchApi_error: errors,
        search_Correlation_id: correlation_id,
        localStorage: this.storageService.calculateMemoryUsage(localStorage),
        sessionStorage: this.storageService.calculateMemoryUsage(sessionStorage),
      });
    }
  }
  //Trigger this events once results are loaded
  // pushFlightViewEvent(){
  //   this.pingGTM({...parseViewFlightData(flightResults, flightSearchInfo,priceResponse),...additionalData,...this.commonData()});
  // }
  // selectedFlight
  public pushSelectedFlightData(flightResults: any, flightSearchInfo: any,priceResponse:any, airlineNames: any, itineraries: any, tripType: string): void {
    let additionalData = {
       [ITERABLE_DATA_LAYER_KEYS.DAY_SEARCH]: 1,
       [ITERABLE_DATA_LAYER_KEYS.VIEW_DETAILS]: 1,
    }
    this.pingGTM(gtm.parseViewFlightData(airlineNames, itineraries, tripType, ''));
    this.pingIterable({...parseFlight_SelectedData(flightResults, flightSearchInfo,priceResponse),...additionalData,...this.iterableCommonData()});
  }
//push flightTravellerEvent once user fill the coontact and traveller details and click on continue CTA
  public pushFlightTravellerEvent(priceResponse :any,additionalDataInfo:any,flightResults:any, flightSearchInfo:any){
    //this.pingGTM({...gtm.parseFlightTravellerData(priceResponse,additionalDataInfo,flightResults, flightSearchInfo),...this.commonData()});
    this.pingIterable({...parseFlightTravellerData(priceResponse,additionalDataInfo,flightResults, flightSearchInfo),...this.iterableCommonData()});
  }
  //push flightTravellerEvent once user fill the coontact and traveller details and click on continue CTA
  public pushFlight_SummaryEvent(priceResponse :any,additionalDataInfo:any,flightResults:any, flightSearchInfo:any){
    //this.pingGTM({...gtm.parseFlightSummaryData(priceResponse,additionalDataInfo,flightResults, flightSearchInfo),...this.commonData()});
    this.pingIterable({...parseFlightSummaryData(priceResponse,additionalDataInfo,flightResults, flightSearchInfo),...this.iterableCommonData()});
  }
  //push payment gate way event 
  public pushFlightPaymentgatewayEvent(paymentData:any){
      this.pushCartPaymentData(paymentData);
  }
  //trigger when flight sold out or supplier failed case
  public pushFlightSoldOutEvent(eventData:any){
     
    this.pingIterable({...parseFlightSoldOutData(eventData),...this.iterableCommonData(null,true)});
  }
  //push event when booking failed from airline
  public pushFlight_BookingFailEvent(eventDataInfo?:any,confirmationData?:any){
    this.pingGTM({ event: 'Flight_BookingFail' });
    this.pingIterable({...parseFlightBookingFailData(eventDataInfo,confirmationData),...this.iterableCommonData()});
  }
    //trigger when payment failed or success case because data is same for both events
  public pushFlight_PaymentFail_OR_SuccessEvent(eventName:any,eventDataInfo:any,confirmationData?:any){
     this.pingIterable({...parseFlightPaymentFail_OR_SuccessData(eventName,eventDataInfo,confirmationData),...this.iterableCommonData()});
  }
    //trigger when payment validation failed case
  public pushValidation_RequestEvent(eventDataInfo:any){
    this.pingIterable({...parsePaymentValidation_RequestData(eventDataInfo),...this.iterableCommonData()});
  }
  public pushFlight_BookingSuccess(eventDataInfo,confirmationData?:any){
    this.pingIterable({...parseBookingSuccessData(eventDataInfo,confirmationData),...this.iterableCommonData(null,true)});
  }
  public pushSearchBookingEvent(eventData:any){
    //this.pingGTM({...parseMyAccountData(eventData),...this.commonData('Search_Booking',true)});
  }
    public pushCancelEvents(eventName :any,eventData:any){
    //this.pingGTM({...parseMyAccountData(eventData),...this.commonData(eventName,true)});
  }
    public pushChange_DateEvents(eventName:any,eventData:any){
    //this.pingGTM({...parseMyAccountData(eventData),...this.commonData(eventName,true)});
  }
    public pushEdit_PassengerEvents(eventName:any,eventData:any){
    //this.pingGTM({...parseMyAccountData(eventData),...this.commonData(eventName,true)});
  }
  public pushDelete_UserEvent(reason:any){
     this.pingGTM({
      Domain : this.apiService.extractCountryFromDomain(),
      Reason : reason
     });
  }
  // "addToCart"
  public pushAddToCartData(mainCart: any, itineraries: any[]): void {
    this.pingGTM(gtm.parseAddToCartData(mainCart, itineraries));
  }

  public pushGFPriceAccuracyTag(evt_name: any, value: any, currency: any): void {
    this.pingGTM({
      event: 'view_item',
      value: value,
      currency: currency,
    });
  }

  public pushGFPriceAccuracyTagError(evt_name: any, param1: any, param2: any): void {
    this.pingGTM({
      event: 'view_item',
      flight_error_code: param1,
      flight_error_message: param2,
    });
  }

  public pushFareIncreseTag(price: any): void {
    this.pingGTM({
      event: 'price_increase',
      price_increased: price,
    });
  }

  public pushCartTravellerData(cartTraveller: any): void {
    this.pingGTM(gtm.parseCartTravellerData(cartTraveller));
  }

  public pushSelectedSeatEvent(selectedSeat: string): void {
    this.pingGTM({ selectedSeat: gtm.parseSelectedSeatData(selectedSeat) });
    this.pingIterable({ selectedSeat: parseSelectedSeatData(selectedSeat) });
  }

  public isBaggagechecked(param: any): void {
    this.pingGTM({ Baggagechecked: param });
    this.pingIterable({ Baggagechecked: param });
  }

  public pushCartProductsData(products: any[], totalAmount: number, cartTraveller: any): void {
    this.pingGTM(gtm.clearProductsData());
    this.pingIterable(clearProductsData());
    // Clear the products data before pushing new data
    this.pingGTM(gtm.parseCartProductsData(products, totalAmount, cartTraveller));
    this.pingIterable(parseCartProductsData(products, totalAmount, cartTraveller));
  }

  public pushBookingReference(bookingReference: string): void {
    this.pingGTM(gtm.parseBookingReference(bookingReference));
    this.pingIterable(parseBookingReference(bookingReference));
  }

  public pushVoucherData(totalAmount: number, voucherCode: string, voucherAmount: number): void {
    this.pingGTM(gtm.parseVoucherData(totalAmount, voucherCode, voucherAmount));
    this.pingIterable(parseVoucherData(totalAmount, voucherCode, voucherAmount));
  }

  public pushCartPaymentData(paymentData: any): void {
    this.pingGTM(gtm.parseCartPaymentData(paymentData));
    this.pingIterable(parseCartPaymentData(paymentData));
  }

  public pushCartPaymentFailedEvent(): void {
    this.pingGTM({ event: 'cartPaymentFailed' });
    this.pingIterable({ event: 'cartPaymentFailed' });
  }

  public pushTransactionSuccessData(transactionData: any): void {
    this.pingGTM(gtm.parseTransactionData(transactionData));
    this.pingIterable(parseTransactionData(transactionData));
  }

  public pushConfirmationData(confirmationData: any): void {
    this.pingGTM(gtm.parseConfirmationData(confirmationData));
    this.pingIterable(parseConfirmationData(confirmationData));
  }

  public pushPageLoadEvent(virtualPageUrl: string, pageTitle: string): void {
    if (virtualPageUrl === '/traveller') {
      return;
    }
    this.pingGTM({ event: 'pageLoad', pageTitle, virtualPageUrl });
  }

  public pushTravelstartPlusUser(
    email: any,
    firstName: string,
    lastName: string,
    paymentGateway: string,
    payment_ref: string
  ): void {
    this.pingGTM({
      event: 'TravelstartPlusUser',
      email,
      firstName,
      lastName,
      paymentGateway,
      payment_ref,
    });
    this.pingIterable({
      event: 'TSplus',
      email,
      firstName,
      lastName,
      paymentGateway,
      payment_ref,
      platform: 'web',
    });
  }


  public upGradetoTSplus(email: string): void {
    this.pingGTM({
      event: 'Upgrade',
      email,
      usertype: 'login',
    });
    this.pingIterable({
      event: 'Upgrade',
      email,
      usertype: 'login',
    });
  }

  public Upgrade_fail(eventName: string, email: string, payment_ref: string): void {
    this.pingGTM({
      event: eventName,
      email,
      payment_gateway: 'credit',
      payment_ref,
    });
    this.pingIterable({
      event: eventName,
      email,
      payment_gateway: 'credit',
      payment_ref,
    });
  }

  public virtualPageview(param: string): void {
    if (!this.isBrowser) return;
    this.pingGTM({
      event: 'virtualPageview',
      pageUrl: window.location.origin + this.getPageUrl(param),
      pageTitle: this.getPageTitle(param),
    });
    this.pingIterable({
      event: 'virtualPageview',
      pageUrl: window.location.origin + this.getPageUrl(param),
      pageTitle: this.getPageTitle(param),
    });
  }

  private getPageUrl(param: string): string {
    switch (param) {
      case 'add_onsCard_Expanded':
        return '/booking/add-ons';
      case 'seatCard_Expanded':
        return '/booking/seats';
      case 'travellerCard_Expanded':
        return '/booking/traveller-details';
      default:
        console.error('Invalid param:', param);
        return '';
    }
  }

  private getPageTitle(param: string): string {
    switch (param) {
      case 'add_onsCard_Expanded':
        return 'Add-Ons';
      case 'seatCard_Expanded':
        return 'Seats';
      case 'travellerCard_Expanded':
        return 'Traveller Details';
      default:
        console.error('Invalid param:', param);
        return '';
    }
  }

  // Events for payment-methods request, payment-methods response, validation-request, validation-response, book request, book response
  public pushPaymentMethodsRequestEvent(): void {
    this.pingGTM({ event: 'paymentMethodsRequest' });
    this.pingIterable({ event: 'paymentMethodsRequest' });
  }

  public pushPaymentMethodsResponseEvent(): void {
    this.pingGTM({ event: 'paymentMethodsResponse' });
    this.pingIterable({ event: 'paymentMethodsResponse' });
  }

  public pushPaymentMethodsValidationRequestEvent(): void {
    this.pingGTM({ event: 'paymentMethodsValidationRequest' });
    this.pingIterable({ event: 'paymentMethodsValidationRequest' });
  }

  public pushPaymentMethodsValidationResponseEvent(): void {
    this.pingGTM({ event: 'paymentMethodsValidationResponse' });
    this.pingIterable({ event: 'paymentMethodsValidationResponse' });
  }

  public pushBookRequestEvent(): void {
    this.pingGTM({ event: 'BookRequest' });
    this.pingIterable({ event: 'BookRequest' });
  }

  public pushBookResponseEvent(): void {
    this.pingGTM({ event: 'BookResponse' });
    this.pingIterable({ event: 'BookResponse' });
  }

  public pushBookValidationRequestEvent(): void {
    this.pingGTM({ event: 'BookValidationRequest' });
    this.pingIterable({ event: 'BookValidationRequest' });
  }

  public pushBookValidationResponseEvent(): void {
    this.pingGTM({ event: 'BookValidationResponse' });
    this.pingIterable({ event: 'BookValidationResponse' });
  }

  // Events for Flight_PaymentFail & Flight_BookingFail
  public pushFlight_PaymentFailEvent(): void {
    this.pingGTM({ event: 'Flight_PaymentFail' });
  }

  public pushGTMFlight_BookingFailEvent(): void {
    this.pingGTM({ event: 'Flight_BookingFail' });
  }

  public pushErrorMapping(category: string, error_code: string, action: string, message: string): void {
    this.pingGTM({
      event: category,
      code: error_code,
      action,
      message,
    });
    this.pingIterable({
      event: category,
      code: error_code,
      action,
      message,
    });
  }

  public pushGlobalErrorHandler(errorObjHandler: any): void {
    this.pingGTM({
      event: errorObjHandler.errorType,
      error_Obj: errorObjHandler,
    });
    this.pingIterable({
      event: errorObjHandler.errorType,
      error_Obj: errorObjHandler,
    });
  }

  public pushMeiliEmbedBookingData(event_type: any, data: any): void {
    this.pingGTM({
      event: event_type,
      Mmeili_Booking_Data: data,
    });
    this.pingIterable({
      event: event_type,
      Mmeili_Booking_Data: data,
    });
  }

  public pushHomeEvent() {
    let eventData = {
      event: 'Home',
      [GTM_DATA_LAYER_KEYS.USER_TYPE]: getUserCredentials() ? 'LoggedIn' : 'Guest',
    };
    eventData = { ...eventData, ...this.commonData() };
    this.pingGTM(eventData);

     let iterable_eventData = {
      event: 'Home',
      [GTM_DATA_LAYER_KEYS.USER_TYPE]: getUserCredentials() ? 'LoggedIn' : 'Guest',
    };
    iterable_eventData = { ...iterable_eventData, ...this.iterableCommonData() };
    this.pingIterable(iterable_eventData);
  }
  /**here we are constructing the comman data object based on domain and use in required events */
  public commonData(eventName?:any,addUserType?:boolean) {
    const commonKeys = {
      [GTM_DATA_LAYER_KEYS.DOMAIN]: this.apiService.extractCountryFromDomain(), 
      [GTM_DATA_LAYER_KEYS.LANGUAGE]: 'EN',
      [GTM_DATA_LAYER_KEYS.COUNTRY]: this.apiService.extractCountryFromDomain(),
    }
    if(eventName){
        commonKeys['event'] = eventName;
    }
     if(addUserType){
        commonKeys[GTM_DATA_LAYER_KEYS.USER_TYPE] = getUserCredentials() ? 'LoggedIn' : 'Guest';
    }
    return commonKeys;
  }

  public iterableCommonData(eventName?:any,addUserType?:boolean) {
    const commonKeys = {
      [ITERABLE_DATA_LAYER_KEYS.DOMAIN]: this.apiService.extractCountryFromDomain(),
      [ITERABLE_DATA_LAYER_KEYS.CURRENCY]: this.apiService.getDomainInfo()?.currency ?? 'ZAR',
      [ITERABLE_DATA_LAYER_KEYS.LANGUAGE]: 'EN',
      [ITERABLE_DATA_LAYER_KEYS.COUNTRY]: this.apiService.extractCountryFromDomain(),
    }
    if(eventName){
        commonKeys['event'] = eventName;
    }
     if(addUserType){
        commonKeys[ITERABLE_DATA_LAYER_KEYS.USER_TYPE] = getUserCredentials() ? 'LoggedIn' : 'Guest';
    }
    return commonKeys;
  }
}
