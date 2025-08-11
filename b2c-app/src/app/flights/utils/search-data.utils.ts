import { every, first, includes, isArray, isEmpty, isEqual, isFunction, last, map } from 'lodash';

import { CABIN_CLASSES } from './../models/cabin-classes.constant';
import { TRIP_TYPES } from './../models/trip-types';
import { SearchData } from './../models/search/search-data.model';
import { SearchItinerary } from './../models/search/search-itinerary.model';
import { ROUTE_TYPES } from './../models/route-types.constant';
import { v4 as uuidv4 } from 'uuid';
import defaultAirports from './../models/defaultAirports.json';
import locationInfo from '../../../translations/common-data-en.json';
import { formatDate } from '@angular/common';
import { UntypedFormArray } from '@angular/forms';
import { CurrencyCodePipe } from '@app/_shared/pipes/currency-code.pipe';
import { getCountriesArray } from '@app/booking/utils/traveller.utils';

/* TODO: Remove `any` from allowed argument types once NG1 is dead */
function getCabinClass(searchData: SearchData | any): string {
  return isEmpty(searchData.moreOptions) ||
    isEmpty(searchData.moreOptions.preferredCabins) ||
    isEmpty(searchData.moreOptions.preferredCabins.value)
    ? CABIN_CLASSES.economy.value
    : searchData.moreOptions.preferredCabins.value;
}

function getDepartDate(searchData: SearchData): string {
  if (!hasItineraries(searchData)) {
    return;
  }

  return searchData.itineraries[0].departDate;
}

function getReturnDate(searchData: SearchData): string {
  if (!hasItineraries(searchData) || searchData.tripType === TRIP_TYPES.oneWay) {
    return;
  }

  return searchData.tripType === TRIP_TYPES.multiCity
    ? last(searchData.itineraries).returnDate
    : first(searchData.itineraries).returnDate;
}

function getDestination(searchData: SearchData) {
  if (!hasItineraries(searchData)) {
    return;
  }

  return searchData.tripType === TRIP_TYPES.multiCity
    ? last(searchData.itineraries).destination
    : first(searchData.itineraries).destination;
}

function getDestinationCity(searchData: SearchData): string {
  const destination = getDestination(searchData);

  return destination && destination.value ? destination.value.city : undefined;
}

function getDestinationCode(searchData: SearchData): string {
  const destination = getDestination(searchData);

  return destination ? destination.value.code : undefined;
}

function getDestinationCountryIata(searchData: SearchData): string {
  const destination = getDestination(searchData);

  return destination ? destination.value.countryIata : undefined;
}

function getOrigin(searchData: SearchData) {
  if (!hasItineraries(searchData)) {
    return;
  }

  return searchData.itineraries[0].origin;
}

function getOriginCity(searchData: SearchData): string {
  const origin = getOrigin(searchData);

  return origin && origin.value ? origin.value.city : undefined;
}

function getOriginCode(searchData: SearchData): string {
  const origin = getOrigin(searchData);

  return origin ? origin.value.code : undefined;
}

function getOriginCountryIata(searchData: SearchData): string {
  const origin = getOrigin(searchData);

  return origin ? origin.value.countryIata : undefined;
}

function getTravellerCount(searchData: SearchData): number {
  return searchData.travellers.adults + searchData.travellers.children + searchData.travellers.infants;
}

function hasItineraries(searchData: SearchData): boolean {
  return !!searchData.itineraries && isArray(searchData.itineraries) && searchData.itineraries.length > 0;
}

function getItineraryRouteType(searchItinerary: SearchItinerary, currentCountryIata: string): string {
  if (
    !searchItinerary ||
    !searchItinerary.origin ||
    // Backwards compatibility for NG1, can just use the isBlank() method when NG1 is gone
    (isFunction(searchItinerary.origin.isBlank) ? searchItinerary.origin.isBlank() : searchItinerary.origin.isBlank) ||
    !searchItinerary.destination ||
    // Backwards compatibility for NG1, can just use the isBlank() method when NG1 is gone
    (isFunction(searchItinerary.destination.isBlank)
      ? searchItinerary.destination.isBlank()
      : searchItinerary.destination.isBlank)
  ) {
    return;
  }

  return searchItinerary.origin.value.countryIata !== currentCountryIata ||
    searchItinerary.destination.value.countryIata !== currentCountryIata ||
    searchItinerary.destination.value.countryIata !== searchItinerary.origin.value.countryIata
    ? ROUTE_TYPES.international
    : ROUTE_TYPES.domestic;
}

/**
 * Checks whether a search is considered 'international' or 'domestic' based on each itinerary.
 * A one way or return search will be determined by the one itinerary's routeType.
 * If any itinerary in a multi city search is considered 'international', the whole search is
 * considered 'international'. Otherwise it is considered a 'domestic' search.
 * @param searchData SearchData
 * @param currentCountryIata string
 */
function getSearchRouteType(searchData: SearchData, currentCountryIata: string): string {
  if (!hasItineraries(searchData)) {
    return;
  }

  if (searchData.tripType !== TRIP_TYPES.multiCity) {
    return getItineraryRouteType(searchData.itineraries[0], currentCountryIata);
  }

  const itineraryRouteTypeList = map(searchData.itineraries, (itinerary) =>
    getItineraryRouteType(itinerary, currentCountryIata)
  );

  // If any itinerrary in a multicity search is international, the whole search route is considered international
  return includes(itineraryRouteTypeList, ROUTE_TYPES.international) ? ROUTE_TYPES.international : ROUTE_TYPES.domestic;
}

function shouldShowPerPersonPrice(searchData: SearchData): boolean {
  return every(searchData.travellers, (travellerCount: number, travellerType: string) => {
    return travellerCount <= 0 || (travellerCount > 1 && travellerType === 'adults');
  });
}

/**
 * Checks if valid multi city search could be treated as a return or oneway search
 * based on the number of itineraries and locations chosen. Strips excess itineraries
 * afterwards, if necessary
 */
function normalizeSearchData(searchData: SearchData): SearchData {
  if (searchData && searchData.tripType === TRIP_TYPES.multiCity) {
    if (searchData.itineraries.length === 1) {
      searchData.tripType = TRIP_TYPES.oneWay;
    } else if (
      searchData.itineraries.length === 2 &&
      searchData.itineraries[0].origin &&
      searchData.itineraries[0].origin.display &&
      isEqual(searchData.itineraries[0].origin.display, searchData.itineraries[1].destination.display) &&
      isEqual(searchData.itineraries[0].destination.display, searchData.itineraries[1].origin.display)
    ) {
      searchData.itineraries[0].returnDate = searchData.itineraries[1].departDate;
      searchData.tripType = TRIP_TYPES.return;
    }
  }

  if (searchData && searchData.tripType !== TRIP_TYPES.multiCity && searchData.itineraries.length > 1) {
    searchData.itineraries = [searchData.itineraries[0]];
  }
  return searchData;
}

function getItineraries(itineraries: any) {
  let itineraryList = [];
  if (itineraries) {
    for (let i = 0; i < itineraries.length; i++) {
      let Itinerary = {
        id: uuidv4(),
        origin: {
          value: itineraries[i].dept_city,
          display: itineraries[i].dept_city.city + ' ' + itineraries[i].dept_city.airport,
        },
        destination: {
          value: itineraries[i].arr_city,
          display: itineraries[i].arr_city.city + ' ' + itineraries[i].arr_city.airport,
        },
        departDate: itineraries[i].dept_date,
        returnDate: itineraries[i].arr_date,
      };
      itineraryList.push(Itinerary);
    }
  }
  return itineraryList;
}

function fetchFlightsJson(searchData: any) {
  if (!searchData) {
    return null;
  }
  const locale: any = [];
  const flightData = {
    tripType: searchData.tripType,
    isNewSession: true,
    travellers: searchData.travellers,
    moreOptions: {
      preferredCabins: {
        display: searchData.cabinClass.display,
        value: searchData.cabinClass.value,
      },
      isCalendarSearch: false,
    },
    outboundFlightNumber: '',
    inboundFlightNumber: '',
    itineraries: getItineraries(searchData.itineraries),
    searchIdentifier: '',
    locale: {
      country: searchData.country,
      currentLocale: 'en',
      locales: locale,
    },
    userProfileUsername: '',
    businessLoggedOnToken: '',
    isDeepLink: false,
  };
  return flightData;
}

function getDefaultAirports(language: any) {
  let airports = defaultAirports;

  switch (language) {
    case 'ZA': {
      return airports.defalutAirports[0]['en-ZA'];
    }
    case 'NG': {
      return airports.defalutAirports[0]['en-NG'];
    }
    case 'FS': {
      return airports.defalutAirports[0]['en-ZA'];
    }
    case 'TB': {
      return airports.defalutAirports[0]['en-ZA'];
    }
    case 'CT': {
      return airports.defalutAirports[0]['en-ZA'];
    }
    case 'MM': {
      return airports.defalutAirports[0]['en-ZA'];
    }
    case 'SA': {
      return airports.defalutAirports[0]['en-SA'];
    }
    case 'IB': {
      return airports.defalutAirports[0]['en-ZA'];
    }
    case 'NA': {
      return airports.defalutAirports[0]['en-NA'];
    }
    case 'BW': {
      return airports.defalutAirports[0]['en-BW'];
    }
    case 'ZW': {
      return airports.defalutAirports[0]['en-ZW'];
    }
    case 'TR': {
      return airports.defalutAirports[0]['en-TR'];
    }
    case 'EG': {
      return airports.defalutAirports[0]['en-EG'];
    }
    case 'KE': {
      return airports.defalutAirports[0]['en-KE'];
    }
    case 'BH': {
      return airports.defalutAirports[0]['en-BH'];
    }
    case 'OM': {
      return airports.defalutAirports[0]['en-OM'];
    }
    case 'QA': {
      return airports.defalutAirports[0]['en-QA'];
    }
    case 'TZ': {
      return airports.defalutAirports[0]['en-TZ'];
    }
    case 'KW': {
      return airports.defalutAirports[0]['en-KW'];
    }
    case 'AE': {
      return airports.defalutAirports[0]['en-AE'];
    }
    case 'MA': {
      return airports.defalutAirports[0]['en-MA'];
    }
    case 'ABSA': {
      return airports.defalutAirports[0]['en-ZA'];
    }
     
    default: {
      return airports.defalutAirports[0].default;
    }
  }
}

function locationWarning(location: string): string | null {
  let loctions = locationInfo as any;

  switch (location) {
    case 'PRY': {
      return loctions.locationInfo[0]['locationWarnings'].PRY;
    }
    case 'AME': {
      return loctions.locationInfo[0]['locationWarnings'].AME;
    }
    case 'TSF': {
      return loctions.locationInfo[0]['locationWarnings'].TSF;
    }
    case 'BWK': {
      return loctions.locationInfo[0]['locationWarnings'].BWK;
    }
    case 'BOB': {
      return loctions.locationInfo[0]['locationWarnings'].BOB;
    }
    case 'SWP': {
      return loctions.locationInfo[0]['locationWarnings'].SWP;
    }

    default: {
      return null;
    }
  }
}
/*It checks the passed argument date is future date or not */
function isFutureDate(idate: any) {
  var today = new Date().getTime(),
    idate = idate.split('/');
  idate = new Date(idate[2], idate[1] - 1, idate[0]).getTime();
  return today - idate < 0 ? true : false;
}
function getDate(date: any) {
  let formattedDate: any;
  formattedDate = formatDate(date, 'dd-MM-yyyy', 'en_US');
  return formattedDate;
}
/**setting the passport details values based on passenger settings*/
function setPaxPassportDetails(
  travellerForm: UntypedFormArray,
  index: number,
  pax: any,
  psExpDate: any,
  paxNationality: any,
  paxCountry: any
) {
  let psNumber = pax.passport.passportNumber;
  let paxPsNum = psNumber.split(' ').join('');
  const formattedTxt = paxPsNum.replace(/[\u0300-\u036f]/g, '');
  if (psExpDate?.day) {
    travellerForm.controls[index].get('psExpDay').setValue(psExpDate.day);
  }
  if (psExpDate?.month) {
    travellerForm.controls[index].get('psExpMonth').setValue(psExpDate.month);
  }
  if (psExpDate?.year) {
    travellerForm.controls[index].get('psExpYear').setValue(psExpDate.year);
  }
  if (psExpDate) {
    travellerForm.controls[index].get('passportExpiry').setValue(psExpDate);
  }
  travellerForm.controls[index].get('passportNumber').setValue(formattedTxt);
  travellerForm.controls[index].get('nationality').setValue(paxNationality?.isoCode);
  travellerForm.controls[index].get('passPortCountry').setValue(paxCountry?.isoCode);
}
/**converts the passed date in to string with delimeter*/
function formatExpDate(date: any): string {
  if (date) {
    let DELIMITER = '-';
    let formattedDate =
      convertDate(date.year) + DELIMITER + convertDate(date.month) + DELIMITER + convertDate(date.day);
    return formattedDate;
  }
}
function convertDate(n: any) {
  return n < 10 ? '0' + n : n;
}

function getDatePrice(date: any, priceCalenderRes: any) {
  const filterPipe = new CurrencyCodePipe();
  let year = date.year;
  let month = date.month <= 9 ? '0' + date.month : date.month;
  let day = date.day <= 9 ? '0' + date.day : date.day;
  let finalDate = year + '-' + month + '-' + day;
  let priceList = priceCalenderRes;
  for (var i in priceList) {
    if (priceList[i].departure_date === finalDate) {
      let priceInfo = {
        currency: filterPipe.transform(priceList[i].display_currency_code),
        amount: priceCalenderRes[i].min_price_display,
      };
      return priceInfo;
    }
  }
}
/**It returns popular destination and arrival cities objects*/
function getPopularCitiesObj(trip: string, searchRoute: any) {
  const countriesArray = getCountriesArray();
  return {
    airport: 'All Airports',
    type: 'city',
    city: trip == 'arrival' ? searchRoute.destination_city_name : searchRoute.departure_city_name,
    iata: trip == 'arrival' ? searchRoute.destination_code : searchRoute.departure_code,
    code: trip == 'arrival' ? searchRoute.destination_code : searchRoute.departure_code,
    country: (() => {
      for (let i in countriesArray) {
        if (trip == 'arrival' && countriesArray[i].isoCode === searchRoute.destination_country_code) {
          return countriesArray[i].name;
        } else if (trip == 'departure' && countriesArray[i].isoCode === searchRoute.departure_country_code) {
          return countriesArray[i].name;
        }
      }
    })(),
    countryIata: trip == 'arrival' ? searchRoute.destination_country_code : searchRoute.departure_country_code,
    locationId:
      trip == 'arrival'
        ? searchRoute.destination_code + '_' + 'city' + '_' + searchRoute.destination_code
        : searchRoute.departure_country_code + '_' + 'city' + '_' + searchRoute.departure_country_code,
  };
}

function isInternational(searchItinerary: any): boolean {
  const itineraries = searchItinerary.itineraries;

  // Check if any itinerary has a different departure and arrival country
  for (const itinerary of itineraries) {
    const departureCountry = itinerary.dept_city?.countryIata;
    const arrivalCountry = itinerary.arr_city?.countryIata;

    if (departureCountry !== arrivalCountry) {
      return true; // International
    }
  }

  return false; // Domestic
}

export {
  getCabinClass,
  getDepartDate,
  getReturnDate,
  getDestination,
  getDestinationCity,
  getDestinationCode,
  getDestinationCountryIata,
  getOrigin,
  getOriginCity,
  getOriginCode,
  getOriginCountryIata,
  getTravellerCount,
  hasItineraries,
  getItineraryRouteType,
  getSearchRouteType,
  shouldShowPerPersonPrice,
  normalizeSearchData,
  fetchFlightsJson,
  getDefaultAirports,
  locationWarning,
  getPopularCitiesObj,
  isFutureDate,
  getDate,
  setPaxPassportDetails,
  formatExpDate,
  getDatePrice,
  isInternational,
};
