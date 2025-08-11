import { CabinClass } from './../../models/cabin-class.model';

export interface SearchResultsFilters {
  availableAirlines: {
    airlineCode: string;
    airlineName: string;
    cheapestPrice: number;
  }[];
  availableCabinClasses: CabinClass[];
  availableStopsOptions: {
    id: string;
    display: string;
  }[];
  maximumPrice: number;
  minimumPrice: number;

  selectedAirlines: string[];
  selectedCabinClasses: CabinClass[];
  selectedMaximumPrice: number;
  selectedMinimumPrice: number;
  selectedStopsOptions: string[];

  departTimeOptions: {
    originCityName: string;
    destinationCityName: string;
    earliestDepartTime: number;
    latestDepartTime: number;
    selectedEarliestDepartTime: number;
    selectedLatestDepartTime: number;
  }[];
}
