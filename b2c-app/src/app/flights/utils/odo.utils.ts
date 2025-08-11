import moment from 'moment';
import { head, isEmpty, last, round, toLower, some } from 'lodash';

import { Odo } from './../models/results/odo.model';
import { CabinClass } from './../models/cabin-class.model';
import { CABIN_CLASSES } from './../models/cabin-classes.constant';
import { SearchResultsItinerary } from '../models/results/search-results-itinerary.model';
import { UntypedFormArray, Validators } from '@angular/forms';

function getArrivalDate(odo: Odo): string {
  return odo && !isEmpty(odo.segments) ? last(odo.segments).arrivalDateTime : undefined;
}

function getDepartureDate(odo: Odo): string {
  return odo && !isEmpty(odo.segments) ? head(odo.segments).departureDateTime : undefined;
}

function getDestinationAirportCode(odo: Odo): string {
  return odo && !isEmpty(odo.segments) ? last(odo.segments).destCode : undefined;
}

function getDurationDays(odo: Odo): number {
  if (!odo || isEmpty(odo.segments)) {
    return 0;
  }

  const arrivalDay = moment.utc(last(odo.segments).arrivalDateTime).startOf('day');
  const departureDay = moment.utc(head(odo.segments).departureDateTime).startOf('day');

  return round(arrivalDay.diff(departureDay, 'days', true));
}

function getFirstSegmentAirlineCode(odo: Odo): string {
  return odo && !isEmpty(odo.segments) ? head(odo.segments).airlineCode : undefined;
}

function getOriginAirportCode(odo: Odo): string {
  return odo && !isEmpty(odo.segments) ? head(odo.segments).origCode : undefined;
}

/**
 * Returns a CabinClass object with a PascalCase `display` and an UPPER_CASE `value`. The correct
 * object is returned by taking `cabinClass` property from the first segment, making it lowercase
 * and using that lowercase value as a key look-up in the CABIN_CLASSES map constant
 *
 * @param odo
 */
function getCabinClass(odo: Odo): CabinClass {
  if (!odo || isEmpty(odo.segments)) {
    return;
  }

  const cabinClassKey = toLower(head(odo.segments).cabinClass);

  return CABIN_CLASSES[cabinClassKey];
}

function odoSome(itineraries: SearchResultsItinerary[], func: (odo: Odo) => boolean): boolean {
  return some(itineraries, (itinerary: SearchResultsItinerary) => {
    return some(itinerary.odoList, (odo: Odo) => func(odo));
  });
}

function getAirlineName(airlineCode: string, airlineNames: { [airlineCode: string]: string }): string {
  if (airlineNames) {
    const result = airlineNames[airlineCode];
    if (result) {
      return result;
    }
  }
  // return code because airline name displays instead of airlineCode
  return airlineCode;
}

function truncateAirlineName(airline: string,isMobile:boolean ): string {
  return airline ?.length > 16 && isMobile ? airline.slice(0, 15).concat('...') : airline;
}

// get the city name based on the code
function getCitiesNames(param: string, airports: any) {
  let airportInfos = airports;
  for (var i in airportInfos) {
    if (airportInfos[i].iataCode === param) {
      return airportInfos[i].city;
    }
  }
}

function getOriginCityName(odo: any, airportList: any): string {
  return getCityName(getOriginAirportCode(odo), airportList);
}

function getDestinationCityName(odo: any, airportList: any): string {
  return getCityName(getDestinationAirportCode(odo), airportList);
}

function getCityName(airportCode: string, airportList: any): string {
  return airportList && airportList[airportCode] ? airportList[airportCode].c : airportCode;
}

function getCurrencies(value: any) {
  switch (value) {
    case 'ZAR': {
      return 'R';
    }
    case 'NAD': {
      return 'N$';
    }
    case 'NGN': {
      return ' ₦';
    }
    case 'AED': {
      return 'AED';
    }
    case 'EGP': {
      return 'E£';
    }
    case 'KES': {
      return 'KSh';
    }
    case 'TZS': {
      return 'TSh';
    }
    case 'BWP': {
      return 'P';
    }
    case 'MAD': {
      return 'dh';
    }
    case 'KWD': {
      return 'KD';
    }
    case 'SAR': {
      return 'SR';
    }
    case 'BHD': {
      return 'BD';
    }
    case 'OMR': {
      return 'bz';
    }
    case 'QAR': {
      return 'QAR';
    }
    default: {
      return value;
    }
  }
}

function getAirportNames(param: string, airports: any) {
  const airportInfos = airports;
  if(airportInfos){
  for (var i in airportInfos) {
    if (airportInfos[i].iataCode === param) {
      return airportInfos[i].airport;
    }
  }
  }else{
    return param;
  }

}
// restrict user to not to type characters for number inputs
function numInputNoChars(event: any) {
  return event.charCode == 8 || event.charCode == 0 ? null : event.charCode >= 48 && event.charCode <= 57;
}
// restrict user to not to type any numbers and special chars allow  alphabets & space only
function keyboardAllowCharsOnly(event: any) {
  return (event.charCode > 64 && event.charCode < 91) || (event.charCode > 96 && event.charCode < 123) || event.charCode == 32;
}

function passportSettings(index: number, travllerInfoForm: UntypedFormArray) {
  travllerInfoForm.controls[index].get('passPortCountry').setValidators(Validators.required);
  travllerInfoForm.controls[index].get('passPortCountry').updateValueAndValidity();
  travllerInfoForm.controls[index].get('psExpDay').setValidators(Validators.required);
  travllerInfoForm.controls[index].get('psExpDay').updateValueAndValidity();
  travllerInfoForm.controls[index].get('psExpMonth').setValidators(Validators.required);
  travllerInfoForm.controls[index].get('psExpMonth').updateValueAndValidity();
  travllerInfoForm.controls[index].get('psExpYear').setValidators(Validators.required);
  travllerInfoForm.controls[index].get('psExpYear').updateValueAndValidity();
  travllerInfoForm.controls[index].get('passportExpiry').setValidators(Validators.required);
  travllerInfoForm.controls[index].get('passportExpiry').updateValueAndValidity();
  travllerInfoForm.controls[index]
    .get('passportNumber')
    .setValidators([Validators.pattern('^[a-zA-Z0-9]+$'), Validators.required]);
  travllerInfoForm.controls[index].get('passportNumber').updateValueAndValidity();
  travllerInfoForm.controls[index].get('nationality').setValidators(Validators.required);
  travllerInfoForm.controls[index].get('nationality').updateValueAndValidity();
}

function getCountryName(country: string) {
  if (typeof window !== 'undefined' && window.sessionStorage) {
    const countriesArray = JSON.parse(sessionStorage.getItem('countries'));
    for (let i in countriesArray) {
      if (countriesArray[i]?.isoCode === country || countriesArray[i]?.name === country) {
        return countriesArray[i];
      }
    }
  }
}

function passengerDobsettings(index: number, travllerInfoForm: UntypedFormArray) {
  travllerInfoForm.controls[index].get('dob').setValidators(Validators.required);
  travllerInfoForm.controls[index].get('dob').updateValueAndValidity();
  travllerInfoForm.controls[index].get('dobMonth').setValidators(Validators.required);
  travllerInfoForm.controls[index].get('dobMonth').updateValueAndValidity();
  travllerInfoForm.controls[index].get('dobYear').setValidators(Validators.required);
  travllerInfoForm.controls[index].get('dobYear').updateValueAndValidity();
  travllerInfoForm.controls[index].get('dobDay').setValidators(Validators.required);
  travllerInfoForm.controls[index].get('dobDay').updateValueAndValidity();
  return;
}

function passengerNationalitySettings(index: number, travllerInfoForm: UntypedFormArray) {
  travllerInfoForm.controls[index].get('nationality').setValidators(Validators.required);
  travllerInfoForm.controls[index].get('nationality').updateValueAndValidity();
}
function dobLengthCheck(dobValue: any, travllerInfoForm: UntypedFormArray, index: number) {
  let dobLength = false;
  if (dobValue.length == 10) {
    dobLength = true;
  } else if (dobValue.length! == 10) {
    travllerInfoForm.controls[index].get('dob').setErrors({ invalid: true });
    dobLength = false;
  }
  return dobLength;
}

function dobValidationSettings(travllerInfoForm: UntypedFormArray, index: number) {
  travllerInfoForm.controls[index].get('showError').setValue(true);
  travllerInfoForm.controls[index].get('dob').setErrors({ invalid: true });
}

function chidDobValidation(travllerInfoForm: UntypedFormArray, index: number, paxSettings: any) {
  travllerInfoForm.controls[index].get('showError').setValue(false);
  if (paxSettings.childSettings.showDateOfBirth) {
    passengerDobsettings(index, travllerInfoForm);
  }
}

function getFormattedDate(paxDate: any) {
  return (
    checkDateNumber(parseInt(paxDate.substring(6, 10))) +
    '-' +
    checkDateNumber(parseInt(paxDate.substring(3, 5))) +
    '-' +
    checkDateNumber(parseInt(paxDate.substring(0, 2)))
  );
}

function checkDateNumber(paxDateNum: number) {
  if (paxDateNum < 10) {
    return '0' + paxDateNum;
  } else {
    return paxDateNum;
  }
}

function getTime(ms: number, isdomMweb?: boolean) {
  let d, h, m, s;
  s = Math.floor(ms / 1000);
  m = Math.floor(s / 60);
  s = s % 60;
  h = Math.floor(m / 60);
  m = m % 60;
  d = Math.floor(h / 24);
  h = h % 24;
  h += d * 24;
  return isdomMweb ? h + 'h ' + m + 'm' : h + 'hrs ' + m + 'min';
}

function getBaggageInfo(id: number, param: string, bagInfos: any, isSRP?: boolean) {
  let baggageAllowanceInfos = bagInfos;
  let bagInfo = [];

  if (param == 'hand') {
    for (let i in baggageAllowanceInfos) {
      if (
        baggageAllowanceInfos[i].correspondingSegmentIdList.includes(id) &&
        baggageAllowanceInfos[i].included &&
        baggageAllowanceInfos[i].type == 'HAND'
      ) {
        if (baggageAllowanceInfos[i].description.includes('hand baggage')) {
          let baggageAllowance = isSRP
            ? baggageAllowanceInfos[i].description.replace('hand baggage', '')
            : baggageAllowanceInfos[i].description.replace('h', 'H');
          bagInfo.push(baggageAllowance);
        } else {
          bagInfo.push(baggageAllowanceInfos[i].description);
        }
      }
    }
  } else if (param == 'checked') {
    for (let i in baggageAllowanceInfos) {
      if (
        baggageAllowanceInfos[i].correspondingSegmentIdList.includes(id) &&
        baggageAllowanceInfos[i].included &&
        baggageAllowanceInfos[i].type == 'CHECKED'
      ) {
        if (baggageAllowanceInfos[i].description.includes('checked baggage')) {
          let baggageAllowance = baggageAllowanceInfos[i].description.replace('checked baggage', '');

          bagInfo.push(baggageAllowance);
        } else {
          bagInfo.push(baggageAllowanceInfos[i].description);
        }
      }
    }
  }
  return bagInfo;
}


/**It checks the amount in the products and if amount is not zero it will return true*/
function checkProductsAmount(products: any) {
  return products && products.length > 0 ? products.some((item: any) => item.amount) : false;
}
/**stores given passegnger details in the traveller page */
function cachePaxDetails(controls: any, paxData: any, travellerForm: UntypedFormArray) {
  setTimeout(() => {
    let paxInfo = paxData.travellersList;
    let travellerFormVal = controls.controls;
    for (let i = 0; i < paxInfo.length; i++) {
      for (let j = 0; j < travellerFormVal.length; j++) {
        if (
          (paxInfo[i].type == travellerFormVal[j].get('type').value &&
            travellerFormVal[j].get('firstName').value == '') ||
          travellerFormVal[j].get('firstName').value == null
        ) {
          let travellerDob = getFormattedPaxDob(paxInfo[i].dobDay, paxInfo[i].dobMonth, paxInfo[i].dobYear);
          travellerFormVal[j].get('firstName').setValue(paxInfo[i].firstName);
          travellerFormVal[j].get('gender').setValue(paxInfo[i].gender);
          travellerFormVal[j].get('title').setValue(paxInfo[i].title);
          travellerFormVal[j].get('lastName').setValue(paxInfo[i].lastName);
          travellerFormVal[j].get('dobDay').setValue(paxInfo[i].dobDay);
          travellerFormVal[j].get('dobMonth').setValue(paxInfo[i].dobMonth);
          travellerFormVal[j].get('dobYear').setValue(paxInfo[i].dobYear);
          travellerFormVal[j].get('middleName').setValue(paxInfo[i].middleName);
          if (travellerFormVal[j] && travellerFormVal[j].get('dob')) {
            travellerFormVal[j].get('dob').setValue(travellerDob);
          }
          break;
        }
      }
    }
  }, 200);
}

function getFormattedPaxDob(day: number, month: number, year: number) {
  let formattedDate = checkDateNumber(day) + '/' + checkDateNumber(month) + '/' + checkDateNumber(year);
  return formattedDate;
}

/*
 * setting the passport expiry days as per the month and year selection
 */
function selectionPassportExpiry(days: any, travellerForm: UntypedFormArray, index: number, param1?: any, param2?: any) {
  if (param1 === 'month' || param1 === 'year') {
    if (!days.includes(parseInt(travellerForm.controls[index].get('psExpDay').value))) {
      travellerForm.controls[index].get('psExpDay').setValue('');
    }
  }
  let psExpiryFormatted = {
    day: travellerForm.controls[index]?.get('psExpDay')?.value,
    month: travellerForm.controls[index]?.get('psExpMonth')?.value,
    year: travellerForm.controls[index]?.get('psExpYear')?.value,
  };
  travellerForm.controls[index].get('passportExpiry').setValue(psExpiryFormatted);
}

function getStopsData(segments:any){
  const numStops = parseInt(segments.length) - 1;
  if (numStops === 0) {
    return 'Non Stop';
  } else if (numStops === 1) {
    return numStops + ' Stop';
  } else {
    return numStops + ' Stops';
  }
}
export {
  getArrivalDate,
  getDepartureDate,
  getDestinationAirportCode,
  getDurationDays,
  getFirstSegmentAirlineCode,
  getOriginAirportCode,
  getCabinClass,
  odoSome,
  getAirlineName,
  getCitiesNames,
  getAirportNames,
  getTime,
  getBaggageInfo,
  getCurrencies,
  passengerNationalitySettings,
  passportSettings,
  passengerDobsettings,
  dobLengthCheck,
  dobValidationSettings,
  getCountryName,
  getFormattedDate,
  checkDateNumber,
  getFormattedPaxDob,
  numInputNoChars,
  chidDobValidation,
  getOriginCityName,
  checkProductsAmount,
  getDestinationCityName,
  cachePaxDetails,
  selectionPassportExpiry,
  getStopsData,
  keyboardAllowCharsOnly,
  truncateAirlineName
};
