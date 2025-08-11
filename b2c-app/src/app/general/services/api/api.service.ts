import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { fromEvent, merge, Observable, of } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { find } from 'lodash';

import { WINDOW } from '../../../../assets/window.providers';
import {
  FOOTER_LINKS_PATH,
  FRESH_DESK_API_PATH,
  TRAVELSTART_ACCOUNT_LIVE_PATH,
  TRAVELSTART_ACCOUNT_PREPROD_PATH,
  TRAVELSTART_ACCOUNT_BETA_PATH,
  TRAVELSTART_ACCOUNT_ALPHA_PATH,
  POPULAR_ROUTES_PATH,
  AIRPORTS_LIVE_PATH,
  AIRPORTS_BETA_PATH,
  AIRPORTS_ALPHA_PATH,
  API_SERVER_BETA_PATH,
  API_SERVER_ALPHA_PATH,
  API_SERVER_LIVE_PATH,
  COUNTRIES_BETA_PATH,
  AIRPORTS_PREPROD_PATH,
  API_SERVER_PREPROD_PATH,
  B2B_API_SERVER_BETA_PATH,
  B2B_API_SERVER_PREPROD_PATH,
  WEB_API_PATH,
  B2B_WEBAPI_PATH,
  B2B_API_SERVER_LIVE_PATH,
  CONATCT_US_CATEGORIES_BETA_PATH,
  CONATCT_US_CATEGORIES_PREPROD_PATH,
  CONATCT_US_CATEGORIES_LIVE_PATH,
  CONATCT_US_CATEGORIES_ALPHA_PATH,
  GET_PEACH_CHECKOUT_ID_LIVE,
  GET_PEACH_CHECKOUT_ID_TEST,
  MEILI_DIRECT_ALPHA,
  MEILI_DIRECT_LIVE,
  MEILI_DIRECT_PREPROD,
  MEILI_BOOKING_MANAGER_TEST,
  MEILI_BOOKING_MANAGER_LIVE,
  HAPI_BASE_URL_LIVE,
  MOMENTUM_PROXY_API_TEST,
  MOMENTUM_PROXY_API_LIVE,
  AUTH_PROXY_BETA,
  AUTH_PROXY_PROD,
  AMADEUS_SEAT_API_LIVE,
  ITERABLE_API_TEST,
  ITERABLE_API_LIVE
} from './api-paths';

import { LOCALE_DOMAINS } from './../../../i18n/locale-domains';
import { DEFAULT_LOCALE } from './../../../i18n/supported-locales';
import { extractCountry } from './../../utils/locale.utils';
import { isIframeWidget, isWhitelabeledSite } from '../../utils/widget.utils';
import { UniversalStorageService } from '@app/general/services/universal-storage.service';
import { languageArray } from '../../../i18n/language-selection';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  constructor(
    @Inject(WINDOW) private window: any,
    @Inject(PLATFORM_ID) private platformId: Object,
    private activatedRoute: ActivatedRoute,
    private storage: UniversalStorageService
  ) {}
  domainInfo: any = languageArray;

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  public fetchApiHostUrl() {
    if (this.isBrowser() && this.storage.getItem('authToken', 'session')) {
      return this.B2BHostUrl() + B2B_WEBAPI_PATH;
    }
    switch (this.getEnvironment()) {
      case 'local':
      case 'beta':
        return API_SERVER_BETA_PATH + WEB_API_PATH;
      case 'preprod':
        return API_SERVER_PREPROD_PATH + WEB_API_PATH;
      case 'live':
        return API_SERVER_LIVE_PATH + WEB_API_PATH;
      case 'alpha':
        return API_SERVER_ALPHA_PATH + WEB_API_PATH;
    }
  }

  public contactUSEnquiresUrl() {
    return this.fetchApiHostUrl();
  }

  public countriesUrl() {
    const env = this.getEnvironment();
    if (env === 'preprod') return API_SERVER_PREPROD_PATH;
    if (env === 'live') return API_SERVER_LIVE_PATH;
    if (env === 'alpha') return API_SERVER_ALPHA_PATH;
    return COUNTRIES_BETA_PATH;
  }

  public autocompleteUrl() {
    const env = this.getEnvironment();
    if (env === 'preprod') return AIRPORTS_PREPROD_PATH;
    if (env === 'live') return AIRPORTS_LIVE_PATH;
    if (env === 'alpha') return AIRPORTS_ALPHA_PATH;
    return AIRPORTS_BETA_PATH;
  }

  public tsMyAccountUrl() {
    switch (this.getEnvironment()) {
      case 'preprod': return TRAVELSTART_ACCOUNT_PREPROD_PATH;
      case 'live': return TRAVELSTART_ACCOUNT_LIVE_PATH;
      case 'alpha': return TRAVELSTART_ACCOUNT_ALPHA_PATH;
      default: return TRAVELSTART_ACCOUNT_BETA_PATH;
    }
  }

  public freshDeskApiUrl() {
    return FRESH_DESK_API_PATH;
  }

  public popularRoutesUrl() {
    return POPULAR_ROUTES_PATH;
  }

  

  public B2BHostUrl() {
    switch (this.getEnvironment()) {
      case 'live': return B2B_API_SERVER_LIVE_PATH;
      case 'preprod': return B2B_API_SERVER_PREPROD_PATH;
      default: return B2B_API_SERVER_BETA_PATH;
    }
  }

  public footerLinkUrl() {
    return FOOTER_LINKS_PATH;
  }

  getHostname(): string {
    return this.isBrowser() ? this.window?.location?.hostname : '';
  }

  getContactUsKeysPath() {
    switch (this.getEnvironment()) {
      case 'preprod': return CONATCT_US_CATEGORIES_PREPROD_PATH;
      case 'live': return CONATCT_US_CATEGORIES_LIVE_PATH;
      case 'alpha': return CONATCT_US_CATEGORIES_ALPHA_PATH;
      default: return CONATCT_US_CATEGORIES_BETA_PATH;
    }
  }

  getPeachCheckoutIdUrl() {
    return this.getEnvironment() === 'live' ? GET_PEACH_CHECKOUT_ID_LIVE : GET_PEACH_CHECKOUT_ID_TEST;
  }

  getEmbedMeiliUrl() {
    switch (this.getEnvironment()) {
      case 'alpha': return MEILI_DIRECT_ALPHA;
      case 'preprod': return MEILI_DIRECT_PREPROD;
      default: return MEILI_DIRECT_LIVE;
    }
  }

  getMeiliBookingManagerUrl() {
    return this.getEnvironment() === 'live' ? MEILI_BOOKING_MANAGER_LIVE : MEILI_BOOKING_MANAGER_TEST;
  }

  get_HAPI_BaseUrl() {
    return HAPI_BASE_URL_LIVE;
  }

  get_MM_PROXY_Url() {
    return this.getEnvironment() === 'live' ? MOMENTUM_PROXY_API_LIVE : MOMENTUM_PROXY_API_TEST;
  }

  get_amadeus_seats_url() {
    return AMADEUS_SEAT_API_LIVE;
  }

  public getEnvironment(): string {
    if (!this.isBrowser()) return 'live';
    const href = this.window.location.href;
    if (this.isLocalhost()) return 'preprod';
    if (this.isAlpha()) return 'alpha';
    if (this.isBeta() || href.includes('beta')) return 'beta';
    if (this.isPreprod() || href.includes('preprod')) return 'preprod';
    return 'live';
  }

  public isAlpha(): boolean {
    const hostname = this.getHostname();
    return !!hostname.match(/(alpha[A-z]+\.travelstart)|(alpha.travelstart)|(alpha[A-z]*\.geziko)/);
  }

  public isPreprod(): boolean {
    const hostname = this.getHostname();
    return !!hostname.match(/(preprod[A-z]+\.travelstart)|(preprod[A-z]*\.geziko)|(preprod+\.travelstart)|(staging+\-momentum)|(staging+\-absa+\-preprod)|(staging+\-sbsa+\-preprod)/);
  }

  public isBeta(): boolean {
    const hostname = this.getHostname();
    return !!hostname.match(/(beta[A-z]+\.travelstart)|(beta[A-z]*\.geziko)|(testfe\.travelstart)|(beta+\.travelstart)|(gigm+\-uat)|(staging+\-absa+\-beta)|(staging+\-sbsa+\-beta)/);
  }

  public isLocalhost(): any {
    const hostname = this.getHostname();
    return !!hostname.match(/(localhost)/i) || hostname.match(/(dev\.travelstart\.com)/i);
  }

  public extractCountryFromDomain(): string {
    if (!this.isBrowser()) return extractCountry(DEFAULT_LOCALE);
    const hostname = this.getHostname();
    if (this.window.location.href.includes('momentum')) return 'MM';
    const country = find(LOCALE_DOMAINS, (localeDomain) => localeDomain.domain === hostname);
    return country?.id || extractCountry(DEFAULT_LOCALE);
  }

  public isTS_PLUSUser(): boolean {
    if (!this.isBrowser()) return false;
    const credentials = this.storage.getItem('credentials', 'local') || this.storage.getItem('credentials', 'session');
    const parsed = credentials ? JSON.parse(credentials) : null;
    return ['ZA', 'MM'].includes(this.extractCountryFromDomain()) &&
      parsed?.data?.isTSPlusSubscriber &&
      parsed?.data?.isTSPlusSubscriptionActive;
  }

  public isShowTSPLUSLabel(): boolean {
    if (!this.isBrowser()) return false;
    const href = this.window.location.href;
    const isTSPlus = this.isTS_PLUSUser();
    const isIFrame = this.is_IFrameWidget();
    const isWhiteLabel = isWhitelabeledSite();
    const country = this.extractCountryFromDomain();

    return (
      (country === 'ZA' && isIFrame && !isWhiteLabel && !isTSPlus &&
        !href.includes('cpysource') && !href.includes('cpy_source')) ||
      (!isTSPlus && isIFrame && !isWhiteLabel && country === 'ZA' &&
        (href.includes('cpysource=tszaweb') ||
         href.includes('cpysource=tszamobi') ||
         href.includes('cpy_source=tszaweb') ||
         href.includes('cpy_source=tszaweb')))
    );
  }

  public is_IFrameWidget(): boolean {
    let iframe = false;
    this.activatedRoute.queryParams.subscribe((x) => {
      iframe = x.isIframe === 'iframe';
    });
    return isIframeWidget(iframe);
  }

  public checkInternetConnection(): Observable<boolean> {
    if (!this.isBrowser()) return of(true);
    const online$ = fromEvent(window, 'online').pipe(map(() => true));
    const offline$ = fromEvent(window, 'offline').pipe(map(() => false));
    return merge(online$, offline$).pipe(startWith(navigator.onLine));
  }

  public getOfflineBookingsURL() {
    return this.getEnvironment() !== 'live' ? 'beta_notifications_validator' : 'production_notifications_validator';
  }

  regionZADomains() {
    const region = this.extractCountryFromDomain();
    return ['ZA', 'FS', 'MM', 'SB', 'ABSA'].includes(region);
  }

  regionNGDomains() {
    const region = this.extractCountryFromDomain();
    return ['NG', 'GI'].includes(region);
  }

  // @TODO configure variable for local, alpha, preprod, live .... eg: ABSA_AUTH_PROXY_ALPHA etc...
   public tsProxyUrl() {
    console.log(this.getEnvironment());
    if (this.getEnvironment() === 'local') {
      return `${AUTH_PROXY_BETA}/${this.extractCountryFromDomain() === "ABSA" ? "absa" : "sbsa"}`;
    } else if (this.getEnvironment() === 'beta') {
      return `${AUTH_PROXY_BETA}/${this.extractCountryFromDomain() === "ABSA" ? "absa" : "sbsa"}`;
    } else if (this.getEnvironment() === 'preprod') {
      return `${AUTH_PROXY_BETA}/${this.extractCountryFromDomain() === "ABSA" ? "absa" : "sbsa"}/${this.getEnvironment()}`;
    } else if (this.getEnvironment() === 'live') {
      return `${AUTH_PROXY_PROD}/${this.extractCountryFromDomain() === "ABSA" ? "absa" : "sbsa"}`;
    } else if (this.getEnvironment() === 'alpha') {
      return `${AUTH_PROXY_BETA}/${this.extractCountryFromDomain() === "ABSA" ? "absa" : "sbsa"}`;
    }
  }

   public iterableProxyUrl(): string {
    if (this.getEnvironment() === 'local') {
      return ITERABLE_API_TEST;
    } else if (this.getEnvironment() === 'beta') {
      return ITERABLE_API_TEST;
    } else if (this.getEnvironment() === 'preprod') {
      return ITERABLE_API_TEST;
    } else if (this.getEnvironment() === 'live') {
      return ITERABLE_API_LIVE;
    } else if (this.getEnvironment() === 'alpha') {
      return ITERABLE_API_TEST;
    }else{
      return ITERABLE_API_LIVE;
    }
  }

  public iterableAPIKEY(): string {
    if (this.extractCountryFromDomain() === 'NG') {
      return "c57a8715cce44f019907ff582f148a75";
    } else   {
      return "145a6e5423f94c698b537385ff7fe6b9";
    }  
  }

  /**here to get domain Data based on user domain */
  getDomainInfo() {
   return  this.domainInfo.find((x: any) => x.domain === this.extractCountryFromDomain());
  }
}
