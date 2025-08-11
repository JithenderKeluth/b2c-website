import moment from 'moment';
import { get, head, last } from 'lodash';
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';

import {
  getDeepLinkAdultCount,
  getDeepLinkChildrenCount,
  getDeepLinkDataToken,
  getDeepLinkDataTokenType,
  getDeepLinkDepartDate,
  getDeepLinkDestination,
  getDeepLinkInBoundFlightNumber,
  getDeepLinkInfantsCount,
  getDeepLinkOrigin,
  getDeepLinkOutBoundFlightNumber,
  getDeepLinkPreferredAirline,
  getDeepLinkPreferredCabinClass,
  getDeepLinkReturnDate,
  getDeepLinkSearchIdentifier,
  hasDeepLinkDataTokens,
  hasDeepLinkPaymentData,
  hasDeepLinkPriceData,
  hasDeepLinkSearchData,
  hasDeepLinkSearchIdentifiers,
  isDeepLinkCalendarSearch,
  isDeepLinkReturnTrip,
  getBusinessToken,
  parsePriceResult,
  getDeepLinkyoungAdultsCount,
} from './deep-link.utils';

import { DEEP_LINK_TYPE } from './deeplink-type.constants';
import { DataToken } from './dataToken.model';
import { AuthDetails } from './auth-details.model';
import { SearchData } from './../../flights/models/search/search-data.model';
import { SearchItinerary } from './../../flights/models/search/search-itinerary.model';
import { LocationService } from './../services/locations/location.service';
import { LocationWrapper } from './../services/locations/location-wrapper';
import { Location } from './../services/locations/location.model';
import { parseMomentExact } from './date-utils';
import { SearchRouteValidation } from './../services/validations/search-route-validation';
import { TRIP_TYPES } from './../../flights/models/trip-types';
import { Travellers } from './../../flights/models/travellers';
import { CABIN_CLASSES } from './../../flights/models/cabin-classes.constant';
import { PreferredAirline } from './../../flights/models/airline.model';
import { normalizeSearchData } from './../../flights/utils/search-data.utils';
import { SearchService } from './../../flights/service/search.service';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { BookingService } from '@app/booking/services/booking.service';
import { I18nService } from '@app/i18n/i18n.service';
import { GoogleTagManagerServiceService } from '@core/tracking/services/google-tag-manager-service.service';
import { BookingCountdownService } from '../utils/bookingFlowCountdown';
import { SessionUtils } from '../utils/session-utils';
import { getStorageData, removeStorageData, setStorageData } from '../utils/storage.utils';
import { window } from 'ngx-bootstrap/utils';
import { UniversalStorageService } from '@app/general/services/universal-storage.service';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class DeepLinkService {
  public readonly MAX_ITINERARIES: number = 6;
  public validation: {
    [itineraryId: string]: SearchRouteValidation;
  };
  private authDetails: AuthDetails;
  private searchApiData: any = new SearchData();
  private originLocationInfo: any;
  private destinationLocationInfo: any;
  private deepLinkType: string;
  private queryParamKeys: any;
  private outBoundSelected: any;
  private inBoundSelected: any;
  private rePriceData: any;
  private triggerSearch_API: boolean = false;
  private flightsearchInfo: any;
  private flightsResultsResponse: any;
  private isBrowser: boolean;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private bookingService: BookingService,
    private i18Service: I18nService,
    private locationService: LocationService,
    private searchService: SearchService,
    private googleTagManagerServiceService: GoogleTagManagerServiceService,
    private bookingCountdownService: BookingCountdownService,
    private sessionUtils: SessionUtils,
    private storage: UniversalStorageService,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    const results = getStorageData('flightResults');
    this.flightsResultsResponse = results ? JSON.parse(results) : {};
  }

  private searchError = new BehaviorSubject(false);
  currentSearchError = this.searchError.asObservable();

  changeSearchError(value: boolean) {
    this.searchError.next(value);
  }

  private isPriceDeepLink = new BehaviorSubject(false);
  currentIsPriceDeepLink = this.isPriceDeepLink.asObservable();

  changeIsPriceDeepLink(value: boolean) {
    this.isPriceDeepLink.next(value);
  }

  private priceError = new BehaviorSubject('');
  currentPriceError = this.priceError.asObservable();

  changePriceError(value: string) {
    this.priceError.next(value);
  }

  public viewItineraryError = new BehaviorSubject('');
  currentViewItineraryError = this.viewItineraryError.asObservable();

  changeViewItineraryError(value: string) {
    this.viewItineraryError.next(value);
  }

  public getRequestType(queryParameterString: any): DEEP_LINK_TYPE {
    if (hasDeepLinkSearchData(queryParameterString)) {
      return hasDeepLinkPriceData(queryParameterString) ? DEEP_LINK_TYPE.PRICE : DEEP_LINK_TYPE.SEARCH;
    }

    if (hasDeepLinkPaymentData(queryParameterString)) {
      return DEEP_LINK_TYPE.PAYMENT;
    }
  }

  public fetchDataTokenFromDeepLinkValues(queryParameterString: string): DataToken {
    if (hasDeepLinkDataTokens(queryParameterString)) {
      return {
        dataToken: getDeepLinkDataToken(queryParameterString),
        dataTokenType: getDeepLinkDataTokenType(queryParameterString),
      };
    }
    return;
  }

  // TODO move to app component when it exists
  // change this. to DeepLinkService.fetchSearchDataFromDeepLinkValues
  public search(queryParameterString: string, RequestType: string): void {
    this.getQueryStringParamsData();
    this.deepLinkType = RequestType;
    const businessUserToken = getBusinessToken(this.authDetails);
    const userEmail = this.authDetails ? this.authDetails.email : '';
    this.queryParamKeys = this.checkDeeplinkParmsCid(this.queryParamKeys);
    this.fetchSearchDataFromDeepLinkValues(queryParameterString)
      .then((searchData: SearchData) => {
        const dataToken = this.fetchDataTokenFromDeepLinkValues(queryParameterString);
        if (dataToken) {
          this.searchApiData = searchData;
        }
      })
      .catch((error) => {
        this.router.navigate([''], { queryParamsHandling: 'preserve' });
        this.searchService.changeShowSpinner(false);
        this.changeSearchError(false);
      })
      // Finally
      .then(() => {
        // this.apiService.setQueryParameters(
        //     stripDeepLinkQueryParameters(queryParameterString)
        // );
        //   this.searchService.changeShowSpinner(false);
        //   this.router.navigate(['']);
      });
  }

  public getItineraryValues(queryParamString: any) {
    this.searchService.viewItinerary(queryParamString).subscribe(
      (data: any) => {
        if (!data?.errors) {
          this.storage.removeItem('paymentDeeplinkData');
          this.storage.setItem('paymentDeeplinkData', JSON.stringify(data), 'session');
          this.storage.setItem('products', JSON.stringify(data.products), 'session');
        } else if (data?.errors[0]?.errorWarningAttributeGroup.shortText === 'invoice is expired' || data?.errors) {
          this.changeViewItineraryError('invoice is expired');
        }
      },
      (error) => {
        if (error) {
          if (error.error) {
            if (error.error.code === 404 || error.error.code === 500) {
              this.changeViewItineraryError('viewItinerayFailed');
              return;
            }
          }
        }
      }
    );
  }

  // NOTE if you have a FAILING TEST its probably because of `earliestDepartDate`: now() vs depart
  public fetchSearchDataFromDeepLinkValues(queryParameterString: string): Promise<SearchData> {
    const businessUserToken = getBusinessToken(this.authDetails);
    const userEmail = this.authDetails ? this.authDetails.email : '';
    // Deeplink itinerary keys can be indexed if more than one itinerary's data is specified
    // Initially look for un-indexed keys (index -1), after which we look for indexed keys (0 - 9)
    let earliestDepartDate = moment(new Date());
    const itineraryPromises = [];
    const itineraryArrayData: any = [];
    const locale: any = [];
    for (let index = -1; index < this.MAX_ITINERARIES; index += 1) {
      const locationPromises = [];
      const deeplinkItineraryIndex = index === -1 ? undefined : index;
      const itinerary = new SearchItinerary();
      const itineraryData = new SearchItinerary();
      const origin = getDeepLinkOrigin(queryParameterString, deeplinkItineraryIndex);
      if (!origin) {
        if (index === -1) {
          // If no un-indexed itinerary key found, still look for indexed itinerary keys
          continue;
        } else {
          // If no indexed itinerary key found, assume that is the end of the list
          break;
        }
      }

      if (origin && origin.iata && origin.type) {
        locationPromises.push(
          this.locationService.fetchLocationInformation(origin.iata, origin.type).then((location: Location) => {
            this.originLocationInfo = location;
            itinerary.origin = new LocationWrapper(location);
          })
        );
      }
      const destination = getDeepLinkDestination(queryParameterString, deeplinkItineraryIndex);

      if (destination && destination.iata && destination.type) {
        locationPromises.push(
          this.locationService
            .fetchLocationInformation(destination.iata, destination.type)
            .then((location: Location) => {
              this.destinationLocationInfo = location;
              itinerary.destination = new LocationWrapper(location);
            })
        );
      }

      // TODO: optimise... (parsing and formatting too many times)
      let departDate = getDeepLinkDepartDate(queryParameterString, deeplinkItineraryIndex);
      let returnDate: any;
      if (
        this.queryParamKeys.trip_type === 'Roundtrip' ||
        (this.queryParamKeys.trip_type === 'RoundTrip' &&
          this.queryParamKeys.depart_date_1 &&
          !getDeepLinkReturnDate(queryParameterString, deeplinkItineraryIndex))
      ) {
        returnDate = this.queryParamKeys.depart_date_1;
      } else {
        returnDate = getDeepLinkReturnDate(queryParameterString, deeplinkItineraryIndex);
      }

      const isReturnBeforeDepart =
        departDate && returnDate && parseMomentExact(returnDate).isBefore(parseMomentExact(departDate));

      const isDepartBeforeEarliest =
        departDate && earliestDepartDate && parseMomentExact(departDate).isBefore(earliestDepartDate);

      if (isReturnBeforeDepart) {
        // returnDate = '';
      }

      if (isDepartBeforeEarliest) {
        // departDate = '';
      } else {
        earliestDepartDate = parseMomentExact(departDate);
      }
      if (departDate) {
        itinerary.departDate = departDate;
        itineraryData.dept_date = departDate;
      }
      if (returnDate) {
        itinerary.returnDate = returnDate;
        itineraryData.arr_date = returnDate;
      } else {
        itineraryData.arr_date = '';
      }
      itineraryPromises.push(itinerary);
      setTimeout(() => {
        if (itinerary && itinerary.origin && itinerary.destination) {
          itineraryData.dept_city = itinerary.origin.value;
          itineraryData.arr_city = itinerary.destination.value;
          itineraryArrayData.push(itineraryData);
          this.searchApiData.itineraries = itineraryArrayData;
        }
      }, 1500);

      // this.validation[itinerary.id] = new SearchRouteValidation();
    }

    // Return for testing purposes
    return Promise.all(itineraryPromises).then((itineraries: SearchItinerary[]) => {
      const searchData = new SearchData();
      this.searchApiData.tripType = TRIP_TYPES.return;
      if (
        isDeepLinkReturnTrip(queryParameterString) ||
        (this.queryParamKeys && this.queryParamKeys.trip_type === 'Roundtrip') ||
        this.queryParamKeys.trip_type === 'RoundTrip'
      ) {
        searchData.tripType = TRIP_TYPES.return;
        // If separate itineraries were detailed in the deep link parameters
        // condense the dates into the one return itinerary
        if (itineraries.length == 2) {
          itineraries[0].returnDate = itineraries[1].departDate;
          itineraries = [itineraries[0]];
        }
      } else if (itineraries.length === 1) {
        searchData.tripType = itineraries[0].returnDate ? TRIP_TYPES.return : TRIP_TYPES.oneWay;
      } else if (itineraries.length === 0) {
        // No itinerary data provided, initialise with fresh object
        const itinerary = new SearchItinerary();
        itineraries = [itinerary];
        this.validation[itinerary.id] = new SearchRouteValidation();
      } else {
        searchData.tripType = TRIP_TYPES.multiCity;
      }

      searchData.itineraries = itineraries;

      this.searchApiData.tripType = '';
      this.searchApiData.tripType = searchData.tripType;
      searchData.travellers = new Travellers(
        // Always default to minimum of 1 adult
        getDeepLinkAdultCount(queryParameterString) || 1,
        getDeepLinkyoungAdultsCount(queryParameterString),
        getDeepLinkChildrenCount(queryParameterString),
        getDeepLinkInfantsCount(queryParameterString)
      );
      this.searchApiData.travellers = searchData.travellers;
      this.storage.removeItem('travellers');
      this.storage.setItem('travellers', JSON.stringify(this.searchApiData.travellers), 'session');

      searchData.moreOptions.isCalendarSearch = isDeepLinkCalendarSearch(queryParameterString);
      searchData.moreOptions.preferredCabins =
        CABIN_CLASSES[getDeepLinkPreferredCabinClass(queryParameterString)] || CABIN_CLASSES.economy;
      this.searchApiData.cabinClass = searchData.moreOptions.preferredCabins;
      const preferredAirlineCode = getDeepLinkPreferredAirline(queryParameterString);
      if (preferredAirlineCode) {
        searchData.moreOptions.preferredAirlines = new PreferredAirline(preferredAirlineCode, preferredAirlineCode);
      }

      if (hasDeepLinkPriceData(queryParameterString)) {
        searchData.outboundFlightNumber = getDeepLinkOutBoundFlightNumber(queryParameterString);
        searchData.inboundFlightNumber = getDeepLinkInBoundFlightNumber(queryParameterString);
      }

      if (hasDeepLinkSearchIdentifiers(queryParameterString)) {
        searchData.searchIdentifier = getDeepLinkSearchIdentifier(queryParameterString);
      }
      searchData.locale = {
        country: this.i18Service.language.split('-')[1],
        currentLocale: 'en',
        locales: locale,
      };
      this.getSearchResults(queryParameterString, userEmail, businessUserToken, searchData);
      return searchData;
    });
  }

  getQueryStringParamsData() {
    this.activatedRoute.queryParams.subscribe((data) => {
      this.queryParamKeys = data;
    });
  }

  getSearchResults(queryParameterString: any, userEmail: any, businessUserToken: any, searchData: any) {
    setTimeout(() => {
      if (this.destinationLocationInfo && this.originLocationInfo) {
        this.getQueryStringParamsData();
        if (this.searchApiData.itineraries[0].dept_city && this.searchApiData.itineraries[0].arr_city) {
          this.searchApiData.cabinClass = searchData.moreOptions.preferredCabins;
          this.storage.removeItem('flightsearchInfo');
          this.storage.setItem('flightsearchInfo', JSON.stringify(this.searchApiData), 'session');
          this.queryParamKeys = this.checkDeeplinkParmsCid(this.queryParamKeys);
          if (this.getRequestType(queryParameterString) == 'SEARCH' && !getStorageData('flightResults')) {
            this.storage.setItem('flightsearchInfo', JSON.stringify(this.searchApiData), 'session');
            this.router.navigate(['/flights/results'], { queryParams: this.queryParamKeys });
            this.triggerSearch_API = true;
          }
          if (!this.triggerSearch_API) {
            this.performSearch(searchData, userEmail, businessUserToken);
          }
        }
      } else {
        if (this.isBrowser) {
          window.location.reload();
        }
      }
    }, 1500);
  }

  // TODO move to app component when it exists
  private performSearch(searchData: SearchData, userEmail: string, businessToken: string, dataToken?: DataToken): void {
    const normalizedSearchData = normalizeSearchData(searchData);
    const startSearchDate = new Date();
    let searchResultsData: any;
    this.bookingCountdownService.stopBookingFlowCountdown();
    this.queryParamKeys = this.checkDeeplinkParmsCid(this.queryParamKeys);
    setTimeout(() => {
      this.searchService.performFlightSearch(normalizedSearchData, userEmail, businessToken, dataToken, true).subscribe(
        (searchResults) => {
          searchResultsData = searchResults;
          removeStorageData('flightResults');
          setStorageData('flightResults', JSON.stringify(searchResults));
          const isPriceDeepLink = get(searchResults, 'priceResponse');
          this.storage.setItem('flightsearchInfo', JSON.stringify(this.searchApiData), 'session');
          this.bookingCountdownService.resetCountdown();
          if (
            this.deepLinkType === 'PRICE' &&
            searchResultsData &&
            !searchResultsData.errors &&
            searchResultsData.priceResponse &&
            !searchResultsData.priceResponse.errors
          ) {
            this.getPriceResponse(searchResultsData);
          } else if (this.deepLinkType === 'PRICE') {
            this.getPricing(this.queryParamKeys, searchResultsData);
          }

          if (!isPriceDeepLink) {
            // TO DO
          } else {
            const priceResult = parsePriceResult(searchResults.priceResponse);
            const outboundItinerary = head(priceResult.itineraries);

            const inboundItinerary =
              priceResult.itineraries !== null && priceResult.itineraries.length > 1
                ? last(priceResult.itineraries)
                : null;

            if (outboundItinerary == null) {
              // TO DO show warning

              return;
            }
          }
        },
        (searchError: any) => {
          this.changeSearchError(true);
          this.searchService.changeShowSpinner(false);
          this.router.navigate(['/flights/results'], { queryParams: this.queryParamKeys });
        }
      );
    }, 2000);
  }

  getPriceResponse(searchResultsData: any) {
    if (searchResultsData && searchResultsData.priceResponse && !searchResultsData.priceResponse.errors) {
      this.searchService.changeShowSpinner(false);
      this.changeIsPriceDeepLink(true);
      this.storage.removeItem('priceData');
      this.storage.setItem('priceData', JSON.stringify(searchResultsData.priceResponse), 'session');
      this.storage.setItem('products', JSON.stringify(searchResultsData.priceResponse?.products), 'session');
      this.bookingService.changeProducts(searchResultsData.priceResponse?.products);
      this.googleTagManagerServiceService.pushGFPriceAccuracyTag(
        'view_item',
        searchResultsData?.priceResponse?.totalAmount,
        searchResultsData?.priceResponse?.currencyCode
      );
      this.pushToMainCartData(searchResultsData?.priceResponse);
      this.queryParamKeys = this.checkDeeplinkParmsCid(this.queryParamKeys);
      if (searchResultsData.isIntl) {
        this.storage.removeItem('selectedFlight');
        this.storage.setItem('selectedFlight', JSON.stringify(searchResultsData.priceResponse.itineraries[0]), 'session');
      } else {
        this.rePriceData = {
          data: searchResultsData.data,
          outboundItineraryId: searchResultsData.priceResponse.selectedOutboundItineraryId,
          inboundItineraryId: searchResultsData.priceResponse.selectedInboundItineraryId,
        };
        this.storage.removeItem('selectedDomesticFlight', 'session');
        this.storage.setItem('selectedDomesticFlight', JSON.stringify(this.rePriceData), 'session');
      }
      this.router.navigate(['/booking/flight-details'], { queryParams: this.queryParamKeys });
    }
  }

  getPricing(paramKeys: any, searchResults: any) {
    const flightslist = searchResults;
    let outBoundId: any;
    let inBoundId: any;
    if (flightslist) {
      if (flightslist.outboundItineraries.length && flightslist.inboundItineraries.length) {
        outBoundId = this.getOutboundId(paramKeys, searchResults);
        inBoundId = this.getInboundId(paramKeys, searchResults);

        const selectedDomesticFlight = {
          outboundItineraries: this.outBoundSelected,
          inboundItineraries: this.inBoundSelected,
        };
        this.storage.setItem('selectedDomesticFlight', JSON.stringify(selectedDomesticFlight), 'session');
        this.rePriceData = {
          data: flightslist.data,
          outboundItineraryId: outBoundId,
          inboundItineraryId: inBoundId,
        };
      } else {
        this.getFlightNumber(paramKeys, searchResults);
      }

      this.getFlightPrice();
    }
  }

  getFlightPrice() {
    this.queryParamKeys = this.checkDeeplinkParmsCid(this.queryParamKeys);
    this.bookingService.getPricing(this.rePriceData).subscribe(
      (res: any) => {
        if (!res.errors) {
          this.searchService.changeShowSpinner(false);
          this.router.navigate(['/booking/flight-details'], { queryParams: this.queryParamKeys });
          this.storage.removeItem('priceData');
          this.storage.setItem('priceData', JSON.stringify(res), 'session');
          this.storage.setItem('products', JSON.stringify(res?.products), 'session');
          this.bookingService.changeProducts(res?.products);
          this.storage.setItem('standardAmount', JSON.stringify(res.totalAmount), 'session');
          this.googleTagManagerServiceService.pushGFPriceAccuracyTag('view_item', res?.totalAmount, res?.currencyCode);
          res && this.pushToMainCartData(res);
        } else if (res.errors) {
          this.router.navigate(['/booking/flight-details'], { queryParams: this.queryParamKeys });
          this.changePriceError('priceResponseErrors');
          this.searchService.changeShowSpinner(false);
        }
      },
      (error) => {
        if (error) {
          if ((error.error && error.error.code === 404) || error.error.code === 500) {
            this.googleTagManagerServiceService.pushGFPriceAccuracyTagError(
              'view_item',
              'FLIGHT_NOT_FOUND',
              error.error
            );
            this.searchService.changeShowSpinner(false);
            this.changePriceError('priceApiFailed');
            this.router.navigate(['/flights/results'], { queryParams: this.queryParamKeys });
            return;
          }
        }
      }
    );
  }

  private getAirlineName = (airlineCode: string) => this.flightsResultsResponse?.airlineNames[airlineCode];

  pushToMainCartData(res: any) {
    /**
     * start of addToCart: mainCart[]
     */
    this.flightsearchInfo = JSON.parse(this.storage.getItem('flightsearchInfo', 'session'));
    if (this.flightsearchInfo) {
      const originAirport = this.flightsearchInfo.itineraries[0].dept_city.code;
      const destinationAirport = this.flightsearchInfo.itineraries[0].arr_city.code;
      const flightRoute = `${this.flightsearchInfo.itineraries[0]?.dept_city.iata}-${this.flightsearchInfo.itineraries[0]?.arr_city.iata}`;
      const flightSector = `${this.flightsearchInfo.itineraries[0]?.dept_city.iata}_${this.flightsearchInfo.itineraries[0]?.arr_city.iata}`;
      const cityPairName = `${this.flightsearchInfo.itineraries[0]?.dept_city.city}-${this.flightsearchInfo.itineraries[0]?.arr_city.city}`;
      const pax =
        this.flightsearchInfo.travellers?.adults +
        this.flightsearchInfo.travellers?.youngAdults +
        this.flightsearchInfo.travellers?.children +
        this.flightsearchInfo.travellers?.infants;

      const airlineNames = res?.airlineNames || undefined;
      // const airline = airlineNames
      //   ? Object.values(airlineNames)[0]
      //   : this.getAirlineName(getFirstOdoAirlineCode(head(res?.itineraries)));

      const airline = '';

      const mainCart = {
        currency: res.currencyCode,
        tripType: this.flightsearchInfo.tripType,
        airlineName: airline,
        route: flightRoute,
        sector: flightSector,
        cityPair: cityPairName,
        originAirportCode: originAirport,
        destinationAirportCode: destinationAirport,
        departureDate: this.flightsearchInfo.itineraries[0]?.dept_date,
        destinationIATA: this.flightsearchInfo.itineraries[0]?.arr_city.iata,
        destinationCityName: this.flightsearchInfo.itineraries[0]?.arr_city.city,
        originIATA: this.flightsearchInfo.itineraries[0]?.dept_city.iata,
        originCityName: this.flightsearchInfo.itineraries[0].dept_city.city,
        returnDate: this.flightsearchInfo.tripType ? this.flightsearchInfo.itineraries[0]?.arr_date : undefined,
        numberAdults: this.flightsearchInfo.travellers?.adults,
        numberyoungAdults: this.flightsearchInfo.travellers?.youngAdults,
        numberChildren: this.flightsearchInfo.travellers?.children,
        numberInfants: this.flightsearchInfo.travellers?.infants,
        paxTotal: pax,
        flightPrice: res?.totalAmount - res?.fareBreakdown?.taxAmount,
        taxAmount: res?.fareBreakdown?.taxAmount,
        transactionTotal: res?.totalAmount,
      };

      this.googleTagManagerServiceService.pushAddToCartData(mainCart, res?.itineraries);
    }
  }

  getFlightNumber(paramKeys: any, searchResults: any) {
    let flightNumbers: any = [];
    let outBoundId: any;
    const flightslist = searchResults;
    flightNumbers = paramKeys?.outbound_flight_number?.split(',');
    for (let i in flightslist.itineraries) {
      for (let j in flightslist.itineraries[i].odoList) {
        for (let x in flightslist.itineraries[i].odoList[j].segments) {
          for (let y in flightNumbers) {
            if (flightNumbers[y] === flightslist.itineraries[i].odoList[j].segments[x].flightNumber) {
              this.storage.setItem('selectedFlight', JSON.stringify(flightslist.itineraries[i]), 'session');
              outBoundId = flightslist.itineraries[i].id;
            } else {
              outBoundId = this.findCheapestFlightByAirline(flightNumbers[y]?.substring(0, 2));
            }
          }
        }
      }
    }
    this.rePriceData = {
      data: flightslist.data,
      outboundItineraryId: outBoundId,
    };
  }

  /* returns the ID of the cheapest flight for the specified airline code */
  findCheapestFlightByAirline(airlineCode: string) {
    const itineraries = JSON.parse(getStorageData('flightResults'))?.itineraries;
    const filteredFlights = itineraries?.filter((itinerary: any) =>
      itinerary.odoList[0]?.segments?.some((segment: any) => segment.airlineCode === airlineCode)
    );
    if (filteredFlights.length > 0) {
      return this.cheapestFlightId(filteredFlights);
    } else {
      return this.cheapestFlightId(itineraries);
    }
  }

  cheapestFlightId(filteredFlights: any) {
    if (filteredFlights) {
      const minAmount = Math.min(...filteredFlights.map((flight: any) => flight.amount));
      const cheapestFlight = filteredFlights.find((flight: any) => flight.amount === minAmount);
      return cheapestFlight.id;
    }
  }

  /**It checks the outbound flight number from the outbound itins list and retrieves the itinerary and itinerary id */
  getOutboundId(paramKeys: any, searchResults: any) {
    const flightslist = searchResults;
    const matchingItinerary = flightslist.outboundItineraries.find((itinerary: any) =>
      itinerary.odoList.some((odo: any) =>
        odo.segments.some((segment: any) => paramKeys.outbound_flight_number === segment.flightNumber)
      )
    );
    if (matchingItinerary) {
      this.outBoundSelected = matchingItinerary;
      return matchingItinerary.id;
    }
  }
  /**It checks the outbound flight number from the inbound itins list and retrieves the itinerary and itinerary id */
  getInboundId(paramKeys: any, searchResults: any) {
    const flightslist = searchResults;
    const matchingItinerary = flightslist.inboundItineraries.find((itinerary: any) =>
      itinerary.odoList.some((odo: any) =>
        odo.segments.some((segment: any) => paramKeys.inbound_flight_number === segment.flightNumber)
      )
    );
    if (matchingItinerary) {
      this.inBoundSelected = matchingItinerary;
      return matchingItinerary.id;
    }
  }

  /**checking the deeplink for correlation id */
  checkDeeplinkParmsCid(queryParamKeys: any) {
    if (!queryParamKeys?.correlation_id) {
      queryParamKeys = {
        ...queryParamKeys,
        correlation_id: this.sessionUtils.getCorrelationId(),
      };
      return queryParamKeys;
    } else {
      return queryParamKeys;
    }
  }
}
