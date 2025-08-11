import { Component, ElementRef, HostListener, OnInit, ViewChild, Inject, PLATFORM_ID } from '@angular/core';

import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';

import { DatePipe, formatDate } from '@angular/common';
import { MyAccountServiceService } from '../my-account-service.service';
import { NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { SearchService } from '@app/flights/service/search.service';
import { responsiveService } from '@app/_core';
import { isFutureDate } from '@app/flights/utils/search-data.utils';
import { CustomDateParser } from '@app/general/utils/CustomDateParser';
import { checkDateNumber } from '@app/flights/utils/odo.utils';
import { ApiService } from '@app/general/services/api/api.service';
import { UniversalStorageService } from '@app/general/services/universal-storage.service';
import { SessionService } from '../../general/services/session.service';
import { isPlatformBrowser } from '@angular/common';

declare let $: any;

const getMonth = (idx: any) => {
  let objDate = new Date();
  objDate.setDate(1);
  objDate.setMonth(idx - 1);
  let locale = 'en-us',
    month = objDate.toLocaleString(locale, { month: 'short' });
  return month;
};

@Component({
  selector: 'app-travellers',
  templateUrl: './travellers.component.html',
  styleUrls: ['./travellers.component.scss', './../../../theme/country_selection.scss'],
  providers: [{ provide: NgbDateParserFormatter, useClass: CustomDateParser }],
})
export class TravellersComponent implements OnInit {
  public countriesArray: [] = [];
  private isBrowser: boolean;
  months = Array(12)
    .fill(0)
    .map((_i, idx) => getMonth(idx + 1));
  submitted = false;
  addTravellerForm: UntypedFormGroup;
  createTraveller: any = {};
  title: any;
  pcardExp: any = '';
  contrycode: any;
  dob: any = '';
  cityCode: any;
  phoneNo: any;
  displayMonths = 1;
  navigation = 'select';
  showWeekNumbers = false;
  outsideDays = 'visible';
  credentials: any = null;
  public isValidPhoneNumber = false;
  selectedYear = 2004;
  selectedMonth = 1;
  selectedDay = 1;
  dobArray: any = [];
  psExpYearArray: any = [];
  get form() {
    return this.addTravellerForm.controls;
  }

  public dobminDate = {
    year: new Date().getFullYear() - 100,
    month: new Date().getMonth() + 1,
    day: new Date().getDate(),
  };
  public dobmaxDate = {
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    day: new Date().getDate(),
  };
  public expminDate = {
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    day: new Date().getDate(),
  };
  public expmaxDate = {
    year: new Date().getFullYear() + 50,
    month: new Date().getMonth() + 1,
    day: new Date().getDate(),
  };
  modalRef: BsModalRef;
  dltTraveller: any;
  updateBtn = false;
  travellerId: any;
  contactNo: any;
  saveLocalStorage = false;
  add_error = false;
  errorMsg: string = '';
  country: string;
  userAgent: any;
  isShowAddmore = false;
  region: string;


  @ViewChild('travellers_list') travellers: ElementRef;
  constructor(
    private formbuilder: UntypedFormBuilder,
    private datePipe: DatePipe,
    private myacountService: MyAccountServiceService,
    private _snackBar: MatSnackBar,
    private searchService: SearchService,
    public responsiveservice: responsiveService,
    public apiService: ApiService,
    private sessionService: SessionService,
    private storage: UniversalStorageService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.region = this.apiService.extractCountryFromDomain();
  }
  ngOnInit(): void {
    if (this.storage.getItem('credentials', 'local')) {
      this.saveLocalStorage = true;
      this.credentials = JSON.parse(this.storage.getItem('credentials', 'local'));
    } else if (this.storage.getItem('credentials', 'session')) {
      this.saveLocalStorage = false;
      this.credentials = JSON.parse(this.storage.getItem('credentials', 'session'));
    }
    this.getCountriesList();
    this.addTravellerForm = this.formbuilder.group({
      gender: ['', [Validators.required]],
      firstName: ['', [Validators.pattern("^[a-zA-Z]+[-'s]?[a-zA-Z ]+$"), Validators.required]],

      surName: ['', [Validators.pattern("^[a-zA-Z]+[-'s]?[a-zA-Z ]+$"), Validators.required]],
      middleName: ['', [Validators.pattern("^[a-zA-Z]+[-'s]?[a-zA-Z ]+$")]],
      dob: ['', [Validators.required]],
      email: ['', [Validators.pattern('^[a-zA-Z0-9.!#$%&\'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\\.[a-zA-Z0-9-]+)*$')]],
      phone: [''],
      dobDay: [''],
      dobMonth: [''],
      dobYear: [''],
      psExpDay: [''],
      psExpMonth: [''],
      psExpYear: [''],
      passportExpiry: [null],
      nationality: [''],
      passPortCountry: [''],
      passportNumber: ['', [Validators.pattern('^[^s]+[a-zA-Z0-9 _]*[a-zA-Z0-9][a-zA-Z0-9 _]*$')]]
    });
    this.searchService.langValue.subscribe((val: any) => {
      this.userAgent = this.myacountService.countrydata;
    });
    this.getDobYears();
  }

  get CountryCode() {
    if (this.storage.getItem('countrycode', 'local')) {
      this.country = this.storage.getItem('countrycode', 'local');
    } else {
      this.country = 'US';
    }
    return this.country;
  }
  telInputObject(obj: any) {
    if (this.CountryCode) {
      obj.setCountry(this.CountryCode);
    }
  }

  onCountryChange(q: any) {
    this.contrycode = q.dialCode;
  }

  getNumber(q: any) {}

  hasError(q: any) {
    this.isValidPhoneNumber = !q;
  }
  onSubmit() {
    this.submitted = true;
    this.checkDob();
    if (this.addTravellerForm.invalid) {
      return;
    } else {
      this.setValues(this.addTravellerForm.value);
      if (this.addTravellerForm?.value?.passportExpiry) {
        if (this.checkDate(this.addTravellerForm?.value?.passportExpiry)) {
          this.submitAddPaxForm();
        }
      } else if (!this.addTravellerForm.value.passportExpiry) {
        this.submitAddPaxForm();
      }
    }
  }

  /**submitting the add traveller form*/
  submitAddPaxForm() {
    this.myacountService.addTravellers(this.createTraveller).subscribe((res: any) => {
      if (res.result === 'OK' && res.code === 200) {
        this.credentials = res;
        this.addTravellerForm.reset();
        this.submitted = false;
        this.add_error = false;
       //store data in session storage & local storage
       this.sessionService.setStorageDataInSession(res, this.saveLocalStorage)
        this._snackBar.open('Traveller added Successfully', '');
        setTimeout(() => {
          this._snackBar.dismiss();
          this.setInitDateValues();
        }, 3000);
      } else if (res.result !== 'OK' && res.code !== 200) {
        this.add_error = true;
        this.errorMsg = res.result;
      }
    });
  }
  /**set values to the form when user clicks on edit icon*/
  editTraveller(traveller: any, el: HTMLElement) {
    el.scrollIntoView({ behavior: 'smooth' });
    this.travellerId = traveller.travellerId;
    if (traveller.telephoneList.length != 0) {
      this.contactNo = traveller.telephoneList[0].areaCityCode + traveller.telephoneList[0].phoneNumber;
    } else {
      this.contactNo = '';
    }
    this.updateBtn = true;

    let paxDob = formatDate(traveller.birthDate, 'dd-MM-yyyy', 'en_US');
    let dobDate = this.getObjFormattedDate(paxDob);
    let psExpDate: any;
    let paxPsExpDate: any;
    if (traveller.passport.effectiveExpireOptionalDate) {
      psExpDate = formatDate(traveller.passport.effectiveExpireOptionalDate, 'dd-MM-yyyy', 'en_US');
      paxPsExpDate = this.getObjFormattedDate(psExpDate);
      this.addTravellerForm.get('passportExpiry').setValue(psExpDate);
      this.addTravellerForm.get('psExpDay').setValue(paxPsExpDate.day);
      this.addTravellerForm.get('psExpMonth').setValue(paxPsExpDate.month);
      this.addTravellerForm.get('psExpYear').setValue(paxPsExpDate.year);
    }
    this.addTravellerForm.get('gender').setValue(traveller.personName.nameTitle);
    this.addTravellerForm.get('firstName').setValue(traveller.personName.givenName);
    this.addTravellerForm.get('surName').setValue(traveller.personName.surname);
    this.addTravellerForm.get('middleName').setValue(traveller.personName.middleName);
    this.addTravellerForm.get('dob').setValue(paxDob);
    this.addTravellerForm.get('dobDay').setValue(dobDate.day);
    this.addTravellerForm.get('dobMonth').setValue(dobDate.month);
    this.addTravellerForm.get('dobYear').setValue(dobDate.year);
    this.addTravellerForm.get('email').setValue(traveller.email);
    this.addTravellerForm.get('phone').setValue(this.contactNo);
    this.addTravellerForm.get('nationality').setValue(traveller.passport.docHolderNationality);
    this.addTravellerForm.get('passPortCountry').setValue(traveller.passport.docIssueCountry);
    this.addTravellerForm.get('passportNumber').setValue(traveller.passport.passportNumber);
  }
  /**returns the date in object format*/
  getObjFormattedDate(date: any) {
    let day = this.formattedDate(date.slice(0, 2));
    let month = this.formattedDate(date.slice(3, 5));
    let year = parseInt(date.slice(6, 10));
    return { day: day, month: month, year: year };
  }
  formattedDate(date: any) {
    if (date[0] == 0) {
      return parseInt(date[1]);
    } else {
      return parseInt(date);
    }
  }

  openDialog(data: any) {
    $('#DeleteTraveller_Modal').modal('show');
    this.dltTraveller = data;
  }
  deleteTraveller() {
    let travellerId = this.dltTraveller.travellerId;

    const tokenData = {
      userAgent: this.userAgent,
    };

    this.myacountService.deleteTraveller(travellerId, tokenData).subscribe((res: any) => {
      if (res.result === 'OK' && res.code === 200) {
        this.credentials = res;
        //store data in session storage & local storage
        this.sessionService.setStorageDataInSession(res, this.saveLocalStorage)
        this._snackBar.open('Traveller Deleted Successfully', '');
        setTimeout(() => {
          this._snackBar.dismiss();
          this.setInitDateValues();
        }, 3000);
      }
      $('#DeleteTraveller_Modal').modal('hide');
    });
  }
  cancel() {
    this.addTravellerForm.reset();
    this.updateBtn = false;
    this.add_error = false;
  }

  update() {
    this.submitted = true;
    this.checkDob();
    if (this.addTravellerForm.invalid) {
      return;
    } else {
      this.setValues(this.addTravellerForm.value);
      if (this.addTravellerForm?.value?.passportExpiry) {
        if (this.checkDate(this.addTravellerForm?.value?.passportExpiry)) {
          this.updatePaxValues();
        }
      } else if (!this.addTravellerForm.value.passportExpiry) {
        this.updatePaxValues();
      }
    }
  }
  /**update the traveller values */
  updatePaxValues() {
    this.myacountService.updateTraveller(this.travellerId, this.createTraveller).subscribe((res: any) => {
      if (res.result === 'OK' && res.code === 200) {
        this.credentials = res;
        this.submitted = false;
        this.addTravellerForm.reset();
        this.updateBtn = false;
        this.add_error = false;
       //store data in session storage & local storage
       this.sessionService.setStorageDataInSession(res, this.saveLocalStorage)
        this._snackBar.open('Traveller updated Successfully', '');
        setTimeout(() => {
          this._snackBar.dismiss();
          this.setInitDateValues();
        }, 3000);
      } else if (res.result !== 'OK' && res.code !== 200) {
        this.add_error = true;
        this.errorMsg = res.result;
      }
    });
  }
  setValues(data: any) {
    let birthDate = this.getFormattedDate(this.addTravellerForm.get('dob').value);
    let expdate: any;
    if (this.addTravellerForm.get('passportExpiry').value) {
      expdate = this.getFormattedDate(this.addTravellerForm.get('passportExpiry').value);
    } else {
      expdate = null;
    }

    if (data.phone) {
      let val = data.phone.toString();
      this.cityCode = val.slice(0, 3);
      this.phoneNo = val.slice(3, val.length);
    }
    this.createTraveller = {
      token: this.credentials.data.token,
      traveller: {
        personName: {
          givenName: data.firstName,
          surname: data.surName,
          middleName: data.middleName,
          nameTitle: data.gender,
        },
        Address: {},
        passport: {
          docHolderNationality: data.nationality,
          docIssueCountry: data.passPortCountry,
          passportNumber: data.passportNumber,
          effectiveExpireOptionalDate: expdate,
        },
        email: data.email,
        passengerType: 10,
        birthDate: birthDate,

        telephoneList: [
          {
            phoneTech: '5',
            countryAccessCode: this.contrycode,
            areaCityCode: this.cityCode,
            phoneNumber: this.phoneNo,
          },
        ],
      },
      userAgent: this.userAgent,
    };
  }
  addpassengerView(element: any) {
    element.scrollIntoView({ behavior: 'smooth' });
  }
  getFormattedDate(date: any) {
    let date1 = date.replace(/(\d{2})-(\d{2})-(\d{4})/, '$2/$1/$3');
    return this.datePipe.transform(date1, 'MMM d, yyyy');
  }
  scrolltoTop() {
    if (!this.isBrowser) return;
    window.scroll({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });
  }

  @HostListener('window:scroll', [])
  checkScroll() {
    if (!this.isBrowser) return;
    if (this.credentials?.data?.travellerList?.length > 0) {
      const scrollPosition = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
      let divHeight = 0;
      if (this.travellers.nativeElement.offsetHeight > 800) {
        divHeight = this.travellers.nativeElement.offsetHeight / 1.5;
      } else {
        divHeight = this.travellers.nativeElement.offsetHeight / 2;
      }
      if (divHeight && divHeight <= scrollPosition) {
        this.isShowAddmore = true;
      } else {
        this.isShowAddmore = false;
      }
    }
  }
  isElementVisible(el: any) {
    if (!this.isBrowser) return;
    const rect = el.getBoundingClientRect(),
      vWidth = window.innerWidth || document.documentElement.clientWidth,
      vHeight = window.innerHeight || document.documentElement.clientHeight,
      efp = function (x: any, y: any) {
        return document.elementFromPoint(x, y);
      };

    // Return false if it's not in the viewport
    if (rect.right < 0 || rect.bottom < 0 || rect.left > vWidth || rect.top > vHeight) return false;

    // Return true if any of its four corners are visible
    return (
      el.contains(efp(rect.left, rect.top)) ||
      el.contains(efp(rect.right, rect.top)) ||
      el.contains(efp(rect.right, rect.bottom)) ||
      el.contains(efp(rect.left, rect.bottom))
    );
  }
  ngOnDestroy() {
    $('#DeleteTraveller_Modal').modal('hide');
  }
  /*
   * setting the days for passenger dob
   */
  public get days() {
    const dayCount = this.getDaysInMonth(this.selectedYear, this.selectedMonth);
    return Array(dayCount)
      .fill(0)
      .map((_i, idx) => idx + 1);
  }
  /*
   * setting the days for passport expiry
   */
  public get psExpdays() {
    const dayCount = this.getDaysInMonth(this.selectedYear, this.selectedMonth);
    return Array(dayCount)
      .fill(0)
      .map((_i, idx) => idx + 1);
  }
  /*
   * restoring the default days if month is not selected
   */
  isdayFocused() {
    if (!this.addTravellerForm.get('dobMonth').value) {
      this.selectedMonth = 1;
    } else {
      this.selectedMonth = this.addTravellerForm.get('dobMonth').value;
    }
    if (this.addTravellerForm.get('dobYear').value) {
      this.selectedYear = this.addTravellerForm.get('dobYear').value;
    }
  }
  /*
   * restoring the default days if month is not selected
   */
  ispsExpdayFocused() {
    if (!this.addTravellerForm.get('psExpMonth').value) {
      this.selectedMonth = 1;
    } else {
      this.selectedMonth = this.addTravellerForm.get('psExpMonth').value;
    }
    if (this.addTravellerForm.get('psExpYear').value) {
      this.selectedYear = this.addTravellerForm.get('psExpYear').value;
    }
  }
  public getDaysInMonth(year: number, month: number) {
    return 32 - new Date(year, month - 1, 32).getDate();
  }
  /**setting the years range*/
  public getDobYears() {
    let year = new Date().getFullYear();
    for (let i = 0; i <= 111; i++) {
      this.dobArray.push(year - i);
    }
    for (let j = 0; j <= 20; j++) {
      this.psExpYearArray.push(year + j);
    }
  }
  /*
   * setting the days as per the month and year selection
   */
  selectionDob(param1?: any, param2?: any) {
    if (param2 === 'month') {
      this.selectedMonth = param1.value;
      if (!this.days.includes(parseInt(this.addTravellerForm.get('dobDay').value))) {
        this.addTravellerForm.get('dobDay').setValue('');
      }
    } else if (param2 === 'year') {
      this.selectedYear = param1.value;
      this.isdayFocused();
      if (!this.days.includes(parseInt(this.addTravellerForm.get('dobDay').value))) {
        this.addTravellerForm.get('dobDay').setValue('');
      }
    }
    if (
      this.addTravellerForm &&
      this.addTravellerForm.get('dobMonth') &&
      this.addTravellerForm.get('dobMonth').value &&
      this.addTravellerForm.get('dobYear') &&
      this.addTravellerForm.get('dobYear').value &&
      this.addTravellerForm.get('dobDay') &&
      this.addTravellerForm.get('dobDay').value
    ) {
      let travellerDob =
        checkDateNumber(this.addTravellerForm.get('dobDay').value) +
        '-' +
        checkDateNumber(this.addTravellerForm.get('dobMonth').value) +
        '-' +
        checkDateNumber(this.addTravellerForm.get('dobYear').value);
      this.addTravellerForm.get('dob').setValue(travellerDob);
    } else {
      this.addTravellerForm.get('dob').setValue('');
    }
  }
  /*
   * setting the days as per the passport expiry month and year selection
   */
  passportExpSelection(param1?: any, param2?: any) {
    if (param2 === 'month') {
      this.selectedMonth = param1.value;
      if (!this.psExpdays.includes(parseInt(this.addTravellerForm.get('psExpDay').value))) {
        this.addTravellerForm.get('psExpDay').setValue('');
      }
    } else if (param2 === 'year') {
      this.selectedYear = param1.value;
      this.ispsExpdayFocused();
      if (!this.psExpdays.includes(parseInt(this.addTravellerForm.get('psExpDay').value))) {
        this.addTravellerForm.get('psExpDay').setValue('');
      }
    }
    if (
      this.addTravellerForm &&
      this.addTravellerForm?.get('psExpMonth')?.value &&
      this.addTravellerForm?.get('psExpYear')?.value &&
      this.addTravellerForm?.get('psExpDay')?.value
    ) {
      let paxPsExp =
        checkDateNumber(this.addTravellerForm.get('psExpDay').value) +
        '-' +
        checkDateNumber(this.addTravellerForm.get('psExpMonth').value) +
        '-' +
        checkDateNumber(this.addTravellerForm.get('psExpYear').value);
      this.addTravellerForm.get('passportExpiry').setValue(paxPsExp);
    } else {
      this.addTravellerForm.get('passportExpiry').setValue('');
    }
  }
  /**setting the init values to the dob and passport expiry */
  setInitDateValues() {
    this.addTravellerForm.get('dobDay').setValue('');
    this.addTravellerForm.get('dobMonth').setValue('');
    this.addTravellerForm.get('dobYear').setValue('');
    this.addTravellerForm.get('psExpDay').setValue('');
    this.addTravellerForm.get('psExpMonth').setValue('');
    this.addTravellerForm.get('psExpYear').setValue('');
  }
  /**checks the passport expiry date is future or not */
  checkDate(date: any) {
    if (date) {
      let userDate = date.replaceAll('-', '/');
      return isFutureDate(userDate);
    }
  }
  /**checking the dob is future date, if yes we are restricting to update and create the traveller */
  checkDob() {
    if (this.checkDate(this.addTravellerForm?.get('dob')?.value)) {
      this.addTravellerForm.get('dob').setErrors({ invalid: true });
    }
  }
  /**Fetching Countries list */
  getCountriesList() {
    this.searchService.fetchCountries().subscribe((countries: any) => {
      this.countriesArray = countries.sort((a: any, b: any) => a.name.localeCompare(b.name));
    });
  }
  handleKeyPressEvent(event: any, traveller: any, firstName: any) {
    if (event.key === 'Enter') {
      if (event.target.src.includes('edit.svg')) {
        this.editTraveller(traveller, firstName);
      } else if (event.target.src.includes('delete_icn.svg')) {
        this.openDialog(traveller);
      } else if (event.target.src.includes('add-passengers-icn')) {
        this.addpassengerView(traveller);
      }
    }
  }
}
