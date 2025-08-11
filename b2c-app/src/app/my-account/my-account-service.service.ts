import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Credentials } from './../auth/credentials.service';
import {
  GUEST_VIEW_BOOKINGS_PATH,
  PROXY_SERVER_PATH,
  PROXY_USER_DATA,
  PROXY_MY_BOOKINGS,
  PROXY_My_ACCOUNT_TRAVELLERS,
  PROXY_My_ACCOUNT_PAYMENT_CARD,
  PROXY_ACCOUNT_CHANGE_PASSWORD_PATH,
  PROXY_HOTELS_MYBOOKINGS_PATH,
  PROXY_FRESHDESK_EMAIL_CONFIG,
  PROXY_FRESHDESK_CREATE_TICKET,
  PROXY_FRESHDESK_TICKETS_BY_EMAIL,
  PROXY_FRESHDESK_TICKET_DETAILS,
  PROXY_FRESHDESK_CHAT_ON_TICKET,
  PROXY_RESEND_ETICKET,
  PROXY_ACCOUNT_DELETE,
  PROXY_CANCEL_HOTEL_BOOKING,
  PROXY_USER_OTP_DATA
} from '@app/general/services/api/api-paths';
import { ApiService } from '@app/general/services/api/api.service';
import { SearchService } from '@app/flights/service/search.service';
import { I18nService } from '@app/i18n';
import { formatDate } from '@angular/common';
import { SessionUtils } from '@app/general/utils/session-utils';
import { UniversalStorageService } from '@app/general/services/universal-storage.service';

export interface myBookings {
  // Customize received credentials here
  myBookingsReq: Credentials;
}

@Injectable({
  providedIn: 'root',
})
export class MyAccountServiceService {
  country: any;
  countryval: any;
  constructor(
    private httpClient: HttpClient,
    private apiservice: ApiService,
    private searchService: SearchService,
    private i18Service: I18nService,
    private sessionUtils: SessionUtils,
    private storage: UniversalStorageService
  ) {
    this.searchService.langValue.subscribe((val: any) => {
      this.countrydata = val;
    });
    this.countrydata = 'en-' + this.apiservice.extractCountryFromDomain();
    this.countryval = this.apiservice.extractCountryFromDomain();
  }

  getMyBookings(data: any) {
    const url = `${PROXY_SERVER_PATH}${PROXY_MY_BOOKINGS}`;
    return this.httpClient.post(url, data);
  }

  addTravellers(data: any) {
    const url = `${PROXY_SERVER_PATH}${PROXY_My_ACCOUNT_TRAVELLERS}`;
    return this.httpClient.post(url, data);
  }

  addpaymentCard(data: any) {
    const url = `${PROXY_SERVER_PATH}${PROXY_My_ACCOUNT_PAYMENT_CARD}`;
    return this.httpClient.post(url, data);
  }

  deletepaymentCard(cardNo: string, data: any) {
    const url =  `${PROXY_SERVER_PATH}${PROXY_My_ACCOUNT_PAYMENT_CARD}` + '/' + cardNo;
    return this.httpClient.post(url, data);
  }

  deleteTraveller(travellerId: string, data: any) {
    const url = `${PROXY_SERVER_PATH}${PROXY_My_ACCOUNT_TRAVELLERS}` + '/' + travellerId;
    return this.httpClient.post(url, data);
  }

  updateTraveller(travellerId: string, data: any) {
    const url = `${PROXY_SERVER_PATH}${PROXY_My_ACCOUNT_TRAVELLERS}` + '/' + travellerId;
    return this.httpClient.put(url, data);
  }

  updateProfile(data: any) {
    const url = `${PROXY_SERVER_PATH}${PROXY_USER_DATA}`;
    return this.httpClient.put(url, data);
  }

  updatePassword(data: any) {
    const url = `${PROXY_SERVER_PATH}${PROXY_ACCOUNT_CHANGE_PASSWORD_PATH}`;
    return this.httpClient.post(url, data);
  }

  getItineraryData(itineraryId: any, data: any) {
    const url = `${PROXY_SERVER_PATH}${PROXY_MY_BOOKINGS}` + '/' + itineraryId;
    return this.httpClient.post(url, data);
  }

  getUserData(token: string, isProxy: boolean = false) {
    const url = `${PROXY_SERVER_PATH}${PROXY_USER_DATA}`;

    const data: any = {
      userAgent: this.countrydata,
      ...(isProxy ? {} : { token }),
    };

    return this.httpClient.post(url, data);
  }

  getUserDataOTPFlow(token: string, isProxy: boolean = false) {
    const url = `${PROXY_SERVER_PATH}${PROXY_USER_OTP_DATA}`;

    let data;
    let userAgent = this.countrydata;

    data = {
      userAgent: userAgent,
      token: token
    };

    return this.httpClient.post(url, data);
  }

  getMyviewBookings(data: any) {
    return this.httpClient.post(`${this.apiservice.fetchApiHostUrl()}${GUEST_VIEW_BOOKINGS_PATH}`, data);
  }

  // freshDeskApi paths

  freshdeskEmailConfig() {
    return this.httpClient.get(`${PROXY_SERVER_PATH}${PROXY_FRESHDESK_EMAIL_CONFIG}`);
  }
  freshdeskCreateticket(data: any) {
    return this.httpClient.post(`${PROXY_SERVER_PATH}${PROXY_FRESHDESK_CREATE_TICKET}`, data);
  }
  getAllTicketsByEmail(email: any) {
    return this.httpClient.get(`${PROXY_SERVER_PATH}${PROXY_FRESHDESK_TICKETS_BY_EMAIL}/${email}`);
  }
  getTicketInfoById(ticketId: any) {
    return this.httpClient.get(
      `${PROXY_SERVER_PATH}${PROXY_FRESHDESK_TICKET_DETAILS}/${ticketId}` +
        '?include=requester,conversations' );
  }

  createFreshDeskChat(ticketId: any, chatMsg: any) {
    return this.httpClient.post(
      `${PROXY_SERVER_PATH}${PROXY_FRESHDESK_CHAT_ON_TICKET}/${ticketId}` + '/reply',
      chatMsg,
    );
  }

  set countrydata(value: string) {
    if (value) {
      this.country = {
        deviceId: 'browser',
        application: `${this.i18Service.browser}`,
        version: 'v1',
        country: value.split('-')[1],
        market: value.split('-')[1],
        language: value.split('-')[0],
      };
    }
  }
  get countrydata() {
    if (this.country) {
      return this.country;
    } else {
      this.country = {
        deviceId: 'browser',
        application: `${this.i18Service.browser}`,
        version: 'v1',
        country: 'US',
        market: 'US',
        language: 'en',
      };
      return this.country;
    }
  }
  // create ticket throw tcc maping
  public contactEnquiry(data: any) {
    let url = `${this.apiservice.fetchApiHostUrl()}/enquiries`;
    return this.httpClient.post(url, data);
  }
  getContactUsData(viewResultData: any, categoryType: string, changeDateval?: any) {
    return {
      bookingRef: viewResultData.tccReference,
      name: viewResultData.contactInfo.personName.givenName,
      surname: viewResultData.contactInfo.personName.surname,
      categoryKey: this.checkCategorykey(
        viewResultData.airReservationList[0].originDestinationOptionsList[0].bookingFlightSegmentList[0]
          .departureDateTime,
        categoryType
      ),
      email: viewResultData.contactInfo.email,
      message:
        changeDateval ||
        this.checkCategorykey(
          viewResultData.airReservationList[0].originDestinationOptionsList[0].bookingFlightSegmentList[0]
            .departureDateTime,
          categoryType
        ),
      correlationId: this.sessionUtils.getCorrelationId(),
    };
  }
  /* set category for Ng-domain based on depature date */
  checkCategorykey(dept_date: any, categoryType: string) {
    let categoryKey: string = '';
    let description: string = '';
    if (this.countryval == 'NG' && categoryType == 'cancelTicket') {
      if (dept_date && formatDate(dept_date, 'dd-MM-yyyy', 'en_US') == formatDate(new Date(), 'dd-MM-yyyy', 'en_US')) {
        categoryKey = 'cancel_ticket_issued_today';
      } else {
        categoryKey = 'cancel_ticket_72_hour_flight';
      }
    } else if (this.countryval !== 'NG' && categoryType == 'cancelTicket') {
      categoryKey = 'CANCELLATION_REFUND_QUOTE';
    } else if (this.countryval == 'NG' && categoryType == 'changeDate') {
      categoryKey = 'change_booking';
    } else if (this.countryval !== 'NG' && categoryType == 'changeDate') {
      categoryKey = 'CHANGES';
    }
    return categoryKey;
  }

  /**Resend Ticekt */
  resendTicket(ticketData: any, reference: string) {
    let ticketInfo = ticketData;
    let tccRef = reference;
    let url = `${PROXY_SERVER_PATH}${PROXY_RESEND_ETICKET}/${tccRef}?deliveryChannel=email`;
    return this.httpClient.put(url, ticketData);
  }
  deleteAccount(data:any) {
    return this.httpClient.delete(`${PROXY_SERVER_PATH}${PROXY_ACCOUNT_DELETE}`);
  }
 
  getHotelBookingList(){
    const identifier = (this.countryval === 'MM') ? "momentum" : "default";
    const url = `${PROXY_SERVER_PATH}${PROXY_HOTELS_MYBOOKINGS_PATH}`;

    const data: any = {
      identifier: identifier,
      email:this.getUsercredentials().data.username,
    };
    return this.httpClient.post(url, data);
  }
  getUsercredentials(){
    let credentials : any =null;
    if(this.storage.getItem('credentials', 'session')){
      credentials = JSON.parse(this.storage.getItem('credentials', 'session'));
    }else if(this.storage.getItem('credentials', 'local')){
      credentials = JSON.parse(this.storage.getItem('credentials', 'local'));
    }
    return credentials;
  }
  getLocalHotelBookings(){
    return this.httpClient.get('assets/json/hotelBookings.json');
  }
  cancelHotelBooking(reqData:any,token:any){
    return this.httpClient.post(`${PROXY_SERVER_PATH}${PROXY_CANCEL_HOTEL_BOOKING}`,reqData);
  }
}
