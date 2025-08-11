import moment from 'moment';

const DATE_FORMAT: string = 'YYYY-MM-DD';
const DEEPLINK_FORMATS: string[] = ['YYYY-MM-DD', 'DD-MM-YY'];
const MAX_NUM_DAYS_TO_RETURN: number = 365;

function getTimestamp(): number {
  return moment().unix();
}

function getDeeplinkFormatsAsString(): string {
  return DEEPLINK_FORMATS.join(',');
}

function parseMoment(dateString: string): moment.Moment {
  return moment(dateString, DATE_FORMAT);
}

function parseMomentExact(dateString: string): moment.Moment {
  return moment(dateString, DATE_FORMAT, true);
}

function parseDeeplinkMomentExact(dateString: string): moment.Moment {
  return moment(dateString, DEEPLINK_FORMATS, true);
}

function getMaxDateMoment(): moment.Moment {
  return moment().add(MAX_NUM_DAYS_TO_RETURN, 'days');
}

function getMinDepartMoment(minHours: number): moment.Moment {
  const now = moment();
  now.add(minHours, 'hours');

  return now;
}

function formatNowNoLocale(): string {
  return formatMomentNoLocale(moment());
}

function formatStringNoLocale(dateString: string): string {
  return formatMomentNoLocale(parseMoment(dateString));
}

function formatMomentNoLocale(mmnt: moment.Moment): string {
  return mmnt.clone().locale('en').format(DATE_FORMAT);
}

function formatDateNoLocale(date: Date): string {
  return formatMomentNoLocale(moment(date));
}

export {
  getTimestamp,
  getDeeplinkFormatsAsString,
  parseMoment,
  parseMomentExact,
  parseDeeplinkMomentExact,
  getMaxDateMoment,
  formatNowNoLocale,
  formatStringNoLocale,
  formatMomentNoLocale,
  formatDateNoLocale,
  getMinDepartMoment,
};
