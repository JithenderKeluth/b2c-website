import moment from 'moment';
import { findKey, forEach, head, includes, isEmpty, last, lowerCase, orderBy, parseInt, reduce, uniq } from 'lodash';
import { SearchResultsItinerary } from '../models/results/search-results-itinerary.model';
import { Odo } from './../models/results/odo.model';
import { Segment } from './../models/results/segment.model';
import { getArrivalDate, getDepartureDate, getFirstSegmentAirlineCode, getAirportNames } from './odo.utils';
import ngDomesticAirlines from '../utils/Ng-domestic-airlines.json';

function getAirlineCodesList(itinerary: SearchResultsItinerary): string[] {
  if (!itinerary || isEmpty(itinerary.odoList)) {
    return [];
  }

  const airlineCodes: string[] = [];
  forEach(itinerary.odoList, (odo) => {
    if (isEmpty(odo.segments)) {
      return;
    }

    forEach(odo.segments, (segment) => {
      airlineCodes.push(segment.airlineCode);
    });
  });

  // Strip duplicates and return
  return uniq(airlineCodes);
}

function getFirstOdoAirlineCode(itinerary: SearchResultsItinerary): string {
  return itinerary && !isEmpty(itinerary.odoList) ? getFirstSegmentAirlineCode(head(itinerary.odoList)) : undefined;
}

function getFirstOdoDepartureDate(itineraries: SearchResultsItinerary[]): string {
  if (isEmpty(itineraries)) {
    return;
  }

  const firstItinerary = head(itineraries);

  return firstItinerary && !isEmpty(firstItinerary.odoList)
    ? getDepartureDate(head(firstItinerary.odoList))
    : undefined;
}

function getLastOdoArrivalDate(itineraries: SearchResultsItinerary[]): string {
  if (isEmpty(itineraries)) {
    return;
  }

  const lastItinerary = last(itineraries);

  return lastItinerary && !isEmpty(lastItinerary.odoList) ? getArrivalDate(last(lastItinerary.odoList)) : undefined;
}

function getSegmentList(itineraries: SearchResultsItinerary[]): any {
  const segmentList: Segment[] = [];

  if (isEmpty(itineraries)) {
    return segmentList;
  }

  forEach(itineraries, (itinerary: SearchResultsItinerary) => {
    if (isEmpty(itinerary.odoList) || !itinerary?.specialServiceAttributes?.offerSeats) {
      return;
    }

    forEach(itinerary.odoList, (odo: Odo) => {
      if (isEmpty(odo.segments)) {
        return;
      }

      forEach(odo.segments, (segment: Segment) => {
        if (!segment) {
          return;
        }
        segmentList.push(segment);
      });
    });
  });

  return segmentList;
}
function passportExpiryDate(passportExpiryDate: any) {
  const d = new Date(passportExpiryDate);
  const month = parseInt(passportExpiryDate.slice(0, 2));
  const day = parseInt(passportExpiryDate.slice(3, 5));
  const year = parseInt(passportExpiryDate.slice(6, 10));
  return { day: day, month: month, year: year };
}

function getPromoInfo(
  promoInfoMap: { [promoDescription: string]: number[] },
  itinerary: SearchResultsItinerary
): string {
  if (isEmpty(promoInfoMap) || !itinerary) {
    return;
  }

  return findKey(promoInfoMap, (itineraryIds: number[]) => includes(itineraryIds, itinerary.id));
}

function getTotalDuration(itinerary: SearchResultsItinerary): number {
  if (!itinerary || isEmpty(itinerary.odoList)) {
    return 0;
  }

  return reduce(itinerary.odoList, (total, odo: Odo) => total + odo.duration, 0);
}

function getTotalStops(itinerary: SearchResultsItinerary): number {
  if (!itinerary || isEmpty(itinerary.odoList)) {
    return 0;
  }

  return reduce(itinerary.odoList, (total, odo: Odo) => total + (odo.segments ? odo.segments.length - 1 : 0), 0);
}

function hasConnectingAirports(itinerary: SearchResultsItinerary): boolean {
  if (!itinerary) {
    return false;
  }

  let lastDestCode: string;
  let result: boolean = false;
  forEach(itinerary.odoList, (odo: Odo) => {
    forEach(odo.segments, (segment: Segment) => {
      if (segment.origCode !== lastDestCode) {
        result = true;

        // Escape forEach
        return false;
      } else {
        lastDestCode = segment.destCode;
      }
    });
    // Escape forEach
    if (result) {
      return false;
    }
  });

  return result;
}

function isInBusinessPolicy(itinerary: SearchResultsItinerary): boolean {
  if (!itinerary) {
    return null;
  }

  return itinerary.isInBusinessPolicy;
}

/**
 * The list returned is the sorted one that needs to be assigned
 *
 * usage example: orderListBy(theListToBeSorted, 'priceAsc')
 * usage example: orderListBy(theListToBeSorted, {id: 'priceAsc'})
 * usage example: orderListBy(theListToBeSorted, {id: 'airlineAsc'}, true)
 * usage example: orderListBy(theListToBeSorted, {id: 'airlineAsc'}, false, theAirlineNameslist)
 *
 * @param list -> mandatory
 * @param selectedSortOption -> mandatory
 * @param isInGroup
 * @param airlineNameslist -> to make order by airlineAsc/Desc accurate
 */
function orderListBy(
  list: SearchResultsItinerary[],
  selectedSortOption: any,
  isInGroup: boolean = false,
  airlineNameslist?: any
): SearchResultsItinerary[] {
  if (isEmpty(selectedSortOption) || isEmpty(list)) {
    return [];
  }

  cachedAirlineNameslist = airlineNameslist || cachedAirlineNameslist;

  /*
   * Enable usage for StandaloneSortFunctions via this method
   * selectedSortOption = 'priceAsc' would become {id: 'priceAsc'}
   */
  const sortOrder: any =
    typeof selectedSortOption === 'string'
      ? getOrderByCriteria(isInGroup, { id: selectedSortOption })
      : getOrderByCriteria(isInGroup, selectedSortOption);

  if (!sortOrder) {
    return list;
  }

  return orderBy(list, sortOrder.property, sortOrder.order);
}

function getOrderByCriteria(isInGroup: boolean, selectedSortOption: any): any {
  if (!selectedSortOption) {
    return null;
  }

  const selectedId = selectedSortOption.id;

  switch (selectedId) {
    case 'priceAsc': {
      return orderByPriceAsc();
    }
    case 'airlineAsc': {
      return isInGroup ? orderByPriceAsc() : orderByAirlineAsc();
    }
    case 'airlineDesc': {
      return isInGroup ? orderByPriceAsc() : orderByAirlineDesc();
    }
    case 'departureAsc': {
      return orderByDepartureAsc();
    }
    case 'departureDesc': {
      return orderByDepartureDesc();
    }
    case 'stopCountAsc': {
      return orderByStopCountAsc();
    }
    case 'durationAsc': {
      return orderByDurationAsc();
    }
    default: {
      //Logger.error(`Could not find selectedSortOption.id : ${selectedId} from ${selectedSortOption}`);
      return null;
    }
  }
}

/**
 * This list denotes: sessionStorage.retrieve(WEB_STORAGE.airlineNames)
 * and is populated via a parameter in orderListBy(...)
 */
let cachedAirlineNameslist: any;

function getFirstOdoAirlineName(itin: any): string {
  const airlineCode = getFirstOdoAirlineCode(itin);
  if (cachedAirlineNameslist) {
    const result = cachedAirlineNameslist[airlineCode];
    if (result) {
      return result;
    }
  }
  // return code because airline name displays instead of airlineCode

  return airlineCode;
}

/**
 * Sort by imitating localeCompare via
 * _.lowerCase("éve") --> "eve"
 */
function orderByAirlineAsc(): any {
  return {
    order: ['asc'],
    property: [(itin: any) => lowerCase(getFirstOdoAirlineName(itin))],
  };
}

/**
 * Sort by imitating localeCompare via
 * _.lowerCase("éve") --> "eve"
 */
function orderByAirlineDesc(): any {
  return {
    order: ['desc'],
    property: [(itin: any) => lowerCase(getFirstOdoAirlineName(itin))],
  };
}

// TODO pass dateformat to moment
function orderByDepartureAsc(): any {
  return {
    order: ['asc', 'asc'],
    property: [(itin: any) => moment(getDepartureDate(itin.odoList[0])), 'amount'],
  };
}

// TODO pass dateformat to moment
function orderByDepartureDesc(): any {
  return {
    order: ['desc', 'asc'],
    property: [(itin: any) => moment(getDepartureDate(itin.odoList[0])), 'amount'],
  };
}

function orderByStopCountAsc(): any {
  return {
    order: ['asc', 'asc'],
    property: [(itin: any) => getTotalStops(itin), 'amount'],
  };
}

/**
 * StandaloneSortFunctions....
 */
function orderByPriceAsc(): any {
  return {
    order: ['asc'],
    property: ['amount'],
  };
}

function orderByDurationAsc(): any {
  return {
    order: ['asc', 'asc'],
    property: [(itin: any) => getTotalDuration(itin), 'amount'],
  };
}

// calculating layover time
function GetLapoverTime(OutBoundFlightDetails: any, airports?: any) {
  let lapOverString = [];
  if (OutBoundFlightDetails.length > 1) {
    for (let j = 1; j < OutBoundFlightDetails.length; j++) {
      let endTime = OutBoundFlightDetails[j - 1].arrivalDateTime;
      let city = OutBoundFlightDetails[j - 1].destCode || OutBoundFlightDetails[j - 1].arrivalAirport;
      let startTime = OutBoundFlightDetails[j].departureDateTime;
      let lapovertimemins = 0;

      lapovertimemins = getLayOverHours(startTime, endTime);
      let hours = leftPad(Math.floor(Math.abs(lapovertimemins) / 60));
      var hours_Arb = leftPad(Math.floor(Math.abs(lapovertimemins) / 60));
      let mins = leftPad(lapovertimemins % 60);

      if (hours == '00') {
        hours = lapovertimemins + 'min';
      } else {
        hours = hours + 'hrs ' + mins + 'min';
      }
      if (airports) {
        lapOverString.push(' at  ' + getAirportNames(city, airports) + ' ' + hours);
      } else {
        lapOverString.push(' at  ' + city + ' ' + hours);
      }
    }
    return lapOverString;
  } else {
    return '';
  }
}

/**Calculating layover time in hours */
function getLayOverHours(startTime: any, endTime: any) {
  let endtimemins = new Date(endTime).getTime() / 60000;
  let starttimemins = new Date(startTime).getTime() / 60000;
  let lapovertimemins = 0;
  if (starttimemins > endtimemins) {
    lapovertimemins = starttimemins - endtimemins;
  } else {
    var firsttime = 1439 - Number(endtimemins);
    var secontime = '0000' + Number(starttimemins);
    lapovertimemins = Number(firsttime) + Number(secontime);
  }

  return lapovertimemins;
}

/**Identifying the layover and long layover based on hours */
function getLayoverLabels(OutBoundFlightDetails: any) {
  let layover_text = [];
  if (OutBoundFlightDetails.length > 1) {
    for (let j = 1; j < OutBoundFlightDetails.length; j++) {
      let endTime = OutBoundFlightDetails[j - 1].arrivalDateTime;
      let startTime = OutBoundFlightDetails[j].departureDateTime;
      const mins = getLayOverHours(startTime, endTime);
      var hours = leftPad(Math.floor(Math.abs(mins) / 60));
      let hrs = parseInt(hours);
      layover_text.push(hrs > 6 ? 'Long Layover' : 'Layover');
    }
    return layover_text;
  }
}

function leftPad(number: number) {
  return (number < 10 && number >= 0 ? '0' : '') + number;
}

/**checks the cabin classes for selected itinerary*/
function checkDestCabinClasses(item: any) {
  let status: boolean = false;
  if (item && item.odoList) {
    let seg1 = item.odoList[0].segments;
    let seg2 = item.odoList[item.odoList.length - 1].segments;
    for (let x in seg1) {
      for (let y in seg2) {
        if (seg1[x].cabinClass !== seg2[y].cabinClass) {
          status = true;
        }
      }
    }
    return status;
  }
}

/**checks the destination and departure airports of international flights and return the origin and destination airports list*/
function checkDestAirports(
  itinerary?: SearchResultsItinerary,
  tripType?: any,
  outboundItin?: any,
  inboundItin?: any,
  param?: boolean
) {
  let odoSeg_airports: any = [];
  let diffAirportsArray: any = [];
  if (param) {
    let segments: any[] = [];
    let obj = {
      origin: inboundItin.odoList[0].segments[0].origCode,
      desti: outboundItin.odoList[0].segments[0].destCode,
    };
    odoSeg_airports.push(obj);
  } else if (itinerary) {
    for (let odolist in itinerary?.odoList) {
      for (let segment in itinerary.odoList[odolist].segments) {
        let obj = {
          origin: itinerary.odoList[odolist].segments[segment].origCode,
          desti: itinerary.odoList[odolist].segments[segment].destCode,
        };
        odoSeg_airports.push(obj);
      }
    }
  }
  odoSeg_airports.forEach((data: any, index: number) => {
    let nextIndex = index + 1;
    if (odoSeg_airports[nextIndex] && odoSeg_airports[index].desti !== odoSeg_airports[nextIndex].origin) {
      diffAirportsArray = airportsList(odoSeg_airports[nextIndex].origin, odoSeg_airports[index].desti);
    }
    if (
      odoSeg_airports.length &&
      tripType == 'return' &&
      odoSeg_airports[0].origin !== odoSeg_airports[odoSeg_airports.length - 1].desti
    ) {
      diffAirportsArray = airportsList(odoSeg_airports[0].origin, odoSeg_airports[odoSeg_airports.length - 1].desti);
    }
  });

  return diffAirportsArray;
}
/**returns a list of origin and destination airports*/
function airportsList(origin: string, destination: string) {
  let destOriginAirports: any[] = [];
  let tempObj = {
    flightOrigin: origin,
    flightDesti: destination,
  };
  destOriginAirports.push(tempObj);
  return destOriginAirports;
}
/**compares city codes from flight search and deeplink params and returns true if they match*/
function getAirlineParam() {
  if (sessionStorage.getItem('queryStringParams')) {
    let deepLinkParams = JSON.parse(sessionStorage.getItem('queryStringParams'));
    let searchInfo = JSON.parse(sessionStorage.getItem('flightsearchInfo'));
    if (
      (searchInfo.itineraries[0].dept_city.code == deepLinkParams.from &&
        searchInfo.itineraries[0].arr_city.code == deepLinkParams.to) ||
      searchInfo.itineraries[0].dept_city.code == deepLinkParams.from_0 ||
      (searchInfo.itineraries[0].arr_city.code == deepLinkParams.to_0 && deepLinkParams.airline)
    ) {
      return true;
    } else {
      return false;
    }
  }
}

/**Checks the destination code and origin codes of domestic flights*/
function domesticDestAirportsCheck(outbound: any, inbound: any, tripType?: string) {
  let airportsArray: any = [];
  let outboundSegments: any = [];
  let inboundSegments: any = [];
  let diffAirportsArray: any = [];
  for (let odolist in outbound.odoList) {
    for (let segment in outbound.odoList[odolist].segments) {
      let obj = {
        origin: outbound.odoList[odolist].segments[segment].origCode,
        desti: outbound.odoList[odolist].segments[segment].destCode,
      };
      outboundSegments.push(obj);
    }
  }
  for (let odolist in inbound.odoList) {
    for (let segment in inbound.odoList[odolist].segments) {
      let obj = {
        origin: inbound.odoList[odolist].segments[segment].origCode,
        desti: inbound.odoList[odolist].segments[segment].destCode,
      };
      inboundSegments.push(obj);
    }
  }
  airportsArray = outboundSegments.concat(inboundSegments);
  airportsArray.forEach((data: any, index: number) => {
    let nextIndex = index + 1;
    if (airportsArray[nextIndex] && airportsArray[index].desti !== airportsArray[nextIndex].origin) {
      diffAirportsArray = airportsList(airportsArray[nextIndex].origin, airportsArray[index].desti);
    }
    if (
      airportsArray.length &&
      tripType == 'return' &&
      airportsArray[0].origin !== airportsArray[airportsArray.length - 1].desti
    ) {
      diffAirportsArray = airportsList(airportsArray[0].origin, airportsArray[airportsArray.length - 1].desti);
    }
  });
  return diffAirportsArray;
}

/**storing the recent three searches in the local storage*/
function recentSearchesInfo(recentSearchData: any) {
  let multiUniqueKey = '';
  let uniqueIndex: number;
  let searchesArray: any[] = [];
  if (localStorage.getItem('flightSearchData')) {
    searchesArray = JSON.parse(localStorage.getItem('flightSearchData'));
    if (searchesArray.length == 10) {
      searchesArray = searchesArray.slice!(7, 10);
    }
  }
  if (recentSearchData && recentSearchData.tripType !== 'multi') {
    recentSearchData.uniqueId =
      recentSearchData.tripType +
      recentSearchData.cabinClass.display +
      recentSearchData.cabinClass.value +
      recentSearchData.itineraries[0].dept_date +
      recentSearchData.itineraries[0].arr_date +
      recentSearchData.travellers.adults +
      recentSearchData.travellers.children +
      recentSearchData.travellers.infants;
    if (searchesArray.length == 0) {
      searchesArray.push(recentSearchData);
    } else if (searchesArray.length !== 0) {
      uniqueIndex = searchesArray.findIndex((x: any) => {
        return recentSearchData.uniqueId == x.uniqueId;
      });
      if (uniqueIndex == -1) {
        searchesArray.push(recentSearchData);
      }
    }
    if (searchesArray.length > 3) {
      searchesArray.shift();
    }
    // localStorage.setItem('flightSearchData', JSON.stringify(searchesArray));
  } else if (recentSearchData && recentSearchData.tripType === 'multi') {
    for (let i = 0; i < recentSearchData.itineraries.length; i++) {
      multiUniqueKey =
        multiUniqueKey +
        recentSearchData.tripType +
        recentSearchData.cabinClass.display +
        recentSearchData.cabinClass.value +
        recentSearchData.itineraries[i].dept_date +
        recentSearchData.itineraries[i].arr_date +
        recentSearchData.travellers.adults +
        recentSearchData.travellers.children +
        recentSearchData.travellers.infants;
    }
    recentSearchData.uniqueId = multiUniqueKey;
    if (searchesArray.length == 0) {
      searchesArray.push(recentSearchData);
    } else if (searchesArray.length !== 0) {
      uniqueIndex = searchesArray.findIndex((x: any) => {
        return recentSearchData.uniqueId == x.uniqueId;
      });
      if (uniqueIndex == -1) {
        searchesArray.push(recentSearchData);
      }
    }
    if (searchesArray.length > 3) {
      searchesArray.shift();
    }
    recentSearchData.uniqueId = multiUniqueKey;
    // localStorage.setItem('flightSearchData', JSON.stringify(searchesArray));
  }
}

/**It will check seat numbers from itinerary in segment level and returns the lowest number*/
function checkSeatsNum(itinerary: any) {
  let statusCodes: any = [];
  for (let odolist in itinerary?.odoList) {
    for (let segment in itinerary.odoList[odolist].segments) {
      if (itinerary.odoList[odolist].segments[segment] && itinerary.odoList[odolist].segments[segment].avlStatusCode) {
        statusCodes.push(parseInt(itinerary.odoList[odolist].segments[segment].avlStatusCode));
      }
    }
  }
  let seatNum: any = statusCodes.length > 0 ? Math.min(...statusCodes) : null;
  return seatNum;
}

/**checking the specific airlines and countries for displaying the transit visa modal */
function transitVisaCheck(flightSearchData: any, item: any) {
  let arrivalCountry: string = flightSearchData.itineraries[flightSearchData.itineraries.length - 1].arr_city.country;
  let airlineCode: string;
  let value: boolean = false;
  for (let odoList in item?.odoList) {
    for (let segment in item.odoList[odoList].segments) {
      airlineCode = item.odoList[odoList].segments[segment].airlineCode;
      if (
        (arrivalCountry === 'United Kingdom' || arrivalCountry === 'Canada') &&
        (airlineCode === 'KL' || airlineCode === 'AF' || airlineCode === 'DL' || airlineCode === 'UA')
      ) {
        value = true;
      }
    }
  }
  return value;
}

/**for B2B concat domestic outbound & inbound itinararies for edit price */

function mergeDomesticFlights(flights: any) {
  const odoList = [...flights.outboundItineraries.odoList, ...flights.inboundItineraries.odoList];
  const ppsAmount = flights.outboundItineraries.ppsAmount + flights.inboundItineraries.ppsAmount;
  const markupAmount = flights.outboundItineraries.markupAmount + flights.inboundItineraries.markupAmount;
  const discountAmount = flights.outboundItineraries.discountAmount + flights.inboundItineraries.discountAmount;
  const dynamicDiscount = flights.dynamicDiscount;
  const additionalMarkup = flights.additionalMarkup;
  let fareBreakdown: any = {
    adults: {
      baseFare:
        flights.outboundItineraries.fareBreakdown.adults.baseFare +
        flights.inboundItineraries.fareBreakdown.adults.baseFare,
      qty: flights.outboundItineraries.fareBreakdown.adults.qty,
    },
    taxAmount: flights.outboundItineraries.fareBreakdown.taxAmount + flights.inboundItineraries.fareBreakdown.taxAmount,
  };
  if (flights.outboundItineraries.fareBreakdown.children && flights.inboundItineraries.fareBreakdown.children) {
    fareBreakdown = {
      ...fareBreakdown,
      children: {
        baseFare:
          flights.outboundItineraries.fareBreakdown.children.baseFare +
          flights.inboundItineraries.fareBreakdown.children.baseFare,
        qty: flights.outboundItineraries.fareBreakdown.children.qty,
      },
    };
  }

  if (flights.outboundItineraries.fareBreakdown.infants && flights.inboundItineraries.fareBreakdown.infants) {
    fareBreakdown = {
      ...fareBreakdown,
      infants: {
        baseFare:
          flights.outboundItineraries.fareBreakdown.infants.baseFare +
          flights.inboundItineraries.fareBreakdown.infants.baseFare,
        qty: flights.outboundItineraries.fareBreakdown.infants.qty,
      },
    };
  }
  if (flights.outboundItineraries.fareBreakdown.youngAdults && flights.inboundItineraries.fareBreakdown.youngAdults) {
    fareBreakdown = {
      ...fareBreakdown,
      youngAdults: {
        baseFare:
          flights.outboundItineraries.fareBreakdown.youngAdults.baseFare +
          flights.inboundItineraries.fareBreakdown.youngAdults.baseFare,
        qty: flights.outboundItineraries.fareBreakdown.youngAdults.qty,
      },
    };
  }

  let amount = fareBreakdown.adults.baseFare + fareBreakdown.taxAmount;

  if (fareBreakdown.children) amount += fareBreakdown?.children?.baseFare;
  if (fareBreakdown.infants) amount += fareBreakdown?.infants?.baseFare;
  if (fareBreakdown.youngAdults) amount += fareBreakdown?.youngAdults?.baseFare;
  const flightType = 'isUnBundle';
  const domesticFlightDetails = {
    outboundkey: flights.outboundItineraries.id,
    inboundkey: flights.inboundItineraries.id,
    amount,
    currencyCode: flights.outboundItineraries.currencyCode,
    fareBreakdown: fareBreakdown,
    odoList,
    ppsAmount,
    markupAmount,
    dynamicDiscount,
    additionalMarkup,
    flightType,
    discountAmount,
  };
  return domesticFlightDetails;
}
/**checking the airline query param and deleting when the user performs new search*/
function checkAirlineParam() {
  if (sessionStorage.getItem('queryStringParams')) {
    const params = JSON.parse(sessionStorage.getItem('queryStringParams'));
    const deepLinkParams = { ...params };
    if (deepLinkParams.airline) {
      delete deepLinkParams.airline;
      sessionStorage.removeItem('queryStringParams');
      sessionStorage.setItem('queryStringParams', JSON.stringify(deepLinkParams));
      return deepLinkParams;
    }
  }
}

/**Checking the airline and booking class, if the are EK&H returns true*/
function checkEK_hFlight(selectedFlight: any) {
  let airlineCode: string;
  let bookingClass: string;
  let value: boolean = false;
  for (let odoList in selectedFlight?.odoList) {
    for (let segment in selectedFlight.odoList[odoList].segments) {
      airlineCode = selectedFlight.odoList[odoList].segments[segment].airlineCode;
      bookingClass = selectedFlight.odoList[odoList].segments[segment].bookingClass;
      if (airlineCode === 'EK' && bookingClass === 'H') {
        value = true;
      }
    }
  }
  return value;
}
function checkSearchErrors(searchErrors: any) {
  for (let x in searchErrors) {
    if (searchErrors[x]?.errorWarningAttributeGroup?.code === '48404') {
      return true;
    }
  }
}
function hasItineraries(result: any): boolean {
  if (
    result?.response?.itineraries?.length !== 0 ||
    (result?.response?.outboundItineraries?.length !== 0 && result?.response?.inboundItineraries?.length !== 0)
  ) {
    return true;
  } else {
    return false;
  }
}

/**showing the offline Booking in the operating hours */
function showOfflineBooking() {
  const todayDate = new Date();
  const day = todayDate.getDay();
  const hour = todayDate.getHours();
  const isWeekday = day >= 1 && day <= 5;
  const isWeekend = day === 0 || day === 6;
  const show = (isWeekday && hour >= 8 && hour < 24) || (isWeekend && hour >= 9 && hour < 24);
  return show;
}

/**showing offline booking banner */
function offLineNgBanner(flightSearchData: any) {
  const deptCity = flightSearchData.itineraries[0].dept_city.code;
  const arrCity = flightSearchData.itineraries[flightSearchData.itineraries.length - 1].arr_city.code;
  const codesSet = new Set<string>();
  ngDomesticAirlines.forEach((airline: any) => {
    airline.airports.forEach((airport: any) => {
      codesSet.add(airport.code);
    });
  });
  const airportCodes = Array.from(codesSet);
  let url;
  if(typeof window !== 'undefined'){
    url = window.location.href;
  }
  return (
    showOfflineBooking() &&
    !url.includes('cpysource') &&
    !url.includes('cpy_source') &&
    !url.includes('affid') &&
    !url.includes('affId') &&
    airportCodes.includes(deptCity) &&
    airportCodes.includes(arrCity)
  );
}
/**showing the stops based on position*/
function getStops(count: number) {
  return Array(count)
    .fill(0)
    .map((x, i) => (i + 1) * (100 / (count + 1)));
}

/**Technical stops count for all the segments */
function getTechStopsTotalCount(odoList: any) {
  const techStopsCount = odoList?.segments?.reduce((segmentTotal: any, segment: any) => {
    return segmentTotal + (segment?.technicalStops || 0);
  }, 0);
  if (techStopsCount > 0) {
    return techStopsCount;
  }
}

/**Extracting the total tech stop locations of an odolist */
function getTotalTechnicalStopLocations(odoList: any) {
  const technicalStopLocations = odoList?.segments?.reduce((acc: any, segment: any) => {
    const locations = segment?.technicalStopLocations || [];
    return acc.concat(locations);
  }, []);
  const allTechStops = technicalStopLocations.map((loc: any) => loc.location);
  return allTechStops;
}
/**It returns the stops names */
function getStopsName(odoList: any) {
  if (odoList?.segments?.length > 1) {
    const destCode0 = odoList?.segments[0]?.destCode;
    const destCode1 = odoList?.segments[1]?.destCode;
    const stopLocations = odoList?.segments?.length > 2 ? destCode0 + ' ' + '|' + ' ' + destCode1 : destCode0;
    return stopLocations;
  }
}

/**Technical stop locations By segments */
function getTechStopsBySegments(segments: any) {
  const techStops = [...segments.technicalStopLocations];
  const locations = techStops.map((loc: any) => loc.location);
  const numofStops = segments.technicalStops;
  if (segments?.aircraftType !== 'Train') {
    return getTechStopsText(numofStops, locations);
  }
}
/**It returns the stops and locations */
function stopsWithLocations(odoList: any) {
  const stops = getStopsNum(odoList?.segments);
  const stopLocations = getStopsName(odoList);
  let stopsLocationsText: any;
  if (stops !== 'Non Stop') {
    stopsLocationsText = `${stops}   |  ${stopLocations}`;
  } else if (stops == 'Non Stop') {
    stopsLocationsText = stops;
  }
  return stopsLocationsText;
}

/*Returns No.of stops */
function getStopsNum(segments: any) {
  const numStops = parseInt(segments.length) - 1;
  if (numStops === 0) {
    return 'Non Stop';
  } else if (numStops === 1) {
    return numStops + ' Stop';
  } else {
    return numStops + ' Stops';
  }
}
/**Technical stop locations By Odo list */
function getTechStopsByOdoList(odoList: any) {
  const isTrainAbsent = odoList.segments.every((segment: any) => segment?.aircraftType !== 'Train');
  const numberOfStops = getTechStopsTotalCount(odoList);
  if (numberOfStops > 0 && isTrainAbsent) {
    const stopLocations = getTotalTechnicalStopLocations(odoList);
    return getTechStopsText(numberOfStops, stopLocations);
  }
}

/**Technical stops text */
function getTechStopsText(techStopsCount: number, stopLocations: any) {
  let techStopsText: any;
  const stopsText = stopLocations.length > 1 ? stopLocations.join(', ') : stopLocations;
  if (techStopsCount > 1) {
    techStopsText = `${techStopsCount} Technical stops at ${stopsText}`;
  } else if (techStopsCount == 1) {
    techStopsText = `${techStopsCount} Technical stop at ${stopsText}`;
  }
  return techStopsText;
}

function displayItinPrice(itinerary: any, isPPS?: boolean, isIntl?: boolean,isBundleFlight?:boolean ) {
  // Safely retrieve the wallet from sessionStorage
  const credentials = sessionStorage.getItem('credentials');
  const wallet = credentials ? JSON.parse(credentials)?.data?.subscriptionResponse?.wallet : null;

  // Get voucher lists by regionality
  const voucherLists = wallet
    ? getLoyaltyVouchersByRegionality(wallet)
    : { internationalVouchers: [], domesticVouchers: [] };

  // Calculate voucher amount based on regionality
  let voucherAmt = isIntl
    ? voucherLists?.internationalVouchers?.[0]?.amount || 0
    : voucherLists?.domesticVouchers?.[0]?.amount || 0;
    /**here we are spliting the voucher amount to two itineraries if flight is domestic unbundled  */
  let domesticVoucherAmt = !isBundleFlight ? voucherAmt / 2 : voucherAmt;
  domesticVoucherAmt = isPPS ? domesticVoucherAmt / (itinerary?.fareBreakdown?.adults?.qty || 1) : domesticVoucherAmt;

  voucherAmt = isPPS ? voucherAmt / (itinerary?.fareBreakdown?.adults?.qty || 1) : voucherAmt;
  const discountAmount = isPPS
    ? Math.abs(itinerary?.discountAmount || 0) / (itinerary?.fareBreakdown?.adults?.qty || 1)
    : itinerary?.discountAmount || 0;

  // Calculate PPS and total amounts
  const ppsAmt = (itinerary?.ppsAmount || 0) ;
  const amount = (itinerary?.amount || 0) ;
  const ItinAmount = isPPS ? ppsAmt : amount;  
  // Calculate saving amount
  const savingAmt = Math.abs(discountAmount) + voucherAmt;
  // Calculate strike and final amounts
  const strikeAmt = ItinAmount + Math.abs(discountAmount);
  const finalAmount = Math.max(ItinAmount - domesticVoucherAmt, 0); // Ensure the final amount is not negative

  const isPerperson = isPPS && itinerary?.fareBreakdown?.adults?.qty > 1;
  // Build the display flight price object
  const displayFlightPrice = {
    strikeAmt: Math.ceil(strikeAmt),
    finalAmount: finalAmount,
    savingAmt: savingAmt,
    discountAmount: discountAmount,
    isPPS: isPerperson,
  };

  return displayFlightPrice;
}

function getLoyaltyVouchersByRegionality(wallet: any) {
  const result = {
    domesticVouchers: <any>[],
    internationalVouchers: <any>[],
  };

  try {
    // Check if loyaltyVoucherBalances exists
    const loyaltyVoucherBalances = wallet?.loyaltyVoucherBalances || [];

    // Iterate through each balance to extract vouchers
    loyaltyVoucherBalances.forEach((balance: any) => {
      const voucherList = balance?.loyaltyFlightVoucherBalance?.loyaltyVoucherList || [];

      voucherList.forEach((voucher: any) => {
        if (voucher.regionalityType === 'DOMESTIC') {
          result.domesticVouchers.push(voucher);
        } else if (voucher.regionalityType === 'INTERNATIONAL') {
          result.internationalVouchers.push(voucher);
        }
      });
    });
  } catch (error) {
    console.error('Error processing wallet object:', error);
  }

  return result;
}

export {
  getAirlineCodesList,
  getFirstOdoAirlineCode,
  getFirstOdoDepartureDate,
  getLastOdoArrivalDate,
  getSegmentList,
  getPromoInfo,
  getTotalDuration,
  getTotalStops,
  hasConnectingAirports,
  isInBusinessPolicy,
  orderListBy,
  GetLapoverTime,
  passportExpiryDate,
  checkDestAirports,
  checkDestCabinClasses,
  getAirlineParam,
  getLayOverHours,
  getLayoverLabels,
  recentSearchesInfo,
  domesticDestAirportsCheck,
  checkSeatsNum,
  transitVisaCheck,
  checkAirlineParam,
  checkEK_hFlight,
  mergeDomesticFlights,
  checkSearchErrors,
  hasItineraries,
  showOfflineBooking,
  offLineNgBanner,
  getStops,
  getTechStopsTotalCount,
  getTotalTechnicalStopLocations,
  getStopsName,
  getTechStopsBySegments,
  stopsWithLocations,
  getStopsNum,
  getTechStopsByOdoList,
  displayItinPrice,
  getLoyaltyVouchersByRegionality,
};
