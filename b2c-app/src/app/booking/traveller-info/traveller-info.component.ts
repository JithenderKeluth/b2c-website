import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators, UntypedFormArray } from '@angular/forms';
import { BookingService } from './../services/booking.service';
import moment from 'moment';
import { SearchResults } from '@app/flights/models/results/search-results.model';
import {
  cachePaxDetails,
  chidDobValidation,
  getCitiesNames,
  getCountryName,
  getFormattedPaxDob,
  passengerDobsettings,
  passengerNationalitySettings,
  passportSettings,
  selectionPassportExpiry,
} from '@app/flights/utils/odo.utils';
import { DatePipe } from '@angular/common';
import { Subscription } from 'rxjs';
import { CredentialsService } from '@app/auth/credentials.service';
import { SearchService } from '@app/flights/service/search.service';
import { responsiveService } from '@app/_core';
import { formatExpDate, setPaxPassportDetails } from '@app/flights/utils/search-data.utils';
import { NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { CustomDateParser } from '../../general/utils/CustomDateParser';
import { SeatmapService } from './../services/seatmap.service';

import { MatLegacyAutocompleteTrigger as MatAutocompleteTrigger } from '@angular/material/legacy-autocomplete';
import {
  getCountriesArray,
  isPaxNameDuplicateErr,
  removeDiacriticsAndHyphens,
  resetTravellerFormValues,
} from '../utils/traveller.utils';
import { ApiService } from '@app/general/services/api/api.service';

import { getStorageData } from '@app/general/utils/storage.utils';
import { restrictEditOption } from '../../general/utils/common-utils';
import { SessionService } from '../../general/services/session.service';
import { UniversalStorageService } from '@app/general/services/universal-storage.service';

const getMonth = (idx: any) => {
  const objDate = new Date();
  objDate.setDate(1);
  objDate.setMonth(idx - 1);

  const locale = 'en-us',
    month = objDate.toLocaleString(locale, { month: 'short' });
  return month;
};

declare const $: any;

@Component({
  selector: 'app-traveller-info',
  templateUrl: './traveller-info.component.html',
  styleUrls: [
    './traveller-info.component.scss',
    './../../../theme/travellerInfoExtras.scss',
    './../../../theme/country_selection.scss',
  ],
  providers: [{ provide: NgbDateParserFormatter, useClass: CustomDateParser }],
})
export class TravellerInfoComponent implements OnInit {
  travellerForm: UntypedFormGroup;
  months = Array(12)
    .fill(0)
    .map((i, idx) => getMonth(idx + 1));
  @Input() pricedResult_dataInfo: any;
  public journeyInfo: any;
  public travellersInfo: any = {};
  public products: any;
  public isWhatsappSubscriped = true;
  public submitted = false;
  public flightsResultsResponse: SearchResults;
  frequentFlyerForm: UntypedFormGroup;
  public countriesArray: any = [];
  public credentials: any;
  public count: number = 0;
  public travellersData: any = {};
  public travellersGender: string;
  public genderArray: any = ['Mr', 'Ms'];
  public AdultGender: any = ['Mr', 'Ms', 'Mrs'];
  selectedTravellers: any = [];
  userTravellersArray: any = [];
  public travellerId: string;
  passengerData: any;
  currencyCode: any;
  public invalidDob: string;
  adltErr = false;
  childErr = false;
  infantInvalidDobErr = false;
  public childArrivalDateDobErr = false;
  public duplicateNameErr = false;
  public psExpiry = false;
  public currentIndex: number = 0;

  frequentFlyersData: any = [];
  baggageFee: number = 0;
  baggageAmount: number = 0;
  public frequentFlyer: any = [];
  public baggage_Data: any = [];
  public check_In_baggageArray: any = [];
  public whatsappAmount: any;
  noprAmt: number = 0;
  public expiryDate: any;
  public psExpDate: any;
  public invalidPassportExpiry = false;
  public todayDate = new Date();
  public passportExpiryValue: any;
  public paxDuplicateNameErr = false;
  public travellerType: string;
  public displayMonths = 2;
  public NOPR: string;
  public showfqFly = false;
  adultTravellerArray: any = [];
  youngAdultTravellerArray: any = [];
  childTravellerArray: any = [];
  infantTravellerArray: any = [];
  selectedYear = 2004;
  selectedMonth = 1;
  selectedDay = 1;
  public minDate = {
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    day: new Date().getDate(),
  };

  selectedMeal: any;
  @Input() set traveller_info(value: any) {}

  //@Output() mealPreferenceAmount: EventEmitter<any> = new EventEmitter<any>();
  @Output() BaggageAmount: EventEmitter<any> = new EventEmitter<any>();
  @Output() selectWtsAlert: EventEmitter<any> = new EventEmitter<any>();
  @Input() alertsData: EventEmitter<any>;
  get travllerInfoForm(): UntypedFormArray {
    return this.travellerForm.controls['travellersList'] as UntypedFormArray;
  }

  public mealprferenceAmount: number = 0;
  public childMealPreferenceAmount: number = 0;
  public infantMealPreferenceAmount: number = 0;
  public specialServiceAttributes: any;
  showMeals = false;
  public psInputClear = false;
  public selectedFlightInfo: any;
  public psExpYearArray: any = [];
  public region: string;
  country: string;

  constructor(
    private fb: UntypedFormBuilder,
    private searchService: SearchService,
    private credentialService: CredentialsService,
    private datePipe: DatePipe,
    private bookingService: BookingService,
    private ngbDateParserFormatter: NgbDateParserFormatter,
    public responsiveservice: responsiveService,
    private seatmapService: SeatmapService,
    public apiService: ApiService,
    private sessionService: SessionService,
    private storage: UniversalStorageService
  ) {
    this.country = apiService.extractCountryFromDomain();

    this.travellerForm = this.fb.group({
      isWhatsappSubscriped: true,
      travellersList: this.fb.array([]),
    });
  }

  public mealSelectionData = [
    { value: 'VGML', name: 'Vegan Meal' },
    { value: 'VLML', name: 'Vegetarian Meal' },
    { value: 'MOML', name: 'Halal Meal' },
    { value: 'GFML', name: 'Gluten Free Meal' },
    { value: 'KSML', name: 'Kosher Meal' },
    { value: 'DBML', name: 'Diabetic Meal' },
    { value: 'FPML', name: 'Fruit Platter Meal' },
    { value: 'LCML', name: 'Low Calorie Meal' },
    { value: 'LFML', name: 'Low Fat Meal' },
    { value: 'LSML', name: 'Low Salt Meal' },
    { value: 'NLML', name: 'Low Lactose Meal' },
    { value: 'BLML', name: 'Bland Meal' },
    { value: 'SFML', name: 'Seafood Meal' },
  ];

  public babyMealSelection = [{ value: 'BBML', name: 'Baby Meal' }];

  public mealsAmount: number = 0;
  singleSlideOffset = true;
  noWrap = false;
  wtsupSelect: boolean = true;
  subscription: Subscription;
  bagDesc: any;
  nameFocusId: number = -1;
  nameFocuscontrol: string = null;
  adultTravellers: any = [];
  YoungAdultTravellers: any = [];
  childTravellers: any = [];
  infantTravellers: any = [];
  finalDestArriveDate: any = null;
  filteredOptions: any = [];
  sessionSubscription: Subscription;

  ngOnInit(): void {
    this.paxNameDetails();
    this.getMealsPreference();
    this.getCountriesList();
    this.region = this.apiService.extractCountryFromDomain();
    this.flightsResultsResponse = JSON.parse(getStorageData('flightResults'));
    this.bookingService.currentBaggage.subscribe((x: any) => {
      if (typeof x != 'object') {
        this.baggageFee = x;
      } else {
        this.baggageAmount = 0;
      }
    });
    this.sessionSubscription = this.sessionService.userLoggedInfo.subscribe((data: any) => {
      this.getUserCredentials();
    });
    if (this.pricedResult_dataInfo.itineraries) {
      this.selectedFlightInfo = this.pricedResult_dataInfo?.itineraries;
      this.pricedResult_dataInfo.itineraries.forEach((x: any) => {
        this.specialServiceAttributes = x.specialServiceAttributes;
        x.odoList.forEach((y: any) => {
          y.segments.forEach((z: any) => {
            this.frequentFlyer.push(z);
          });
        });
      });
      if (this.frequentFlyer.length != 0) {
        const result = Array.from(
          this.frequentFlyer.reduce((m: any, t: any) => m.set(t.airlineCode, t), new Map()).values()
        );
        this.frequentFlyer = result;
      }
      this.finalDestArriveDate = this.pricedResult_dataInfo.itineraries[
        this.pricedResult_dataInfo.itineraries.length - 1
      ].odoList[
        this.pricedResult_dataInfo.itineraries[this.pricedResult_dataInfo.itineraries.length - 1].odoList.length - 1
      ].segments[
        this.pricedResult_dataInfo.itineraries[this.pricedResult_dataInfo.itineraries.length - 1].odoList[
          this.pricedResult_dataInfo.itineraries[this.pricedResult_dataInfo.itineraries.length - 1].odoList.length - 1
        ].segments.length - 1
      ].arrivalDateTime;
    }
    // setTimeout(() => {
    if (this.pricedResult_dataInfo?.errors == null) {
      this.journeyInfo = this.pricedResult_dataInfo;
      this.travellersInfo = this.journeyInfo.travellers;
      this.baggage_Data = Array.from(
        this.baggage_Data.reduce((m: any, t: any) => m.set(t.direction, t), new Map()).values()
      );
      this.addQuantity();
    }
    // }, 0);
    if (
      this.storage.getItem('baggageInfo', 'session') &&
      JSON.parse(this.storage.getItem('baggageInfo', 'session'))?.checkInBaggageData?.length > 0
    ) {
      this.check_In_baggageArray = JSON.parse(this.storage.getItem('baggageInfo', 'session'))?.checkInBaggageData;
    }
    this.getPaxDobYears('ADULT');
    this.getPaxDobYears('YOUNGADULT');
    this.getPaxDobYears('CHILD');
    this.getPaxDobYears('INFANT');

    if (this.storage.getItem('bookingInfo', 'session')) {
      const bookInfo = JSON.parse(this.storage.getItem('bookingInfo', 'session'));
      if (bookInfo.travellerDetails) {
        this.userTravellersArray = JSON.parse(this.storage.getItem('useTravlellers', 'session'));
      }
    }
    if (this.region === 'MM') {
      setTimeout(() => {
        this.populateMmfTravelerData();
      }, 2500);
    }
  }

  /**here to get credentials from session  */
  getUserCredentials() {
    this.credentials = null;
    this.credentials = this.sessionService.getUserCredentials();
    this.userTravellersArray = [];
    if (this.credentials?.data?.travellerList?.length > 0) {
      this.credentials?.data?.travellerList?.forEach((data: any) => {
        this.userTravellersArray.push({ ...data, isSelected: false, formIndex: -1 });
      });
    }
    if (this.userTravellersArray?.length > 0) {
      this.userTravellersArray.forEach((x: any) => {
        this.verifyTraveller(x);
      });
    } else {
      this.adultTravellers = [];
      this.YoungAdultTravellers = [];
      this.childTravellers = [];
      this.infantTravellers = [];
    }
  }

  updateTravellersInfo() {
    this.seatmapService.updateTravellers(this.travellerForm.value);
  }

  openDatePicker(datepicker: any) {
    datepicker.open();
    return;
  }

  public days() {
    const dayCount = this.getDaysInMonth(this.selectedYear, this.selectedMonth);
    return Array(dayCount)
      .fill(0)
      .map((i, idx) => idx + 1);
  }

  getDobDate(i: number) {
    if (i || i == 0) {
      const dayCount = this.getDaysInMonth(
        this.travllerInfoForm.controls[i].get('dobYear').value,
        this.travllerInfoForm.controls[i].get('dobMonth').value
      );
      return Array(dayCount)
        .fill(0)
        .map((i, idx) => idx + 1);
    }
  }

  getpsExpDate(i: number) {
    if (i || i == 0) {
      const dayCount = this.getDaysInMonth(
        this.travllerInfoForm?.controls[i]?.get('psExpYear').value,
        this.travllerInfoForm?.controls[i]?.get('psExpMonth').value
      );
      return Array(dayCount)
        .fill(0)
        .map((i, idx) => idx + 1);
    }
  }

  public getDaysInMonth(year: number, month: number) {
    return 32 - new Date(year, month - 1, 32).getDate();
  }

  /*
   * restoring the default days if month is not selected
   */
  isdayFocused(i: number) {
    if (!this.travllerInfoForm.controls[i].get('dobMonth').value) {
      this.selectedMonth = 1;
    } else {
      this.selectedMonth = this.travllerInfoForm.controls[i].get('dobMonth').value;
    }
    if (this.travllerInfoForm.controls[i].get('dobYear').value) {
      this.selectedYear = this.travllerInfoForm.controls[i].get('dobYear').value;
    }
  }

  selectionDob(index: number, param1?: any, param2?: any) {
    /*
     * setting the days as per the month and year selection
     */
    this.updateFormValue();
    if (param1 === 'month') {
      this.selectedMonth = param2.value;
      if (!this.days().includes(parseInt(this.travllerInfoForm.controls[index].get('dobDay').value))) {
        this.travllerInfoForm.controls[index].get('dobDay').setValue('');
      }
    } else if (param1 === 'year') {
      this.selectedYear = param2.value;
      this.isdayFocused(index);
      if (!this.days().includes(parseInt(this.travllerInfoForm.controls[index].get('dobDay').value))) {
        this.travllerInfoForm.controls[index].get('dobDay').setValue('');
      }
    }
    if (
      this.travllerInfoForm.controls[index]?.get('dobMonth')?.value &&
      this.travllerInfoForm.controls[index]?.get('dobYear')?.value &&
      this.travllerInfoForm.controls[index]?.get('dobDay')?.value
    ) {
      let travellerDob = getFormattedPaxDob(
        this.travllerInfoForm.controls[index].get('dobDay').value,
        this.travllerInfoForm.controls[index].get('dobMonth').value,
        this.travllerInfoForm.controls[index].get('dobYear').value
      );
      this.travllerInfoForm.controls[index].get('dob').setValue(travellerDob);
      this.onKeypressEvent(index);
    } else {
      this.travllerInfoForm.controls[index].get('dob').setValue('');
    }
  }

  /*
   * setting the years range based on passenger type
   */
  getPaxDobYears(type: string) {
    let year: any;
    let expYear = new Date().getFullYear();
    this.psExpYearArray = [];
    for (let j = 0; j <= 50; j++) {
      this.psExpYearArray.push(expYear + j);
    }
    if (this.finalDestArriveDate) {
      year = new Date(this.finalDestArriveDate).getFullYear();
    } else {
      year = new Date().getFullYear();
    }
    if (type == 'ADULT') {
      for (let i = 16; i <= 111; i++) {
        this.adultTravellerArray.push(year - i);
      }
    } else if (type == 'YOUNGADULT') {
      for (let i = 12; i <= 16; i++) {
        this.youngAdultTravellerArray.push(year - i);
      }
    } else if (type == 'CHILD') {
      for (let j = 2; j <= 12; j++) {
        this.childTravellerArray.push(year - j);
      }
    } else if (type == 'INFANT') {
      for (let k = 0; k <= 2; k++) {
        this.infantTravellerArray.push(year - k);
      }
    }
  }

  public getCityName(param: string) {
    return getCitiesNames(param, this.flightsResultsResponse.airportInfos);
  }

  public getGenderCheckedValue(gender: string, travellersGender: any) {
    return gender == travellersGender;
  }

  public getMealsPreference() {
    if (this.pricedResult_dataInfo?.products) {
      this.pricedResult_dataInfo.products.forEach((x: any) => {
        if (x.description == 'Add Meal Preference') {
          this.showMeals = true;
          this.mealprferenceAmount = x.perAdultAmount;
          this.childMealPreferenceAmount = x.perChildAmount;
          this.infantMealPreferenceAmount = x.perInfantAmount !== null ? x.perInfantAmount : 0;
        }
      });
    }
  }

  // Get Passenger name for displaying in the heading
  getPassengerNameOrHeading(index: number): string {
    if (this.country !== 'ABSA')
      return `Passenger ${index + 1}`;

    const passenger = this.travellerForm.value.travellersList[index];
    if (passenger.firstName || passenger.lastName)
      return `${passenger.firstName} ${passenger.lastName}`;

    return `Traveller ${index + 1}`;
  }

  /*
   * setting the saved traveller details to the form
   */
  public passengerInfo(
    travellerType: any,
    passengerSettings: any,
    passenger: any,
    travellerindex: number,
    event: any,
    index?: number
  ) {
    let psExpDate: any;
    if (event?.target?.checked || this.region === 'MM') {
      this.passengerData = passenger;
      const paxNationality = getCountryName(passenger.passport.docHolderNationality);
      const paxCountry = getCountryName(passenger.passport.docIssueCountry);
      if (passenger?.passport?.effectiveExpireOptionalDate) {
        let expDate = this.datePipe.transform(passenger.passport.effectiveExpireOptionalDate, 'dd-MM-yyyy');
        psExpDate = this.ngbDateParserFormatter.parse(expDate);
      }
      const trvlrIndex = this.getTravellers(travellerType).findIndex((x: any) => x.formIndex == index);
      if (trvlrIndex !== -1) {
        this.getTravellers(travellerType)[trvlrIndex].isSelected = false;
        this.getTravellers(travellerType)[trvlrIndex].formIndex = -1;
      }
      let paxTitle = passenger?.personName?.nameTitle;
      if (paxTitle === 'MRS') {
        paxTitle = 'Mrs';
      }
      const passengerDob = this.datePipe.transform(passenger.birthDate, 'dd-MM-yyyy');
      const paxDob = this.ngbDateParserFormatter.parse(passengerDob);
      if (this.region !== 'MM') {
        this.getTravellers(travellerType)[travellerindex].isSelected = true;
        this.getTravellers(travellerType)[travellerindex].formIndex = index;
      }

      this.savedPaxPsExpiry(psExpDate, travellerType, passengerSettings, index, passenger, paxCountry, paxNationality);

      this.travllerInfoForm.controls[index].get('dobMonth').setValue(paxDob.month);
      this.travllerInfoForm.controls[index].get('dobYear').setValue(paxDob.year);
      this.travllerInfoForm.controls[index].get('firstName').setValue(passenger.personName.givenName);
      this.travllerInfoForm.controls[index].get('lastName').setValue(passenger.personName.surname);
      this.travllerInfoForm.controls[index].get('dobDay').setValue(paxDob.day);
      this.travllerInfoForm.controls[index].get('dob').setValue(passengerDob);
      if (paxTitle) {
        this.travllerInfoForm.controls[index].get('gender').setValue(paxTitle);
      }
      this.updateFormValue();
    } else {
      this.getTravellers(travellerType)[travellerindex].isSelected = false;
      resetTravellerFormValues(index, this.travllerInfoForm);
    }
  }

  /*
   * setting the passport expiry date of saved traveller
   */
  savedPaxPsExpiry(
    psExpDate: any,
    paxType: any,
    passengerSettings: any,
    index: number,
    passenger: any,
    paxCountry: string,
    paxNationality: string
  ) {
    this.travllerInfoForm.controls[index].get('psExpDay').setValue('');
    this.travllerInfoForm.controls[index].get('psExpMonth').setValue('');
    this.travllerInfoForm.controls[index].get('psExpYear').setValue('');
    if (
      paxType === 'ADULT' &&
      (passengerSettings.adultSettings?.requirePassport || passengerSettings.adultSettings?.showPassport)
    ) {
      setPaxPassportDetails(this.travllerInfoForm, index, passenger, psExpDate, paxNationality, paxCountry);
    }
    if (
      paxType === 'YOUNGADULT' &&
      (passengerSettings.youngAdultSettings?.requirePassport || passengerSettings.youngAdultSettings?.showPassport)
    ) {
      setPaxPassportDetails(this.travllerInfoForm, index, passenger, psExpDate, paxNationality, paxCountry);
    }
    if (
      paxType === 'CHILD' &&
      (passengerSettings.childSettings?.requirePassport || passengerSettings.childSettings?.showPassport)
    ) {
      setPaxPassportDetails(this.travllerInfoForm, index, passenger, psExpDate, paxNationality, paxCountry);
    }
    if (
      paxType === 'INFANT' &&
      (passengerSettings.infantSettings?.requirePassport || passengerSettings.infantSettings?.showPassport)
    ) {
      setPaxPassportDetails(this.travllerInfoForm, index, passenger, psExpDate, paxNationality, paxCountry);
    }
  }

  checkedTraveller(passenger: any, index: number) {
    let status = false;
    if (passenger.isSelected) {
      if (passenger.formIndex == index) {
        status = true;
      }
    }
    return status;
  }

  travellerSelection(passenger: any, index: number) {
    let status = true;
    if (passenger.isSelected) {
      if (passenger.formIndex !== index) {
        status = false;
      }
    }
    return status;
  }

  ngOnDestroy(): void {
    this.storage.setItem('useTravlellers', JSON.stringify(this.userTravellersArray), 'session');
    this.bookingService.userTravellersData = this.userTravellersArray;
    this.sessionSubscription.unsubscribe();
  }

  /*
   * validations based on traveller settings
   */
  passengerSettings(settings: any, travellerType: any, param: string, index: number) {
    if (travellerType === 'ADULT' && param === 'dob') {
      if (settings.adultSettings?.showDateOfBirth) {
        passengerDobsettings(index, this.travllerInfoForm);
        return settings.adultSettings.showDateOfBirth;
      }
    }
    if (travellerType === 'ADULT' && param === 'nationality') {
      if (settings.adultSettings?.showNationality) {
        passengerNationalitySettings(index, this.travllerInfoForm);
        return settings.adultSettings.showNationality;
      }
    }
    if (travellerType === 'ADULT' && param === 'passPortInfo') {
      if (settings.adultSettings?.showPassport || settings.adultSettings?.requirePassport) {
        this.travllerInfoForm.controls[index].get('passPortCountry').setValidators(Validators.required);
        this.travllerInfoForm.controls[index].get('passPortCountry').updateValueAndValidity();
        this.travllerInfoForm.controls[index].get('passportExpiry').setValidators(Validators.required);
        this.travllerInfoForm.controls[index].get('passportExpiry').updateValueAndValidity();
        passportSettings(index, this.travllerInfoForm);
        return settings.adultSettings.showPassport || settings.adultSettings.requirePassport;
      }
    }
    if (travellerType === 'YOUNGADULT' && param === 'dob') {
      if (settings.youngAdultSettings?.showDateOfBirth) {
        passengerDobsettings(index, this.travllerInfoForm);
        return settings.youngAdultSettings.showDateOfBirth;
      }
    }
    if (travellerType === 'YOUNGADULT' && param === 'nationality') {
      if (settings.youngAdultSettings?.showNationality) {
        passengerNationalitySettings(index, this.travllerInfoForm);
        return settings.youngAdultSettings.showNationality;
      }
    }
    if (travellerType === 'YOUNGADULT' && param === 'passPortInfo') {
      if (settings.youngAdultSettings?.showPassport || settings.youngAdultSettings?.requirePassport) {
        this.travllerInfoForm.controls[index].get('passPortCountry').setValidators(Validators.required);
        this.travllerInfoForm.controls[index].get('passPortCountry').updateValueAndValidity();
        passportSettings(index, this.travllerInfoForm);
        return settings.youngAdultSettings.showPassport || settings.youngAdultSettings.requirePassport;
      }
    }
    if (travellerType === 'CHILD' && param === 'dob') {
      if (settings.childSettings?.showDateOfBirth) {
        passengerDobsettings(index, this.travllerInfoForm);
        return settings.childSettings.showDateOfBirth;
      }
    }
    if (travellerType === 'CHILD' && param === 'nationality') {
      if (settings.childSettings?.showNationality) {
        passengerNationalitySettings(index, this.travllerInfoForm);
        return settings.childSettings.showNationality;
      }
    }
    if (travellerType === 'CHILD' && param === 'passPortInfo') {
      if (settings.childSettings?.showPassport || settings.childSettings?.requirePassport) {
        passportSettings(index, this.travllerInfoForm);
        return settings.childSettings.showPassport || settings.childSettings.requirePassport;
      }
    }
    if (travellerType === 'INFANT' && param === 'dob') {
      if (settings.infantSettings?.showDateOfBirth) {
        passengerDobsettings(index, this.travllerInfoForm);
        return settings.infantSettings.showDateOfBirth;
      }
    }
    if (travellerType === 'INFANT' && param === 'nationality') {
      if (settings.infantSettings?.showNationality) {
        passengerNationalitySettings(index, this.travllerInfoForm);
        return settings.infantSettings.showNationality;
      }
    }
    if (travellerType === 'INFANT' && param === 'passPortInfo') {
      if (settings.infantSettings?.showPassport || settings.infantSettings?.requirePassport) {
        passportSettings(index, this.travllerInfoForm);
        return settings.infantSettings.showPassport || settings.infantSettings.requirePassport;
      }
    }
    this.displayMonths = 1;
  }

  passengerDobOrNationalitySettings(index: number, form: any, param: string) {
    // Common logic for setting date of birth or nationality settings
    passengerDobsettings(index, form);
    passengerNationalitySettings(index, form);
  }

  public selectMeals(meals: any, index: number) {
    this.travllerInfoForm.controls[index]
      .get('specialRequests')
      .get('mealSelection')
      .setValue(meals ? meals.name : '');
    this.travllerInfoForm.controls[index]
      .get('specialRequests')
      .get('mealValue')
      .setValue(meals ? meals.value : '');
    let array = this.travellersList().value.filter(
      (x: any) => x.specialRequests.mealSelection != '' && x.specialRequests.mealSelection != 'NOPR'
    );
    this.mealsAmount = 0;
    if (array.length > 0) {
      array.forEach((x: any) => {
        this.mealsAmount = this.mealsAmount + x.specialRequests.mealsAmount;
        x.mealSelection = meals.value;
      });
      this.setProductsData(true);
    } else if (array.length == 0) {
      this.setProductsData(false);
    }
  }

  setProductsData(selected: any) {
    let selProductsList = this.storage.getItem('products', 'session')
      ? JSON.parse(this.storage.getItem('products', 'session'))
      : this.pricedResult_dataInfo.products;
    if (selProductsList && selProductsList.length > 0) {
      selProductsList.forEach((x: any) => {
        if (x.description == 'Add Meal Preference') {
          x.initSelected = selected;
          x.amount = this.mealsAmount;
        }
      });
      this.storage.setItem('products', JSON.stringify(selProductsList), 'session');
      this.bookingService.changeProducts(selProductsList);
    }
  }
  travellersList(): UntypedFormArray {
    return this.travellerForm.get('travellersList') as UntypedFormArray;
  }
  newQuantity(passengerCount: number, travellerType: string, paxTypeCount: number): UntypedFormGroup {
    return this.fb.group({
      paxTypeCount: paxTypeCount,
      showError: false,
      showPsExpiryErr: false,
      invalidPscountry: false,
      invalidnationality: false,
      dobDay: '',
      dobMonth: '',
      dobYear: '',
      psExpDay: '',
      psExpMonth: '',
      psExpYear: '',
      travellersAge: Number,
      gender: ['', Validators.required],
      firstName: ['', [Validators.pattern("^[A-Za-zÀ-ÖØ-öø-ÿ-'’ ]+$"), Validators.required]],
      middleName: ['', [Validators.pattern("^[A-Za-zÀ-ÖØ-öø-ÿ-'’ ]+$")]],
      lastName: ['', [Validators.pattern("^[A-Za-zÀ-ÖØ-öø-ÿ-'’ ]+$"), Validators.required]],
      email: '',
      dob: [''],
      type: travellerType,
      title: '',
      id: '',
      passportExpiry: '',
      nationality: [''],
      passPortCountry: '',
      passportNumber: ['', [Validators.pattern('^[a-zA-Z0-9]+$')]],
      baggageSelection: [],
      specialRequests: this.specialRequestData(travellerType),
    });
  }
  specialRequestData(paxType: string): UntypedFormGroup {
    return this.fb.group({
      mealSelection: [''],
      mealValue: [''],
      mealsAmount: (() => {
        if (paxType == 'ADULT' || paxType == 'YOUNGADULT') {
          return this.mealprferenceAmount;
        } else if (paxType == 'CHILD') {
          return this.childMealPreferenceAmount;
        }
      })(),
      frequentFlyerDetailsList: this.fb.array(this.frequentFlyer.map((x: any) => this.addFlyer(x))),
      seatDetails: [],
    });
  }

  /**ToDo we can remove after deploying new baggage design
   * addBaggage(data: any): FormGroup {
    if (data != null) {
      this.bagDesc = data.description;
      return this.fb.group({
        id: [data.id],
        selected: [data.preSelected],
        description: [this.bagDesc],
        amount: [data.amount],
        direction: [data.direction],
        currencyCode: [data.currencyCode],
      });
    } else {
      return null;
    }
  }
   */

  addFlyer(data: any): UntypedFormGroup {
    if (data != null) {
      let airlineimg = 'assets/img/carriers/retina48px/carrier-' + data.airlineCode + '.png';
      return this.fb.group({
        airlineCode: [data.airlineCode],
        airlineImage: [airlineimg],
        airlineName: [this.flightsResultsResponse.airlineNames[data.airlineCode]],
        frequentFlyerCode: [''],
      });
    } else {
      return null;
    }
  }

  /**ToDo we can remove after deploying new baggage design
  selectBaggage(baggage: any, index: number, event: any) {
    if (event == true) {
      baggage.value.selected = true;
    } else if (event == false) {
      baggage.value.selected = false;
    }
    this.getbaggageVal();
  }
  */

  addQuantity() {
    let travellers = this.travellersInfo;
    let passengerCount = 0;
    const bookInfo = JSON.parse(this.storage.getItem('bookingInfo', 'session'));
    if (bookInfo?.travellerDetails) {
      this.updateTravellerForm(bookInfo.travellerDetails.travellersList);
    } else if (!this.storage.getItem('bookingInfo', 'session') && this.storage.getItem('travellerFormData', 'session')) {
      let travellerData = JSON.parse(this.storage.getItem('travellerFormData', 'session'));
      this.updateTravellerForm(travellerData);
    } else if (travellers) {
      if (travellers.adults !== 0) {
        for (let m = 1; m <= travellers.adults; m++) {
          this.travellersList().push(this.newQuantity(++passengerCount, 'ADULT', m));
        }
      }
      if (travellers.youngAdults !== 0) {
        for (let m = 1; m <= travellers.youngAdults; m++) {
          this.travellersList().push(this.newQuantity(++passengerCount, 'YOUNGADULT', m));
        }
      }
      if (travellers.children !== 0) {
        for (let j = 1; j <= travellers.children; j++) {
          this.travellersList().push(this.newQuantity(++passengerCount, 'CHILD', j));
        }
      }
      if (travellers.infants !== 0) {
        for (let k = 1; k <= travellers.infants; k++) {
          this.travellersList().push(this.newQuantity(++passengerCount, 'INFANT', k));
        }
      }
    }
  }

  getFrequentFlyers(data: any): UntypedFormGroup {
    return this.fb.group({
      airlineCode: [data.airlineCode],
      airlineImage: [data.airlineImage],
      airlineName: [data.airlineName],
      frequentFlyerCode: [data.frequentFlyerCode],
    });
  }
  getBaggage(data: any): UntypedFormGroup {
    if (data != null) {
      return this.fb.group({
        id: [data.id],
        preSelected: [data.preSelected],
        description: [data.description],
        amount: [data.amount],
        direction: [data.direction],
        currencyCode: [data.currencyCode],
      });
    } else {
      return null;
    }
  }

  onSubmit() {}

  //validation
  onKeypressEvent(index: number) {
    this.travllerInfoForm.controls[index].get('showError').setValue(false);
    if (this.travllerInfoForm.controls) {
      this.travllerInfoForm.controls[index].get('dob').setValidators(Validators.required);
      this.travllerInfoForm.controls[index].get('dob').updateValueAndValidity();
      let paxDob =
        this.travllerInfoForm.controls[index].get('dobYear').value +
        '/' +
        this.travllerInfoForm.controls[index].get('dobMonth').value +
        '/' +
        this.travllerInfoForm.controls[index].get('dobDay').value;
      /**check age years of traveller */
      let userDOB: any = new Date(paxDob);
      let arrivaldayDate: any = new Date(this.finalDestArriveDate);
      let ageOfTraveller = this.calculatePaxAge(userDOB,arrivaldayDate);
      if (this.travllerInfoForm.controls[index]?.get('type').value == 'ADULT') {
        this.verifyAdult(index, ageOfTraveller);
        return;
      } else if (
        this.travllerInfoForm.controls[index] &&
        this.travllerInfoForm.controls[index].get('type').value == 'YOUNGADULT'
      ) {
        this.verifyYoungAdult(index, ageOfTraveller);
        return;
      } else if (this.travllerInfoForm.controls[index]?.get('type').value == 'CHILD') {
        this.verifyChild(index, ageOfTraveller);
        return;
      } else if (this.travllerInfoForm.controls[index]?.get('type').value == 'INFANT') {
        this.verifyInfant(index, ageOfTraveller);
      }
    }
  }

  getTravellerInfo() {
    this.submitted = true;
    if (this.travellerForm.invalid) {
      const controls = <UntypedFormArray>this.travellerForm.controls['travellersList'];
      for (let i = 0; i <= controls.length; i++) {
        if (this.travllerInfoForm.controls[i]?.get('gender').invalid) {
          this.scrollInput('gender', i);
        }
        if (this.travllerInfoForm.controls[i]?.get('firstName').invalid) {
          let index = 'firstName' + i.toString();
          document?.getElementById(index).focus();
          return;
        }
        if (this.travllerInfoForm.controls[i]?.get('lastName').invalid) {
          let index = 'lastName' + i.toString();
          document?.getElementById(index).focus();
          return;
        }
        if (this.travllerInfoForm.controls[i]?.get('passportNumber').invalid) {
          let index = 'passportNumber' + i.toString();
          document?.getElementById(index).focus();
          return;
        }
        if (this.travllerInfoForm.controls[i]?.get('middleName').invalid) {
          let middlenameIndex = 'middleName' + i.toString();
          document?.getElementById(middlenameIndex).focus();
          return;
        }
        if (this.travllerInfoForm.controls[i]?.get('dob').invalid) {
          this.scrollInput('dobDay', i);
        }
        if (this.travllerInfoForm.controls[i]?.get('passPortCountry').invalid) {
          this.scrollInput('passPortCountry', i);
        }
        if (this.travllerInfoForm.controls[i]?.get('nationality').invalid) {
          this.scrollInput('nationality', i);
        }
        if (
          this.travllerInfoForm.controls[i]?.get('psExpYear').invalid ||
          this.travllerInfoForm.controls[i]?.get('psExpMonth').invalid ||
          this.travllerInfoForm.controls[i]?.get('psExpDay').invalid ||
          this.travllerInfoForm.controls[i]?.get('passportExpiry').invalid
        ) {
          this.scrollInput('psExpDay', i);
        }
      }
      return;
    } else {
      const controls = <UntypedFormArray>this.travellerForm.controls['travellersList'];
      for (let i = 0; i <= controls.length; i++) {
        this.checkNameDuplication(i);
        if (this.checkPsExpDate(i)) {
          this.travllerInfoForm.controls[i]?.get('passportExpiry').setErrors({ invalid: true });
          this.scrollInput('psExpDay', i);
        }
        if (this.travllerInfoForm.controls[i] && this.travllerInfoForm.controls[i].get('dob').value) {
          let formattedDate =
            this.travllerInfoForm.controls[i].get('dob').value.split('/')[2] +
            '/' +
            this.travllerInfoForm.controls[i].get('dob').value.split('/')[1] +
            '/' +
            this.travllerInfoForm.controls[i].get('dob').value.split('/')[0];
          /**check age years of traveller */
          let userDOB: any = new Date(formattedDate);
          let arriveday: any = new Date(this.finalDestArriveDate);
          let ageOfTraveller = this.calculatePaxAge(userDOB,arriveday);
          if (this.travllerInfoForm.controls[i]?.get('type').value == 'ADULT') {
            this.verifyAdult(i, ageOfTraveller);
          }
          if (this.travllerInfoForm.controls[i]?.get('type').value == 'YOUNGADULT') {
            this.verifyYoungAdult(i, ageOfTraveller);
          } else if (this.travllerInfoForm.controls[i]?.get('type').value == 'CHILD') {
            this.verifyChild(i, ageOfTraveller);
          } else if (this.travllerInfoForm.controls[i]?.get('type').value == 'INFANT') {
            this.verifyInfant(i, ageOfTraveller);

          }
        }
      }
    }
  }

  /**checks the passengers name when there are multiple passengers*/
  showPaxNameDuplicateErr(index: number) {
    return isPaxNameDuplicateErr(index, this.travllerInfoForm);
  }

  /**verifies the passenger as a adult or not */
  verifyAdult(index: number, ageOfTraveller: number) {
    if (ageOfTraveller > 0 && ageOfTraveller >= 16 && ageOfTraveller <= 111) {
      this.travllerInfoForm.controls[index].get('showError').setValue(false);
      if (this.pricedResult_dataInfo.passengerSettings.adultSettings.showDateOfBirth == true) {
        this.travllerInfoForm.controls[index].get('dob').setValidators(Validators.required);
        this.travllerInfoForm.controls[index].get('dob').updateValueAndValidity();
        return;
      }
    } else if (
      (this.travllerInfoForm.controls[index]?.get('type').value == 'ADULT' &&
        ageOfTraveller >= 0 &&
        ageOfTraveller < 16) ||
      ageOfTraveller > 111 ||
      ageOfTraveller < 0
    ) {
      this.scrollInput('dobDay', index);
      this.travllerInfoForm.controls[index].get('showError').setValue(true);
      this.adltErr = true;
      this.travellerForm.get('travellersList')['controls'][index].get('dob').setErrors({ invalid: true });
    }
  }

  /**verifies the passenger as a youngadult or not */
  verifyYoungAdult(index: number, ageOfTraveller: number) {
    if (ageOfTraveller > 0 && ageOfTraveller >= 12 && ageOfTraveller <= 15) {
      this.travllerInfoForm.controls[index].get('showError').setValue(false);
      if (this.pricedResult_dataInfo.passengerSettings.youngAdultSettings.showDateOfBirth == true) {
        this.travllerInfoForm.controls[index].get('dob').setValidators(Validators.required);
        this.travllerInfoForm.controls[index].get('dob').updateValueAndValidity();
        return;
      }
    } else if (
      (this.travllerInfoForm.controls[index]?.get('type').value == 'YOUNGADULT' &&
        ageOfTraveller >= 0 &&
        ageOfTraveller < 12) ||
      ageOfTraveller > 15 ||
      ageOfTraveller < 0
    ) {
      this.scrollInput('dobDay', index);
      this.travllerInfoForm.controls[index].get('showError').setValue(true);
      this.adltErr = true;
      this.travellerForm.get('travellersList')['controls'][index].get('dob').setErrors({ invalid: true });
    }
  }

  /**verifies the passenger as a child or not */
  verifyChild(index: number, ageOfTraveller: number) {
    let flightSearchData = JSON.parse(this.storage.getItem('flightsearchInfo', 'session'));
    if (
      flightSearchData.tripType !== 'return' &&
      this.pricedResult_dataInfo.passengerSettings &&
      ageOfTraveller > 0 &&
      ageOfTraveller >= 2 &&
      ageOfTraveller <= 11
    ) {
      chidDobValidation(this.travllerInfoForm, index, this.pricedResult_dataInfo.passengerSettings);
    } else if (
      flightSearchData.tripType == 'return' &&
      (ageOfTraveller < 2 || ageOfTraveller > 11) &&
      this.pricedResult_dataInfo.passengerSettings
    ) {
      this.childErr = true;
      this.childArrivalDateDobErr = false;
      this.travllerInfoForm.controls[index].get('showError').setValue(true);
      this.scrollInput('dobDay', index);
      this.travellerForm.get('travellersList')['controls'][index].get('dob').setErrors({ invalid: true });
    } else if (
      (flightSearchData.tripType !== 'return' && this.travllerInfoForm.controls[index] && ageOfTraveller > 0) ||
      ageOfTraveller < 2 ||
      ageOfTraveller > 11 ||
      ageOfTraveller < 0 ||
      ageOfTraveller > 90
    ) {
      this.travllerInfoForm.controls[index].get('showError').setValue(true);
      this.scrollInput('dobDay', index);
      this.childErr = true;
      this.childArrivalDateDobErr = false;
      this.travellerForm.get('travellersList')['controls'][index].get('dob').setErrors({ invalid: true });
    }
  }

  /**verifies the passenger as a infant or not */
  verifyInfant(index: number, ageOfTraveller: number) {
    if (ageOfTraveller > 0 && ageOfTraveller < 2) {
      this.travllerInfoForm.controls[index].get('showError').setValue(false);
      if (this.pricedResult_dataInfo.passengerSettings.infantSettings.showDateOfBirth == true) {
        this.travllerInfoForm.controls[index].get('dob').setValidators(Validators.required);
        this.travllerInfoForm.controls[index].get('dob').updateValueAndValidity();
        return;
      }
    } else if (this.travllerInfoForm.controls[index] && ageOfTraveller >= 2) {
      this.travllerInfoForm.controls[index].get('showError').setValue(true);
      this.scrollInput('dobDay', index);
      this.infantInvalidDobErr = false;
      this.travellerForm.get('travellersList')['controls'][index].get('dob').setErrors({ invalid: true });
      // TO DO for dob focus
      // if (this.travllerInfoForm.controls[index].get('dob')) {
      //   let indexId = 'dob' + index.toString();
      //   document.getElementById(indexId).focus();
      // }
    }
    else if(ageOfTraveller < 0){
      this.infantInvalidDobErr = true;
      this.scrollInput('dobDay', index);
      this.travllerInfoForm.controls[index].get('showError').setValue(true);
      this.travellerForm.get('travellersList')['controls'][index].get('dob').setErrors({ invalid: true });
    }
  }

  /**ToDo we can remove after deploying new baggage design
  getbaggageVal() {
    this.baggageFee = getBaggageFee(this.travellerForm.value);
    this.bookingService.changeBaggage(this.baggageFee);
    this.BaggageAmount.emit(this.baggageFee);
  }
  */
  nameFocus(control: string, index: number, value: boolean) {
    if (value) {
      this.nameFocusId = index;
      this.nameFocuscontrol = control;
    } else {
      this.nameFocusId = -1;
      this.nameFocuscontrol = null;
    }
  }

  /* check saved travellers age and split the travellers based on age */
  verifyTraveller(traveller: any) {
    let formattedDate = new Date(traveller.birthDate);
    let ageInTotalMonths = moment().diff(formattedDate, 'months');
    let ageOfTraveller = ageInTotalMonths / 12;
    if (
      ageOfTraveller > 0 &&
      ageOfTraveller >= 16 &&
      ageOfTraveller <= 111 &&
      !this.adultTravellers.some((x: any) => x.travellerId === traveller.travellerId)
    ) {
      this.adultTravellers.push(traveller);
    } else if (
      ageOfTraveller > 0 &&
      ageOfTraveller >= 12 &&
      ageOfTraveller <= 15 &&
      !this.YoungAdultTravellers.some((x: any) => x.travellerId === traveller.travellerId)
    ) {
      this.YoungAdultTravellers.push(traveller);
    } else if (
      ageOfTraveller > 0 &&
      ageOfTraveller > 2 &&
      ageOfTraveller < 12 &&
      !this.childTravellers.some((x: any) => x.travellerId === traveller.travellerId)
    ) {
      this.childTravellers.push(traveller);
    } else if (
      ageOfTraveller > 0 &&
      ageOfTraveller < 2 &&
      !this.infantTravellers.some((x: any) => x.travellerId === traveller.travellerId)
    ) {
      this.infantTravellers.push(traveller);
    }
  }

  /* here return the saved travellers based on passenger type*/
  getTravellers(type: string) {
    if (type === 'ADULT') {
      return this.adultTravellers;
    } else if (type === 'YOUNGADULT') {
      return this.YoungAdultTravellers;
    } else if (type === 'CHILD') {
      return this.childTravellers;
    } else if (type === 'INFANT') {
      return this.infantTravellers;
    }
  }

  /* here trim the value is less than 10 for set value to  dobDay & dobmonth in saved traveller case */
  getDobvalue(value: any) {
    if (value < 10) {
      return value.charAt(value.length - 1);
    } else {
      return value;
    }
  }

  onKeyEnterEvent(searchValue: string, index: number) {
    if (searchValue.length >= 2) {
      this.filteredOptions = this.filteredOptions.filter((item: any) => {
        return item.name.toLowerCase().includes(searchValue.toLowerCase());
      });
    } else {
      this.getCountriesName();
    }
    if (this.filteredOptions.length == 0) {
      this.getCountriesName();
    }
  }

  getCountriesName() {
    this.filteredOptions = getCountriesArray();
  }

  openMealSelection(element: string, index: number) {
    $(element + index).collapse('show');
  }

  ArrMatFocused(matTrg: MatAutocompleteTrigger, isopen: boolean) {
    if (isopen) {
      setTimeout(() => {
        matTrg.openPanel();
      });
    } else {
      setTimeout(() => {
        matTrg.closePanel();
      });
    }
  }

  /**sets the pax details in the form  when user is moving in the booking flow*/
  paxNameDetails() {
    if (this.storage.getItem('travellerDetails', 'session')) {
      const paxData = JSON.parse(this.storage.getItem('travellerDetails', 'session'));
      const controls = <UntypedFormArray>this.travellerForm.controls['travellersList'];
      cachePaxDetails(controls, paxData, this.travllerInfoForm);
    }
  }

  /**stores the traveller values in the session*/
  updateFormValue() {
    this.storage.removeItem('travellerDetails');
    this.storage.setItem('travellerDetails', JSON.stringify(this.travellerForm.value), 'session');
    this.bookingService.updateTravellersDataInfo(this.travellerForm.value);
  }

  openFqFlyer(param: boolean) {
    this.showfqFly = !param;
  }

  hideMeals() {
    this.showfqFly = false;
  }

  /**update traveller form with session data  */
  updateTravellerForm(travellerData: any) {
    for (let i = 0; i < travellerData.length; i++) {
      let travellerBirthdate = this.ngbDateParserFormatter.parse(travellerData[i]?.dob?.replaceAll('/', '-'));
      this.travellersList().push(
        this.fb.group({
          paxTypeCount: travellerData[i].paxTypeCount,
          showError: false,
          showPsExpiryErr: false,
          invalidPscountry: false,
          invalidnationality: false,
          dobDay: (() => {
            if (travellerBirthdate?.day) {
              return travellerBirthdate.day;
            }
          })(),
          dobMonth: (() => {
            if (travellerBirthdate?.month) {
              return travellerBirthdate.month;
            }
          })(),
          dobYear: (() => {
            if (travellerBirthdate?.year) {
              return travellerBirthdate.year;
            }
          })(),
          psExpDay: travellerData[i].passportExpiry.day,
          psExpMonth: travellerData[i].passportExpiry.month,
          psExpYear: travellerData[i].passportExpiry.year,
          firstName: [
            travellerData[i].firstName,
            [Validators.pattern("^[A-Za-zÀ-ÖØ-öø-ÿ-'’ ]+$"), Validators.required],
          ],
          middleName: [travellerData[i].middleName, [Validators.pattern("^[A-Za-zÀ-ÖØ-öø-ÿ-'’ ]+$")]],
          lastName: [travellerData[i].lastName, [Validators.pattern("^[A-Za-zÀ-ÖØ-öø-ÿ-'’ ]+$"), Validators.required]],
          travellersAge: travellerData[i].travellersAge,
          gender: travellerData[i].gender,
          email: travellerData[i].email,
          dob: [travellerData[i].dob],
          type: travellerData[i].type,
          title: travellerData[i].title,
          id: travellerData[i].id,
          passengerCount: travellerData[i].passengerCount,
          passportExpiry: travellerData[i].passportExpiry,

          passPortCountry: travellerData[i].passPortCountry,
          passportNumber: [travellerData[i].passportNumber, [Validators.pattern('^[a-zA-Z0-9]+$')]],
          nationality: travellerData[i].nationality,
          baggageSelection:
            this.check_In_baggageArray.length > 0 &&
            this.check_In_baggageArray[i] &&
            this.check_In_baggageArray[i].baggageData?.length > 0
              ? this.fb.array(this.check_In_baggageArray[i].baggageData.map((x: any) => this.getBaggage(x)))
              : [],
          specialRequests: this.fb.group({
            mealSelection: travellerData[i].specialRequests.mealSelection,
            mealValue: travellerData[i].specialRequests.mealValue,
            mealsAmount: travellerData[i].specialRequests.mealsAmount,
            frequentFlyerDetailsList: this.fb.array(
              travellerData[i].specialRequests.frequentFlyerDetailsList.map((x: any) => this.getFrequentFlyers(x))
            ),
            seatDetails: [],
          }),
        })
      );
    }
  }

  getSeatsInfo(data: any): any {
    if (data) {
      return this.fb.array(
        data.map((x: any) => {
          if (x != null) {
            return this.fb.group({
              basePrice: [x.basePrice],
              currency: [x.currency],
              flightNumber: [x.flightNumber],
              price: [x.price],
              seatNumber: [x.seatNumber],
            });
          }
        })
      );
    } else {
      return null;
    }
  }

  public displayFn(country: any) {
    if (country) {
      return `${country['name']}`;
    }
  }

  /**Checking the diacritics from the entered name*/
  nameCheck(text: any, index: number, control: string) {
    let inputTxt = text;
    const formattedTxt = inputTxt.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    this.travllerInfoForm.controls[index]?.get(control).setValue(formattedTxt);
  }

  /**Removing diacritics*/
  removeDiacritics(text: string) {
    const name = removeDiacriticsAndHyphens(text);
    return name;
  }

  /**It checks the diacritics, it removes and changes those values*/
  namesCheck(index: number, control: string) {
    const name = this.travllerInfoForm.controls[index]?.get(control).value;
    this.travllerInfoForm.controls[index]?.get(control).setValue(removeDiacriticsAndHyphens(name));
  }

  /**Comparing the passport expiry date with arrival date*/
  checkArrivalDate(index: number) {
    if (this.selectedFlightInfo && this.travllerInfoForm?.controls[index]?.get('passportExpiry').value) {
      const expDate = formatExpDate(this.travllerInfoForm?.controls[index]?.get('passportExpiry').value);
      let psExpDate = new Date(expDate);
      const arr_Date = new Date(this.finalDestArriveDate);
      return psExpDate && arr_Date && psExpDate < arr_Date;
    }
  }

  /*
   * setting the days as per the month and year selection
   */
  selectionPsExpiry(index: number, param1?: any, param2?: any) {
    if (param1 === 'month') {
      this.selectedMonth = param2.value;
    } else if (param1 === 'year') {
      this.selectedYear = param2.value;
    }
    selectionPassportExpiry(this.days(), this.travllerInfoForm, index, param1, param2);
  }

  /**scrolling passed formcontrol if it is invalid */
  scrollInput(control: any, i: number) {
    let countryIndex = control + i.toString();
    let element = document.getElementById(countryIndex);
    if (element) {
      element.scrollIntoView({ behavior: 'auto', block: 'start' });
    }
  }

  /**Checking the passport expiry date with current date */
  checkPsExpDate(index: number) {
    if (this.travllerInfoForm.controls[index]?.get('passportExpiry')?.value) {
      let date = this.travllerInfoForm.controls[index]?.get('passportExpiry')?.value;
      const targetDate = new Date(date.year, date.month - 1, date.day);
      const currentDate = new Date();
      return targetDate && currentDate && targetDate < currentDate;
    }
  }

  /**Focusing name field on duplicate name error */
  checkNameDuplication(index: number) {
    if (this.showPaxNameDuplicateErr(index)) {
      this.focusInput('firstName', index);
    }
  }

  /**focusing passed formcontrol if it is invalid */
  focusInput(control: any, i: number) {
    let inputIndex = control + i.toString();
    let element = document.getElementById(inputIndex);
    if (element) {
      element.focus();
    }
    return;
  }

  /**Fetching Countries list */
  getCountriesList() {
    this.searchService.fetchCountries().subscribe((countries: any) => {
      this.filteredOptions = countries.sort((a: any, b: any) => a.name.localeCompare(b.name));
    });
  }

  populateMmfTravelerData() {
    const travelerData = JSON.parse(this.storage.getItem('mmfTravellerData', 'session'));
    travelerData.sort((a: any, b: any) => {
      const order = { ADULT: 1, YOUNGADULT: 2, CHILD: 3, INFANT: 4 };
      return (order[a.paxType] || 5) - (order[b.paxType] || 5);
    });
    travelerData.forEach((traveler: any, idx: number) => {
      this.passengerInfo(traveler.paxType, this.pricedResult_dataInfo.passengerSettings, traveler, idx, '', idx);
    });
  }

  /**To check allow  user to edit input fields or not based on country and input value  */
  restrictInputEditOption(inputValue: any) {
    return restrictEditOption(this.region, inputValue);
  }

  onMealSelected(event: { meal: any; index: number }): void {
    this.selectedMeal = event;
  }

  applyMealSelection(): void {
    if (this.selectedMeal) {
      this.selectMeals(this.selectedMeal.meal, this.selectedMeal.index);
    }
    this.selectedMeal = null;
  }

  fullUpdateFormValue(text: any, index: number, control: string) {
    this.updateFormValue();
    this.nameCheck(text, index, control);
    this.namesCheck(index, control);
  }
    /**here we are calculate pax age with last arrival date of itinerary based on this age we are validatong pax Date of birth  */
    calculatePaxAge(dob: string, arraivalDate: string): number {
      const birthDate = new Date(dob);
     let paxAge =  moment(arraivalDate, 'YYYY-MM-DD').diff(moment(dob, 'YYYY-MM-DD'), 'years');
     if(birthDate > new Date()){
       paxAge = -1;
     }
     return paxAge;
   }
}
