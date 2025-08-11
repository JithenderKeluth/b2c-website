import { DestinationModalComponent } from './../../../flights/destination-modal/destination-modal.component';
import { AirlineCode } from './../../../general/utils/airline-code';

import { forEach, head, isEmpty, last, map, round, upperCase, zipObject, find, some } from 'lodash';
import moment from 'moment';

import { ITERABLE_DATA_LAYER_KEYS } from '../models/iterable-data-layer-keys.constant';
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
import { AnyARecord } from 'dns';

function getCleanDataLayerObject(): any {
  // Return an object with all included properties set to `undefined`
  return zipObject([
    ITERABLE_DATA_LAYER_KEYS.AFFILIATE_ID,
    ITERABLE_DATA_LAYER_KEYS.AIRLINE_NAME,
    ITERABLE_DATA_LAYER_KEYS.ARRIVAL_TIME,
    ITERABLE_DATA_LAYER_KEYS.BIRTH_DATE,
    ITERABLE_DATA_LAYER_KEYS.BOOKING_REFERENCE,
    ITERABLE_DATA_LAYER_KEYS.CABIN_CLASS,
    ITERABLE_DATA_LAYER_KEYS.CATEGORY,
    ITERABLE_DATA_LAYER_KEYS.CITY_PAIR,
    ITERABLE_DATA_LAYER_KEYS.COUNTRY,
    ITERABLE_DATA_LAYER_KEYS.COUNTRY_CODE,
    ITERABLE_DATA_LAYER_KEYS.CURRENCY,
    ITERABLE_DATA_LAYER_KEYS.DEPARTURE_TIME,
    ITERABLE_DATA_LAYER_KEYS.DEPART_DATE,
    ITERABLE_DATA_LAYER_KEYS.DESTINATION_CITY,
    ITERABLE_DATA_LAYER_KEYS.DESTINATION_COUNTRY_IATA,
    ITERABLE_DATA_LAYER_KEYS.DESTINATION_COUNTRY,
    ITERABLE_DATA_LAYER_KEYS.DESTINATION_IATA,
    ITERABLE_DATA_LAYER_KEYS.DOMAIN,
    ITERABLE_DATA_LAYER_KEYS.ECOMMERCE,
    ITERABLE_DATA_LAYER_KEYS.EMAIL,
    ITERABLE_DATA_LAYER_KEYS.FIRST_NAME,
    ITERABLE_DATA_LAYER_KEYS.FLIGHT_NUMBERS,
    ITERABLE_DATA_LAYER_KEYS.FLIGHT_PRICE,
    ITERABLE_DATA_LAYER_KEYS.FLIGHT_SELECTED,
    ITERABLE_DATA_LAYER_KEYS.GENDER,
    ITERABLE_DATA_LAYER_KEYS.ITEMS_GOOGLE_FLIGHTS,
    ITERABLE_DATA_LAYER_KEYS.LANGUAGE,
    ITERABLE_DATA_LAYER_KEYS.LANGUAGE_CODE,
    ITERABLE_DATA_LAYER_KEYS.LAST_NAME,
    ITERABLE_DATA_LAYER_KEYS.LOCALITY,
    ITERABLE_DATA_LAYER_KEYS.LOGIN_TYPE,
    ITERABLE_DATA_LAYER_KEYS.MTN_CUSTOMER,
    ITERABLE_DATA_LAYER_KEYS.ONWARD_AIRLINE_NAMES,
    ITERABLE_DATA_LAYER_KEYS.ONWARD_DATE_WE,
    ITERABLE_DATA_LAYER_KEYS.ONWARD_STOPS,
    ITERABLE_DATA_LAYER_KEYS.ORIGIN_CITY,
    ITERABLE_DATA_LAYER_KEYS.ORIGIN_COUNTRY_IATA,
    ITERABLE_DATA_LAYER_KEYS.ORIGIN_COUNTRY,
    ITERABLE_DATA_LAYER_KEYS.ORIGIN_IATA,
    ITERABLE_DATA_LAYER_KEYS.PAYMENT_METHOD_NAME,
    ITERABLE_DATA_LAYER_KEYS.PHONE,
    ITERABLE_DATA_LAYER_KEYS.PRICE_AFTER_DISCOUNT,
    ITERABLE_DATA_LAYER_KEYS.PRICE_BEFORE_DISCOUNT,
    ITERABLE_DATA_LAYER_KEYS.PRODUCT_NAME,
    ITERABLE_DATA_LAYER_KEYS.PRODUCT_PRICE,
    ITERABLE_DATA_LAYER_KEYS.PRODUCT_QUANTITY,
    ITERABLE_DATA_LAYER_KEYS.PRODUCT_SKU,
    ITERABLE_DATA_LAYER_KEYS.RETURN_AIRLINE_NAMES,
    ITERABLE_DATA_LAYER_KEYS.RETURN_ARRIVAL_TIME,
    ITERABLE_DATA_LAYER_KEYS.RETURN_DEPARTURE_TIME,
    ITERABLE_DATA_LAYER_KEYS.RETURN_DATE,
    ITERABLE_DATA_LAYER_KEYS.RETURN_DATE_WE,
    ITERABLE_DATA_LAYER_KEYS.RETURN_FLIGHT_SELECTED,
    ITERABLE_DATA_LAYER_KEYS.ROUTE,
    ITERABLE_DATA_LAYER_KEYS.ROUTE_TYPE,
    ITERABLE_DATA_LAYER_KEYS.SEARCH_DATE,
    ITERABLE_DATA_LAYER_KEYS.SECTOR,
    ITERABLE_DATA_LAYER_KEYS.SELECTED_DESTINATION_IATA,
    ITERABLE_DATA_LAYER_KEYS.SELECTED_ORIGIN_IATA,
    ITERABLE_DATA_LAYER_KEYS.SELECTED_SEAT,
    ITERABLE_DATA_LAYER_KEYS.SESSION_ID,
    ITERABLE_DATA_LAYER_KEYS.SIGNUP_TYPE,
    ITERABLE_DATA_LAYER_KEYS.RETURN_STOPS,
    ITERABLE_DATA_LAYER_KEYS.TOTAL_PRICE,
    ITERABLE_DATA_LAYER_KEYS.TRANSACTION_ID,
    ITERABLE_DATA_LAYER_KEYS.TRANSACTION_PRODUCTS,
    ITERABLE_DATA_LAYER_KEYS.TRANSACTION_TAX,
    ITERABLE_DATA_LAYER_KEYS.TRANSACTION_TOTAL,
    ITERABLE_DATA_LAYER_KEYS.TRAVELLER_ADULT,
    ITERABLE_DATA_LAYER_KEYS.TRAVELLER_CHILD,
    ITERABLE_DATA_LAYER_KEYS.TRAVELLER_COUNT,
    ITERABLE_DATA_LAYER_KEYS.TRAVELLER_INFANT,
    ITERABLE_DATA_LAYER_KEYS.USER_ID,
    ITERABLE_DATA_LAYER_KEYS.USER_TYPE,
    ITERABLE_DATA_LAYER_KEYS.VOUCHER_CODE,
  ]);
}

// Home & defaults
function parseAffiliateId(affiliateId: string): any {
  return { [ITERABLE_DATA_LAYER_KEYS.AFFILIATE_ID]: affiliateId };
}

function parseCorrelationId(correlationId: string): any {
  return { [ITERABLE_DATA_LAYER_KEYS.SESSION_ID]: correlationId };
}

function parseLocaleData(languageCode: string, countryCode: string, locale: any): any {
  return {
    [ITERABLE_DATA_LAYER_KEYS.LANGUAGE_CODE]: languageCode,
    [ITERABLE_DATA_LAYER_KEYS.COUNTRY_CODE]: countryCode,
    [ITERABLE_DATA_LAYER_KEYS.CURRENCY]: getCurrencyCode(countryCode),
    [ITERABLE_DATA_LAYER_KEYS.LANGUAGE]: getLanguage(languageCode),
    [ITERABLE_DATA_LAYER_KEYS.COUNTRY]: getCountry(countryCode),
    [ITERABLE_DATA_LAYER_KEYS.LOCALITY]: `${locale.currentLocale}-${locale.country}`,
    [ITERABLE_DATA_LAYER_KEYS.DOMAIN]: countryCode,
  };
}

// "login"
function parseUserType(userType: string): any {
  return {
    [ITERABLE_DATA_LAYER_KEYS.USER_TYPE]: userType,
  };
}

function parseLoginData(userProfileDetails: any): any {
  if (!userProfileDetails) {
    return;
  }
  const emailAddress = getEmail(userProfileDetails);
  const phoneNumber = getPhoneNumber(userProfileDetails);
  const birthDate = getBirthDateFromUser(userProfileDetails) != 'not provided' ? moment(getBirthDateFromUser(userProfileDetails)).format('YYYY-MM-DD') : new Date();  

  return {
    event: 'Logged_In',
    [ITERABLE_DATA_LAYER_KEYS.LOGIN_TYPE]: userProfileDetails.provider || 'email',
    [ITERABLE_DATA_LAYER_KEYS.USER_TYPE]: 'Logged in',
    [ITERABLE_DATA_LAYER_KEYS.USER_ID]: userProfileDetails.token || userProfileDetails.userToken,
    [ITERABLE_DATA_LAYER_KEYS.FIRST_NAME]: getFirstName(userProfileDetails).toLowerCase(),
    [ITERABLE_DATA_LAYER_KEYS.LAST_NAME]: getLastName(userProfileDetails).toLowerCase(),
    [ITERABLE_DATA_LAYER_KEYS.BIRTH_DATE]: birthDate,
    [ITERABLE_DATA_LAYER_KEYS.GENDER]: getGenderFromUser(userProfileDetails).toLowerCase(),
    [ITERABLE_DATA_LAYER_KEYS.EMAIL]: emailAddress,
    [ITERABLE_DATA_LAYER_KEYS.PHONE]: phoneNumber,
  };
}

// "signup"
function parseSignupData(userProfileDetails: any): any {
  if (!userProfileDetails) {
    return;
  }
  const email = getEmail(userProfileDetails);

  return {
    event: 'Signup',
    [ITERABLE_DATA_LAYER_KEYS.SIGNUP_TYPE]: userProfileDetails.provider || 'email',
    [ITERABLE_DATA_LAYER_KEYS.USER_ID]: userProfileDetails.token || userProfileDetails.userToken,
    [ITERABLE_DATA_LAYER_KEYS.FIRST_NAME]: getFirstName(userProfileDetails).toLowerCase(),
    [ITERABLE_DATA_LAYER_KEYS.LAST_NAME]: getLastName(userProfileDetails).toLowerCase(),
    [ITERABLE_DATA_LAYER_KEYS.EMAIL]: email,
  };
}

// "newsletter subscribe"
function parseNewsletterSubscribeData(credentials: any): any {
  if (!credentials) {
    return undefined;
  }

  return {
    event: 'newsletterSubscribe',
    [ITERABLE_DATA_LAYER_KEYS.FIRST_NAME]: credentials.name,
    [ITERABLE_DATA_LAYER_KEYS.EMAIL]: credentials.email,
    [ITERABLE_DATA_LAYER_KEYS.SUBSCRIBE_SIGNUP_TYPE]: credentials.subscribeSignupType,
    [ITERABLE_DATA_LAYER_KEYS.CAMPAIGN_TYPE]: credentials.campaignType,
  };
}

// searchSuccess
function parseSearchData(searchData: any, correlationId :string ,currentCountryIata: string): any {
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
    event: 'Flight_Search',
    [ITERABLE_DATA_LAYER_KEYS.CABIN_CLASS]: getCabinClass(searchData),
    [ITERABLE_DATA_LAYER_KEYS.DESTINATION_CITY]: destination.value.city,
    [ITERABLE_DATA_LAYER_KEYS.DESTINATION_COUNTRY]: destination.value.country,
    [ITERABLE_DATA_LAYER_KEYS.DESTINATION_COUNTRY_IATA]: destination.value.countryIata,
    [ITERABLE_DATA_LAYER_KEYS.DESTINATION_IATA]: destination.value.code,
    [ITERABLE_DATA_LAYER_KEYS.ORIGIN_CITY]: origin.value.city,
    [ITERABLE_DATA_LAYER_KEYS.ORIGIN_COUNTRY]: origin.value.country,
    [ITERABLE_DATA_LAYER_KEYS.ORIGIN_COUNTRY_IATA]: origin.value.countryIata,
    [ITERABLE_DATA_LAYER_KEYS.ORIGIN_IATA]: origin.value.code,
    [ITERABLE_DATA_LAYER_KEYS.SECTOR]: `${origin.value.code}-${destination.value.code}`,
    [ITERABLE_DATA_LAYER_KEYS.ROUTE_TYPE]: upperCase(getSearchRouteType(searchData, currentCountryIata)),
    [ITERABLE_DATA_LAYER_KEYS.DEPART_DATE]: departDate,
    [ITERABLE_DATA_LAYER_KEYS.RETURN_DATE]: returnDate ?? '',
    [ITERABLE_DATA_LAYER_KEYS.TRAVELLER_ADULT]: searchData.travellers.adults,
    [ITERABLE_DATA_LAYER_KEYS.TRAVELLER_CHILD]: searchData.travellers.children,
    [ITERABLE_DATA_LAYER_KEYS.TRAVELLER_COUNT]: getTravellerCount(searchData),
    [ITERABLE_DATA_LAYER_KEYS.TRAVELLER_INFANT]: searchData.travellers.infants,
    [ITERABLE_DATA_LAYER_KEYS.TRIP_TYPE]: upperCase(searchData.tripType),
    [ITERABLE_DATA_LAYER_KEYS.CORRELATION_ID]: correlationId,
  };
}
// "viewFlight"
function parseFlight_ViewData(flightResults: any, flightSearchInfo: any, priceResponse: any): any {
  const parsedSelectedFlightEventData :any = parsePriceData(flightResults,flightSearchInfo,priceResponse);
  let flight_Selected_EventData = {
     event: 'Flight_Selected',
      day_search : [],
      view_details : 1
  }
  flight_Selected_EventData = {...flight_Selected_EventData,...parsedSelectedFlightEventData}
  return flight_Selected_EventData
}
function parseTimingInfo(timingEventName: string, startDate: Date): any {
  if (!timingEventName || !startDate) {
    return undefined;
  }

  return { [timingEventName]: Date.now() - startDate.getTime() };
}
//here parse the data for used for flightselectedEvent and FlightTraveller events
  function parsePriceData(flightResults: any, flightSearchInfo: any, priceResponse: any){
  if (!priceResponse?.itineraries) {
    return undefined;
  }
 // const searchDateFormatted = formatDateforWE(date);
 const itineraryData = getItineraryData(priceResponse?.itineraries,flightSearchInfo,flightResults)
 const additionalData = {
    [ITERABLE_DATA_LAYER_KEYS.TRAVELLER_ADULT]: priceResponse?.travellers?.adults + priceResponse?.travellers?.youngAdults,
    [ITERABLE_DATA_LAYER_KEYS.TRAVELLER_CHILD]: priceResponse?.travellers?.children,
    [ITERABLE_DATA_LAYER_KEYS.TRAVELLER_COUNT]: priceResponse?.travellerCount,
    [ITERABLE_DATA_LAYER_KEYS.TRAVELLER_INFANT]: priceResponse?.travellers?.infants,
    [ITERABLE_DATA_LAYER_KEYS.TOTAL_FARE]: priceResponse?.totalAmount,
    [ITERABLE_DATA_LAYER_KEYS.BASE_FARE]:
      priceResponse?.totalAmount -
      (priceResponse?.fareBreakdown?.markupAmount + priceResponse?.fareBreakdown?.taxAmount),
    [ITERABLE_DATA_LAYER_KEYS.PRICE_BEFORE_DISCOUNT]: priceResponse?.voucherAmount ?? priceResponse?.totalAmount ?? 0,
 }
  return {...itineraryData,...additionalData};
  }
// "viewFlight"
function parseFlight_SelectedData(flightResults: any, flightSearchInfo: any, priceResponse: any): any {
  const parsedSelectedFlightEventData :any = parsePriceData(flightResults,flightSearchInfo,priceResponse);
  let flight_Selected_EventData = {
     event: 'Flight_Selected',
      day_search : [],
      view_details : 1
  }
  flight_Selected_EventData = {...flight_Selected_EventData,...parsedSelectedFlightEventData}
  return flight_Selected_EventData
}
  //parse flight-travellerData
  function parseFlightTravellerData(priceResponse: any,travellerDataInfo:any,flightResults: any, flightSearchInfo: any){
    const parsedPriceData :any = parsePriceData(flightResults,flightSearchInfo,priceResponse);
    const travellerData = parseTravellerData(travellerDataInfo);
    const isWhatsAppSelected = getAddonsSelectedInfo(travellerDataInfo?.addonsInfo,'WHATSAPP');
    const additionalData = {
       event: 'Flight_Traveller',
      [ITERABLE_DATA_LAYER_KEYS.ONWARD_AIRLINE_NAME] : getOnwardAirlineName(priceResponse.itineraries,flightResults) ?? '',
      [ITERABLE_DATA_LAYER_KEYS.RETURN_AIRLINE_NAME] : getReturnAirlineName(priceResponse.itineraries,flightResults) ?? '' ,
      [ITERABLE_DATA_LAYER_KEYS.TICKET]: 0,
      [ITERABLE_DATA_LAYER_KEYS.T_API]: 'Yes',
      [ITERABLE_DATA_LAYER_KEYS.WHATAPP_OPTIN]: isWhatsAppSelected,
    }
    return {...parsedPriceData,...travellerData,...additionalData }
  }
  //parse flight-summary data
  function parseFlightSummaryData(
    priceResponse: any,
    travellerDataInfo: any,
    flightResults: any,
    flightSearchInfo: any
  ) {
    const parsedPriceData: any = parsePriceData(flightResults, flightSearchInfo, priceResponse);
    const travellerData = parseTravellerData(travellerDataInfo);
    const keysToDelete = ['Ticket', 'T_API', 'Whatapp_Optin', 'Onward_Airline_Name', 'Return_Airline_Name'];
    const finalParsedpriceData = deleteObjKeys(parsedPriceData, keysToDelete);
    const additionalSummaryData = {
      event: 'Flight_Summary',
      [ITERABLE_DATA_LAYER_KEYS.PRICE_AFTER_DISCOUNT]: priceResponse?.totalAmount,
      [ITERABLE_DATA_LAYER_KEYS.ONLINE_CHECK_IN]: getAddonsSelectedInfo(travellerDataInfo?.addonsInfo, 'AUTO_CHECK_IN'),
      [ITERABLE_DATA_LAYER_KEYS.TRAVEL_INSURANCE]: getAddonsSelectedInfo(travellerDataInfo?.addonsInfo, 'TVL_IND'),
      [ITERABLE_DATA_LAYER_KEYS.MEDICAL_CANCELLATION]: getAddonsSelectedInfo(travellerDataInfo?.addonsInfo, 'CNC_RFD'),
      [ITERABLE_DATA_LAYER_KEYS.TERMS_CONDITIONS]: travellerDataInfo.agree_terms_conditions,
    };
    return { ...finalParsedpriceData, ...travellerData, ...additionalSummaryData };
  }
  //parse flightSold out data
  function parseFlightSoldOutData(eventData:any){
    const priceResponse = eventData.itinResponse;
    const additionalDataInfo = eventData.additionalDataInfo;
    const flightResults = eventData.flightResults;
    const flightSearchInfo = eventData.flightSearchInfo;
    const parsedflightSummaryData: any = parseFlightSummaryData(priceResponse,additionalDataInfo,flightResults, flightSearchInfo);
    const keysToDelete = ["Category","Departure_Time","Arrival_Time","Price_before_discount","Price_After_Discount","flightSelected","Stops",
                          "Airline","birthDate","Gender","Email","TandC","event","Total_Fare"];
    const parsedFlightSoldOutData = deleteObjKeys(parsedflightSummaryData, keysToDelete);       
    const additionalData = {
       event: 'Flight_Soldout',
      [ITERABLE_DATA_LAYER_KEYS.CURRENCY]: priceResponse?.currencyCode ?? '',
      [ITERABLE_DATA_LAYER_KEYS.FROM_CITY]: getItinOriginAirportCode(priceResponse.itineraries) ?? '',
      [ITERABLE_DATA_LAYER_KEYS.TO_CITY] : getItinDestinationAirportCode(priceResponse.itineraries) ?? '',
      [ITERABLE_DATA_LAYER_KEYS.BAGGAGE_CHECKED]: additionalDataInfo?.baggageData?.isSelected ?? false,
      [ITERABLE_DATA_LAYER_KEYS.COUPON_CODE]: additionalDataInfo.coupon ?? '',
      [ITERABLE_DATA_LAYER_KEYS.TOTAL_FARE] : additionalDataInfo.totalAmount ?? 0,
      [ITERABLE_DATA_LAYER_KEYS.AIRLINE_NAME] : getOnwardAirlineName(priceResponse.itineraries,flightResults) ?? '',
      [ITERABLE_DATA_LAYER_KEYS.AIRLINECODE] : getOnwardAirlineCode(priceResponse.itineraries) ?? '',
    }
     return{...parsedFlightSoldOutData, ...additionalData}
  }
  //parse FlightBookingFailData
  function parseFlightBookingFailData(eventData:any,confirmationData?:any){
     let parsedFlightSoldOutData: any = parseFlightSoldOutData(eventData);
    const keysToDelete = ["Baggagechecked","event"];
     parsedFlightSoldOutData = deleteObjKeys(parsedFlightSoldOutData, keysToDelete);       
    const additionalData = {
       event: 'Flight_BookingFail',
      [ITERABLE_DATA_LAYER_KEYS.THREE_D_SECURE] : eventData?.additionalDataInfo?.threeDEnabled ? 'Success' : 'failed'
    }
      if(confirmationData){
        parsedFlightSoldOutData = updateWithConfirmationData(parsedFlightSoldOutData,confirmationData) 
    }
     return{...parsedFlightSoldOutData, ...additionalData}
  }
//parse flightSold out data
  function parseFlightPaymentFail_OR_SuccessData(eventName:any,eventData:any,confirmationData?:any){
    const additionalDataInfo = eventData?.additionalDataInfo;
     let parsedFlightSoldOutData: any = parseFlightSoldOutData(eventData);
    const keysToDelete = ["Boarding_Time", "Landing_Time", "Return_Boarding_Time", "Return_Landing_Time","event"];
     parsedFlightSoldOutData = deleteObjKeys(parsedFlightSoldOutData, keysToDelete);       
    const additionalData = {
       event: eventName,
      [ITERABLE_DATA_LAYER_KEYS.PAYMENT_GATEWAY_NAME] : additionalDataInfo?.paymentGatewayData?.paymentOptionName ?? ''
    }
  if(confirmationData){
      const updatedConfirmationData = updateWithConfirmationData(parsedFlightSoldOutData,confirmationData)
        parsedFlightSoldOutData = {...parsedFlightSoldOutData,...updatedConfirmationData} 
        
    }
     return{...parsedFlightSoldOutData, ...additionalData}
  }
  //parse payment validation failed data 
  function parsePaymentValidation_RequestData(eventData:any){
    const additionalDataInfo = eventData.additionalDataInfo;
     let parsedFlightSoldOutData: any = parseFlightSoldOutData(eventData);
    parsedFlightSoldOutData.event = 'validation_request';
    const additionalData = {
      [ITERABLE_DATA_LAYER_KEYS.PAYMENT_GATEWAY_NAME] : additionalDataInfo?.paymentGatewayData?.paymentOptionName ?? '',
      [ITERABLE_DATA_LAYER_KEYS.WHATAPP_OPTIN] : getAddonsSelectedInfo(additionalDataInfo?.addonsInfo, 'WHATSAPP') ?? '',
      [ITERABLE_DATA_LAYER_KEYS.SEATS] : isseatsSelected(additionalDataInfo.travellerInfo) ?? false,
      [ITERABLE_DATA_LAYER_KEYS.VAT] : additionalDataInfo?.vatInfo ?? false
    }
     return{...parsedFlightSoldOutData, ...additionalData}
  }
    //parse payment Success failed data 
  function parseBookingSuccessData(eventData:any,confirmationData?:any){
    const priceResponse = eventData.itinResponse;
    const flightResults = eventData.flightResults;
    let bookingConfirmationData = {};
     let parsedPaymentValidation_RequestData: any = parsePaymentValidation_RequestData(eventData);
     const additionalData = {
       event: 'Flight_BookingSuccess',
      [ITERABLE_DATA_LAYER_KEYS.ONWARD_AIRLINE_NAME] : getOnwardAirlineName(priceResponse.itineraries,flightResults) ?? '',
      [ITERABLE_DATA_LAYER_KEYS.RETURN_AIRLINE_NAME] : getReturnAirlineName(priceResponse.itineraries,flightResults) ?? '',
    }
     if(confirmationData){
        parsedPaymentValidation_RequestData = {...parsedPaymentValidation_RequestData,...updateWithConfirmationData(parsedPaymentValidation_RequestData,confirmationData,eventData)} 
    }
     return{...parsedPaymentValidation_RequestData, ...additionalData}
  }
  //here we are update data with confirmation data
  function updateWithConfirmationData(dataObj:any,confirmationData:any,eventData?:any){
    let eventDataInfo = dataObj;
      if(confirmationData){
      const keysToDelete = ["Total_Fare", "Base_Fare"];
     eventDataInfo = deleteObjKeys(dataObj, keysToDelete);
     const priceBeforeDiscountAmount = confirmationData?.fareBreakdown?.totalAmount - eventData?.additionalDataInfo?.voucherAmount
      eventDataInfo = {
      [ITERABLE_DATA_LAYER_KEYS.TOTAL_FARE]: confirmationData?.fareBreakdown?.totalAmount,
      [ITERABLE_DATA_LAYER_KEYS.BASE_FARE]:   confirmationData?.fareBreakdown?.totalAmount - confirmationData?.fareBreakdown?.taxesAndFees,
      [ITERABLE_DATA_LAYER_KEYS.PRICE_BEFORE_DISCOUNT]: priceBeforeDiscountAmount  ?? confirmationData?.fareBreakdown?.totalAmount ,
     }  
     return eventDataInfo;
    }
  }
  function parseMyAccountData(data:any){
    return {
      [ITERABLE_DATA_LAYER_KEYS.EMAIL]: data?.email ?? '',
      [ITERABLE_DATA_LAYER_KEYS.FIRST_NAME]: data.firstName ?? '' ,
      [ITERABLE_DATA_LAYER_KEYS.SURNAME]: data.surname ?? '',
      [ITERABLE_DATA_LAYER_KEYS.BOOKING_ID]: data.bookingId ?? '' ,
      [ITERABLE_DATA_LAYER_KEYS.LOCALITY]: data.locality ?? '',
      [ITERABLE_DATA_LAYER_KEYS.FARE_DIFF]: data.fareDiff,
      [ITERABLE_DATA_LAYER_KEYS.PAYMENT]: data.payment ,
    }
  }
    //Check product is available or not and selected or not
  function getAddonsSelectedInfo(addonsInfo:any,addonName:any){
    return addonsInfo?.some((x:any)=> x.id == addonName && x.initSelected);
  }
  /**her to delete some keys from object based on keys list bcoz some event dont want all data */
  function deleteObjKeys(dataObj:any,keysList:any){
          keysList.forEach(key => {
              delete dataObj[key];
            });
      return dataObj
  }
// "addToCart"
function parseAddToCartData(mainCart: MainCart, itineraries: any[]): any {
  if (!mainCart?.originCityName || !itineraries.length) {
    return;
  }

  return {
    event: 'addToCart',
    [ITERABLE_DATA_LAYER_KEYS.CURRENCY]: mainCart.currency,
    [ITERABLE_DATA_LAYER_KEYS.COUNTRY_CODE]: mainCart.country,
    [ITERABLE_DATA_LAYER_KEYS.LANGUAGE_CODE]: mainCart.language,
    [ITERABLE_DATA_LAYER_KEYS.TRIP_TYPE]: mainCart.tripType,
    [ITERABLE_DATA_LAYER_KEYS.AIRLINE_NAME]: mainCart.airlineName,
    [ITERABLE_DATA_LAYER_KEYS.ROUTE]: mainCart.route,
    [ITERABLE_DATA_LAYER_KEYS.SECTOR]: mainCart.sector,
    [ITERABLE_DATA_LAYER_KEYS.CITY_PAIR]: mainCart.cityPair,
    [ITERABLE_DATA_LAYER_KEYS.ORIGIN_AIRPORT_CODE]: mainCart.originAirportCode,
    [ITERABLE_DATA_LAYER_KEYS.DESTINATION_AIPORT_CODE]: mainCart.destinationAirportCode,
    [ITERABLE_DATA_LAYER_KEYS.DEPART_DATE]: mainCart.departureDate,
    [ITERABLE_DATA_LAYER_KEYS.RETURN_DATE]: mainCart.returnDate,
    [ITERABLE_DATA_LAYER_KEYS.DESTINATION_IATA]: mainCart.destinationIATA,
    [ITERABLE_DATA_LAYER_KEYS.DESTINATION_CITY]: mainCart.destinationCityName,
    [ITERABLE_DATA_LAYER_KEYS.ORIGIN_IATA]: mainCart.originIATA,
    [ITERABLE_DATA_LAYER_KEYS.ORIGIN_CITY]: mainCart.originCityName,
    [ITERABLE_DATA_LAYER_KEYS.SELECTED_DESTINATION_IATA]: getItinDestinationAirportCode(itineraries),
    [ITERABLE_DATA_LAYER_KEYS.SELECTED_ORIGIN_IATA]: getItinOriginAirportCode(itineraries),
    [ITERABLE_DATA_LAYER_KEYS.FLIGHT_NUMBERS]: getFlightNumbersString(itineraries),
    [ITERABLE_DATA_LAYER_KEYS.TRAVELLER_ADULT]: mainCart.numberAdults,
    [ITERABLE_DATA_LAYER_KEYS.TRAVELLER_CHILD]: mainCart.numberChildren,
    [ITERABLE_DATA_LAYER_KEYS.TRAVELLER_INFANT]: mainCart.numberInfants,
    [ITERABLE_DATA_LAYER_KEYS.TRAVELLER_COUNT]: mainCart.paxTotal,
    [ITERABLE_DATA_LAYER_KEYS.FLIGHT_PRICE]: mainCart.flightPrice,
    [ITERABLE_DATA_LAYER_KEYS.TRANSACTION_TAX]: mainCart.taxAmount,
    [ITERABLE_DATA_LAYER_KEYS.TRANSACTION_TOTAL]: mainCart.transactionTotal,
    /**
     * Enhanced Ecommerce Format
     */
    [ITERABLE_DATA_LAYER_KEYS.ECOMMERCE]: {
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
    [ITERABLE_DATA_LAYER_KEYS.EMAIL]: cartTraveller.email,
    [ITERABLE_DATA_LAYER_KEYS.PHONE]: cartTraveller.phone,
  };
}

// "cartProducts"
function parseSelectedSeatData(selectedSeat: string): any {
  if (!selectedSeat) {
    return;
  }

  return {
    [ITERABLE_DATA_LAYER_KEYS.SELECTED_SEAT]: selectedSeat,
  };
}

function clearProductsData(): any {
  return {
    [ITERABLE_DATA_LAYER_KEYS.CART_PRODUCTS]: undefined,
  };
}

function parseCartProductsData(products: any[], totalAmount: number, cartTraveller: any): any {
  if (!products || !totalAmount) {
    return {
      [ITERABLE_DATA_LAYER_KEYS.CART_PRODUCTS]: undefined,
      [ITERABLE_DATA_LAYER_KEYS.TRANSACTION_TOTAL]: undefined,
    };
  }
  const parsedProducts = map(products, (product) => parseProductData(product));

  return {
    event: 'cartProducts',
    [ITERABLE_DATA_LAYER_KEYS.TITLE]: cartTraveller?.title?.toLowerCase(),
    [ITERABLE_DATA_LAYER_KEYS.FIRST_NAME]: cartTraveller?.firstName?.toLowerCase(),
    [ITERABLE_DATA_LAYER_KEYS.LAST_NAME]: cartTraveller?.lastName?.toLowerCase(),
    [ITERABLE_DATA_LAYER_KEYS.BIRTH_DATE]: getBirthDateFromTraveller(cartTraveller?.dob),
    [ITERABLE_DATA_LAYER_KEYS.GENDER]: getGenderFromTitle(cartTraveller?.title).toLowerCase(),
    [ITERABLE_DATA_LAYER_KEYS.TRANSACTION_TOTAL]: totalAmount,
    [ITERABLE_DATA_LAYER_KEYS.ADDITIONAL_FARES]: getAdditionalFaresFromProducts(parsedProducts),
    [ITERABLE_DATA_LAYER_KEYS.WHATSAPP_OPTIN]: isWhatsappProductPresent(parsedProducts),
    [ITERABLE_DATA_LAYER_KEYS.CART_PRODUCTS]: [
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
    [ITERABLE_DATA_LAYER_KEYS.BOOKING_REFERENCE]: bookingReference,
  };
}

function parseVoucherData(totalAmount: number, voucherCode: string, voucherAmount: number): any {
  return {
    [ITERABLE_DATA_LAYER_KEYS.VOUCHER_CODE]: voucherCode,
    [ITERABLE_DATA_LAYER_KEYS.PRICE_BEFORE_DISCOUNT]: totalAmount,
    [ITERABLE_DATA_LAYER_KEYS.PRICE_AFTER_DISCOUNT]: totalAmount + voucherAmount,
  };
}

function parseCartPaymentData(paymentData: any): any {
  const parsedProducts = map(paymentData.cartPaymentProducts, (product) => parseProductData(product));

  return {
    event: 'Flight_PG',
    [ITERABLE_DATA_LAYER_KEYS.CARD_TYPE]: paymentData.cardType ?? '',
    [ITERABLE_DATA_LAYER_KEYS.PAYMENT_GATEWAY_NAME]: paymentData.paymentOptionName,
    [ITERABLE_DATA_LAYER_KEYS.PAYMENT_NAME]: paymentData.paymentName,
    [ITERABLE_DATA_LAYER_KEYS.PAYMENT_METHOD_NAME]: paymentData.paymentMethodName,
    [ITERABLE_DATA_LAYER_KEYS.PAYMENT_OPTION_NAME]: paymentData.paymentOptionName,
    [ITERABLE_DATA_LAYER_KEYS.PROCESSING_FEE]: getProcessingFee(parsedProducts),
     [ITERABLE_DATA_LAYER_KEYS.COUPON_CODE]: paymentData.coupon ?? '',
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
    // [ITERABLE_DATA_LAYER_KEYS.BOOKING_REFERENCE]: cartPayment.bookingReference,
    [ITERABLE_DATA_LAYER_KEYS.CARD_TYPE]: cartPayment.cardType,
    coupon: cartPayment.coupon,
    // [ITERABLE_DATA_LAYER_KEYS.BANK_ACCOUNT_NO]: cartPayment.accountNo,
    // [ITERABLE_DATA_LAYER_KEYS.IBAN]: cartPayment.iban,
    [ITERABLE_DATA_LAYER_KEYS.METHOD]: cartPayment.method,
    [ITERABLE_DATA_LAYER_KEYS.PAYMENT_NAME]: cartPayment.name,
    [ITERABLE_DATA_LAYER_KEYS.PAYMENT_METHOD_NAME]: cartPayment.paymentMethodName,
    [ITERABLE_DATA_LAYER_KEYS.PAYMENT_OPTION_NAME]: cartPayment.paymentOptionName,
    [ITERABLE_DATA_LAYER_KEYS.PROCESSING_FEE]: getProcessingFee(parsedProducts),
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
    [ITERABLE_DATA_LAYER_KEYS.CURRENCY]: fareBreakdown.currencyCode,
    [ITERABLE_DATA_LAYER_KEYS.TRANSACTION_ID]: bookingInformation.bookingReferenceNo,
    [ITERABLE_DATA_LAYER_KEYS.TRANSACTION_TOTAL]: fareBreakdown.totalAmount,
    [ITERABLE_DATA_LAYER_KEYS.TRANSACTION_TAX]: fareBreakdown.taxesAndFees,
    [ITERABLE_DATA_LAYER_KEYS.TRANSACTION_PRODUCTS]: [
      {
        [ITERABLE_DATA_LAYER_KEYS.PRODUCT_NAME]: `${firstSegment.origCode}-${firstSegment.destCode}`,
        [ITERABLE_DATA_LAYER_KEYS.PRODUCT_PRICE]: round(fareBreakdown.totalAmount - fareBreakdown.taxesAndFees),
        [ITERABLE_DATA_LAYER_KEYS.PRODUCT_QUANTITY]: 1,
        [ITERABLE_DATA_LAYER_KEYS.PRODUCT_SKU]: getFlightNumbersString(itineraries),
      },
      ...parsedProducts,
    ],
    [ITERABLE_DATA_LAYER_KEYS.ITEMS_GOOGLE_FLIGHTS]: getItemsforGoogleFlights(itineraries),
    [ITERABLE_DATA_LAYER_KEYS.PRICE_AFTER_DISCOUNT]: fareBreakdown.totalAmount,
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
    [ITERABLE_DATA_LAYER_KEYS.PAYMENT_METHOD_NAME]:
      confirmationData.bookingInformation.selectedPaymentMethod.paymentOptionName,
    [ITERABLE_DATA_LAYER_KEYS.TRANSACTION_ID]: confirmationData.bookingInformation.bookingReferenceNo,
  };
}

function parseProductData(product: any): any {
  if (!product) {
    return;
  }

  return {
    [ITERABLE_DATA_LAYER_KEYS.PRODUCT_NAME]: product.name,
    [ITERABLE_DATA_LAYER_KEYS.PRODUCT_PRICE]: product.amount,
    [ITERABLE_DATA_LAYER_KEYS.PRODUCT_QUANTITY]: 1,
    [ITERABLE_DATA_LAYER_KEYS.PRODUCT_SKU]: product.id,
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
        const airlineName = airlineNames ? airlineNames[segment.airlineCode] : segment.airlineCode;
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

function getOriginOdo(itineraries: any[]): any {
  if (isEmpty(itineraries)) {
    return undefined;
  }

  return head((head(itineraries) as any).odoList);
}
function getDestinationOdo(itineraries: any[]): any {
  if (isEmpty(itineraries)) {
    return undefined;
  }

  return last((last(itineraries) as any).odoList);
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
export function getStopsFromItineraries(itineraries :any){
  let stopsCount :number = 0;
  forEach(itineraries, (itinerary) => {
    forEach(itinerary.odoList, (odo) => {
      forEach(odo.segments, (segment) => {
        stopsCount++;
      });
    });
  });
  return stopsCount;
}
export function parseTravellerData(travellerPageInfo:any){
  const primaryPax = travellerPageInfo?.travellerInfo[0];
  return {
    [ITERABLE_DATA_LAYER_KEYS.PAX_TITLE]: primaryPax?.gender ?? '',
    [ITERABLE_DATA_LAYER_KEYS.PAX_FIRSTNAME]: primaryPax?.firstName ?? '',
    [ITERABLE_DATA_LAYER_KEYS.PAX_LASTNAME]: primaryPax?.lastName ?? '',
    [ITERABLE_DATA_LAYER_KEYS.BIRTH_DATE]: primaryPax?.dob ?? '',
    [ITERABLE_DATA_LAYER_KEYS.GENDER]: primaryPax.gender === 'Ms' ? 'Female' : 'Male',
    [ITERABLE_DATA_LAYER_KEYS.PHONE_NUMBER]: travellerPageInfo?.contactInfo?.phone?.internationalNumber ?? travellerPageInfo?.contactInfo?.phone ?? '',
    [ITERABLE_DATA_LAYER_KEYS.EMAIL]: travellerPageInfo?.contactInfo?.email ?? '',
  
  };
}
function getCabinClassData(itineraries:any){
return (head((head((head(itineraries) as any).odoList) as any).segments) as any).cabinClass;
}
function getOnwardAirlineCode(itineraries:any){
  const airlineCode = (head((head((head(itineraries) as any).odoList) as any).segments) as any).airlineCode;
  return airlineCode;
}
function getOnwardAirlineName(itineraries:any,flightResultsData?:any){
  const airlineCode = (head((head((head(itineraries) as any).odoList) as any).segments) as any).airlineCode;
  return flightResultsData?.airlineNames ? flightResultsData?.airlineNames[airlineCode] : airlineCode;
}
function getReturnAirlineName(itineraries:any,flightResultsData?:any){
  let airlineCode :any = '';
  if(itineraries.length > 1){
  airlineCode = (head((head((last(itineraries) as any).odoList) as any).segments) as any).airlineCode;
  }
  else if (itineraries[0].odoList.length > 1 ){
      airlineCode = (head((last((last(itineraries) as any).odoList) as any).segments) as any).airlineCode;
  }else 
  return flightResultsData?.airlineNames ? flightResultsData?.airlineNames[airlineCode] : airlineCode;
}
function getItineraryData(itinerariesData :any,flightSearchInfo:any,flightResults:any){
  if (!itinerariesData) {
    return undefined;
  }
  const itineraries = itinerariesData;
  const arrivalTime = getArrivalTime(itineraries);
  const departTime = getDepartTime(itineraries);
   let departFlightsString = getFlightNumbersStringFromItineraries(itineraries);
    let airlines = getAirlineNamesFromItineraries(itineraries, flightResults?.airlineNames);
  // "Return" trip variables
  let returnArrivalTime : Date;
  let returnDepartTime: Date;
  const orginData = getOriginOdo(itineraries);
  const destData = getDestinationOdo(itineraries);
  /*
   *  "Return" flights will set return properties based on the itineraries,
   *  else "One-Way" flights will set the "Return" properties as undefined
   */
  if(itineraries.length > 1) {
    // domestic return
    returnArrivalTime = (last((head((last(itineraries) as any).odoList) as any).segments) as any).arrivalDateTime;
    returnDepartTime = (head((head((last(itineraries) as any).odoList) as any).segments) as any).departureDateTime;
  } else if (itineraries[0].odoList.length > 1) {
    // international return
    returnArrivalTime = (last((last((last(itineraries) as any).odoList) as any).segments) as any).arrivalDateTime;
    returnDepartTime = (head((last((last(itineraries) as any).odoList) as any).segments) as any).departureDateTime;;
  }
  const totalStops = getStopsFromItineraries(itineraries);
  const itinAirlineNames = airlines;
  const departData = flightSearchInfo?.itineraries[0]?.dept_city;
  const arrivalData =  flightSearchInfo?.itineraries[0]?.arr_city;
  const departureTimeFormatted = departTime;
  const arrivalTimeFormatted = arrivalTime ?? '';
  const returnArrivalTimeFormatted =  returnArrivalTime ?? '';
  const returnDepartureTimeFormatted = returnDepartTime ?? '';
  const cabinClass = getCabinClassData(itineraries);
  const searchDate = new Date();
  const tripMode  = flightResults?.isIntl ? 'International' : 'Domestic'; 
  const sector = `${orginData?.segments[0]?.origCode} - ${destData?.segments[destData?.segments?.length -1]?.destCode}`; 
  return {
    [ITERABLE_DATA_LAYER_KEYS.FLIGHT_SELECTED]: departFlightsString,
    [ITERABLE_DATA_LAYER_KEYS.TRIP_TYPE]: flightSearchInfo?.tripType ?? '',
    [ITERABLE_DATA_LAYER_KEYS.CABIN_CLASS]: cabinClass ?? '',
    [ITERABLE_DATA_LAYER_KEYS.DESTINATION_CITY]: arrivalData?.city ?? destData?.segments[destData?.segments?.length -1]?.destCode ??'',
    [ITERABLE_DATA_LAYER_KEYS.DESTINATION_COUNTRY]: arrivalData?.country?? '',
    [ITERABLE_DATA_LAYER_KEYS.DESTINATION_COUNTRY_IATA]: arrivalData?.countryIata ?? '',
    [ITERABLE_DATA_LAYER_KEYS.DESTINATION_IATA]: arrivalData?.code?? destData?.segments[destData?.segments?.length -1]?.destCode ?? '',
    [ITERABLE_DATA_LAYER_KEYS.ORIGIN_CITY]: departData?.city ?? orginData.segments[0].origCode ?? '',
    [ITERABLE_DATA_LAYER_KEYS.ORIGIN_COUNTRY]: departData?.country?? '',
    [ITERABLE_DATA_LAYER_KEYS.ORIGIN_COUNTRY_IATA]: departData?.countryIata?? '',
    [ITERABLE_DATA_LAYER_KEYS.ORIGIN_IATA]: orginData?.segments[0]?.origCode ?? departData?.code?? '',
    [ITERABLE_DATA_LAYER_KEYS.SECTOR]: sector ?? `${departData?.code}-${arrivalData?.code}`,
    [ITERABLE_DATA_LAYER_KEYS.DEPART_DATE]: departureTimeFormatted,
    [ITERABLE_DATA_LAYER_KEYS.RETURN_DATE]: returnDepartureTimeFormatted,
    [ITERABLE_DATA_LAYER_KEYS.CATEGORY]: 'flights',
    [ITERABLE_DATA_LAYER_KEYS.DEPARTURE_TIME]: departureTimeFormatted,
    [ITERABLE_DATA_LAYER_KEYS.ARRIVAL_TIME]: arrivalTimeFormatted ?? '',
    [ITERABLE_DATA_LAYER_KEYS.BOARDING_TIME]: departureTimeFormatted,
    [ITERABLE_DATA_LAYER_KEYS.LANDING_TIME]: arrivalTimeFormatted ?? '',
    [ITERABLE_DATA_LAYER_KEYS.RETURN_BOARDING_TIME]: returnDepartureTimeFormatted ?? '',
    [ITERABLE_DATA_LAYER_KEYS.RETURN_LANDING_TIME]: returnArrivalTimeFormatted ?? '',
    [ITERABLE_DATA_LAYER_KEYS.STOPS]: totalStops,
    [ITERABLE_DATA_LAYER_KEYS.START_DATE]: departureTimeFormatted,
    [ITERABLE_DATA_LAYER_KEYS.AIRLINE]: itinAirlineNames,
    [ITERABLE_DATA_LAYER_KEYS.SEARCH_DATE] : searchDate,
   [ITERABLE_DATA_LAYER_KEYS.ROUTE_TYPE] : tripMode ?? '',
  }
}
function isseatsSelected(travellerInfo:any){
  return travellerInfo.some((x:any)=>x ?.specialRequests?.seatDetails?.length > 0)
}
export {
  getCleanDataLayerObject,
  parseLocaleData,
  parseUserType,
  parseLoginData,
  parseSignupData,
  parseNewsletterSubscribeData,
  parseAffiliateId,
  parseFlight_SelectedData,
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
  getDestinationOdo,
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
  parseFlightTravellerData,
  parseFlightSummaryData,
  deleteObjKeys,
  parseFlightSoldOutData,
  parseFlightPaymentFail_OR_SuccessData,
  parsePaymentValidation_RequestData,
  parseFlightBookingFailData,
  parseBookingSuccessData,
  parseFlight_ViewData,
  parseMyAccountData
};
