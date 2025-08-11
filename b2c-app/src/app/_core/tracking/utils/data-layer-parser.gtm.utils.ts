import { forEach, head, isEmpty, last, map, round, upperCase, zipObject, find } from 'lodash';
import moment from 'moment';

import { GTM_DATA_LAYER_KEYS } from './../models/gtm-data-layer-keys.constant';
import { TRIP_TYPES } from '../models/trip-types';
import {
  getTravellerCount,
  getCabinClass,
  hasItineraries,
  getDepartDate,
  getReturnDate,
  getSearchRouteType,
} from './../../../flights/utils/search-data.utils';
import { MainCart, TravellerCart, PaymentCart } from '../models/cart-tracking.model';
import { PRODUCT } from './../models/product.constants';
import { Odo } from './../models/odo.model';

function getCleanDataLayerObject(): any {
  // Return an object with all included properties set to `undefined`
  return zipObject([
    GTM_DATA_LAYER_KEYS.AFFILIATE_ID,
    GTM_DATA_LAYER_KEYS.AIRLINE_NAME,
    GTM_DATA_LAYER_KEYS.ARRIVAL_TIME,
    GTM_DATA_LAYER_KEYS.BIRTH_DATE,
    GTM_DATA_LAYER_KEYS.BOOKING_REFERENCE,
    GTM_DATA_LAYER_KEYS.CABIN_CLASS,
    GTM_DATA_LAYER_KEYS.CATEGORY,
    GTM_DATA_LAYER_KEYS.CITY_PAIR,
    GTM_DATA_LAYER_KEYS.COUNTRY,
    GTM_DATA_LAYER_KEYS.COUNTRY_CODE,
    GTM_DATA_LAYER_KEYS.CURRENCY_CODE,
    GTM_DATA_LAYER_KEYS.DEPARTURE_TIME,
    GTM_DATA_LAYER_KEYS.DEPART_DATE,
    GTM_DATA_LAYER_KEYS.DESTINATION_CITY,
    GTM_DATA_LAYER_KEYS.DESTINATION_COUNTRY_IATA,
    GTM_DATA_LAYER_KEYS.DESTINATION_COUNTRY,
    GTM_DATA_LAYER_KEYS.DESTINATION_IATA,
    GTM_DATA_LAYER_KEYS.DOMAIN,
    GTM_DATA_LAYER_KEYS.ECOMMERCE,
    GTM_DATA_LAYER_KEYS.EMAIL,
    GTM_DATA_LAYER_KEYS.FIRST_NAME,
    GTM_DATA_LAYER_KEYS.FLIGHT_NUMBERS,
    GTM_DATA_LAYER_KEYS.FLIGHT_PRICE,
    GTM_DATA_LAYER_KEYS.FLIGHT_SELECTED,
    GTM_DATA_LAYER_KEYS.GENDER,
    GTM_DATA_LAYER_KEYS.ITEMS_GOOGLE_FLIGHTS,
    GTM_DATA_LAYER_KEYS.LANGUAGE,
    GTM_DATA_LAYER_KEYS.LANGUAGE_CODE,
    GTM_DATA_LAYER_KEYS.LAST_NAME,
    GTM_DATA_LAYER_KEYS.LOCALITY,
    GTM_DATA_LAYER_KEYS.LOGIN_TYPE,
    GTM_DATA_LAYER_KEYS.MTN_CUSTOMER,
    GTM_DATA_LAYER_KEYS.ONWARD_AIRLINE_NAMES,
    GTM_DATA_LAYER_KEYS.ONWARD_DATE_WE,
    GTM_DATA_LAYER_KEYS.ONWARD_STOPS,
    GTM_DATA_LAYER_KEYS.ORIGIN_CITY,
    GTM_DATA_LAYER_KEYS.ORIGIN_COUNTRY_IATA,
    GTM_DATA_LAYER_KEYS.ORIGIN_COUNTRY,
    GTM_DATA_LAYER_KEYS.ORIGIN_IATA,
    GTM_DATA_LAYER_KEYS.PAYMENT_METHOD_NAME,
    GTM_DATA_LAYER_KEYS.PHONE,
    GTM_DATA_LAYER_KEYS.PRICE_AFTER_DISCOUNT,
    GTM_DATA_LAYER_KEYS.PRICE_BEFORE_DISCOUNT,
    GTM_DATA_LAYER_KEYS.PRODUCT_NAME,
    GTM_DATA_LAYER_KEYS.PRODUCT_PRICE,
    GTM_DATA_LAYER_KEYS.PRODUCT_QUANTITY,
    GTM_DATA_LAYER_KEYS.PRODUCT_SKU,
    GTM_DATA_LAYER_KEYS.RETURN_AIRLINE_NAMES,
    GTM_DATA_LAYER_KEYS.RETURN_ARRIVAL_TIME,
    GTM_DATA_LAYER_KEYS.RETURN_DEPARTURE_TIME,
    GTM_DATA_LAYER_KEYS.RETURN_DATE,
    GTM_DATA_LAYER_KEYS.RETURN_DATE_WE,
    GTM_DATA_LAYER_KEYS.RETURN_FLIGHT_SELECTED,
    GTM_DATA_LAYER_KEYS.ROUTE,
    GTM_DATA_LAYER_KEYS.ROUTE_TYPE,
    GTM_DATA_LAYER_KEYS.SEARCH_DATE_WE,
    GTM_DATA_LAYER_KEYS.SECTOR,
    GTM_DATA_LAYER_KEYS.SELECTED_DESTINATION_IATA,
    GTM_DATA_LAYER_KEYS.SELECTED_ORIGIN_IATA,
    GTM_DATA_LAYER_KEYS.SELECTED_SEAT,
    GTM_DATA_LAYER_KEYS.SESSION_ID,
    GTM_DATA_LAYER_KEYS.SIGNUP_TYPE,
    GTM_DATA_LAYER_KEYS.RETURN_STOPS,
    GTM_DATA_LAYER_KEYS.TOTAL_PRICE,
    GTM_DATA_LAYER_KEYS.TRANSACTION_ID,
    GTM_DATA_LAYER_KEYS.TRANSACTION_PRODUCTS,
    GTM_DATA_LAYER_KEYS.TRANSACTION_TAX,
    GTM_DATA_LAYER_KEYS.TRANSACTION_TOTAL,
    GTM_DATA_LAYER_KEYS.TRAVELLER_ADULT,
    GTM_DATA_LAYER_KEYS.TRAVELLER_CHILD,
    GTM_DATA_LAYER_KEYS.TRAVELLER_COUNT,
    GTM_DATA_LAYER_KEYS.TRAVELLER_INFANT,
    GTM_DATA_LAYER_KEYS.USER_ID,
    GTM_DATA_LAYER_KEYS.USER_TYPE,
    GTM_DATA_LAYER_KEYS.VOUCHER_CODE,
  ]);
}

// Home & defaults
function parseAffiliateId(affiliateId: string): any {
  return { [GTM_DATA_LAYER_KEYS.AFFILIATE_ID]: affiliateId };
}

function parseCorrelationId(correlationId: string): any {
  return { [GTM_DATA_LAYER_KEYS.SESSION_ID]: correlationId };
}

function parseLocaleData(languageCode: string, countryCode: string, locale: any): any {
  return {
    [GTM_DATA_LAYER_KEYS.LANGUAGE_CODE]: languageCode,
    [GTM_DATA_LAYER_KEYS.COUNTRY_CODE]: countryCode,
    [GTM_DATA_LAYER_KEYS.CURRENCY_CODE]: getCurrencyCode(countryCode),
    [GTM_DATA_LAYER_KEYS.LANGUAGE]: getLanguage(languageCode),
    [GTM_DATA_LAYER_KEYS.COUNTRY]: getCountry(countryCode),
    [GTM_DATA_LAYER_KEYS.LOCALITY]: `${locale.currentLocale}-${locale.country}`,
    [GTM_DATA_LAYER_KEYS.DOMAIN]: countryCode,
  };
}

// "login"
function parseUserType(userType: string): any {
  return {
    [GTM_DATA_LAYER_KEYS.USER_TYPE]: userType,
  };
}

function parseLoginData(userProfileDetails: any): any {
  if (!userProfileDetails) {
    return;
  }
  const emailAddress = getEmail(userProfileDetails);
  const phoneNumber = getPhoneNumber(userProfileDetails);

  return {
    event: 'login',
    [GTM_DATA_LAYER_KEYS.LOGIN_TYPE]: userProfileDetails.provider || 'email',
    [GTM_DATA_LAYER_KEYS.USER_ID]: userProfileDetails.token || userProfileDetails.userToken,
    [GTM_DATA_LAYER_KEYS.FIRST_NAME]: getFirstName(userProfileDetails).toLowerCase(),
    [GTM_DATA_LAYER_KEYS.LAST_NAME]: getLastName(userProfileDetails).toLowerCase(),
    [GTM_DATA_LAYER_KEYS.BIRTH_DATE]: moment(getBirthDateFromUser(userProfileDetails)).format('YYYY-MM-DD'),
    [GTM_DATA_LAYER_KEYS.GENDER]: getGenderFromUser(userProfileDetails).toLowerCase(),
    [GTM_DATA_LAYER_KEYS.EMAIL]: emailAddress,
    [GTM_DATA_LAYER_KEYS.PHONE]: phoneNumber,
  };
}

// "signup"
function parseSignupData(userProfileDetails: any): any {
  if (!userProfileDetails) {
    return;
  }
  const email = getEmail(userProfileDetails);

  return {
    event: 'signup',
    [GTM_DATA_LAYER_KEYS.SIGNUP_TYPE]: userProfileDetails.provider || 'email',
    [GTM_DATA_LAYER_KEYS.USER_ID]: userProfileDetails.token || userProfileDetails.userToken,
    [GTM_DATA_LAYER_KEYS.FIRST_NAME]: getFirstName(userProfileDetails).toLowerCase(),
    [GTM_DATA_LAYER_KEYS.LAST_NAME]: getLastName(userProfileDetails).toLowerCase(),
    [GTM_DATA_LAYER_KEYS.EMAIL]: email,
  };
}

// "newsletter subscribe"
function parseNewsletterSubscribeData(credentials: any): any {
  if (!credentials) {
    return undefined;
  }

  return {
    event: 'newsletterSubscribe',
    [GTM_DATA_LAYER_KEYS.FIRST_NAME]: credentials.name,
    [GTM_DATA_LAYER_KEYS.EMAIL]: credentials.email,
    [GTM_DATA_LAYER_KEYS.SUBSCRIBE_SIGNUP_TYPE]: credentials.subscribeSignupType,
    [GTM_DATA_LAYER_KEYS.CAMPAIGN_TYPE]: credentials.campaignType,
  };
}

// searchSuccess
function parseSearchData(searchData: any, currentCountryIata: string): any {
  if (!searchData || !hasItineraries(searchData)) {
    return;
  }

  const origin = searchData.itineraries[0].origin || {};
  const destination = searchData.itineraries[0].destination || {};

  if (!origin?.value || !destination?.value) {
    return;
  }

  if (searchData.tripType !== TRIP_TYPES.multiCity) {
    // Remove probable multi-city itineraries from searchData
    searchData.itineraries.splice(1, searchData.itineraries.length - 1);
  }

  const departDate = getDepartDate(searchData);
  const returnDate = getReturnDate(searchData) || undefined;
  const searchDate = moment().format();

  return {
    event: 'searchSuccess',
    [GTM_DATA_LAYER_KEYS.CABIN_CLASS]: getCabinClass(searchData),
    [GTM_DATA_LAYER_KEYS.CITY_PAIR]: `${origin.value.city}-${destination.value.city}`,
    [GTM_DATA_LAYER_KEYS.DESTINATION_CITY]: destination.value.city,
    [GTM_DATA_LAYER_KEYS.DESTINATION_COUNTRY]: destination.value.country,
    [GTM_DATA_LAYER_KEYS.DESTINATION_COUNTRY_IATA]: destination.value.countryIata,
    [GTM_DATA_LAYER_KEYS.DESTINATION_IATA]: destination.value.code,
    [GTM_DATA_LAYER_KEYS.MTN_CUSTOMER]: !!searchData.loyaltyData,
    [GTM_DATA_LAYER_KEYS.ORIGIN_CITY]: origin.value.city,
    [GTM_DATA_LAYER_KEYS.ORIGIN_COUNTRY]: origin.value.country,
    [GTM_DATA_LAYER_KEYS.ORIGIN_COUNTRY_IATA]: origin.value.countryIata,
    [GTM_DATA_LAYER_KEYS.ORIGIN_IATA]: origin.value.code,
    [GTM_DATA_LAYER_KEYS.ROUTE]: `${origin.value.code}-${destination.value.code}`,
    [GTM_DATA_LAYER_KEYS.ROUTE_TYPE]: upperCase(getSearchRouteType(searchData, currentCountryIata)),
    [GTM_DATA_LAYER_KEYS.DEPART_DATE]: departDate,
    [GTM_DATA_LAYER_KEYS.RETURN_DATE]: returnDate,
    [GTM_DATA_LAYER_KEYS.ONWARD_DATE_WE]: formatDateforWE(departDate),
    [GTM_DATA_LAYER_KEYS.RETURN_DATE_WE]: formatDateforWE(returnDate),
    [GTM_DATA_LAYER_KEYS.SEARCH_DATE_WE]: formatDateforWE(searchDate),
    [GTM_DATA_LAYER_KEYS.SECTOR]: `${origin.value.code}_${destination.value.code}`,
    [GTM_DATA_LAYER_KEYS.TRAVELLER_ADULT]: searchData.travellers.adults,
    [GTM_DATA_LAYER_KEYS.TRAVELLER_CHILD]: searchData.travellers.children,
    [GTM_DATA_LAYER_KEYS.TRAVELLER_COUNT]: getTravellerCount(searchData),
    [GTM_DATA_LAYER_KEYS.TRAVELLER_INFANT]: searchData.travellers.infants,
    [GTM_DATA_LAYER_KEYS.TRIP_TYPE]: upperCase(searchData.tripType),
  };
}

function parseTimingInfo(timingEventName: string, startDate: Date): any {
  if (!timingEventName || !startDate) {
    return undefined;
  }

  return { [timingEventName]: Date.now() - startDate.getTime() };
}

// "viewFlight"
function parseViewFlightData(airlineNames: any, itineraries: any, tripType: string, date: string): any {
  if (!itineraries) {
    return undefined;
  }

  const originOdo = getOriginOdo(itineraries);
  const arrivalTime = getArrivalTime(itineraries);
  const departTime = getDepartTime(itineraries);
  const departAirlineCode = getDepartAirlineCode(itineraries);

  let departFlightsString: string;
  let onwardAirlines: string;
  let departOdoStops: number;

  if (tripType === 'multi') {
    departFlightsString = getFlightNumbersStringFromItineraries(itineraries);
    onwardAirlines = getAirlineNamesFromItineraries(itineraries, airlineNames);
    departOdoStops = getMultiStopsFromItineraries(itineraries);
  } else {
    departFlightsString = getFlightNumbersStringFromOdo(originOdo);
    onwardAirlines = getAirlineNamesFromOdo(originOdo, airlineNames);
    departOdoStops = originOdo.segments.length - 1;
  }

  // "Return" trip variables
  let returnAirlines = 'NA';
  let returnArrivalTime: Date;
  let returnDepartTime: Date;
  let returnFlightsString = 'NA';
  let destinationOdo: any = null;
  let returnOdoStops: number;

  /*
   *  "Return" flights will set return properties based on the itineraries,
   *  else "One-Way" flights will set the "Return" properties as undefined
   */
  if (itineraries.length > 1 && tripType !== 'multi') {
    // domestic return
    destinationOdo = head((last(itineraries) as any).odoList);
    returnAirlines = getAirlineNamesFromOdo(destinationOdo, airlineNames);
    returnOdoStops = destinationOdo.segments.length - 1;
    returnArrivalTime = (last((head((last(itineraries) as any).odoList) as any).segments) as any).arrivalDateTime;
    returnDepartTime = (head((head((last(itineraries) as any).odoList) as any).segments) as any).departureDateTime;
    returnFlightsString = getFlightNumbersStringFromOdo(destinationOdo);
  } else if (itineraries[0].odoList.length > 1 && tripType !== 'multi') {
    // international return
    destinationOdo = last((last(itineraries) as any).odoList);
    returnAirlines = getAirlineNamesFromOdo(destinationOdo, airlineNames);
    returnOdoStops = destinationOdo.segments.length - 1;
    returnArrivalTime = (last((last((last(itineraries) as any).odoList) as any).segments) as any).arrivalDateTime;
    returnDepartTime = (head((last((last(itineraries) as any).odoList) as any).segments) as any).departureDateTime;
    returnFlightsString = getFlightNumbersStringFromOdo(destinationOdo);
  }

  const departureTimeFormatted = formatDateforWE(departTime);
  const arrivalTimeFormatted = formatDateforWE(arrivalTime);
  const returnArrivalTimeFormatted = formatDateforWE(returnArrivalTime);
  const returnDepartureTimeFormatted = formatDateforWE(returnDepartTime);
  const searchDateFormatted = formatDateforWE(date);
  const searchDate = moment().format();

  return {
    event: 'selectedFlight',
    [GTM_DATA_LAYER_KEYS.AIRLINE_NAME]: airlineNames[departAirlineCode],
    [GTM_DATA_LAYER_KEYS.TRANSACTION_TOTAL]: getTotalFromItineraries(itineraries),
    [GTM_DATA_LAYER_KEYS.CATEGORY]: 'flights',
    [GTM_DATA_LAYER_KEYS.ONWARD_DATE_WE]: departureTimeFormatted,
    [GTM_DATA_LAYER_KEYS.RETURN_DATE_WE]: returnDepartureTimeFormatted,
    [GTM_DATA_LAYER_KEYS.SEARCH_DATE_WE]: searchDateFormatted,
    [GTM_DATA_LAYER_KEYS.DEPARTURE_TIME]: departureTimeFormatted,
    [GTM_DATA_LAYER_KEYS.ARRIVAL_TIME]: arrivalTimeFormatted,
    [GTM_DATA_LAYER_KEYS.FLIGHT_SELECTED]: departFlightsString,
    [GTM_DATA_LAYER_KEYS.RETURN_FLIGHT_SELECTED]: returnFlightsString,
    [GTM_DATA_LAYER_KEYS.ONWARD_AIRLINE_NAMES]: onwardAirlines,
    [GTM_DATA_LAYER_KEYS.RETURN_AIRLINE_NAMES]: returnAirlines,
    [GTM_DATA_LAYER_KEYS.RETURN_ARRIVAL_TIME]: returnArrivalTimeFormatted,
    [GTM_DATA_LAYER_KEYS.RETURN_DEPARTURE_TIME]: returnDepartureTimeFormatted,
    [GTM_DATA_LAYER_KEYS.ONWARD_STOPS]: departOdoStops,
    [GTM_DATA_LAYER_KEYS.RETURN_STOPS]: returnOdoStops,
    [GTM_DATA_LAYER_KEYS.SEARCH_DATE_WE]: formatDateforWE(searchDate),
  };
}

// "addToCart"
function parseAddToCartData(mainCart: MainCart, itineraries: any[]): any {
  if (!mainCart?.originCityName || !itineraries.length) {
    return;
  }

  return {
    event: 'addToCart',
    [GTM_DATA_LAYER_KEYS.CURRENCY_CODE]: mainCart.currency,
    [GTM_DATA_LAYER_KEYS.COUNTRY_CODE]: mainCart.country,
    [GTM_DATA_LAYER_KEYS.LANGUAGE_CODE]: mainCart.language,
    [GTM_DATA_LAYER_KEYS.TRIP_TYPE]: mainCart.tripType,
    [GTM_DATA_LAYER_KEYS.AIRLINE_NAME]: mainCart.airlineName,
    [GTM_DATA_LAYER_KEYS.ROUTE]: mainCart.route,
    [GTM_DATA_LAYER_KEYS.SECTOR]: mainCart.sector,
    [GTM_DATA_LAYER_KEYS.CITY_PAIR]: mainCart.cityPair,
    [GTM_DATA_LAYER_KEYS.ORIGIN_AIRPORT_CODE]: mainCart.originAirportCode,
    [GTM_DATA_LAYER_KEYS.DESTINATION_AIPORT_CODE]: mainCart.destinationAirportCode,
    [GTM_DATA_LAYER_KEYS.DEPART_DATE]: mainCart.departureDate,
    [GTM_DATA_LAYER_KEYS.RETURN_DATE]: mainCart.returnDate,
    [GTM_DATA_LAYER_KEYS.DESTINATION_IATA]: mainCart.destinationIATA,
    [GTM_DATA_LAYER_KEYS.DESTINATION_CITY]: mainCart.destinationCityName,
    [GTM_DATA_LAYER_KEYS.ORIGIN_IATA]: mainCart.originIATA,
    [GTM_DATA_LAYER_KEYS.ORIGIN_CITY]: mainCart.originCityName,
    [GTM_DATA_LAYER_KEYS.SELECTED_DESTINATION_IATA]: getItinDestinationAirportCode(itineraries),
    [GTM_DATA_LAYER_KEYS.SELECTED_ORIGIN_IATA]: getItinOriginAirportCode(itineraries),
    [GTM_DATA_LAYER_KEYS.FLIGHT_NUMBERS]: getFlightNumbersString(itineraries),
    [GTM_DATA_LAYER_KEYS.TRAVELLER_ADULT]: mainCart.numberAdults,
    [GTM_DATA_LAYER_KEYS.TRAVELLER_CHILD]: mainCart.numberChildren,
    [GTM_DATA_LAYER_KEYS.TRAVELLER_INFANT]: mainCart.numberInfants,
    [GTM_DATA_LAYER_KEYS.TRAVELLER_COUNT]: mainCart.paxTotal,
    [GTM_DATA_LAYER_KEYS.FLIGHT_PRICE]: mainCart.flightPrice,
    [GTM_DATA_LAYER_KEYS.TRANSACTION_TAX]: mainCart.taxAmount,
    [GTM_DATA_LAYER_KEYS.TRANSACTION_TOTAL]: mainCart.transactionTotal,
    /**
     * Enhanced Ecommerce Format
     */
    [GTM_DATA_LAYER_KEYS.ECOMMERCE]: {
      add: {
        products: {
          brand: mainCart.airlineName,
          category: 'Flight',
          id: mainCart.route,
          name: mainCart.cityPair,
          price: mainCart.transactionTotal,
          quantity: mainCart.paxTotal,
          variant: mainCart.tripType,
        },
      },
      currencyCode: mainCart.currency,
    },
  };
}

// "cartTraveller"
function parseCartTravellerData(cartTraveller: TravellerCart): any {
  if (!cartTraveller) {
    return;
  }

  return {
    event: 'cartTraveller',
    [GTM_DATA_LAYER_KEYS.EMAIL]: cartTraveller.email,
    [GTM_DATA_LAYER_KEYS.PHONE]: cartTraveller.phone,
  };
}

// "cartProducts"
function parseSelectedSeatData(selectedSeat: string): any {
  if (!selectedSeat) {
    return;
  }

  return {
    [GTM_DATA_LAYER_KEYS.SELECTED_SEAT]: selectedSeat,
  };
}

function clearProductsData(): any {
  return {
    [GTM_DATA_LAYER_KEYS.CART_PRODUCTS]: undefined,
  };
}

function parseCartProductsData(products: any[], totalAmount: number, cartTraveller: any): any {
  if (!products || !totalAmount) {
    return {
      [GTM_DATA_LAYER_KEYS.CART_PRODUCTS]: undefined,
      [GTM_DATA_LAYER_KEYS.TRANSACTION_TOTAL]: undefined,
    };
  }
  const parsedProducts = map(products, (product) => parseProductData(product));

  return {
    event: 'cartProducts',
    [GTM_DATA_LAYER_KEYS.TITLE]: cartTraveller?.title?.toLowerCase(),
    [GTM_DATA_LAYER_KEYS.FIRST_NAME]: cartTraveller?.firstName?.toLowerCase(),
    [GTM_DATA_LAYER_KEYS.LAST_NAME]: cartTraveller?.lastName?.toLowerCase(),
    [GTM_DATA_LAYER_KEYS.BIRTH_DATE]: getBirthDateFromTraveller(cartTraveller?.dob),
    [GTM_DATA_LAYER_KEYS.GENDER]: getGenderFromTitle(cartTraveller?.title).toLowerCase(),
    [GTM_DATA_LAYER_KEYS.TRANSACTION_TOTAL]: totalAmount,
    [GTM_DATA_LAYER_KEYS.ADDITIONAL_FARES]: getAdditionalFaresFromProducts(parsedProducts),
    [GTM_DATA_LAYER_KEYS.WHATSAPP_OPTIN]: isWhatsappProductPresent(parsedProducts),
    [GTM_DATA_LAYER_KEYS.CART_PRODUCTS]: [
      {
        ...parsedProducts,
      },
    ],
  };
}

// Cart Payment
function parseBookingReference(bookingReference: string): any {
  return {
    event: 'Tcc Reference',
    [GTM_DATA_LAYER_KEYS.BOOKING_REFERENCE]: bookingReference,
  };
}

function parseVoucherData(totalAmount: number, voucherCode: string, voucherAmount: number): any {
  return {
    [GTM_DATA_LAYER_KEYS.VOUCHER_CODE]: voucherCode,
    [GTM_DATA_LAYER_KEYS.PRICE_BEFORE_DISCOUNT]: totalAmount,
    [GTM_DATA_LAYER_KEYS.PRICE_AFTER_DISCOUNT]: totalAmount + voucherAmount,
  };
}

function parseCartPaymentData(cartPayment: PaymentCart): any {
  if (!cartPayment) {
    return;
  }

  const parsedProducts = map(cartPayment.products, (product) => parseProductData(product));

  return {
    event: 'cartPayment',
    [GTM_DATA_LAYER_KEYS.CURRENCY_CODE]: cartPayment.currencyCode,
    [GTM_DATA_LAYER_KEYS.CARD_TYPE]: cartPayment.cardType,
    [GTM_DATA_LAYER_KEYS.BANK_ID]: cartPayment.bankId,
    [GTM_DATA_LAYER_KEYS.BANK_ACCOUNT_NO]: cartPayment.accountNo,
    [GTM_DATA_LAYER_KEYS.IBAN]: cartPayment.iban,
    [GTM_DATA_LAYER_KEYS.METHOD]: cartPayment.method,
    [GTM_DATA_LAYER_KEYS.PAYMENT_NAME]: cartPayment.name,
    [GTM_DATA_LAYER_KEYS.PAYMENT_METHOD_NAME]: cartPayment.paymentMethodName,
    [GTM_DATA_LAYER_KEYS.PAYMENT_OPTION_NAME]: cartPayment.paymentOptionName,
    [GTM_DATA_LAYER_KEYS.PROCESSING_FEE]: getProcessingFee(parsedProducts),
  };
}
// To Do
function parseCartPaymentOptionData(cartPayment: PaymentCart): any {
  if (!cartPayment) {
    return;
  }

  const parsedProducts = map(cartPayment.products, (product) => parseProductData(product));

  return {
    event: 'cartPayment',
    // [GTM_DATA_LAYER_KEYS.BOOKING_REFERENCE]: cartPayment.bookingReference,
    [GTM_DATA_LAYER_KEYS.CARD_TYPE]: cartPayment.cardType,
    coupon: cartPayment.coupon,
    // [GTM_DATA_LAYER_KEYS.BANK_ACCOUNT_NO]: cartPayment.accountNo,
    // [GTM_DATA_LAYER_KEYS.IBAN]: cartPayment.iban,
    [GTM_DATA_LAYER_KEYS.METHOD]: cartPayment.method,
    [GTM_DATA_LAYER_KEYS.PAYMENT_NAME]: cartPayment.name,
    [GTM_DATA_LAYER_KEYS.PAYMENT_METHOD_NAME]: cartPayment.paymentMethodName,
    [GTM_DATA_LAYER_KEYS.PAYMENT_OPTION_NAME]: cartPayment.paymentOptionName,
    [GTM_DATA_LAYER_KEYS.PROCESSING_FEE]: getProcessingFee(parsedProducts),
  };
}

// transactionSuccess
function parseTransactionData(transactionData: any): any {
  if (!transactionData) {
    return;
  }

  const { bookingInformation, fareBreakdown, itineraries, products } = transactionData;

  if (
    !bookingInformation ||
    !fareBreakdown ||
    !itineraries ||
    !itineraries[0] ||
    !itineraries[0].odoList ||
    !itineraries[0].odoList[0] ||
    !itineraries[0].odoList[0].segments ||
    !products
  ) {
    return;
  }

  const firstSegment = itineraries[0].odoList[0].segments[0];
  const parsedProducts = map(products, (product) => parseProductData(product));

  return {
    event: 'transactionSuccess',
    [GTM_DATA_LAYER_KEYS.CURRENCY_CODE]: fareBreakdown.currencyCode,
    [GTM_DATA_LAYER_KEYS.TRANSACTION_ID]: bookingInformation.bookingReferenceNo,
    [GTM_DATA_LAYER_KEYS.TRANSACTION_TOTAL]: fareBreakdown.totalAmount,
    [GTM_DATA_LAYER_KEYS.TRANSACTION_TAX]: fareBreakdown.taxesAndFees,
    [GTM_DATA_LAYER_KEYS.TRANSACTION_PRODUCTS]: [
      {
        [GTM_DATA_LAYER_KEYS.PRODUCT_NAME]: `${firstSegment.origCode}-${firstSegment.destCode}`,
        [GTM_DATA_LAYER_KEYS.PRODUCT_PRICE]: round(fareBreakdown.totalAmount - fareBreakdown.taxesAndFees),
        [GTM_DATA_LAYER_KEYS.PRODUCT_QUANTITY]: 1,
        [GTM_DATA_LAYER_KEYS.PRODUCT_SKU]: getFlightNumbersString(itineraries),
      },
      ...parsedProducts,
    ],
    [GTM_DATA_LAYER_KEYS.ITEMS_GOOGLE_FLIGHTS]: getItemsforGoogleFlights(itineraries),
    [GTM_DATA_LAYER_KEYS.PRICE_AFTER_DISCOUNT]: fareBreakdown.totalAmount,
  };
}

function parseConfirmationData(confirmationData: any): any {
  if (
    !confirmationData ||
    !confirmationData.bookingInformation ||
    !confirmationData.bookingInformation.selectedPaymentMethod
  ) {
    return;
  }

  return {
    [GTM_DATA_LAYER_KEYS.PAYMENT_METHOD_NAME]:
      confirmationData.bookingInformation.selectedPaymentMethod.paymentOptionName,
    [GTM_DATA_LAYER_KEYS.TRANSACTION_ID]: confirmationData.bookingInformation.bookingReferenceNo,
  };
}

function parseProductData(product: any): any {
  if (!product) {
    return;
  }

  return {
    [GTM_DATA_LAYER_KEYS.PRODUCT_NAME]: product.name,
    [GTM_DATA_LAYER_KEYS.PRODUCT_PRICE]: product.amount,
    [GTM_DATA_LAYER_KEYS.PRODUCT_QUANTITY]: 1,
    [GTM_DATA_LAYER_KEYS.PRODUCT_SKU]: product.id,
  };
}

function getFlightNumbersStringFromOdo(odo: Odo): string {
  let returnString = '';

  forEach(odo.segments, (segment) => {
    returnString += `${segment.flightNumber}, `;
  });
  // Remove the last comma and return
  returnString = returnString.substring(0, returnString.length - 2);

  return returnString;
}

function getAirlineNamesFromOdo(odo: any, airlineNames: any): string {
  let returnString = '';

  // Get the airline names from Odo's and push into list
  forEach(odo.segments, (segment) => {
    const airlineName = airlineNames[segment.airlineCode];
    returnString += `${airlineName}, `;
  });
  // Remove the last comma and return
  returnString = returnString.substring(0, returnString.length - 2);

  return returnString;
}

function getAirlineNamesFromItineraries(itineraries: any[], airlineNames: any): string {
  let returnString = '';

  forEach(itineraries, (itinerary) => {
    forEach(itinerary.odoList, (odo) => {
      forEach(odo.segments, (segment) => {
        const airlineName = airlineNames[segment.airlineCode];
        returnString += `${airlineName}, `;
      });
    });
  });
  // Remove the last comma and return
  returnString = returnString.substring(0, returnString.length - 2);

  return returnString;
}

function getFlightNumbersStringFromItineraries(itineraries: any[]): string {
  let returnString = '';
  forEach(itineraries, (itinerary) => {
    forEach(itinerary.odoList, (odo) => {
      forEach(odo.segments, (segment) => {
        returnString += `${segment.flightNumber}, `;
      });
    });
  });
  // Remove the last comma and return
  returnString = returnString.substring(0, returnString.length - 2);

  return returnString;
}

function getMultiStopsFromItineraries(itineraries: any[]): number {
  let returnStops = 0;
  forEach(itineraries, (itinerary) => {
    forEach(itinerary.odoList, (odo) => {
      forEach(odo.segments, (segment) => {
        returnStops += 1;
      });
    });
  });

  return returnStops - 1;
}

function getTotalFromItineraries(itineraries: any[]): number {
  let total = 0;

  forEach(itineraries, (itinerary) => {
    total += itinerary.amount;
  });

  return total;
}

// TODO: Commonly used method of finding flight numbers list (see confirmationController and
// ItineraryUtils.getAirlineCodes). Need to move to itinerary.util.ts
function getFlightNumbersString(itineraries: any[]): string {
  let returnString = '';
  forEach(itineraries, (itinerary) => {
    forEach(itinerary.odoList, (odo) => {
      forEach(odo.segments, (segment) => {
        returnString += `${segment.flightNumber},`;
      });
    });
  });

  // Remove the last comma and return
  return returnString.substring(0, returnString.length - 1);
}

function getAdditionalFaresFromProducts(products: any[]): number {
  let totalFares = 0;
  forEach(products, (product) => {
    totalFares += product.price;
  });

  return totalFares;
}

function isWhatsappProductPresent(products: any[]): boolean {
  let shouldProductShow = false;
  const whatsAppProduct = find(products, (product) => product.sku === PRODUCT.WHATSAPP_ID);
  if (whatsAppProduct) {
    shouldProductShow = true;
  }

  return shouldProductShow;
}

function getProcessingFee(products: any[]): number {
  let totalFee = 0;
  forEach(products, (product) => {
    totalFee += product.price;
  });

  return totalFee;
}

function getItemsforGoogleFlights(itineraries: any[]): any[] {
  const items: any[] = [];
  forEach(itineraries, (itinerary) => {
    forEach(itinerary.odoList, (odo) => {
      forEach(odo.segments, (segment) => {
        items.push({
          /**
           * These are not GTM variables, but objects pushed into a GTM
           * variable 'itemsGoogleFlights', which are sent to
           * Google Flights and then used on their side for mapping.
           */
          destination: segment.destCode,
          flight_number: segment.flightNumber,
          origin: segment.origCode,
          start_date: moment(segment.departureDateTime).format('YYYY-MM-DD'),
          travel_class: segment.cabinClass,
        });
      });
    });
  });

  return items;
}

function getItinOriginAirportCode(itineraries: any[]): string {
  if (isEmpty(itineraries)) {
    return;
  }

  return (head((head((head(itineraries) as any).odoList) as any).segments) as any).origCode;
}

function getItinDestinationAirportCode(itineraries: any[]): string {
  if (isEmpty(itineraries)) {
    return;
  }

  return (last((head((head(itineraries) as any).odoList) as any).segments) as any).destCode;
}

function getOriginOdo(itineraries: any[]): Odo {
  if (isEmpty(itineraries)) {
    return undefined;
  }

  return head((head(itineraries) as any).odoList);
}

function getArrivalTime(itineraries: any[]): string {
  if (isEmpty(itineraries)) {
    return undefined;
  }

  return (last((head((head(itineraries) as any).odoList) as any).segments) as any).arrivalDateTime;
}

function getDepartTime(itineraries: any[]): string {
  if (isEmpty(itineraries)) {
    return undefined;
  }

  return (head((head((head(itineraries) as any).odoList) as any).segments) as any).departureDateTime;
}

function getDepartAirlineCode(itineraries: any[]): string {
  if (isEmpty(itineraries)) {
    return undefined;
  }

  return (head((head((head(itineraries) as any).odoList) as any).segments) as any).airlineCode;
}

function formatDateforWE(date: any): Date {
  if (!date) {
    return undefined;
  }

  const formattedDate = new Date(date);

  return formattedDate;
}

function getLanguage(languageCode: string): string {
  if (languageCode === 'en') {
    return 'english';
  } else if (languageCode === 'ar') {
    return 'arabic';
  } else if (languageCode === 'tr') {
    return 'turkish';
  }
}

function getCountry(countryCode: string): string {
  switch (countryCode) {
    case 'ZA': {
      return 'South Africa';
    }
    case 'NG': {
      return 'Nigeria';
    }
    case 'FS': {
      return 'South Africa';
    }
    case 'CT': {
      return 'South Africa';
    }
    case 'TB': {
      return 'South Africa';
    }
    case 'GZ': {
      return 'South Africa';
    }
    case 'AE': {
      return 'United Arab Emirates';
    }
    case 'BH': {
      return 'Bahrain';
    }
    case 'BW': {
      return 'Botswana';
    }
    case 'DZ': {
      return 'Algeria';
    }
    case 'EG': {
      return 'Egypt';
    }
    case 'GH': {
      return 'Ghana';
    }
    case 'GO': {
      return 'ANY';
    }
    case 'JO': {
      return 'Jordan';
    }
    case 'KE': {
      return 'Kenya';
    }
    case 'KW': {
      return 'Kuwait';
    }
    case 'LY': {
      return 'Libya';
    }
    case 'MA': {
      return 'Morocco';
    }
    case 'MW': {
      return 'Malawi';
    }
    case 'NA': {
      return 'Namibia';
    }
    case 'OM': {
      return 'Oman';
    }
    case 'PK': {
      return 'Pakistan';
    }
    case 'QA': {
      return 'Qatar';
    }
    case 'SA': {
      return 'Saudi Arabia';
    }
    case 'TZ': {
      return 'Tanzania';
    }
    case 'ZW': {
      return 'Zimbabwe';
    }
    default: {
      return 'ANY';
    }
  }
}

function getCurrencyCode(countryCode: string): string {
  switch (countryCode) {
    case 'ZA': {
      return 'ZAR';
    }
    case 'NG': {
      return 'NGN';
    }
    case 'FS': {
      return 'ZAR';
    }
    case 'CT': {
      return 'ZAR';
    }
    case 'TB': {
      return 'ZAR';
    }
    case 'GZ': {
      return 'ZAR';
    }
    case 'AE': {
      return 'AED';
    }
    case 'BH': {
      return 'BHD';
    }
    case 'BW': {
      return 'BWP';
    }
    case 'DZ': {
      return 'DZD';
    }
    case 'EG': {
      return 'EGP';
    }
    case 'GH': {
      return 'GHS';
    }
    case 'GO': {
      return 'USD';
    }
    case 'JO': {
      return 'JOD';
    }
    case 'KE': {
      return 'USD';
    }
    case 'KW': {
      return 'AED';
    }
    case 'LY': {
      return 'LYD';
    }
    case 'MA': {
      return 'MAD';
    }
    case 'MW': {
      return 'MWK';
    }
    case 'NA': {
      return 'NAD';
    }
    case 'OM': {
      return 'OMR';
    }
    case 'PK': {
      return 'PKR';
    }
    case 'QA': {
      return 'QAR';
    }
    case 'SA': {
      return 'AED';
    }
    case 'TZ': {
      return 'TZS';
    }
    case 'ZW': {
      return 'USD';
    }
    case 'IB': {
      return 'ZAR';
    }
    case 'MM': {
      return 'ZAR';
    }
    case 'ABSA': {
      return 'ZAR';
    }
    case 'SB': {
      return 'ZAR';
    }
    default: {
      return 'USD';
    }
  }
}

function getBirthDateFromUser(userProfileDetails: any): string {
  let userBirthdate = '';
  let matchedUser = false;

  if (userProfileDetails.birthDate) {
    return userProfileDetails.birthDate;
  } else {
    if (userProfileDetails.travellerList) {
      forEach(userProfileDetails.travellerList, (traveller) => {
        if (
          traveller.personName.givenName.toLowerCase() ===
          userProfileDetails.contactInfo.personName.givenName.toLowerCase()
        ) {
          matchedUser = true;
          userBirthdate = traveller.birthDate;
        } else {
          return 'not provided';
        }
      });

      return matchedUser ? userBirthdate : 'not provided';
    } else {
      return 'not provided';
    }
  }
}

function getBirthDateFromTraveller(traveller: any): string {
  if (!traveller) {
    return 'not provided';
  }

  if (traveller.dob) {
    if (traveller.dob.month <= 9 && traveller.dob.day <= 9) {
      return `${traveller.dob.year}-0${traveller.dob.month}-0${traveller.dob.day}`;
    } else if (traveller.dob.month <= 9 && traveller.dob.day > 9) {
      return `${traveller.dob.year}-0${traveller.dob.month}-${traveller.dob.day}`;
    } else if (traveller.dob.month > 9 && traveller.dob.day <= 9) {
      return `${traveller.dob.year}-${traveller.dob.month}-0${traveller.dob.day}`;
    } else {
      return `${traveller.dob.year}-${traveller.dob.month}-${traveller.dob.day}`;
    }
  } else {
    return 'not provided';
  }
}

function getGenderFromUser(userProfileDetails: any): string {
  let userGender = '';
  let matchedUser = false;

  if (userProfileDetails.gender) {
    return userProfileDetails.gender;
  } else {
    if (userProfileDetails.travellerList) {
      forEach(userProfileDetails.travellerList, (traveller) => {
        if (
          traveller.personName.givenName.toLowerCase() ===
          userProfileDetails.contactInfo.personName.givenName.toLowerCase()
        ) {
          matchedUser = true;
          userGender = traveller.gender.toLowerCase();
        } else {
          return 'not provided';
        }
      });

      return matchedUser ? userGender : 'not provided';
    } else {
      return 'not provided';
    }
  }
}

function getFirstName(userProfileDetails: any): string {
  let firstName = '';
  let matchedUser = false;

  if (userProfileDetails.givenName) {
    return userProfileDetails.givenName;
  } else if (userProfileDetails.contactInfo.personName.givenName) {
    return userProfileDetails.contactInfo.personName.givenName;
  } else {
    if (userProfileDetails.travellerList) {
      forEach(userProfileDetails.travellerList, (traveller) => {
        if (
          traveller.personName.givenName.toLowerCase() ===
          userProfileDetails.contactInfo.personName.givenName.toLowerCase()
        ) {
          matchedUser = true;
          firstName = traveller.personName.givenName;
        } else {
          return 'not provided';
        }
      });

      return matchedUser ? firstName : 'not provided';
    } else {
      return 'not provided';
    }
  }
}

function getLastName(userProfileDetails: any): string {
  let lastName = '';
  let matchedUser = false;

  if (userProfileDetails.surname) {
    return userProfileDetails.surname;
  } else if (userProfileDetails.contactInfo.personName.surname) {
    return userProfileDetails.contactInfo.personName.surname;
  } else {
    forEach(userProfileDetails.travellerList, (traveller) => {
      if (
        traveller.personName.givenName.toLowerCase() ===
        userProfileDetails.contactInfo.personName.givenName.toLowerCase()
      ) {
        matchedUser = true;
        lastName = traveller.personName.surname;
      }
    });

    return matchedUser ? lastName : 'not provided';
  }
}

function getEmail(userProfileDetails: any): string {
  let userEmail = '';
  let matchedUser = false;

  if (userProfileDetails.email) {
    return userProfileDetails.email;
  } else if (userProfileDetails.username) {
    return userProfileDetails.username;
  } else {
    forEach(userProfileDetails.travellerList, (traveller) => {
      if (
        traveller.personName.givenName.toLowerCase() ===
        userProfileDetails.contactInfo.personName.givenName.toLowerCase()
      ) {
        matchedUser = true;
        userEmail = traveller.email;
      }
    });

    return matchedUser ? userEmail : 'not provided';
  }
}

function getPhoneNumber(userProfileDetails: any): string {
  let fullNumber = '';
  const matchedUser = false;

  if (userProfileDetails.contactInfo) {
    if (userProfileDetails.contactInfo.telephoneList.length > 0) {
      const phoneObject = userProfileDetails.contactInfo.telephoneList[0];
      fullNumber = `+${phoneObject.countryAccessCode}${phoneObject.areaCityCode}${phoneObject.phoneNumber}`;

      return fullNumber;
    } else {
      return 'not provided';
    }
  } else {
    travellerProfileDetails(userProfileDetails, matchedUser, fullNumber);
  }
}

function getGenderFromTitle(title: string): string {
  if (title.toLowerCase() === 'mr') {
    return 'male';
  } else {
    return 'female';
  }
}

function travellerProfileDetails(userProfileDetails: any, matchedUser: boolean, fullNumber: string) {
  if (userProfileDetails.travellerList) {
    forEach(userProfileDetails.travellerList, (traveller) => {
      if (
        traveller.personName.givenName.toLowerCase() ===
        userProfileDetails.contactInfo.personName.givenName.toLowerCase()
      ) {
        matchedUser = true;
        if (traveller.telephoneList || traveller.telephoneList.length > 0) {
          const phoneObject = traveller.telephoneList[0];
          fullNumber = `+${phoneObject.countryAccessCode}${phoneObject.areaCityCode}${phoneObject.phoneNumber}`;
        } else {
          return 'not provided';
        }
      } else {
        return 'not provided';
      }
    });
    return matchedUser ? fullNumber : '';
  } else {
    return 'not provided';
  }
}

export function getContainerIdByCountry(countryCode: string) {
  const conatinerIds = [
    { country: 'ZA', id: 'GTM-PSZTMSGS' },
    { country: 'ZW', id: 'GTM-WTWPJ3Z' },
    { country: 'NA', id: 'GTM-NRHSHGR' },
    { country: 'KE', id: 'GTM-N688MS4' },
    { country: 'BW', id: 'GTM-M6TZ3L6' },
    { country: 'GO', id: 'GTM-52VT3SW' },
    { country: 'NG', id: 'GTM-53DCSRJW' },
  ];
  const countryContainer = conatinerIds.find((container) => container.country === countryCode);
  const id = countryContainer ? countryContainer.id : 'GTM-PSZTMSGS';
  return id;
}

export {
  getCleanDataLayerObject,
  parseLocaleData,
  parseUserType,
  parseLoginData,
  parseSignupData,
  parseNewsletterSubscribeData,
  parseAffiliateId,
  parseViewFlightData,
  clearProductsData,
  parseCartTravellerData,
  parseSelectedSeatData,
  parseCartProductsData,
  parseConfirmationData,
  parseCorrelationId,
  parseAddToCartData,
  parseSearchData,
  parseTimingInfo,
  parseTransactionData,
  parseBookingReference,
  parseVoucherData,
  parseCartPaymentData,
  parseProductData,
  getFlightNumbersStringFromOdo,
  getAirlineNamesFromOdo,
  getAirlineNamesFromItineraries,
  getFlightNumbersStringFromItineraries,
  getMultiStopsFromItineraries,
  getTotalFromItineraries,
  getFlightNumbersString,
  getAdditionalFaresFromProducts,
  isWhatsappProductPresent,
  getProcessingFee,
  getItemsforGoogleFlights,
  getItinOriginAirportCode,
  getItinDestinationAirportCode,
  getOriginOdo,
  getArrivalTime,
  getDepartTime,
  getDepartAirlineCode,
  formatDateforWE,
  getLanguage,
  getCountry,
  getCurrencyCode,
  getBirthDateFromUser,
  getBirthDateFromTraveller,
  getGenderFromUser,
  getFirstName,
  getLastName,
  getEmail,
  getPhoneNumber,
  getGenderFromTitle,
};
