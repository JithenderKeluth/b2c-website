import { SearchResultsLocation } from './../results/search-results-location.model';
import { ApiEncryptedData } from './../../models/api-encrypted-data.model';
import { SearchResultsItinerary } from './../results/search-results-itinerary.model';
import { SearchResultsDisplayInfo } from './../results/search-results-display-info.model';
import { ApiError } from './../../models/api-error.model';
import { PriceResult } from './../price/price-result.model';

export interface SearchResults {
  readonly cpySource: string;
  readonly isBundled: boolean;
  readonly isCalendarSearch: boolean;
  readonly isIntl: boolean;
  readonly isLoyaltyDiscount: boolean;

  readonly data: ApiEncryptedData;
  readonly errors: ApiError[];

  readonly airlineNames: { [airlineCode: string]: string };
  readonly airlineInfos: {
    code: string;
    name: string;
  }[];

  readonly locationNames: { [airportIata: string]: SearchResultsLocation };
  readonly airportInfos: {
    airport: string;
    city: string;
    iataCode: string;
  }[];

  readonly baggageAllowance: { [baggageAllowanceDescription: string]: number[] };
  readonly baggageAllowanceInfos: {
    correspondingSegmentIdList: number[];
    description: string;
    included: boolean;
    type: 'CHECKED' | 'HAND';
  }[];

  readonly promoInfo: { [promotionDescription: string]: number[] };
  readonly promotionInfos: {
    correspondingItineraryIdList: number[];
    promotionalText: string;
  }[];

  /**
   * The preferredAirline properties will only be populated in a preferred airline is selected
   * during search. This now happens via deep link only.
   *
   * Preferred Airline Display used to available as a drop down in searchData.moreOptions with key/values,
   * but we dont have the 'display' in the FE any longer so only the code is used now,
   * and we would lookup the display part once the search-results comes back.
   *
   */
  readonly preferredAirlineCode?: string;
  readonly preferredAirlineDisplay?: string;

  /**
   * The priceResponse property will only be populated if this search is performed as part of a
   * price deep-link
   */
  readonly priceResponse?: PriceResult;

  // This will only be populated for return international searches
  readonly calendarItineraries?: SearchResultsItinerary[];

  // This will only be populated for bundled results
  itineraries?: SearchResultsItinerary[];

  // The next two will only be populated for unbundled results
  readonly inboundItineraries?: SearchResultsItinerary[];
  readonly outboundItineraries?: SearchResultsItinerary[];
  readonly display?: {
    cheapestWithoutFlexiTicketAmount: number;
    cheapestWithoutFlexiTicketCurrency: string;
  };

  // The displayInfo property gets populated when the app receives the RS object from the web-api
  readonly displayInfo?: SearchResultsDisplayInfo;
  // The UUID property gets populated for B2B web-api
  readonly uuid?: string;
}
