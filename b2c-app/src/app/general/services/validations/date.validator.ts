import { ValidationResults } from './validation-results';
import moment from 'moment';

export class DateValidator {
  public static readonly DATE_BEFORE_EARLIEST = 'dateBeforeEarliest';
  public static readonly DATE_BLANK = 'dateBlank';

  public validateDateCaptured(date: moment.Moment): ValidationResults {
    const results = new ValidationResults();

    results.validateField(DateValidator.DATE_BLANK, !!(date && date.isValid()));

    return results;
  }

  public validateDateAfterEarliest(date: moment.Moment, earliestDate: moment.Moment): ValidationResults {
    const results = new ValidationResults();

    results.validateField(DateValidator.DATE_BEFORE_EARLIEST, !!(date && earliestDate && earliestDate.isBefore(date)));

    return results;
  }
}
