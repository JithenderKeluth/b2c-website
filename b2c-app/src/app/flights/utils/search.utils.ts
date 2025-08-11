/* tslint:disable: object-literal-sort-keys */
import { map } from 'lodash';

import { SearchResults } from './../models/results/search-results.model';
import { SearchResultsItinerary } from '../models/results/search-results-itinerary.model';
import { getPromoInfo } from './../../flights/utils/search-results-itinerary.utils';
import { SearchData } from './../models/search/search-data.model';
import { SearchRequest } from '../models/search/search-request.model';
import { ExportedLocales } from '../../_core/models/exported-locales.model';
import { SearchResponse } from './../models/results/search-response.model';
import { DataToken } from '../../_core/models/dataToken.model';
import { FormArray, FormGroup } from '@angular/forms';
import { ApiErrorscode } from '../../payment/utils/Api-error-code';

export function parseSearchRequest(
  searchData: SearchData,
  //locale: ExportedLocales,
  userProfileUsername: string,
  businessLoggedOnToken: string,
  isDeepLink: boolean,
  dataToken?: DataToken
): SearchRequest {
  return {
    ...searchData,
    //locale,
    userProfileUsername,
    businessLoggedOnToken,
    ...dataToken,
    isDeepLink,
  };
}

export function parseSearchResults(
  searchResponse: SearchResponse,
  shouldShowPerPersonPrice: boolean,
  travellerCount: number
): SearchResults {
  /**
   * TODO: Remove this assertion when the [Temporary Hack] in SearchResultsPresistence is no longer
   * implementing this function
   */
  if (!searchResponse) {
    return;
  }

  const { itineraries, inboundItineraries, outboundItineraries, promoInfo } = searchResponse.response;

  return {
    ...searchResponse.response,
    displayInfo: {
      shouldShowPerPersonPrice,
      travellerCount,
    },
    itineraries: parseSearchResultsItineraries(promoInfo, itineraries),
    inboundItineraries: parseSearchResultsItineraries(promoInfo, inboundItineraries),
    outboundItineraries: parseSearchResultsItineraries(promoInfo, outboundItineraries),
    uuid: searchResponse?.UUID,
  };
}

function parseSearchResultsItineraries(
  promoInfoMap: { [promotionDescription: string]: number[] },
  itineraries: SearchResultsItinerary[]
): SearchResultsItinerary[] {
  return map(itineraries, (itinerary: SearchResultsItinerary) => ({
    ...itinerary,
    isAvailable: true,
    promoInfo: getPromoInfo(promoInfoMap, itinerary),
  }));
}

/**checks error codes returned by the API and returns error message*/
export function compareErrorCodes(errorCodes: string) {
  for (let y in ApiErrorscode) {
    if (ApiErrorscode[y].code == errorCodes) {
      return ApiErrorscode[y];
    }
  }
}

/**checks the pax name length validtions from API*/
export function checkPaxValidationErrors(bookingDetails: any) {
  if (
    bookingDetails &&
    bookingDetails.validationResults &&
    bookingDetails.validationResults.passengersValidationResults
  ) {
    let paxValidationResults = bookingDetails.validationResults.passengersValidationResults.passengerValidationResults;
    for (let paxValidation in paxValidationResults) {
      if (!paxValidationResults[paxValidation].validationResults.invalidFields.nameLengthAdultInfantValid) {
        return paxValidationResults[paxValidation].validationResults.invalidFields;
      }
    }
  }
}

