import { every, get, includes, isEmpty, map, replace, some, toLower, forEach, union, keyBy } from 'lodash';
import {
  getQueryParameterBooleanValue,
  getQueryParameterIntegerValue,
  getQueryParameterStringValue,
} from './query-parameters.utils';
import { formatMomentNoLocale, parseDeeplinkMomentExact } from './date-utils';
import { SearchData } from './../../flights/models/search/search-data.model';
import { SearchItinerary } from './../../flights/models/search/search-itinerary.model';
import { TRIP_TYPES } from './../../flights/models/trip-types';
import { SigninSource } from './signin-source.enum';

const SEARCH_ITINERARY_KEYS = ['from', 'to', 'depart_date', 'return_date'];
const SEARCH_TRAVELLERS_KEYS = ['adults', 'children', 'infants'];
const SEARCH_FLAG_KEYS = ['search', 'is_round_trip', 'is_flexi_ticket'];
const PRICE_FLIGHT_NUMBER_KEYS = ['outbound_flight_number', 'inbound_flight_number'];
const ACCEPTED_LOCATION_TYPES = ['city', 'airport'];
const VIEW_ITINERARY_KEYS = ['uuid'];
const DATA_TOKEN_KEYS = ['dataToken', 'dataTokenType'];
const SEARCH_IDENTIFIERS = ['search_identifier'];
const MY_ACCOUNT_QUERY_STRINGS_SEARCH_PARAMs = [
  'dept_city',
  'arr_city',
  'triptype',
  'OpenJaw',
  'query',
  'Id',
  'onlyView',
  'reference',
  'mainIndex',
  'index',
];

/**
 * https://travelstart.atlassian.net/wiki/spaces/TSIC/pages/31555605/Website+deeplinks
 */

/**
 * Looks for the query parameter keys associated with search data and returns `true` if any are
 * found, else returns `false`
 */
function hasDeepLinkSearchData(queryParameterString: string): boolean {
  return (
    hasAnyKeys(queryParameterString, SEARCH_ITINERARY_KEYS) ||
    hasAnyKeys(
      queryParameterString,
      map(SEARCH_ITINERARY_KEYS, (key) => `${key}_0`)
    ) ||
    hasAnyKeys(queryParameterString, SEARCH_TRAVELLERS_KEYS) ||
    hasAnyKeys(queryParameterString, SEARCH_FLAG_KEYS)
  );
}

/**Checking the Myaccount related query params and returns `true` if they are present else returns `false`*/
function hasMyAccountParamsInfo(queryParameterString: string): boolean {
  return hasAnyKeys(queryParameterString, MY_ACCOUNT_QUERY_STRINGS_SEARCH_PARAMs);
}

/**
 * Looks for the query parameter keys associated exclusively with price data and returns `true` if
 * any are found, else returns `false`
 */
function hasDeepLinkPriceData(queryParameterString: string): boolean {
  return hasAnyKeys(queryParameterString, PRICE_FLIGHT_NUMBER_KEYS);
}

/**
 * Looks for the query parameter keys associated exclusively with payment data and returns `true` if
 * any are found, else returns `false`
 */
function hasDeepLinkPaymentData(queryParameterString: string): boolean {
  return hasAnyKeys(queryParameterString, VIEW_ITINERARY_KEYS);
}

/**
 * Looks for the query parameter keys associated exclusively with dataTokens and returns `true` if
 * any are found, else returns `false`
 */
function hasDeepLinkDataTokens(queryParameterString: string): boolean {
  return hasAnyKeys(queryParameterString, DATA_TOKEN_KEYS);
}

/**
 * Looks for the query parameter keys associated exclusively with searchIdentifiers and returns `true` if
 * any are found, else returns `false`
 */
function hasDeepLinkSearchIdentifiers(queryParameterString: string): boolean {
  return hasAnyKeys(queryParameterString, SEARCH_IDENTIFIERS);
}

/**
 * Gets the origin object from the deeplink query parameters
 * @param itineraryIndex (optional) The current itinerary index
 * @returns the origin location data with iata and type
 */
function getDeepLinkOrigin(queryParameterString: string, itineraryIndex?: number): any {
  if (getLocationData(queryParameterString, 'from', itineraryIndex)) {
    return getLocationData(queryParameterString, 'from', itineraryIndex);
  }
}

/**
 * Gets the destination IATA string from the deeplink query parameters
 * @param itineraryIndex (optional) The current itinerary index
 * @returns the destination location data with iata  and type
 */
function getDeepLinkDestination(queryParameterString: string, itineraryIndex?: number): any {
  return getLocationData(queryParameterString, 'to', itineraryIndex);
}

/**
 * Gets the depart date string from the deeplink query parameters
 * @param itineraryIndex (optional) The current itinerary index
 * @returns The formatted date string, or empty string if no valid date found
 */
function getDeepLinkDepartDate(queryParameterString: string, itineraryIndex?: number): string {
  if (getItineraryValue(queryParameterString, 'depart_date', itineraryIndex)) {
    return getItineraryValue(queryParameterString, 'depart_date', itineraryIndex);
  }
}

/**
 * Gets the return date string from the deeplink query parameters
 * @param itineraryIndex (optional) The current itinerary index
 * @returns The formatted date string, or empty string if no valid date found
 */
function getDeepLinkReturnDate(queryParameterString: string, itineraryIndex?: number): string {
  if (getItineraryValue(queryParameterString, 'return_date', itineraryIndex)) {
    return getItineraryValue(queryParameterString, 'return_date', itineraryIndex);
  }
}

/**
 * Gets the adult count from the deeplink query parameters. Includes teen count as keeping the
 * values separate is deprecated
 * @returns The number of adults (plus teens) specified in the query parameter string
 */
function getDeepLinkAdultCount(queryParameterString: string): number {
  return getQueryParameterIntegerValue(queryParameterString, 'adults');
}
function getDeepLinkyoungAdultsCount(queryParameterString: string): number {
  return getQueryParameterIntegerValue(queryParameterString, 'youngAdults');
}
function getDeepLinkChildrenCount(queryParameterString: string): number {
  return getQueryParameterIntegerValue(queryParameterString, 'children');
}

function getDeepLinkInfantsCount(queryParameterString: string): number {
  return getQueryParameterIntegerValue(queryParameterString, 'infants');
}

function getDeepLinkPreferredCabinClass(queryParameterString: string): string {
  // In the travelstart BE DeepLinkUtil.java: `private static final String CLASS = "class"`;
  const preferredCabinClass =
    getQueryParameterStringValue(queryParameterString, 'cabin') ||
    getQueryParameterStringValue(queryParameterString, 'class');

  /*
    So there's this super weird Typescript error (TypeError: Cannot read property 'text' of undefined)
    that comes up if you try to return the toLower string without caching it in a variable first, ie.
    ```
    return toLower(getQueryParameterStringValue(queryParameterString, 'cabin'));
    ```
    Can't find anything useful online to explain why this happens so... yeah.
    According to a couple searches it could be cos I'm using a Mac, it could be cos Jasmine/Karma is
    involved (though the error is thrown during dev, not unit tests) or it could be cos it's an Angular app...
    */
  return toLower(preferredCabinClass);
}

function getDeepLinkPreferredAirline(queryParameterString: string): string {
  return getQueryParameterStringValue(queryParameterString, 'airline');
}

function isDeepLinkReturnTrip(queryParameterString: string): boolean {
  return getQueryParameterBooleanValue(queryParameterString, 'Roundtrip');
}

function isDeepLinkCalendarSearch(queryParameterString: string): boolean {
  return getQueryParameterBooleanValue(queryParameterString, 'is_flex_dates');
}

/**
 * checks for a boolean flag and returns the result. Defaults to `true` if no flag found
 * @param queryParameterString
 */
function shouldDeepLinkPerformSearch(queryParameterString: string): boolean {
  // Only explicitly setting the flag to `false` should prevent a search from being performed
  /* tslint:disable-next-line:no-boolean-literal-compare */
  return getQueryParameterBooleanValue(queryParameterString, 'search') !== false;
}

/**
 * Gets the specified outbound flight number(s) as a string
 * @returns The comma separated string of flight numbers specified, else `undefined`
 */
function getDeepLinkOutBoundFlightNumber(queryParameterString: string): string {
  return getQueryParameterStringValue(queryParameterString, 'outbound_flight_number');
}

/**
 * Gets the specified inbound flight number(s) as a string
 * @returns The comma separated string of flight numbers specified, else `undefined`
 */
function getDeepLinkInBoundFlightNumber(queryParameterString: string): string {
  return getQueryParameterStringValue(queryParameterString, 'inbound_flight_number');
}

/**
 * Gets the specified dataToken as a string
 * @returns The string representing the datatoken
 */
function getDeepLinkDataToken(queryParameterString: string): string {
  try {
    return decodeURIComponent(getQueryParameterStringValue(queryParameterString, 'dataToken'));
  } catch (error) {
    // Ignore any invalid data token
    return;
  }
}

/**
 * Gets the dataToken type as a string
 * @returns The string representing the datatoken type
 */
function getDeepLinkDataTokenType(queryParameterString: string): string {
  return getQueryParameterStringValue(queryParameterString, 'dataTokenType');
}

/**
 * Gets the searchIdentifier as a string
 * @returns The string representing the datatoken type
 */
function getDeepLinkSearchIdentifier(queryParameterString: string): string {
  return getQueryParameterStringValue(queryParameterString, 'search_identifier');
}

/**
 * Takes a query parameter string (or entire URL) and removes any query parameters related to deep link URLs
 * Takes 0.0011ms (Regex replace FTW)
 * @returns The stripped query parameter string
 */
function stripDeepLinkQueryParameters(queryParameterString: string): string {
  const supportedDeepLinkParametersRegex = /(from|to|from_type|fromType|to_type|toType|depart_date|return_date|adults|teens|children|infants|cabin|class|is_round_trip|is_flex_dates|inbound_flight_number|outbound_flight_number|search_identifier|search|airline|currency|dataToken|dataTokenType|activation-token|capture-password|code|trip_type|timestamp|show_search_options)(_[0-9])?=[^&]*&?/g;
  return replace(queryParameterString, supportedDeepLinkParametersRegex, '');
}
/**
 * Looks for the existance of values for any of the specified keys in the query parameters.
 * Returns `true` if any are found, else returns `false`
 * @param queryParameterKeys The list of relevant query parameter keys
 */
function hasAnyKeys(queryParameterString: string, queryParameterKeys: string[]): boolean {
  return some(queryParameterKeys, (key) => !isEmpty(getQueryParameterStringValue(queryParameterString, key)));
}

/**
 * Some deep links will specify an index for itinerary properties so multiple itineraries' properties may be specified.
 * This method takes an itinerary property's appropriate query parameter value and appends the relevant index value if
 * specified.
 *
 * Returns the query parameter value if found, else returns `undefined`
 * @param queryParameterKey The query parameter key of the relevant itinerary property
 * @param itineraryIndex (optional) the index of the relevant itinerary
 */
function getItineraryValue(queryParameterString: string, queryParameterKey: string, itineraryIndex?: number): string {
  if (itineraryIndex !== undefined && itineraryIndex >= 0) {
    queryParameterKey = `${queryParameterKey}_${itineraryIndex}`;
  }

  const stringValue = getQueryParameterStringValue(queryParameterString, queryParameterKey);

  if (stringValue && !includes(queryParameterKey, 'date')) {
    return stringValue;
  }
  if (stringValue) {
    return stringValue ? formatMomentNoLocale(parseDeeplinkMomentExact(stringValue)) : stringValue;
  }
}

/**
 * Gets the location data for the specified location. Finds the IATA code of the given location
 * and looks for certain brackets wrapping the value, or an explicit location type query parameter value
 *
 * default || [CPT] = 'airport'
 *
 * (CPT) = 'city'
 *
 * Example explicit location type keys: 'fromType', 'from_type', 'fromType_0', 'from_type_0', etc...
 *
 * @param queryParameterString The query parameter string (window.location.search)
 * @param queryParameterKey The query parameter key of the relevant itinerary property
 * @param itineraryIndex (optional) the index of the relevant itinerary
 */
function getLocationData(queryParameterString: string, queryParameterKey: string, itineraryIndex?: number): any {
  const squareBracketsRegex = /\[|\]/g;
  const roundBracketsRegex = /\(|\)/g;
  let locationString = getItineraryValue(queryParameterString, queryParameterKey, itineraryIndex);
  let locationType = 'airport';

  if (!locationString) {
    return;
  }

  if (locationString && squareBracketsRegex.test(locationString)) {
    locationType = 'city';
    locationString = replace(locationString, squareBracketsRegex, '');
  } else if (roundBracketsRegex.test(locationString)) {
    locationString = replace(locationString, roundBracketsRegex, '');
  }

  const explicitLocationType =
    getItineraryValue(queryParameterString, `${queryParameterKey}Type`, itineraryIndex) ||
    getItineraryValue(queryParameterString, `${queryParameterKey}_type`, itineraryIndex);

  if (explicitLocationType) {
    const explicitLocationTypeLower = toLower(explicitLocationType);
    if (includes(ACCEPTED_LOCATION_TYPES, explicitLocationTypeLower)) {
      locationType = explicitLocationTypeLower;
    }
  }

  return {
    iata: locationString,
    type: locationType,
  };
}

function buildSearchDeepLink(searchData: SearchData): string {
  // Guard for lodash#every:
  // This method returns true for empty collections because everything is true of elements of empty collections.
  if (isEmpty(searchData.itineraries)) {
    return;
  }

  let searchString: string = '/search?search=true';

  const isItinerariesValid = every(searchData.itineraries, (itinerary: SearchItinerary, index: number) => {
    if (
      !get(itinerary, 'origin.value.code') ||
      !get(itinerary, 'origin.value.type') ||
      !get(itinerary, 'destination.value.code') ||
      !get(itinerary, 'destination.value.type') ||
      !itinerary.departDate
    ) {
      return false;
    }

    /**
     * Build itinerary string
     */
    searchString += `&from_${index}=${itinerary.origin.value.code}`;
    searchString += `&from_type_${index}=${itinerary.origin.value.type}`;
    searchString += `&to_${index}=${itinerary.destination.value.code}`;
    searchString += `&to_type_${index}=${itinerary.destination.value.type}`;
    searchString += `&depart_date_${index}=${itinerary.departDate}`;

    if (itinerary.returnDate && searchData.tripType === TRIP_TYPES.return && index === 0) {
      searchString += `&from_1=${itinerary.destination.value.code}`;
      searchString += `&from_type_1=${itinerary.destination.value.type}`;
      searchString += `&to_1=${itinerary.origin.value.code}`;
      searchString += `&to_type_1=${itinerary.origin.value.type}`;
      searchString += `&depart_date_1=${itinerary.returnDate}`;
    }

    return true;
  });

  if (!isItinerariesValid) {
    return;
  }

  searchString += `&adults=${searchData.travellers.adults}`;

  if (get(searchData, 'travellers.children')) {
    searchString += `&children=${searchData.travellers.children}`;
  }

  if (get(searchData, 'travellers.infants')) {
    searchString += `&infants = ${searchData.travellers.infants}`;
  }

  if (get(searchData, 'moreOptions.preferredCabins.value')) {
    searchString += `&class=${searchData.moreOptions.preferredCabins.value}`;
  }

  return (searchString += '&');
}

function getBusinessToken(authDetails: any): string {
  if (!authDetails || authDetails.signinSource !== SigninSource.BUSINESS) {
    return null;
  }

  return authDetails.userToken;
}

// TODO this might need to take `priceResponse: PriceResponse`
function parsePriceResult(priceResponse: any) {
  return {
    ...priceResponse,
    // Index baggage options and products for quicker access
    indexedBaggageOptions: priceResponse.baggageOptions
      ? indexPriceResultBaggage(priceResponse.baggageOptions.baggagePerPassenger)
      : null,
    indexedProducts: indexPriceResultProducts(priceResponse.products),
  };
}

function indexPriceResultBaggage(baggageOptions: any): { [baggageOptionId: number]: any } {
  if (isEmpty(baggageOptions)) {
    return {};
  }

  return keyBy(baggageOptions, 'id');
}

function indexPriceResultProducts(products: any): { [productId: string]: any } {
  let parsedProducts = <any>[];
  forEach(products, (product: any) => {
    parsedProducts = product.isNestedProduct
      ? union(parsedProducts, product.childProducts)
      : [...parsedProducts, product];
  });

  return keyBy(parsedProducts, 'id');
}

function getQueryParamSourceValue() {
  if (sessionStorage.getItem('queryStringParams')) {
    let deeplinkValues = JSON.parse(sessionStorage.getItem('queryStringParams'));
    if (deeplinkValues['cpysource']) {
      return deeplinkValues['cpysource'];
    } else if (deeplinkValues['cpy_source'] && Array.isArray(deeplinkValues['cpy_source'])) {
      return deeplinkValues['cpy_source'][0];
    } else if (deeplinkValues['cpy_source']) {
      return deeplinkValues['cpy_source'];
    }
  }
}

function getQueryStringParams(): boolean | undefined {
  if (typeof window !== 'undefined' && typeof sessionStorage !== 'undefined') {
    const storedParams = sessionStorage.getItem('queryStringParams');
    if (storedParams) {
      try {
        const deeplinkparams = JSON.parse(storedParams);
        if ((deeplinkparams && deeplinkparams.cpysource) || deeplinkparams.cpy_source) {
          return true;
        }
      } catch (e) {
        console.error('Invalid JSON in sessionStorage:', e);
      }
    }
  }
  return false;
}

/**
 * Takes a query parameter value and if parameter value is array we can consider first value of array.
 */
function getAuthBookStringParameters(paramValue: any) {
  if (paramValue) {
    if (Array.isArray(paramValue)) {
      return paramValue[0];
    } else {
      return paramValue;
    }
  } else {
    return '';
  }
}
/**Checking the myaccount related query params and deleting them */
function checkMyAccountParams(queryStringKeys: any) {
  let queryParamsToRemove = MY_ACCOUNT_QUERY_STRINGS_SEARCH_PARAMs;
  const queryParams = { ...queryStringKeys };
  for (let x in queryParamsToRemove) {
    delete queryParams[queryParamsToRemove[x]];
  }
  return queryParams;
}
/**Removing the search params */
function updateQueryString(paramPath: any) {
  const url = stripDeepLinkQueryParameters(paramPath);
  const queryString = new URLSearchParams(url.split('?')[1]);
  let queryParamsObject: any = {};
  queryString.forEach((value, key) => {
    queryParamsObject[key] = value;
  });
  sessionStorage.removeItem('queryStringParams');
  sessionStorage?.setItem('queryStringParams', JSON.stringify(queryParamsObject));
  clearEmptyQueryParams();
  return queryParamsObject;
}
/**
 * Checks if 'queryStringParams' in session storage is empty and removes it if true.
 */
function clearEmptyQueryParams() {
  const qParams = JSON?.parse(sessionStorage?.getItem('queryStringParams'));
  if (Object.keys(qParams)?.length == 0) {
    sessionStorage.removeItem('queryStringParams');
  }
}

export {
  hasDeepLinkSearchData,
  hasDeepLinkPriceData,
  hasDeepLinkPaymentData,
  hasDeepLinkDataTokens,
  hasDeepLinkSearchIdentifiers,
  getDeepLinkOrigin,
  getDeepLinkDestination,
  getDeepLinkDepartDate,
  getDeepLinkReturnDate,
  getDeepLinkAdultCount,
  getDeepLinkChildrenCount,
  getDeepLinkInfantsCount,
  getDeepLinkPreferredAirline,
  getDeepLinkPreferredCabinClass,
  getDeepLinkDataToken,
  getDeepLinkDataTokenType,
  getDeepLinkSearchIdentifier,
  isDeepLinkReturnTrip,
  isDeepLinkCalendarSearch,
  shouldDeepLinkPerformSearch,
  getDeepLinkOutBoundFlightNumber,
  getDeepLinkInBoundFlightNumber,
  stripDeepLinkQueryParameters,
  buildSearchDeepLink,
  getBusinessToken,
  parsePriceResult,
  getQueryParamSourceValue,
  getQueryStringParams,
  getAuthBookStringParameters,
  getDeepLinkyoungAdultsCount,
  hasMyAccountParamsInfo,
  checkMyAccountParams,
  updateQueryString,
};
