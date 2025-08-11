import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {
  BOOK_FLIGHTS_PATH,
  GATEWAY_AUTH_BOOK_FLIGHTS_PATH,
  REDIRECT_GATEWAY_AUTH_PATH,
  FLIGHT_BOOK,
  WALLET_BALANCE,
  AGENT_WALLET_TRANSACTIONS,
  GET_PAYMENT_METHODS,
  GET_PROCESSING_FEE,
  INITIATE_PAYMENT_TRANSACTION,
  PAYMENT_VERIFY_CALL,
  B2B_STAGE_PATH,
  PROXY_SERVER_PATH,
  PROXY_BOOKFLIGHT,
  PROXY_BIN_LOOKUP,
  PROXY_WALLET_VOUCHERS,
  PROXY_VALIDATE_WALLET_VOUCHERS,
  PROXY_WALLET_BALANCE_UPDATE
} from './../../general/services/api/api-paths';
import { ApiService } from './../../general/services/api/api.service';
import { SessionUtils } from './../../general/utils/session-utils';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { QueryStringAffid } from '@app/general/utils/querystringAffid-utils';
import { UniversalStorageService } from '@app/general/services/universal-storage.service';

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  public processingfee = new BehaviorSubject(null);
  currentProcessingfee = this.processingfee.asObservable();
  private BASE_URL;

  changeProcessingFee(value: any) {
    this.processingfee.next(value);
  }

  public binResponse = new BehaviorSubject(null);
  currentbinResponse = this.binResponse.asObservable();

  public binResponseForEight = new BehaviorSubject(null);
  currentbinResponseForEight = this.binResponseForEight.asObservable();

  changebinResponse(value: any) {
    this.binResponse.next(value);
  }

  constructor(
    private httpClient: HttpClient,
    private queryString: QueryStringAffid,
    private apiService: ApiService,
    private sessionUtils: SessionUtils,
    private storage: UniversalStorageService
  ) {
    this.BASE_URL = `${this.apiService.B2BHostUrl()}${B2B_STAGE_PATH}`;
  }

  

  public bookFlight(data: any) {
    //Headers
    const headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');
    headers.append('Accept', 'application/json');

    const isClientCall = this.storage.getItem('credentials', 'session');

    const url = !isClientCall
      ? `${this.apiService.fetchApiHostUrl()}${BOOK_FLIGHTS_PATH}/?${this.queryString.getParamApiPath()}`
      :  `${PROXY_SERVER_PATH}${PROXY_BOOKFLIGHT}/?${this.queryString.getParamApiPath()}`;
      
    return this.httpClient.post(url, data, { headers: headers });
  }

  GatewayPaymentBookFlight(data: any, redirectGateway?: any) {
    const headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');
    headers.append('Accept', 'application/json');
    let url: any;
    let queryPath: any = '';
    let queryStringValue: any = {};
    if (this.storage.getItem('queryStringParams', 'session')) {
      queryStringValue = this.getQueryparamData(JSON.parse(this.storage.getItem('queryStringParams', 'session')));
      queryPath = this.queryString.getQueryString(queryStringValue);
    } else if (this.storage.getItem('affiliateData', 'session')) {
      queryStringValue = this.getQueryparamData(JSON.parse(this.storage.getItem('affiliateData', 'session')));
      queryPath = this.queryString.getQueryString(queryStringValue);
    } else {
      queryStringValue['language'] = 'en';
      queryStringValue['correlation_id'] = this.sessionUtils.getCorrelationId();
      queryPath = this.queryString.getQueryString(queryStringValue);
    }
    if (this.apiService.extractCountryFromDomain() === 'SB' && queryPath.includes('adobe_mc')) {
      const params = new URLSearchParams(queryPath);
      params.delete('adobe_mc');
      queryPath = params.toString();
    }
    if (redirectGateway) {
      url = `${this.apiService.fetchApiHostUrl()}${REDIRECT_GATEWAY_AUTH_PATH}/?redirectGatewayAuth=${redirectGateway}&${queryPath}`;
    } else if (
      this.storage.getItem('bookingDetails', 'session') &&
      JSON.parse(this.storage.getItem('bookingDetails', 'session')).redirectGatewayParameters
    ) {
      url = `${this.apiService.fetchApiHostUrl()}${REDIRECT_GATEWAY_AUTH_PATH}/?${queryPath}`;
    } else {
      url = `${this.apiService.fetchApiHostUrl()}${GATEWAY_AUTH_BOOK_FLIGHTS_PATH}/?${queryPath}`;
    }
    return this.httpClient.post(url, data, { headers: headers });
  }
  getQueryparamData(value: any) {
    let cpy_sourceData = this.queryString.removeQueryStringDuplication(value);
    let queryParams = this.queryString.getUTMCampaigns(cpy_sourceData);
    if (!queryParams.correlation_id) {
      queryParams['correlation_id'] = this.sessionUtils.getCorrelationId();
    }

    return queryParams;
  }
  public async getBinData(cardNumber: any, cpySource: string) {
    this.binResponse.next(null); 
    const url = `${PROXY_SERVER_PATH}${PROXY_BIN_LOOKUP}`;
    const data: any = {
      bin:  cardNumber,
      cpySource: cpySource
    };
    
      this.httpClient.post(url, data).subscribe((res:any)=>{ 
       this.binResponse.next(JSON.parse(res));
      },(error)=>{
        console.error('Error invoking Lambda function:', error);
      });
  }

  public async getBinDataForEight(cardNumber: string, cpySource: string) { 
    this.binResponseForEight.next(null);
     const url = `${PROXY_SERVER_PATH}${PROXY_BIN_LOOKUP}`;

    const data: any = {
      bin:  cardNumber,
      cpySource: cpySource
    };
    
      this.httpClient.post(url, data).subscribe((res:any)=>{
        this.binResponseForEight.next(JSON.parse(res));
      },(error)=>{
        console.error('Error invoking Lambda function:', error);
      });
  }

  

  public bookB2BFlight(data: any) {
    const url = `${this.apiService.fetchApiHostUrl()}${FLIGHT_BOOK}?${this.queryString.getParamApiPath()}`;
    return this.httpClient.post(url, data);
  }

  getWalletBalance(): Observable<any> {
    return this.httpClient.get(this.BASE_URL + WALLET_BALANCE).pipe(
      map((balance) => {
        return balance;
      })
    );
  }

  getWalletTransactions() {
    return this.httpClient.get(this.BASE_URL + AGENT_WALLET_TRANSACTIONS);
  }

  getPaymentMethods() {
    return this.httpClient.get(this.BASE_URL + GET_PAYMENT_METHODS);
  }

  getProcessingFee(data: any) {
    return this.httpClient.post(this.BASE_URL + GET_PROCESSING_FEE, data);
  }

  initiatePaymentTransaction(data: any) {
    return this.httpClient.post(this.BASE_URL + INITIATE_PAYMENT_TRANSACTION, data);
  }

  paymentVerifyCall(data: any) {
    return this.httpClient.post(this.BASE_URL + PAYMENT_VERIFY_CALL, data);
  }

  getWalletVouchersList(token: string) {
    const url = `${PROXY_SERVER_PATH}${PROXY_WALLET_VOUCHERS}`;
    return this.httpClient.get(url);
  }

  validateWalletVoucher(data: any) {
    const url = `${PROXY_SERVER_PATH}${PROXY_VALIDATE_WALLET_VOUCHERS}/?${this.queryString.getParamApiPath()}`;
    return this.httpClient.post(url, data);
  }

  walletBalanceUpdate(data: any) {
    const url = `${PROXY_SERVER_PATH}${PROXY_WALLET_BALANCE_UPDATE}`;
    return this.httpClient.post(url, data);
  }

  getPeachCheckoutIdforBNPL(amount: any, shopperResultUrl: string, bookingReference: string): Observable<any> {
    let currencyCode = this.storage.getItem('currencycode', 'session') ? this.storage.getItem('currencycode', 'session') : 'USD';
    const checkoutData: any = {
      amount: amount,
      currency: currencyCode,
      shopperResultUrl: shopperResultUrl,
      bookingReference: bookingReference,
      correlationId: this.sessionUtils.getCorrelationId(),
    };
    return this.httpClient.post(`${this.apiService.getPeachCheckoutIdUrl()}`, checkoutData);
  }
}
