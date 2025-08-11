import { Injectable } from '@angular/core';

import { ValidationResults } from './validation-results';
import { LocationWrapper } from './../locations/location-wrapper';

@Injectable()
export class LocationValidator {
  /**
   * Validates a LocationWrapper to ensure it's code is different from the compared LocationWrapper
   * @param location The location being validated
   * @param comparison The location to compare with
   * @param locationType The name/type of the location field (eg. 'origin')
   * @returns Valid ValidationResults if the locations are different OR either location is not valid, else invalid if the locations are the same
   *
   * validationField key will be `${locationType}Same`
   */
  public validateLocationDifferent(
    location: LocationWrapper,
    comparison: LocationWrapper,
    locationType: string
  ): ValidationResults {
    const results = new ValidationResults();

    if (location && !location.isBlank() && comparison && !comparison.isBlank()) {
      results.validateField(`${locationType}Same`, location.value.code !== comparison.value.code);
    }

    return results;
  }

  /**
   * Validates a LocationWrapper to ensure it has a value
   * @param location The location to validate
   * @param locationType The name/type of the location field (eg. 'origin')
   * @returns Valid ValidationResults if the LocationWrapper has a value
   *
   * validationField key will be `${locationType}Blank`
   */
  public validateLocationCaptured(location: LocationWrapper, locationType: string): ValidationResults {
    const results = new ValidationResults();

    results.validateField(`${locationType}Blank`, !!(location && !location.isBlank()));

    return results;
  }
}
