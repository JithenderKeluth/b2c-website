import {
  difference,
  filter,
  find,
  forEach,
  get,
  head,
  includes,
  isEmpty,
  isNumber,
  isUndefined,
  join,
  lowerCase,
  map,
  matches,
  reduce,
  size,
  uniq,
  flatMap,
  omit,
} from 'lodash';
import moment from 'moment';
import { PRODUCT } from './../../general/constants/product.constants';
import { TRAVELLER_TYPE } from './../../general/constants/traveller-type.constants';
import { VALIDATION_PROPERTY } from './../../general/constants/validation-property.constants';
import { PRICE } from './../../general/constants/price.constants';
import { BookingDataTravellers } from './../models/booking-data-travellers.model';
import { Traveller } from './../../general/account/Traveller';
// import { ACCOUNT_DATE_FORMAT } from 'account/utils/travelstart-account.utils';
import { FrequentFlyer } from './../../general/account/frequent-flyer.model';
import { getDestinationCityName, getOriginCityName } from '../../flights/utils/odo.utils';
import { TitleModel } from './../../general/account/title.model';
import { BookingDataTraveller } from './../../flights/models/price/booking-data-traveller.model';
import { UntypedFormArray, UntypedFormGroup, Validators } from '@angular/forms';

const CARD_EXPIRY_DATE_FORMAT = 'MM/YY';
const ACCOUNT_DATE_FORMAT = 'YYYY-MM-DD';

/**
 * NG1 getPassengerType
 * Usually how old the traveller would be on the last date of travelling
 *
 * @param age
 */
export function travellerTypeByAge(age: number): string {
  if (!isNumber(age) || age < 0) {
    return null;
  } else if (age < TRAVELLER_TYPE.INFANT.ageMaxExclusive) {
    return TRAVELLER_TYPE.INFANT.type;
  } else if (age < TRAVELLER_TYPE.CHILD.ageMaxExclusive) {
    return TRAVELLER_TYPE.CHILD.type;
  } else if (age < TRAVELLER_TYPE.YOUNGADULT.ageMaxExclusive) {
    return TRAVELLER_TYPE.YOUNGADULT.type;
  } else {
    return TRAVELLER_TYPE.ADULT.type;
  }
}

/**
 * NG1 calculatePassengerTypeByAge
 * Return TravellerType by date
 *
 * @param birthDate
 * @param lastDateOfTravelling -> defaults to now
 */
export function travellerTypeByDate(
  dateOfBirth: moment.Moment,
  lastDateOfTravelling: moment.Moment = moment()
): string {
  if (!dateOfBirth || !lastDateOfTravelling) {
    return undefined;
  }

  return travellerTypeByAge(ageInYears(dateOfBirth, lastDateOfTravelling));
}

/**
 * NG1 calculatePassengerAgeFromDate
 * Age in years
 * If you want a floating point number, pass true as the third argument.
 * @param startDate -> usually dateOfBirth
 * @param endDate -> defaults to now
 * @param precise
 */
export function ageInYears(
  startDate: moment.Moment,
  endDate: moment.Moment = moment(),
  precise: boolean = true
): number {
  if (!startDate) {
    return 0;
  }

  // strip time from last/first departure
  endDate.startOf('day');

  /**
   * By default, moment#diff will truncate the result to zero decimal places,
   * returning an integer.
   * If you want a floating point number, pass true as the third argument.
   *
   * var a = moment([2008, 9]);
   * var b = moment([2007, 0]);
   * a.diff(b, 'years');       // 1
   * a.diff(b, 'years', true); // 1.75
   */

  return endDate.diff(startDate, 'years', precise);
}

export function convertDateToMoment(model: any, property: any): moment.Moment {
  if (!model || !property || !model[property]) {
    return undefined;
  }

  return moment([model[property].year, model[property].month - 1, model[property].day]);
}

export function travellerDisplayType(travellerType: string): string {
  switch (travellerType) {
    case TRAVELLER_TYPE.CHILD.type:
      return TRAVELLER_TYPE.CHILD.display;
    case TRAVELLER_TYPE.INFANT.type:
      return TRAVELLER_TYPE.INFANT.display;
    case TRAVELLER_TYPE.YOUNGADULT.type:
      return TRAVELLER_TYPE.YOUNGADULT.display;
    default:
      return TRAVELLER_TYPE.ADULT.display;
  }
}

// ------------------------- SEATS ------------------------- VVV
export function containsSeatSelection(travellers: any): boolean {
  if (!travellers) {
    return false;
  }

  let found: boolean = false;

  forEach(travellers, (travellerTypeList) => {
    forEach(travellerTypeList, (traveller) => {
      if (traveller.specialRequests && traveller.specialRequests.seatDetails) {
        const seat = find(
          traveller.specialRequests.seatDetails,
          (seatDetail) => seatDetail.seatNumber && seatDetail.seatNumber.length > 0
        );
        if (seat) {
          found = true;
        }
      }
    });
  });

  return found;
}

export function clearSeatSelection(travellerList: BookingDataTraveller[]): void {
  if (isEmpty(travellerList)) {
    return;
  }

  forEach(travellerList, (traveller: BookingDataTraveller) => {
    if (get(traveller, 'specialRequests.seatDetails')) {
      forEach(traveller.specialRequests.seatDetails, (seat) => {
        seat.basePrice = 0;
        seat.price = 0;
        seat.currency = '';
        seat.flightNumber = '';
        seat.seatNumber = '';
      });
    }
  });
}

export function setDefaultSeatSelection(travellers: any, itineraries: any[]): void {
  if (!travellers || !itineraries) {
    return;
  }

  forEach(travellers, (travellerPerTypeList) => {
    forEach(travellerPerTypeList, (traveller) => {
      traveller.specialRequests = traveller.specialRequests || {};
      traveller.specialRequests.seatDetails = [];
      forEach(itineraries, (itinerary) => {
        forEach(itinerary.odoList, (odo) => {
          forEach(odo.segments, (segment) => {
            traveller.specialRequests.seatDetails.push({
              currency: itinerary.currencyCode,
              flightNumber: segment.flightNumber,
              price: 0,
              seatNumber: '',
            });
          });
        });
      });
    });
  });
}

// NG1 calculateSeatsTotal
/**
 * Returns the total cost of seats calculated by adding the total traveller seat cost with
 * the seats product fee (if any)
 *
 * @param travellerList
 * @param travellerProducts (optional)
 */
export function seatsTotal(travellerList: BookingDataTraveller[], travellerProducts?: any[]): number {
  const seatsProduct = find(travellerProducts, matches({ id: PRODUCT.SEATS_ID }));
  const seatsOnlyTotal = reduce(
    travellerList,
    (total, traveller: any) => {
      return (
        total +
        // If traveller.specialRequests.seatDetails exists...
        (!isUndefined(get(traveller, 'specialRequests.seatDetails'))
          ? // ... Calculate subtotal for this traveller from each seatDetail object
            reduce(
              traveller.specialRequests.seatDetails,
              (subTotal, seatDetail) => subTotal + seatDetail.price,
              0 // Initialise total at 0
            )
          : // ... else add 0 to the total
            0)
      );
    },
    0 /* Initialise total at 0 */
  );

  return seatsOnlyTotal + (seatsProduct ? seatsProduct.amount : 0);
}

export function getSeatsInOdoSegment(odos: any, travellers: BookingDataTravellers, list: any): any[] {
  const travellersList = travellers.adults.concat(travellers.children);
  const seatsPerFlight = {};

  forEach(travellersList, (travellerList) => {
    if (travellerList && travellerList.specialRequests && travellerList.specialRequests.seatDetails) {
      const details = travellerList.specialRequests.seatDetails;
      addSeatToSegment(details, seatsPerFlight);
    }
  });

  return map(odos, (odo) => {
    const newOdo: any = {
      destination: getDestinationCityName(odo, list),
      origin: getOriginCityName(odo, list),
      segments: {},
    };

    forEach(odo.segments, (segment, segmentIndex) => {
      newOdo.segments[segmentIndex] = {
        destination: segment.destCode,
        flightNumber: segment.flightNumber,
        origin: segment.origCode,
        // lodash#join returns `""` if no valid value passed
        // here default back to `undefind`
        seats: join(seatsPerFlight[segment.flightNumber], ',') || undefined,
      };
    });

    return newOdo;
  });
}

export function addSeatToSegment(seatDetails: any[], seatsPerSegment: any): void {
  forEach(seatDetails, (detail) => {
    const flightNumber = detail.flightNumber;
    const seatNumber = detail.seatNumber;

    if (!seatNumber) {
      return;
    }

    seatsPerSegment[flightNumber] = seatsPerSegment[flightNumber] || [];
    seatsPerSegment[flightNumber].push(seatNumber);
  });
}

// ------------------------- SEATS ------------------------- ^^^

// ------------------------- VALIDATION ------------------------- vvv
/*
 * only adults/teens traveling (no minors)
 * NG1 hasOnlyTeensWithMinors
 */
export function hasUnaccompaniedMinors(travellers: any, lastArrivalDate: moment.Moment): boolean {
  if (
    !travellers ||
    !lastArrivalDate ||
    isEmpty(travellers.adults) ||
    (isEmpty(travellers.children) && isEmpty(travellers.infants))
  ) {
    return false;
  }

  const firstAdult: any = head(travellers.adults);

  if (!firstAdult || !get(firstAdult, VALIDATION_PROPERTY.DOB, '')) {
    return false;
  }

  let hasTeens = false;
  let hasAdults = false;

  forEach(travellers.adults, (adult) => {
    if (isTeen(adult, lastArrivalDate)) {
      hasTeens = true;
    } else {
      hasAdults = true;
    }
  });

  // has only teens with minors
  return !hasAdults && hasTeens;
}

export function isTeen(adult: any, lastArrivalDate: moment.Moment): boolean {
  // exclusive
  const teenEndAge = 18;
  const dateOfBirth = convertDateToMoment(adult, VALIDATION_PROPERTY.DOB);
  const age = ageInYears(dateOfBirth, lastArrivalDate);

  return age < teenEndAge;
}

export function validateTravellerForDuplicateName(traveller: any, duplicateNames: any[]): boolean {
  if (!traveller || !duplicateNames) {
    return false;
  }

  let isValid = true;

  const concatName = lowerCase(traveller.firstName + traveller.lastName || '');

  if (includes(duplicateNames, concatName)) {
    isValid = false;
    if (!traveller.validation) {
      traveller.validation = {};
    }

    invalidate('passengersDuplicate', traveller.validation);
  }

  duplicateNames.push(concatName);

  return isValid;
}

export function invalidate(propertyName: string, validation: any): void {
  validation[propertyName + PRICE.VALID] = false;
  validation.isValid = false;
}

/*
 * Removes fields that are not displayed on-screen
 */
export function stripTraveller(traveller: any, validationSettings: any[]): void {
  let hiddenFields = map(
    filter(validationSettings, (validationSetting) => !validationSetting.displayed),
    'propertyName'
  );
  const includedFields = map(
    filter(validationSettings, (validationSetting) => validationSetting.displayed),
    'propertyName'
  );

  // do not strip included fields (due to different rules including a previously hidden field)
  hiddenFields = uniq(difference(hiddenFields, includedFields));

  if (!isEmpty(hiddenFields)) {
    forEach(hiddenFields, (hiddenPropertyName) => {
      delete traveller[hiddenPropertyName];
    });
  }
}

// ------------------------- VALIDATION ------------------------- ^^^

export function titleOptions(travellerType?: string, language?: string): any {
  const result: TitleModel[] = [
    {
      display: 'Mr',
      id: 'Mr',
    },
    {
      display: 'Ms',
      id: 'Ms',
    },
  ];

  if ((!language || language !== 'tr') && (!travellerType || travellerType === TRAVELLER_TYPE.ADULT.type)) {
    result.push({
      display: 'Mrs',
      id: 'Mrs',
    });
  }

  return result;
}

export function hasTravellers(travellers: any): boolean {
  return travellerCount(travellers) > 0;
}

export function travellerCount(travellers: any): number {
  let count: number = 0;
  if (!travellers) {
    return count;
  }

  forEach(travellers, (travellerTypeList) => {
    count += size(travellerTypeList);
  });

  return count;
}

export function hasFrequentFlyerDetails(bookingDataTravellers: BookingDataTravellers): boolean {
  const travellerTypes = flatMap(bookingDataTravellers, (travellerType) => travellerType);

  return !isEmpty(
    find(travellerTypes, (traveller: BookingDataTraveller) => {
      return !isEmpty(get(traveller, 'specialRequests.frequentFlyerDetailsList'));
    })
  );
}

export function getTravellerValidationAdditionalParams(validationResults: any): {} {
  if (validationResults && validationResults.passengersValidationResults) {
    return omit(omit(validationResults.passengersValidationResults, 'invalidFields'), 'passengerValidationResults');
  }

  return {};
}

// ------------------------- ACCOUNT ------------------------- vvv
export function convertBusinessTraveller(traveller: Traveller, lastArrivalDate: moment.Moment): any {
  if (!traveller) {
    return null;
  }

  // tslint:disable:object-literal-sort-keys
  const result = {
    id: '',
    display: '',
    title: traveller.title,
    firstName: traveller.firstName,
    middleName: traveller.middleName,
    lastName: traveller.surname,
    email: traveller.email,
    dob: {},
    dobFormatted: '',
    specialRequests: {},
    type: '',
    passportNumber: traveller.passportNumber,
    passportCountry: traveller.passportIssuingCountry,
    passportExpiry: {},
    passportExpiryFormatted: '',
    nationality: traveller.nationality,
  };

  // dates
  if (traveller.dateOfBirth) {
    const dateOfBirthParsed = moment.utc(traveller.dateOfBirth, ACCOUNT_DATE_FORMAT, 'en');
    if (dateOfBirthParsed.isValid()) {
      result.dob = {
        day: dateOfBirthParsed.date(),
        month: dateOfBirthParsed.month() + 1,
        year: dateOfBirthParsed.year(),
      };
      result.dobFormatted = dateOfBirthParsed.format();
      result.type = travellerTypeByDate(dateOfBirthParsed, lastArrivalDate);
    }
  }
  if (traveller.passportExpiryDate) {
    const expiryDateParsed = moment.utc(traveller.passportExpiryDate, ACCOUNT_DATE_FORMAT, 'en');
    if (expiryDateParsed.isValid()) {
      result.passportExpiry = {
        day: expiryDateParsed.date(),
        month: expiryDateParsed.month() + 1,
        year: expiryDateParsed.year(),
      };
      result.passportExpiryFormatted = expiryDateParsed.format();
    }
  }

  // calculate display values
  const travellerTitle = traveller.title ? `${traveller.title} ` : '';
  const travellerFullname = `${traveller.firstName || ''} ${traveller.surname || ''}`;

  result.display = `${travellerTitle}${travellerFullname}`;

  // set id hash
  result.id = `${traveller.id}`;

  // frequentFlyerDetails
  if (traveller.frequentFlyerDetails) {
    result.specialRequests = {
      frequentFlyerDetailsList: convertFrequentFlyerDetails(traveller.frequentFlyerDetails),
    };
  }

  return result;
}

/**
 * The ts-account format are different as current angular app
 * So, we have to convert the format to match current angular app
 */
export function convertFrequentFlyerDetails(frequentFlyerList: FrequentFlyer[]): any {
  return map(frequentFlyerList, (frequentFlyer: FrequentFlyer) => {
    return {
      airlineCode: frequentFlyer.airlineCode,
      companyShortName: frequentFlyer.companyShortName,
      frequentFlyerCode: frequentFlyer.frequentFlyerNumber,
    };
  });
}

// ------------------------- ACCOUNT ------------------------- ^^^

// -------------------------seat ------------------------- ^^^
export function extractSeatDetailsDisplayData(travellerList: any, sel_seatsList: any, passengersInitVal?: any) {
  let seatFinalDisplayInfo = <any>[];
  if (travellerList.length > 0) {
    for (let traveller in travellerList) {
      if (
        travellerList[traveller].specialRequests &&
        travellerList[traveller].specialRequests.seatDetails &&
        travellerList[traveller].specialRequests.seatDetails.length > 0
      ) {
        const seatData = travellerList[traveller].specialRequests.seatDetails;
        for (let seat in seatData) {
          if (seatData[seat].seatNumber) {
            for (let sel_seat in sel_seatsList) {
              if (
                seatData[seat].seatNumber === sel_seatsList[sel_seat].selectedSeat &&
                seatData[seat].flightNumber ===
                  sel_seatsList[sel_seat].id.aircraft.carrierCode + sel_seatsList[sel_seat].id.aircraft.flightNumber
              ) {
                if (sel_seatsList[sel_seat].id.selectedSeat && sel_seatsList[sel_seat].id.selectedSeat.passenger) {
                  const pax = getPassengerName(sel_seatsList[sel_seat].id.selectedSeat.passenger, passengersInitVal);
                  let seat_itin_info = {
                    ...seatData[seat],
                    id: sel_seatsList[sel_seat].id.id,
                    arrival: sel_seatsList[sel_seat].id.arrival,
                    departure: sel_seatsList[sel_seat].id.departure,
                    passenger: pax,
                  };
                  seatFinalDisplayInfo.push(seat_itin_info);
                }
              }
            }
          }
        }
      }
    }
  }

  return seatFinalDisplayInfo;
}

// group seats by passensers
export function groupByPassengerSeat(array: any) {
  return array.reduce((r: any, a: any) => {
    r[a.passenger] = r[a.passenger] || [];
    r[a.passenger].push(a);
    return r;
  }, Object.create(null));
}

export function getSeatMarkUpPrice(price_Data: any) {
  if (price_Data && price_Data.markupRule) {
    return price_Data.markupRule;
  }
}

export function getPassengerName(passenger: any, passengersInitVal: any) {
  if (passenger.infant) {
    return checkHeld_InfantPax(passenger, passengersInitVal);
  } else {
    let pax = passengersInitVal.find(
      (x: any) => x.uId == passenger.identity.firstName + ' ' + passenger.identity.lastName && x.type != 'HELD_INFANT'
    );
    if (pax) {
      return pax.first_name + ' ' + pax.last_name;
    } else {
      return passenger.identity.firstName + ' ' + passenger.identity.lastName;
    }
  }
}
export function checkHeld_InfantPax(passenger: any, passengersInitVal: any) {
  let infant_Pax = passengersInitVal.find(
    (x: any) =>
      x.uId == passenger.infant.identity.firstName + ' ' + passenger.infant.identity.lastName && x.type == 'HELD_INFANT'
  );
  if (infant_Pax) {
    return infant_Pax.parent_name + ' + ' + ' HELD INFANT ' + ' ' + infant_Pax.first_name + ' ' + infant_Pax.last_name;
  } else {
    return (
      passenger.identity.firstName +
      ' ' +
      passenger.identity.lastName +
      ' + ' +
      ' HELD INFANT ' +
      ' ' +
      passenger.infant.identity.firstName +
      ' ' +
      passenger.infant.identity.lastName
    );
  }
}
/**It will return the object with update price or refresh results values based on user selection in the session time out pop up*/
export function searchOrUpdatePrice(param: string) {
  let idleSessionObj: any;
  if (param == 'refreshResults') {
    idleSessionObj = {
      isIdleTimeoutOpen: false,
      refreshResults: true,
      updatePrice: false,
    };
  } else if (param == 'updatePrice') {
    idleSessionObj = {
      isIdleTimeoutOpen: false,
      refreshResults: false,
      updatePrice: true,
    };
  }
  return idleSessionObj;
}

/**retrieves an array of countries from the session storage.finally, it returns the sorted array.*/
export function getCountriesArray() {
  let countriesArray = [];
  if (typeof window !== 'undefined' && window.sessionStorage) {
    if (sessionStorage.getItem('countries')) {
      countriesArray = JSON.parse(sessionStorage.getItem('countries'));
      countriesArray = countriesArray.sort((a: any, b: any) => a.name.localeCompare(b.name));
    }
  }
  return countriesArray;
}
/**Here it takes the country name as an argument and returns the iso code*/
export function getCountryCode(countryName: any) {
  let countriesList = [];
  countriesList = getCountriesArray();
  let code: string = '';
  for (let i in countriesList) {
    if (countriesList[i]['name'] === countryName.name || countriesList[i]['name'] === countryName) {
      code = countriesList[i]['isoCode'];
    }
  }
  return code;
}
export function getFeeAmount(): number {
  /**TO DO if TBI fee added from UI side
   *  const flightsearchInfo = JSON.parse(sessionStorage.getItem('flightsearchInfo'));
  const flightResultsList = JSON.parse(getStorageData('flightResults'));
  const paxCount =
    flightsearchInfo.travellers.adults + flightsearchInfo.travellers.children + flightsearchInfo.travellers.infants;
  let fee: number = flightResultsList.isIntl ? 200 : 95;
  let feeAmount: number = paxCount * fee;
  */

  return 0;
}
export function getCountryName(countryCode: string) {
  let countriesList = [];
  countriesList = getCountriesArray();
  for (let i in countriesList) {
    if (countriesList[i]['isoCode'] == countryCode) {
      return countriesList[i];
    }
  }
}
export function checkMiddleNameRequired(index: number, settings: any, travellerType: any, travllerInfoForm: UntypedFormArray) {
  if (travellerType === 'ADULT' && settings.adultSettings && settings.adultSettings.middleNameRequired) {
    setMiddleNameValidators(index, travllerInfoForm);
  }
  if (travellerType === 'YOUNGADULT' && settings.adultSettings && settings.youngAdultSettings.middleNameRequired) {
    setMiddleNameValidators(index, travllerInfoForm);
  }
  if (travellerType === 'CHILD' && settings.childSettings && settings.childSettings.middleNameRequired) {
    setMiddleNameValidators(index, travllerInfoForm);
  }
  if (travellerType === 'INFANT' && settings.infantSettings && settings.infantSettings.middleNameRequired) {
    setMiddleNameValidators(index, travllerInfoForm);
  }
}
export function setMiddleNameValidators(index: number, travllerInfoForm: UntypedFormArray) {
  travllerInfoForm.controls[index].get('middleName').setValidators(Validators.required);
  travllerInfoForm.controls[index].get('middleName').updateValueAndValidity();
}
/**Checking the length of first name and last name of Adult,Infant, if it is greater than 59 we are restricting the user from payments*/
export function checkPaxNameLengthValidation(travellerForm: UntypedFormGroup, travllerInfoForm: UntypedFormArray): boolean {
  const controls = <UntypedFormArray>travellerForm.controls['travellersList'];
  let value: boolean = false;
  for (let i = 0; i < controls.length; i++) {
    if (travllerInfoForm.controls[i]) {
      const travellerType = travllerInfoForm.controls[i].get('type').value;
      if (travellerType === 'ADULT' || travellerType === 'INFANT') {
        const adultControl = travllerInfoForm.controls[i];
        const infantControl = travellerType === 'INFANT' ? adultControl : null;
        const adultFirstName = adultControl.get('firstName').value.trim();
        const adultLastName = adultControl.get('lastName').value.trim();
        const infantFirstName = infantControl ? infantControl.get('firstName').value.trim() : '';
        const infantLastName = infantControl ? infantControl.get('lastName').value.trim() : '';
        const fullNameLength = (adultFirstName + adultLastName + infantFirstName + infantLastName).length;
        if (fullNameLength > 59) {
          value = true;
        }
      }
    }
  }
  return value;
}

/**To check passenger TYPE */
export function getTravellerType(travellers: any, param: string) {
  if (param === 'infant' && travellers > 1) {
    return 'Infants';
  } else if (param === 'infant' && travellers === 1) {
    return 'Infant';
  }
  if (param === 'adult' && travellers > 1) {
    return 'Adults';
  } else if (param === 'adult' && travellers === 1) {
    return 'Adult';
  }
  if (param === 'youngAdults' && travellers > 1) {
    return 'Young Adults';
  } else if (param === 'youngAdults' && travellers === 1) {
    return 'Young Adult';
  }
}

/**check passengers have youngAdult or not in search and update fare breakdown  */
export function updateFareInfoTravellers(travellers: any) {
  if (typeof window !== 'undefined' && window.sessionStorage) {
    let flightSearchInfo = sessionStorage.getItem('flightsearchInfo')
    ? JSON.parse(sessionStorage.getItem('flightsearchInfo'))
    : null;
    let travellersList = travellers;
    let youngAdultAmont = 0;
    if (flightSearchInfo?.travellers?.youngAdults && !travellersList?.youngAdults && travellersList?.adults.qty > 1) {
      youngAdultAmont = travellersList.adults.baseFare / travellersList.adults.qty;
      travellersList.adults.qty = travellersList.adults.qty - flightSearchInfo.travellers.youngAdults;
      travellersList.adults.baseFare =
        travellersList.adults.baseFare - youngAdultAmont * flightSearchInfo.travellers.youngAdults;
      travellersList.youngAdults = {
        baseFare: youngAdultAmont * flightSearchInfo.travellers.youngAdults,
        qty: flightSearchInfo.travellers.youngAdults,
        isModified: true,
      };
      return travellersList;
    } else {
      return travellersList;
    }
  }
}

/**It returns the baggage amount based on the traveller form value*/
export function getBaggageFee(travellers: any) {
  let baggageFee = 0;
  if (travellers.length > 0) {
    for (let i = 0; i < travellers.length; i++) {
      if (travellers[i].baggageData.length > 0) {
        for (let j = 0; j < travellers[i].baggageData.length; j++) {
          if (travellers[i].baggageData[j].preSelected) {
            baggageFee += travellers[i].baggageData[j].amount;
          }
        }
      }
    }
  }
  return baggageFee;
}

/**It removes the diacritics from the entered text */
export function removeDiacriticsAndHyphens(text: string) {
  let paxName = text;
  const name = paxName.replace(/’/g, '');
  const diacriticMap: { [key: string]: string } = {
    à: 'a',
    á: 'a',
    â: 'a',
    ã: 'a',
    ä: 'a',
    å: 'a',
    æ: 'ae',
    ç: 'c',
    è: 'e',
    é: 'e',
    ê: 'e',
    ë: 'e',
    ì: 'i',
    í: 'i',
    î: 'i',
    ï: 'i',
    ñ: 'n',
    ò: 'o',
    ó: 'o',
    ô: 'o',
    õ: 'o',
    ö: 'o',
    ø: 'o',
    ù: 'u',
    ú: 'u',
    û: 'u',
    ü: 'u',
    ý: 'y',
    ÿ: 'y',
    '-': ' ',
  };
  return name.replace(/[àáâãäåæçèéêëìíîïñòóôõöøùúûüýÿ’'-]/g, (match) => diacriticMap[match] || match);
}

/**checks the passengers name when there are multiple passengers*/
export function isPaxNameDuplicateErr(index: number, travllerInfoForm: UntypedFormArray) {
  let value: boolean = false;
  for (let i = 0; i < travllerInfoForm.controls.length; i++) {
    if (
      i != index &&
      travllerInfoForm.controls[i]?.get('firstName').value?.toLowerCase() ===
        travllerInfoForm.controls[index]?.get('firstName').value?.toLowerCase() &&
      travllerInfoForm.controls[i]?.get('lastName').value?.toLowerCase() ===
        travllerInfoForm.controls[index]?.get('lastName').value?.toLowerCase()
    ) {
      value = true;
    }
  }
  return value;
}

/*Checking the first and last names whether they are duplicates in the pax array*/
export function checkPaxNames(totalPaxValues: any) {
  let value: boolean = false;
  for (let i = 0; i < totalPaxValues.length; i++) {
    for (let j = i + 1; j < totalPaxValues.length; j++) {
      if (isFirstNameAndLastNameSame(totalPaxValues[i], totalPaxValues[j])) {
        value = true;
      }
    }
  }
  return value;
}

/**It returns true if the both pax first name and last name are same */
export function isFirstNameAndLastNameSame(passenger1: any, passenger2: any) {
  return passenger1.firstName === passenger2.firstName && passenger1.lastName === passenger2.lastName;
}

/**Resetting the form traveller from control values */
export function resetTravellerFormValues(index: number, travllerInfoForm: UntypedFormArray) {
  const formControlsToFocus = [
    'firstName',
    'lastName',
    'gender',
    'dob',
    'dobDay',
    'dobMonth',
    'dobYear',
    'passportNumber',
    'passportExpiry',
    'nationality',
    'passPortCountry',
    'psExpDay',
    'psExpMonth',
    'psExpYear',
  ];
  for (const control of formControlsToFocus) {
    travllerInfoForm.controls[index].get(control).setValue('');
  }
}

interface Passenger {
  type: string;
  firstName: string;
  lastName: string;
  parentName?: string;
  associatedAdultId?: string;
  travelerId?: string;
}
export function bindInfantsToAdults(passengers: Passenger[]): Passenger[] {
  // Filter adults and infants from the passengers list
  const adults = passengers.filter((passenger) => passenger.type === 'ADULT');
  const infants = passengers.filter((passenger) => passenger.type === 'INFANT');
  const children = passengers.filter((passenger) => passenger.type === 'CHILD');

  // Check if there are enough adults for the infants
  if (infants.length > adults.length) {
    throw new Error('Not enough adults to associate with infants.');
  }

  // Assign travelerId to all passengers in sequence
  let travelerIdCounter = 1;

  // Assign travelerId to adults
  adults.forEach((adult) => {
    adult.travelerId = travelerIdCounter.toString();
    travelerIdCounter++;
  });

  // Assign travelerId to children
  children.forEach((child) => {
    child.travelerId = travelerIdCounter.toString();
    travelerIdCounter++;
  });

  // Bind each infant to an adult by assigning associatedAdultId and changing type to HELD_INFANT
  infants.forEach((infant, index) => {
    const adult = adults[index % adults.length]; // Rotate through adults if there are more infants
    infant.associatedAdultId = adult.travelerId; // Assign the adult's travelerId to associatedAdultId
    infant.type = 'HELD_INFANT'; // Change the type from INFANT to HELD_INFANT
    infant.travelerId = travelerIdCounter.toString(); // Assign a unique travelerId for the infant
    travelerIdCounter++;
  });

  // Return the modified passengers list
  return passengers;
}
