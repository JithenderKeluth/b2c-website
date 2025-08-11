import { forEach, head } from 'lodash';
import { Injectable } from '@angular/core';
import { SearchData } from './../../../flights/models/search/search-data.model';
import { TRIP_TYPES } from './../../../flights/models/trip-types';
import { SearchItinerary } from './../../../flights/models/search/search-itinerary.model';
import { ValidationResults } from './validation-results';
import { parseMomentExact } from './../../deeplinks/date-utils';
import { SearchRouteValidation } from './search-route-validation';
import { LocationValidator } from './location.validator';
import { DateValidator } from './date.validator';

@Injectable()
export class SearchDataValidator {
  constructor(private locationValidator: LocationValidator, private dateValidator: DateValidator) {}

  public isSearchDataValid(
    searchData: SearchData,
    validation: {
      [itineraryId: string]: SearchRouteValidation;
    } = {}
  ): boolean {
    if (!searchData) {
      return false;
    }

    let isAllValid = true;

    if (searchData.tripType !== TRIP_TYPES.multiCity) {
      isAllValid = this.isItineraryValid(head(searchData.itineraries), searchData, validation);
    } else {
      forEach(searchData.itineraries, (itinerary) => {
        isAllValid = this.isItineraryValid(itinerary, searchData, validation) && isAllValid;
      });
    }

    return isAllValid;
  }

  /**
   * Performs validation for a single itinerary and saves the results in the this.validation object
   * @param itinerary The itinerary to validate
   * @param searchData
   * @param validation
   * @returns The validation state of the given itinerary
   */
  public isItineraryValid(
    itinerary: SearchItinerary,
    searchData: SearchData,
    validation: {
      [itineraryId: string]: SearchRouteValidation;
    }
  ): boolean {
    const originValidation: ValidationResults = this.locationValidator.validateLocationCaptured(
      itinerary.origin,
      'origin'
    );

    const destinationValidation: ValidationResults = this.locationValidator.validateLocationCaptured(
      itinerary.destination,
      'destination'
    );

    destinationValidation.ingest(
      this.locationValidator.validateLocationDifferent(itinerary.origin, itinerary.destination, 'destination')
    );

    const dateValidation: ValidationResults = this.dateValidator.validateDateCaptured(
      parseMomentExact(itinerary.departDate)
    );

    if (dateValidation.isValid() && searchData.tripType === TRIP_TYPES.return) {
      dateValidation.ingest(this.dateValidator.validateDateCaptured(parseMomentExact(itinerary.returnDate)));
    }

    validation[itinerary.id] = new SearchRouteValidation({
      dateValidation,
      destinationValidation,
      originValidation,
    });

    return validation[itinerary.id].isValid();
  }
}
