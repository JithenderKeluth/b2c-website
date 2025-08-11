import { SearchResultsSortOption } from '../results/search-results-sort-option.model';
export const SORT_OPTIONS = {
  // Default
  cheapest: new SearchResultsSortOption('priceAsc', 'Cheapest'),
  earliestDeparture: new SearchResultsSortOption('departureAsc', 'Earliest Departure'),
  latestDeparture: new SearchResultsSortOption('departureDesc', 'Latest Departure'),
  // Only used for unbundled search results
  fastest: new SearchResultsSortOption('durationAsc', 'Fastest'),
};
