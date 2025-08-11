import { PROXY_TSPLUSCONFIG } from './../../general/services/api/api-paths';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiService } from '@app/general/services/api/api.service';
import { 
  TS_PLUS_SUBSCRIPTIONSTATUS,
  PROXY_SERVER_PATH,
  PROXY_TS_PLUS_SUBSCRIPTION_UPDATE,
  PROXY_PEACHPAYMENT_STATUS,
  PROXY_PEACH_REVERSE_PAYMENT,
  PROXY_PEACH_CHECKOUTID,
  PROXY_PEACH_TOKENLOGS,
  PROXY_PEACH_PAYMENTLOGS
} from '@app/general/services/api/api-paths';

@Injectable({
  providedIn: 'root',
})
export class PeachPaymentsService {
  private tsLogsApiUrl = 'https://beta-check-in.travelstart.com/tslogs'; 
  private env: string;
  constructor(private http: HttpClient, private apiService: ApiService) {
    this.env = this.apiService.getEnvironment().toUpperCase();
  }

  // 1. Prepare the checkout
  getCheckout(amount: any, currency: string, paymentType: string, email: string, isRenew: boolean): Observable<any> {
    const body = {
    email,
    isRenew
  };

  return this.http.post(`${PROXY_SERVER_PATH}${PROXY_PEACH_CHECKOUTID}`, body).pipe(
    catchError((error: HttpErrorResponse) => {
      console.error('Error during checkout:', error);
      return throwError(() => error);
    })
  );
  }

  // 3. Get the payment status
  getPaymentStatus(statusUrl: string): Observable<any> {

    const data: any = {
      statusUrl:  statusUrl
    };

    return this.http.post(`${PROXY_SERVER_PATH}${PROXY_PEACHPAYMENT_STATUS}`,data);
  }

  // Update Travelstart Plus subscription
  updateSubscriptionStatus(params: any) {
    // const headers = new HttpHeaders({
    //   'X-Token': params?.token,
    // });
    // const url = `${this.apiService.tsMyAccountUrl()}${TS_PLUS_SUBSCRIPTIONSTATUS}`;

    const url = `${PROXY_SERVER_PATH}${PROXY_TS_PLUS_SUBSCRIPTION_UPDATE}`;

    return this.http.post(url, params);
  }

  // Reverse A Payment
  reverseAPayment(paymentId: string, paymentType: string) {
    const payload = {
    paymentId,
    paymentType,
  };

    return this.http.post(`${PROXY_SERVER_PATH}${PROXY_PEACH_REVERSE_PAYMENT}`, payload).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Error during reverse the payment:', error);
        return throwError(() => error);
      })
    );
  }

  // Api endpoints to store logs
  generateTokenLogs(amount: any, currency: string, paymentType: string, email: string, response: any) {
    const checkoutData = {
      amount,
      currency,
      paymentType,
      'customer.email': email,
    };

    const logPayload = {
      request: JSON.stringify(checkoutData),
      response: JSON.stringify(response),
      apiType: '/v1/checkouts', 
      channel: 'Web',
      email: email,
      product: 'tsplus',
    };
    console.log("--token log initiated--",logPayload);
    return this.http.post(`${PROXY_SERVER_PATH}${PROXY_PEACH_TOKENLOGS}`, logPayload); 
  }

  paymentStatusLogs(getStatusUrl: any, statusResponse: any, email: string) {

    const body = {
      request: getStatusUrl,
      response: JSON.stringify(statusResponse),
      apiType: `${getStatusUrl}`,
      channel: 'Web',
      email: email,
      product: 'tsplus',
    };

    return this.http.post(`${PROXY_SERVER_PATH}${PROXY_PEACH_PAYMENTLOGS}`, body); 
  }
  paymentFailedStatusLogs(email: string) {

    const body = {
      request: 'Payment Aborted',
      response: 'Payment Aborted',
      api_type: '',
      channel: 'Web',
      email: email,
      product: 'tsplus',
    }; 
    return this.http.post(`${PROXY_SERVER_PATH}${PROXY_PEACH_PAYMENTLOGS}`, body); 
  }
  subscriptionStatusLogs(params: any, res: any, email: any) {

    const body = {
      request: JSON.stringify(params),
      response: JSON.stringify(res),
      api_type: `${this.apiService.tsMyAccountUrl()}${TS_PLUS_SUBSCRIPTIONSTATUS}`,
      channel: 'Web',
      email: email,
      product: 'tsplus',
    };
    return this.http.post(this.tsLogsApiUrl, body);
  }

  // Lambda APIs
  // getCheckOutId(currency: string, amount: number, email: string, isRenew: boolean) {
  //   const headers = new HttpHeaders({
  //     'x-api-key': '2wYVhN1M2N8zaKN66CTYu7kmvtzDrx881DOrluAA',
  //   });

  //   const subscriptionType = isRenew ? '&subscriptiontype=renewal' : '';
  //   const url = `${this.apiService.tsPlusHostUrl()}${TS_PLUS_PAYMENT_CHECKOUT_GET_TOKEN}?env=LIVE&currency=${currency}&product=tsplus&channel=Web&emailID=${email}${subscriptionType}`;

  //   return this.http.get(url, { headers });
  // }

  // getCheckoutPaymentStatus(checkOutId: string) {
  //   const url = `${this.apiService.tsPlusHostUrl()}${TS_PLUS_PAYMENT_PAYMENT_STATUS_API}?checkoutId=${checkOutId}&env=TEST`;
  //   return this.http.get(url);
  // }
  getTSPLUSAmount(){
    return this.http.get(`${PROXY_SERVER_PATH}${PROXY_TSPLUSCONFIG}`);
  }
}
