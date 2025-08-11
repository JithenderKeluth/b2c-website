import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { defaultTo } from 'lodash';

import { SearchData } from './../models/search/search-data.model';
import { getTravellerCount, shouldShowPerPersonPrice } from './../utils/search-data.utils';
import { SearchResults } from './../models/results/search-results.model';
import { parseSearchResults, parseSearchRequest } from './../utils/search.utils';
import { SearchRequest } from './../models/search/search-request.model';
import { DataToken } from '../../_core/models/dataToken.model';
import { ApiService } from './../../general/services/api/api.service';
import {
  SEARCH_PATH,
  AUTOCOMPLETE_PATH,
  FOOTER_PATH,
  VIEW_ITINERARY_PATH,
  PRICE_WITH_CALENDAR,
  S3_BUCKET_PATH,
  COUNTRIES_LIST_PATH,
  B2B_STAGE_PATH,
  B2B_USER_DATA,
  B2B_AGENCY_INFO,
} from './../../general/services/api/api-paths';
import { SessionUtils } from './../../general/utils/session-utils';

import { QueryStringAffid } from '@app/general/utils/querystringAffid-utils';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { UniversalStorageService } from '@app/general/services/universal-storage.service';

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  currency: any;
  countryDomain: any;
  public flightSearch: any;
  public tripType: string;
  public constructor(
    private httpClient: HttpClient,
    private apiService: ApiService,
    private sessionUtils: SessionUtils,
    private queryStringaffid: QueryStringAffid,
    private storage: UniversalStorageService
  ) {
    this.countryDomain = 'en-' + this.apiService.extractCountryFromDomain();
  }

  private noFiltersMsg = new BehaviorSubject(false);
  currentnoFiltersMsg = this.noFiltersMsg.asObservable();

  changeNoFilters(value: boolean) {
    this.noFiltersMsg.next(value);
  }

  private searchValue = new BehaviorSubject(false);
  currentsearch = this.searchValue.asObservable();

  changeSearchVal(value: boolean) {
    this.searchValue.next(value);
  }

  langValue = new BehaviorSubject(this.languagedata);
  currenyValue = new BehaviorSubject(this.currencyCode);

  private userCredentials = new BehaviorSubject(null);
  currentUserCredentials = this.userCredentials.asObservable();

  updateUserCredentials(user: any) {
    this.userCredentials.next(user);
  }

  private countryChange = new BehaviorSubject(false);
  currentCountry = this.countryChange.asObservable();

  private itineraryTabValue = new BehaviorSubject(this.flightSearchTrip);
  currentItineraryValue = this.itineraryTabValue.asObservable();

  private queryString = new BehaviorSubject(null);
  currentQueryString = this.queryString.asObservable();

  changeQueryString(value: any) {
    this.queryString.next(value);
  }

  private showSpinner = new BehaviorSubject(false);
  currentShowSpinner = this.showSpinner.asObservable();

  changeShowSpinner(value: boolean) {
    this.showSpinner.next(value);
  }

  private outBoundsortingValue = new BehaviorSubject(null);
  currentoutBoundSortingValue = this.outBoundsortingValue.asObservable();

  changeoutBoundSortingValue(value: any) {
    this.outBoundsortingValue.next(value);
  }

  private inBoundsortingValue = new BehaviorSubject(null);
  currentInBoundSortingValue = this.inBoundsortingValue.asObservable();

  private newSearch = new BehaviorSubject(null);
  currentNewSearch = this.newSearch.asObservable();

  changeInBoundSortingValue(value: any) {
    this.inBoundsortingValue.next(value);
  }

  changeItineraryValue(value: any) {
    this.itineraryTabValue.next(value);
  }

  changeCountry(product: any) {
    this.countryChange.next(product);
  }

  changeNewSearch(value: any) {
    this.newSearch.next(value);
  }

  private loginModalOutSideClick = new BehaviorSubject(false);
  currentloginModalOutSideClick = this.loginModalOutSideClick.asObservable();

  changeloginModalOutSideClick(value: boolean) {
    this.loginModalOutSideClick.next(value);
  }

  public getAirports(event: any) {
    const searchValue = event?.target?.value ? event?.target?.value : event;
    const languagedata = this.languagedata === 'en-GI' ? 'en-NG' : this.languagedata;
    return this.httpClient.get(
      `${this.apiService.autocompleteUrl()}${AUTOCOMPLETE_PATH}?n=12&q=${searchValue}&locale=${languagedata}`
    );
  }

  public getFooterLinks() {
    const domain = this.languagedata === 'en-CT' || this.languagedata === 'en-FS' ? 'en-ZA' : this.languagedata;
    return this.httpClient.get(`${this.apiService.footerLinkUrl()}${FOOTER_PATH}/${domain}.json/`);
  }

  public contactEnquiry(data: any) {
    let url = `${this.apiService.contactUSEnquiresUrl()}/enquiries`;
    return this.httpClient.post(url, data);
  }

  public getPopularRoutes() {
    let params = new HttpParams();
    params = params.append('api_key', 'tXr0HiFpxT2vWBT');
    params = params.append('display_currency_code', this.currencyCode);
    params = params.append('is_roundtrip', 'false');
    // if( this.apiService.extractCountryFromDomain() === 'ZA' ) {
    //        params = params.append('airline_code', 'GE');
    // }
    const url = `${this.apiService.popularRoutesUrl()}`;
    return this.httpClient.get(url, { params: params });
  }

  public getDownloadLink(phoneNum: any) {
    const url = `https://bnc.lt/c/OMhkL9AOUjb`;
    let formData = {};
    formData['sdk'] = 'web2.58.3';
    formData['phone'] = phoneNum;
    formData['branch_key'] = 'key_live_gasiAq9D93c1ZSfurPJK6mfhDDlnSNVs';
    return this.httpClient.post(url, formData);
  }

   
  /**Fetching Itinerary values for payment link */
  public viewItinerary(deepLinkData: any) {
    const url = `${this.apiService.fetchApiHostUrl()}${VIEW_ITINERARY_PATH}/?${this.queryStringaffid.getParamApiPath()}`;
    let itinData = {
      uuId: deepLinkData?.uuid,
      invId: deepLinkData?.invid,
    };
    return this.httpClient.post(url, JSON.stringify(itinData));
  }
  /**To get Itinerary details of B2B  */
  public b2BPaymentLinkViewItinerary(deepLinkData: any) {
    const url = `${this.apiService.fetchApiHostUrl()}${VIEW_ITINERARY_PATH}/?language=en&correlation_id=${this.sessionUtils.getCorrelationId()}`;
    let itinData = {
      uuId: deepLinkData?.uuid,
      invId: deepLinkData?.invid,
      tccRef: deepLinkData?.tccReference,
    };
    return this.httpClient.post(url, JSON.stringify(itinData));
  }

  public performSearch(
    searchData: SearchData,
    userEmail: string,
    businessUserToken: string,
    dataToken?: DataToken,
    isDeepLink: boolean = false
  ): Promise<SearchResults> {
    const searchPath = this.storage.getItem('authToken', 'session') ? SEARCH_PATH : SEARCH_PATH + '/';
    const url = `${this.apiService.fetchApiHostUrl()}${searchPath}?${this.queryStringaffid.getParamApiPath()}`;
    // const url = `${this.apiService.fetchApiHostUrl()}${WEB_API_PATH}${SEARCH_PATH}/?appsource=flappios&affId=microappios&cpysource=zamicroapp&correlation_id=1131F999-C3F1-401F-BC54-0CBBFD13B8FFflappIOS1617979108717&ma_active=false`;

    const searchRequest: SearchRequest = parseSearchRequest(
      searchData,
      defaultTo(userEmail, ''),
      defaultTo(businessUserToken, ''),
      isDeepLink,
      dataToken
    );
    return new Promise<SearchResults>((resolve, reject) => {
      this.httpClient
        .post(url, searchRequest)
        .toPromise()
        .then((searchResponse: any) => {
          if (searchResponse.response.errors) {
            reject(searchResponse.response.errors);
          }
          /**if want to check error code and itineraries length here only
           * if ((checkSearchErrors(searchResponse.response.errors)) || !this.hasItineraries(searchResponse)) {
            reject(SEARCH_ERROR.noFlights);
            return;
          }other wise we can check at search call method
          */

          const searchResults: SearchResults = parseSearchResults(
            searchResponse,
            shouldShowPerPersonPrice(searchData),
            getTravellerCount(searchData)
          );
          resolve(searchResults);
        })
        .catch((error: Error) => {
          reject(error);
        });
    });
  }

  public performFlightSearch(
    searchData: SearchData,
    userEmail: string,
    businessUserToken: string,
    dataToken?: DataToken,
    isDeepLink: boolean = false
  ): Observable<SearchResults> {
    const searchPath = this.storage.getItem('authToken', 'session') ? SEARCH_PATH : SEARCH_PATH + '/';
    const url = `${this.apiService.fetchApiHostUrl()}${searchPath}?${this.queryStringaffid.getParamApiPath()}`;

    const searchRequest: SearchRequest = parseSearchRequest(
      searchData,
      defaultTo(userEmail, ''),
      defaultTo(businessUserToken, ''),
      isDeepLink,
      dataToken
    );

    return this.httpClient.post(url, searchRequest).pipe(
      map((searchResponse: any) => {
        if (searchResponse.response.errors) {
          throw {
            message: 'Search error occurred',
            errors: searchResponse.response.errors,
          };
        }
        return parseSearchResults(searchResponse, shouldShowPerPersonPrice(searchData), getTravellerCount(searchData));
      }),
      catchError((error: any) => {
        return throwError(error);
      })
    );
  }

  private hasItineraries(result: any): boolean {
    if (
      result?.response?.itineraries?.length !== 0 ||
      (result?.response?.outboundItineraries?.length !== 0 && result?.response?.inboundItineraries?.length !== 0)
    ) {
      return true;
    } else {
      return false;
    }
  }
  get languagedata(): string {
    return this.countryDomain;
  }

  get flightSearchTrip(): any {
    if (JSON.parse(this.storage.getItem('flightsearchInfo', 'session'))) {
      this.flightSearch = JSON.parse(this.storage.getItem('flightsearchInfo', 'session'));
      return (this.tripType = this.flightSearch.tripType);
    } else {
      return (this.tripType = 'return');
    }
  }

  set languagedata(value: string) {
    this.langValue.next(value);
    // this._localItem = value;
    // localStorage.setItem('country-language', value);
  }
  set currencyCode(value: string) {
    this.currenyValue.next(value);
  }

  get currencyCode() {
    if (this.storage.getItem('currencycode', 'session')) {
      return this.storage.getItem('currencycode', 'session');
    } else {
      return (this.currency = 'USD');
    }
  }

  getPricewithCalendar(dept: string, arr: string, isRoundTrip: boolean, cabin: string) {
    return this.httpClient.get(
      `${PRICE_WITH_CALENDAR}&display_currency_code=${this.currencyCode}&departure=${dept}&destination=${arr}&is_roundtrip=${isRoundTrip}&cabin=${cabin}`
    );
  }
  /**Fetching countries list*/
  fetchCountries() {
    const url = `${S3_BUCKET_PATH}${COUNTRIES_LIST_PATH}`;
    return this.httpClient.get(url);
  }
  /**To get B2B user data */
  getB2BUserData() {
    let url = `${this.apiService.B2BHostUrl()}${B2B_STAGE_PATH}${B2B_USER_DATA}`;
    return this.httpClient.get(url);
  }
  /**To get B2B user profile to display logo and name  */
  getB2BAgencyInfo() {
    let url = `${this.apiService.B2BHostUrl()}${B2B_STAGE_PATH}${B2B_AGENCY_INFO}`;
    return this.httpClient.get(url);
  }

  /**
   * Checks if at least one "ADULT" paxType is selected.
   * @param travellers Array of traveler data.
   * @returns True if at least one "ADULT" paxType is selected; otherwise, false.
   */
  isAdultPaxSelected(travellers: any[]): boolean {
    if (!Array.isArray(travellers)) {
      console.error('Invalid traveler list provided.');
      return false;
    }

    return travellers.some((traveller) => traveller.paxType === 'ADULT' && traveller.paxSelected === true);
  }
}
