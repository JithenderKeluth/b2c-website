import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {
  PRICE_PATH,
  PAYMENT_METHODS_PATH,
  COUNTRIES_PATH,
  VALIDATE_VOUCHER_PATH,
  FLIGHT_EDIT_PRICE,
  PAYMENT_PATH,
} from './../../general/services/api/api-paths';
import { ApiService } from './../../general/services/api/api.service';
import { SessionUtils } from './../../general/utils/session-utils';
import { BehaviorSubject } from 'rxjs';
import { QueryStringAffid } from '@app/general/utils/querystringAffid-utils';
import { UniversalStorageService } from '@app/general/services/universal-storage.service';

@Injectable({
  providedIn: 'root',
})
export class BookingService {
  private productsSource = new BehaviorSubject([]);
  currentProducts = this.productsSource.asObservable();
  public userTravellersData: any[] = [];

  private baggageSelction = new BehaviorSubject({});
  currentBaggage = this.baggageSelction.asObservable();

  private voucherAmount = new BehaviorSubject(0);
  currentVoucherAmount = this.voucherAmount.asObservable();

  private voucherInfo = new BehaviorSubject(null);
  currentVoucherInfo = this.voucherInfo.asObservable();

  private smsInfo = new BehaviorSubject(false);
  currentSMSInfo = this.smsInfo.asObservable();

  private contactDetailsvalid = new BehaviorSubject(null);
  currentContactDetailsvalid = this.contactDetailsvalid.asObservable();

  changeContactDetailsvalid(value: any) {
    this.contactDetailsvalid.next(value);
  }

  private invalidMobileCode = new BehaviorSubject(false);
  currentInvalidMobileCode = this.invalidMobileCode.asObservable();

  private seatsToBeExpanded = new BehaviorSubject(false);
  isSeatsToBeExpanded = this.seatsToBeExpanded.asObservable();

  seatToBeExpanded(value: boolean) {
    this.seatsToBeExpanded.next(value);
  }

  changeInvalidMobileCode(value: boolean) {
    this.invalidMobileCode.next(value);
  }

  changeSmsVal(val: boolean) {
    this.smsInfo.next(val);
  }
  changeVoucherInfo(info: any) {
    this.voucherInfo.next(info);
  }

  changeVoucheramount(value: any) {
    this.voucherAmount.next(value);
  }

  private voucherData = new BehaviorSubject(0);
  currentVoucherData = this.voucherData.asObservable();

  private totalAmountToBook = new BehaviorSubject(null);
  currentTotalAmount = this.totalAmountToBook.asObservable();

  changeVoucherData(value: any) {
    this.voucherData.next(value);
  }

  changeTotalAmountToBook(value: number) {
    this.totalAmountToBook.next(value);
  }

  private mealPreference = new BehaviorSubject({});
  currentMealPreference = this.mealPreference.asObservable();

  constructor(
    private httpClient: HttpClient,
    private queryString: QueryStringAffid,
    private apiService: ApiService,
    private sessionUtils: SessionUtils,
    private storage: UniversalStorageService
  ) {}

  changeProducts(product: any) {
    this.productsSource.next(product);
  }

  changeBaggage(baggage: any) {
    this.baggageSelction.next(baggage);
  }
  selectMeal(meals: any) {
    this.mealPreference.next(meals);
  }

  private flightNotavail = new BehaviorSubject(false);
  currentflightNotavail = this.flightNotavail.asObservable();

  changeflightNotavail(value: boolean) {
    this.flightNotavail.next(value);
  }

  private resetFilters = new BehaviorSubject(false);
  currentresetFilters = this.resetFilters.asObservable();

  changeresetFilters(value: boolean) {
    this.resetFilters.next(value);
  }

  private deeplinkProductsData = new BehaviorSubject(null);
  currentDeeplinkProductsData = this.deeplinkProductsData.asObservable();

  changeDeeplinkProductsData(value: boolean) {
    this.deeplinkProductsData.next(value);
  }

  private displayProductsData = new BehaviorSubject({});
  currentDisplayProductsData = this.displayProductsData.asObservable();

  changeDisplayProductsData(value: any) {
    this.displayProductsData.next(value);
  }

  public getPricing(data: any) {
    const pricePath = this.storage.getItem('authToken', 'session') ? PRICE_PATH : PRICE_PATH + '/';
    const url = `${this.apiService.fetchApiHostUrl()}${pricePath}?${this.queryString.getParamApiPath()}`;
    return this.httpClient.post(url, data);
  }

  public getCoutries() {
    const headers = new HttpHeaders();
    headers.append('Access-Control-Expose-Headers', 'cf-ipcountry');
    const url = `${this.apiService.fetchApiHostUrl()}${COUNTRIES_PATH}?language=en&correlation_id=${this.sessionUtils.getCorrelationId()}`;
    return this.httpClient.get(url, { headers: headers, observe: 'response' });
  }

  public validateVoucherCode(voucherData: any) {
    const url = `${this.apiService.fetchApiHostUrl()}${VALIDATE_VOUCHER_PATH}/?language=en&correlation_id=${this.sessionUtils.getCorrelationId()}`;
    return this.httpClient.post(url, voucherData);
  }

  public getPaymentMethods(data: any) {
    // Headers
    const headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');
    headers.append('Accept', 'application/json');
    const paymentPath = this.storage.getItem('authToken', 'session') ? PAYMENT_PATH : PAYMENT_METHODS_PATH + '/';
    const url = `${this.apiService.fetchApiHostUrl()}${paymentPath}?${this.queryString.getParamApiPath()}`;
    return this.httpClient.post(url, data, { headers: headers });
  }
  public getUserCountry() {
    const url = `https://api.country.is/`;
    return this.httpClient.get(url);
  }

  /**for B2B edit price update */
  public editPrice(data: any) {
    const url = `${this.apiService.fetchApiHostUrl()}${FLIGHT_EDIT_PRICE}?${this.queryString.getParamApiPath()}`;
    return this.httpClient.post(url, data);
  }
  /**To update travellers when name changes and get updated values for baggage */
  private travellersDataInfo = new BehaviorSubject(null);
  currentTravellersDataInfo = this.travellersDataInfo.asObservable();

  updateTravellersDataInfo(value: boolean) {
    this.travellersDataInfo.next(value);
  }
}
