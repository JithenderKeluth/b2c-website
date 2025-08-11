import { Segment } from './segment.model';

/**
 * ODO stands for Origin Destination Option and represents a "leg" of the traveller's journey
 * including any layovers or stops (segments).
 *
 * A one-way flight will have one odo
 * A return flight will have two odos (if bundled, they will both be in the one itinerary, if
 * unbundled they will be individual odos in the two itineraries)
 * A multi-city itinerary will have a number of odos equal to the number of search-itineraries in
 * the search data
 */
export interface Odo {
  duration: number;
  companyName: string;
  segments: Segment[];
  bookingFlightSegmentList?: Segment[];
}
