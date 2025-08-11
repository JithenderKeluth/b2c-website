import { SearchResults } from './search-results.model';

export interface SearchResponse {
  response: SearchResults;
  visits: number;
  UUID?: string;
}
