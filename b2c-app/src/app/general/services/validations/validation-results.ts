import { assign, every, has } from 'lodash';

/**
 * Used to represent the results of various validator classes validating various states.
 * ValidationResults objects will contain a validationFields property containing the validation state of each key:
 *
 * - `false`: invalid
 * - `true`: valid
 * - `undefined`/`null`: pending (required)
 * - not defined: not validated (counts as valid)
 *
 * Setting a validationField to `undefined`/`null` will force `isValid()` to include the key in the iteration and therefore fail validation (ie. return `false`).
 *
 * This is intended as a way to force a key's validation to be required without setting the key itself to a failed validation state.
 *
 * This can be achieved with `ValidationResults#validateField('example', null)` (`null` is preferred, but `undefined` will work too, as long as the key exists on the object).
 */
export class ValidationResults {
  public validationFields: { [key: string]: boolean };

  public constructor() {
    this.validationFields = {};
  }

  /**
   * Set/Update a field's validation status
   * @param fieldName The key for the relevant field being validated
   * @param isValid Did this field pass validation
   */
  public validateField(fieldName: string, isValid: boolean): void {
    this.validationFields[fieldName] = isValid;
  }

  /**
   * Get a specified field's validation status
   * @param fieldName The key for the field you wish to query
   * @returns The field's validation status (`false` if required field hasn't been validated, or `true` if not defined)
   */
  public getFieldStatus(fieldName: string): boolean {
    return !has(this.validationFields, fieldName) || this.validationFields[fieldName] === true;
  }

  /**
   * Updates the current validation fields with those provided.
   * Sets/Overwrites provided fields and keeps the status of those omitted.
   *
   * WARNING! This mutates the existing validationFields object
   * @param validationResults A map of field validations to ingest
   */
  public ingest(validationResults: ValidationResults): void {
    this.validationFields = assign({}, this.validationFields, validationResults.validationFields);
  }

  /**
   * Calculates the overall validity of this object's validation fields
   * @returns true if all validation passed, else false
   */
  public isValid(): boolean {
    return every(this.validationFields, (validationField) => validationField === true);
  }
}
