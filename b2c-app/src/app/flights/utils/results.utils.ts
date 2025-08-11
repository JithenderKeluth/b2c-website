import { groupBy, head, map, orderBy } from 'lodash';
import { SearchResultsItinerary } from '../models/results/search-results-itinerary.model';
import { SearchResultsSortOption } from '../models/results/search-results-sort-option.model';
import { GroupedItineraries } from '../models/results/groupedItineraries';
import { getTotalDuration } from './search-results-itinerary.utils';
import { getDepartureDate, getFirstSegmentAirlineCode } from './odo.utils';

import { Odo } from './../models/results/odo.model';
import { SORT_OPTIONS } from '../models/results/sort-options';

import moment from 'moment';
import { AirlineCodesArray } from '@app/general/utils/airline-code';
import { getStorageData } from '@app/general/utils/storage.utils';

/**
 * Takes the supplied bundled SearchResultsItineraries and groups them by airlineCode and amount,
 * then orders the GroupedItineraries by the selected sort order before returning the list
 *
 * @param itineraries The bundled SearchResultsItinerary list
 * @param selectedSortOption The currently selected SearchResultsSortOption
 */
export function getGroupedItineraries(
  itineraries: SearchResultsItinerary[],
  selectedSortOption: SearchResultsSortOption,
  flightSearchData?: any,
  flightslist?: any
): GroupedItineraries[] {
  /**
   * First we have to group itineraries by airline and amount. Because this involves arranging
   * them in groups idintified in a map by keys, we lose the sorting done in the
   * SearchResultsView
   */
  const groupedItinerariesMap = groupBy(
    itineraries,
    (itinerary: SearchResultsItinerary) => `${getFirstSegmentAirlineCode(head(itinerary.odoList))}-${itinerary.amount}`
  );
  /**
   * Next we take that map and turn it into list of itinerary groups each with a
   * representative itinerary providing the properties necessary to be reordered, as well as
   * intialising an isExpanded property for use in the view
   */
  let groupedItinerariesList: GroupedItineraries[] = [];
  /**
   * UnBundle domestic  one way flights
   */
  if (flightSearchData.tripType == 'oneway' && !flightslist.isIntl) {
    let itin: any = [];
    itineraries.forEach((x) => {
      let firstItinerary = x;
      let firstOdo: Odo = head(firstItinerary.odoList);
      let airlineCodeVal = getFirstSegmentAirlineCode(firstOdo);
      let airlineNameval = flightslist?.airlineNames[airlineCodeVal] || airlineCodeVal;
      let amountval = firstItinerary.amount;
      let departDateval = moment(getDepartureDate(firstOdo));
      let durationval = getTotalDuration(firstItinerary);
      let groupIdval = `${airlineCodeVal}-${amountval}`;
      itin.push({
        itineraries: [x],
        amount: x.amount,
        airlineCode: airlineCodeVal,
        airlineName: airlineNameval,
        departDate: departDateval,
        duration: durationval,
        groupId: groupIdval,
        isExpanded: false,
        isMoreFlightsExpanded: false,
      });
    });
    groupedItinerariesList = itin;
  } else {
    groupedItinerariesList = map(groupedItinerariesMap, (itineraries: SearchResultsItinerary[]) => {
      const firstItinerary: SearchResultsItinerary = head(sortItinerariesListArray(itineraries, selectedSortOption));
      const firstOdo: Odo = head(firstItinerary.odoList);
      const airlineCode: string = getFirstSegmentAirlineCode(firstOdo);
      const airlineName: string = flightslist.airlineNames[airlineCode] || airlineCode;
      const amount: number = firstItinerary.amount;
      const departDate = moment(getDepartureDate(firstOdo));
      const duration = getTotalDuration(firstItinerary);
      const groupId: string = `${airlineCode}-${amount}`;
      const result: GroupedItineraries = {
        airlineCode,
        airlineName,
        amount,
        departDate,
        duration,
        groupId,
        itineraries,
        isExpanded: false,
        isMoreFlightsExpanded: false,
      };

      return result;
    });
  }

  /**
   * Lastly, sort the groups by the selected sort option. This will look very similar to how
   * unbundled itineraries are sorted in the SearchResultsView, but the process has been
   * tailored to work with the GroupedItineraries model
   *
   * TODO: DRY up the two sorting implementations
   */
  const ORDER_BY_CRITERIA = {
    [SORT_OPTIONS.cheapest.id]: {
      order: 'asc',
      property: 'amount',
    },
    [SORT_OPTIONS.fastest.id]: {
      order: ['asc', 'asc'],
      property: ['duration', 'amount'],
    },
    [SORT_OPTIONS.earliestDeparture.id]: {
      order: ['asc', 'asc'],
      property: [(groupedItineraries: GroupedItineraries) => moment(groupedItineraries.departDate), 'amount'],
    },
    [SORT_OPTIONS.latestDeparture.id]: {
      order: ['desc', 'asc'],
      property: [(groupedItineraries: GroupedItineraries) => moment(groupedItineraries.departDate), 'amount'],
    },
  };

  const orderByCriteria = ORDER_BY_CRITERIA[selectedSortOption.id];
  let groupedItinerariesData = [];
  let byOrder: any;
  if (orderByCriteria.order.length != 0 && orderByCriteria.order[0] == 'desc') {
    byOrder = 'desc';
  } else {
    byOrder = 'asc';
  }
  groupedItinerariesData = orderBy(groupedItinerariesList, orderByCriteria.property, byOrder);
  return groupedItinerariesData;
}

/* sort itineraries based on the depature time in itineraries array*/
export function sortItinerariesListArray(itineraries: any, resultSort_option: any) {
  if (resultSort_option && resultSort_option.id == 'departureAsc') {
    return itineraries.sort((a: any, b: any) => {
      return (
        <any>moment(a.odoList[0].segments[0].departureDateTime) -
        <any>moment(b.odoList[0].segments[0].departureDateTime)
      );
    });
  } else if (resultSort_option && resultSort_option.id == 'departureDesc') {
    return itineraries.sort((a: any, b: any) => {
      return (
        <any>moment(b.odoList[0].segments[0].departureDateTime) -
        <any>moment(a.odoList[0].segments[0].departureDateTime)
      );
    });
  } else {
    return itineraries;
  }
}

/**Retrieving the results from session storage */
export function getFlightResults() {
  if (getStorageData('flightResults')) {
    const flightslist = JSON.parse(getStorageData('flightResults'));
    return flightslist;
  }
}
/**checks the airlines with promotext*/

export function getAirlinePromo_info(airlineCode: string, param: string) {
  if (typeof window !== 'undefined' && window.sessionStorage) {
    let deepLinkParams = JSON.parse(sessionStorage.getItem('queryStringParams'));
    if (
      (typeof window !== 'undefined' && deepLinkParams && deepLinkParams.cpysource == 'mastercardza') ||
      window.location.hostname.includes('mastercard.travelstart.co.za')
    ) {
      for (let airline in AirlineCodesArray) {
        if (airlineCode == AirlineCodesArray[airline].airlineCode && param == 'promoText') {
          return AirlineCodesArray[airline].promoText;
        }
      }
    }
  }
}
export function getBestFlights(flightList: any, results: any, type: string, isIntl?: any) {
  const listItem = flightList;
  let bestRank: any = [];
  let best_itin: any = {
    cheapest: null,
    fastest: null,
    NEGO: null,
    recommended: null,
  };
  bestRank = getBestRank(flightList, isIntl);
  listItem.forEach((x: any) => {
    if (type === 'outBound') {
      if (x.odoList[0]?.segments[0]?.bestRank === bestRank) {
        best_itin.recommended = { ...x, flagTypes: ['Recommended'] };
      }
      if (x.id == results.cheapestOutBoundId[0]) {
        best_itin.cheapest = { ...x, flagTypes: ['Cheapest'] };
        if (best_itin?.cheapest?.id == best_itin?.recommended?.id) {
          best_itin.cheapest['flagTypes']?.push('Recommended');
        }
        if (best_itin?.cheapest?.id == results.fastestOutBoundId[0]) {
          best_itin.cheapest['flagTypes']?.push('Fastest');
        }
      }
      if (x.id === results.fastestOutBoundId[0] && results.fastestOutBoundId[0] != results.cheapestOutBoundId[0]) {
        best_itin.fastest = { ...x, flagTypes: ['Fastest'] };
        if (best_itin?.fastest?.id == best_itin?.recommended?.id) {
          best_itin.fastest['flagTypes']?.push('Recommended');
        }
      }

      // To Do if we need Best value label
      // if((x.fareBreakdown.adults.pricingSource === 'NEGO') && (x.id !=results.cheapestOutBoundId[0] && x.id !=  results.fastestOutBoundId[0]) &&!best_itin.NEGO){
      //   best_itin.NEGO = { ...x, flagType: "Best value" }
      // }
    }
    if (best_itin.cheapest && best_itin.fastest && best_itin.recommended) {
      return;
    }
  });
  return best_itin;
}

export function getItineraryBestRank(itinerary: any) {
  let itinerarySegments: any = [];
  for (let odolist in itinerary.odoList) {
    for (let segment in itinerary.odoList[odolist].segments) {
      let bestRank = {
        rank: itinerary.odoList[odolist].segments[segment].bestRank,
      };
      itinerarySegments.push(bestRank);
    }
  }
  return itinerarySegments;
}

export function getBestRank(itinerary: any, isIntl: any) {
  if (!Array.isArray(itinerary)) {
    return null;
  }
  let bestRank: any = null;
  for (let itin of itinerary) {
    if (Array.isArray(itin?.odoList)) {
      /**here we are consider all odolist first segments airline is included in bestRankAirInt then only we are consider best rank  */
      let isAllOdoFirstSegmentsHasSameAirline = itin.odoList.every(
        (x: any) => x?.segments[0]?.bestRank && isShowBestRankLabl(x?.segments[0].airlineCode, isIntl)
      );
      if (
        isAllOdoFirstSegmentsHasSameAirline &&
        (bestRank === null || parseInt(itin.odoList[0]?.segments[0].bestRank) < parseInt(bestRank))
      ) {
        bestRank = itin.odoList[0]?.segments[0].bestRank;
      }
    }
  }
  return bestRank;
}
function isShowBestRankLabl(airline: string, isIntl: any): boolean {
  const bestRankAirInt = ['EK', 'QR',];
/**here now we are consider international only if we get requirement for domestic then consider below logic 
 * const bestRankAirDom = ['4Z', 'GE'];
 * const airlineList = isIntl ? bestRankAirInt : bestRankAirDom;
 */
  const airlineList = bestRankAirInt;
  return airlineList.includes(airline);
}
/**here we can call this method if we need to display recommended label based on price  */
function getRecommendedFlight(recommendedFlight: any, itinerary: any) {
  if (recommendedFlight === null ||
    (parseInt(itinerary.amount) < parseInt(recommendedFlight.amount)) ||
    ((parseInt(itinerary.amount) == parseInt(recommendedFlight.amount)) &&
      (parseInt(itinerary.odoList[0].segments[0].bestRank) < parseInt(recommendedFlight.odoList[0].segments[0].bestRank))
    )) {
    recommendedFlight = itinerary;
  }
  return recommendedFlight;
}
