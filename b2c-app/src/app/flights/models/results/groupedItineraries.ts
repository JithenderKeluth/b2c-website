import { Moment } from 'moment';
import { SearchResultsItinerary } from './search-results-itinerary.model';

export interface GroupedItineraries {
  groupId: string;
  airlineCode: string;
  airlineName: string;
  amount: number;
  departDate: Moment;
  duration: number;
  itineraries: SearchResultsItinerary[];
  isExpanded: boolean;
  isMoreFlightsExpanded?: boolean;
}
