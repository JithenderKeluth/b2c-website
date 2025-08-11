import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpResponse, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { getQueryParamSourceValue, getQueryStringParams } from '@app/general/deeplinks/deep-link.utils';
import { ApiService } from '@app/general/services/api/api.service';
import { GoogleTagManagerServiceService } from '@core/tracking/services/google-tag-manager-service.service';
import { UniversalStorageService } from '@app/general/services/universal-storage.service';

@Injectable({
  providedIn: 'root',
})
export class ApiPrefixInterceptor implements HttpInterceptor {
  private tsCountry: string | null = null;
  private currency: string | null = null;
  private readonly excludedUrls = [
    'webpre.multiply.co.za',
    'partner-proxy-',
    'api/v1/wallet/balance',
    'oppwa.com',
    'peachpayment',
    'subscriptions/tsplus',
    'tslogs',
    'https://europe-west2-ts-dev-dataops-prod.cloudfunctions.net/cms',
    'api/enquiries',
    'https://travel.api.amadeus.com/v1/security/oauth2/token',
    'https://travel.api.amadeus.com/v1/shopping/seatmaps',
    'https://peach-checkout-staging.travelstart.com',
    'https://peach-checkout.travelstart.com',
    'http://hapi-service-staging.hotelsapi.net',
    'https://beta-strapi.travelstart.com',
    'https://strapi.travelstart.com',
    'https://beta-b2b-admin.travelstart.com',
    'https://api.eu.iterable.com/api'
  ];

  constructor(
    private apiService: ApiService,
    private googleTagManagerServiceService: GoogleTagManagerServiceService,
    private storage: UniversalStorageService
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    this.tsCountry = this.apiService.extractCountryFromDomain();
    this.currency = this.storage.getItem('currencycode', 'session');

    if (this.tsCountry === 'GI') this.tsCountry = 'NG';
    else if (this.tsCountry === 'MM') this.tsCountry = 'ZA';
    else if (this.tsCountry === 'ABSA') this.tsCountry = 'xb';
    else if (this.tsCountry === 'mastercardtravel') this.tsCountry = 'GO';

    const authToken = this.storage.getItem('authToken', 'session') || '';

    if (!authToken && !this.isExcludedUrl(request.url) || (request.url.includes('api/enquiries') && this.tsCountry === 'NG')) {
      request = this.addHeaders(request);
    } else if (request.url.includes('b2b-api')) {
      request = this.addB2BHeaders(request, authToken);
    }

    const startTime = new Date();
    return next.handle(request).pipe(
      tap((response) => {
        if (response instanceof HttpResponse && request.url.includes('website-services/api/search')) {
          this.logRequestTime(request, response, startTime);
        }
      })
    );
  }

  private addHeaders(request: HttpRequest<any>): HttpRequest<any> {
    let headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'TS-country': `${this.tsCountry}`,
      'TS-language': 'en',
    };

    if (['https://bnc.lt/c/OMhkL9AOUjb', 
         'https://travel.api.amadeus.com/v1/security/oauth2/token', 
         'https://travel.api.amadeus.com/v1/shopping/seatmaps'].includes(request.url)) {
      headers['Content-Type'] = 'application/x-www-form-urlencoded';
    }

    if (getQueryStringParams()) {
      headers['ts-source'] = getQueryParamSourceValue();
    }

    return request.clone({ setHeaders: headers });
  }

  private addB2BHeaders(request: HttpRequest<any>, authToken: string): HttpRequest<any> {
    return request.clone({
      headers: new HttpHeaders({
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
        Accept: '*/*',
        'TS-country': `${this.tsCountry}`,
        'TS-language': 'en',
      }),
    });
  }

  private logRequestTime(request: HttpRequest<any>, response: HttpResponse<any>, startTime: Date): void {
    const endTime = new Date();
    const duration = (endTime.getTime() - startTime.getTime()) / 1000;

    this.googleTagManagerServiceService.searchResponseTime(duration);
  }

  private isExcludedUrl(url: string): boolean {
    return this.excludedUrls.some((excludedUrl) => url.includes(excludedUrl));
  }

}
