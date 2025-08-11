import { filter, keys } from 'lodash';
import { ValidationResults } from './validation-results';

export class SearchRouteValidation {
  public originValidation: ValidationResults;
  public destinationValidation: ValidationResults;
  public dateValidation: ValidationResults;

  constructor({
    originValidation = new ValidationResults(),
    destinationValidation = new ValidationResults(),
    dateValidation = new ValidationResults(),
  } = {}) {
    this.originValidation = originValidation;
    this.destinationValidation = destinationValidation;
    this.dateValidation = dateValidation;
  }

  public isValid(): boolean {
    return this.originValidation.isValid() && this.destinationValidation.isValid() && this.dateValidation.isValid();
  }

  public getAllInvalidFields(): string[] {
    const allValidationFields = {
      ...this.dateValidation.validationFields,
      ...this.destinationValidation.validationFields,
      ...this.originValidation.validationFields,
    };

    return filter(keys(allValidationFields), (key: string) => allValidationFields[key] === false);
  }
}
