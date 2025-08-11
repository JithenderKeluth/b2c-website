import { DatePipe, formatDate } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild, Inject, PLATFORM_ID } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BookingService } from '@app/booking/services/booking.service';
import { Travellers } from '@app/flights/models/travellers';
import { SearchService } from '@app/flights/service/search.service';
import { DeepLinkService } from '@app/general/deeplinks/deep-link.service';
import { QueryStringAffid } from '@app/general/utils/querystringAffid-utils';
import { I18nService } from '@app/i18n/i18n.service';
import { responsiveService } from '@app/_core/services/responsive.service';
import { NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { CountryCodes } from './../../general/utils/country-code';
import { getCountriesArray } from '@app/booking/utils/traveller.utils';
import { IframeWidgetService } from '@app/general/services/iframe-widget.service';
import { SessionUtils } from '@app/general/utils/session-utils';
import { SessionStorageService } from 'ngx-webstorage';
import { clearAllSessionStorageData } from '@app/general/utils/storage.utils';
import { SearchCountryField, CountryISO, PhoneNumberFormat } from 'ngx-intl-tel-input';
import { UniversalStorageService } from '@app/general/services/universal-storage.service';
import { isPlatformBrowser } from '@angular/common';

declare var $: any;
@Component({
  selector: 'app-find-itinerary',
  templateUrl: './find-itinerary.component.html',
  styleUrls: ['./find-itinerary.component.scss'],
})
export class FindItineraryComponent implements OnInit {
  public bookingInfo: any = null;
  public travellerForm: UntypedFormGroup;
  public travellers = new Travellers();
  public countriesArray: any[] = [];
  public adultArray: any = [];
  public childArray: any = [];
  public infantArray: any = [];
  public frequentFlyerDetails: any = [];
  public baggage_Data: any = [];
  public selectedProducts: any = [];
  public productDetails: any;
  public submitted = false;
  public expiryDate: any = {};
  public contactNumber = new UntypedFormControl(null, [Validators.required]);
  public dialCode = new UntypedFormControl('', [Validators.required]);
  public countryName: any;
  public countrydata: any;
  public noCorrectInfo = false;
  isB2BError: boolean = false;
  @ViewChild('phone') mobileNumber: ElementRef;
  queryStringKeys = {};
  apiTriggered: boolean = false;
  isLoading : boolean = false;

  separateDialCode = true;
  SearchCountryField = SearchCountryField;
  CountryISO = CountryISO;
  PhoneNumberFormat = PhoneNumberFormat;
  preferredCountries: CountryISO[] = [CountryISO.UnitedStates, CountryISO.UnitedKingdom];
  selectedCountryCode:string = CountryISO.UnitedStates ;
  private isBrowser: boolean;

  constructor(
    private fb: UntypedFormBuilder,
    private datePipe: DatePipe,
    private router: Router,
    private i18nService: I18nService,
    private ngbDateParserFormatter: NgbDateParserFormatter,
    public responsivservice: responsiveService,
    private deepLinkService: DeepLinkService,
    private activatedRoute: ActivatedRoute,
    private queryString: QueryStringAffid,
    private searchService: SearchService,
    private bookingService: BookingService,
    public iframewidgetservice: IframeWidgetService,
    private sessionStorageService: SessionStorageService,
    private sessionUtils: SessionUtils,
    private storage: UniversalStorageService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    this.getDeepLinkValues();
    this.itineraryApiIssues();
    this.isB2BApp() && this.updateB2BParentUrl(this.sessionUtils.getCorrelationId());
    setTimeout(() => {
      this.getCountryCode();
      this.countriesArray = getCountriesArray();
    }, 1500);
    this.createForm();
  }

  itineraryApiIssues() {
    this.deepLinkService.currentViewItineraryError.subscribe((value: any) => {
      if (value) {
        $('#view_itinerary_error_modal').modal('show');
      }
    });
  }

  getDeepLinkValues() {
    this.activatedRoute.queryParams.subscribe((x) => {
      if (x) {
        this.queryStringKeys = Object.assign(x);
        if (
          typeof this.queryStringKeys === 'object' &&
          Object.keys(this.queryStringKeys).length !== 0 &&
          !this.queryStringKeys.hasOwnProperty('redirect')
        ) {
          this.storage.removeItem('queryStringParams');
          this.queryStringKeys = this.deepLinkService.checkDeeplinkParmsCid(this.queryStringKeys);
          this.storage.setItem('queryStringParams', JSON.stringify(this.queryStringKeys), 'session');
          this.storage.setItem('deepLinkRequest', JSON.stringify(true), 'session');
          this.router.navigate([], {
            queryParams: this.queryStringKeys,
            relativeTo: this.activatedRoute,
            queryParamsHandling: 'merge',
            replaceUrl: true
          }); 
          if (!this.apiTriggered) {
            this.triggerAPIs();
          }
          this.getBookingInfo();
          setTimeout(() => {
            if (this.bookingInfo?.passengers) {
              this.travellerListData();
            }
          }, 1500);
          this.searchService.changeQueryString(this.queryStringKeys);
        }
      }
    });
  }
  triggerAPIs() {
    this.apiTriggered = true;
    if (this.isB2BApp()) {
      this.queryString.getQueryParameterValues();
      clearAllSessionStorageData();
      this.sessionStorageService.clear(SessionUtils.CORRELATION_ID);
      this.getB2BItineraryValues(this.queryStringKeys);
    } else {
      this.queryString.getQueryParameterValues();
      if (!this.storage.getItem('paymentDeeplinkData', 'session')) {
        this.deepLinkService.getItineraryValues(this.queryStringKeys);
      }
    }
  }
  getBookingInfo() {
    if (this.storage.getItem('paymentDeeplinkData', 'session')) {
      this.bookingInfo = JSON.parse(this.storage.getItem('paymentDeeplinkData', 'session'));
      if (this.bookingInfo.passengers && this.bookingInfo.passengers.adults) {
        this.noCorrectInfo = false;
        this.travellers = new Travellers(
          this.bookingInfo.passengers.adults.length,
          this.bookingInfo.passengers.children && this.bookingInfo.passengers.children.length
            ? this.bookingInfo.passengers.children.length
            : 0,
          this.bookingInfo.passengers.infants && this.bookingInfo.passengers.infants.length
            ? this.bookingInfo.passengers.infants.length
            : 0
        );
      }
    }
  }
  get priceLinkData() {
    this.getBookingInfo();
    return this.bookingInfo;
  }
  goToSearchPage() {
    this.router.navigate([''], { queryParamsHandling: 'preserve' });
  }

  getCountryCode() {
    if (JSON.parse(this.storage.getItem('contactInfo', 'session'))) {
      let contactInfo = JSON.parse(this.storage.getItem('contactInfo', 'session'));
      if (contactInfo?.phone) {
        this.contactNumber.setValue(contactInfo.phone);
        this.dialCode.setValue(contactInfo.dialCode);
      }
    }
    else if (JSON.parse(this.storage.getItem('contactData', 'session'))) {
      let contactInfo = JSON.parse(this.storage.getItem('contactData', 'session'));
      if (contactInfo?.Number) {
        this.contactNumber.setValue(contactInfo.Number);
        this.dialCode.setValue(contactInfo.dialcode);
      }
    }
    if (this.storage.getItem('dialCode', 'session') && JSON.parse(this.storage.getItem('dialCode', 'session')).iso2) {
      let dialCode = JSON.parse(this.storage.getItem('dialCode', 'session'));
      for (let x in CountryCodes) {
        if (CountryCodes[x].code == dialCode.iso2.toUpperCase()) {
          this.countrydata = CountryCodes[x].code;
          this.selectedCountryCode = CountryCodes[x].code;
        }
      }
      this.dialCode.setValue(dialCode.dialCode);
    } else if (this.i18nService.userCountry) {
      this.countrydata = this.i18nService.userCountry.split('-')[1];
      this.dialCode.setValue(this.i18nService.dialCode_Info.dialCode);
      this.storage.setItem('dialCode', JSON.stringify(this.i18nService.dialCode_Info), 'session');
    } else {
      let dialCodeObj = {
        name: 'United States',
        iso2: 'us',
        dialCode: '1',
        priority: 0,
      };
      this.dialCode.setValue(dialCodeObj);
      this.storage.setItem('dialCode', JSON.stringify(dialCodeObj), 'session');
    }
  }

  telInputObject(obj: any) {
    this.countryName = obj;
    if (obj && this.countrydata) {
      obj.setCountry(this.countrydata);
    }
  }
  getNumber(q: any) {}
  hasError(q: any) {}
  onCountryChange(q: any) {
    this.storage.setItem('dialCode', JSON.stringify(q), 'session');
    this.dialCode.setValue(q.dialCode);
  }
  createForm() {
    this.travellerForm = this.fb.group({
      isWhatsappSubscriped: true,
      travellersList: this.fb.array([]),
    });
  }

  get travellersListForm(): UntypedFormArray {
    return this.travellerForm?.controls['travellersList'] as UntypedFormArray;
  }

  travellerListData() {
    if (this.storage.getItem('paxDetails', 'session')) {
      const bookInfo = JSON.parse(this.storage.getItem('paxDetails', 'session'));
      if (bookInfo.travellersList) {
        for (let i in bookInfo.travellersList) {
          let paxDob: any;
          if (bookInfo.travellersList[i].dob) {
            paxDob = this.getPsgDob(bookInfo.travellersList[i].dob);
          }
          if (
            bookInfo.travellersList[i].passportExpiry &&
            bookInfo.travellersList[i].passportExpiry !== '' &&
            !bookInfo.travellersList[i].passportExpiry.includes('/')
          ) {
            this.expiryDate = this.datePipe.transform(bookInfo.travellersList[i].passportExpiry, 'dd/MM/yyyy');
          } else {
            this.expiryDate = bookInfo.travellersList[i].passportExpiry;
          }
          this.travellersListForm.push(
            this.fb.group({
              firstName: [bookInfo.travellersList[i].firstName],
              middleName: [bookInfo.travellersList[i].middleName],
              lastName: [bookInfo.travellersList[i].lastName],
              dob: [paxDob, Validators.required],
              passportNumber: [bookInfo.travellersList[i].passportNumber, Validators.required],
              passportExpiry: [this.expiryDate, Validators.required],
              passPortCountry: [bookInfo.travellersList[i].passPortCountry, Validators.required],
              nationality: [bookInfo.travellersList[i].nationality, Validators.required],
              title: [bookInfo.travellersList[i].title],
              type: [bookInfo.travellersList[i].type],
            })
          );
        }
      }
    } else {
      this.initTravellerValues();
    }
  }
  initTravellerValues() {
    if (this.bookingInfo && this.bookingInfo.passengers.adults && this.bookingInfo.passengers.adults.length) {
      for (let a = 0; a < this.bookingInfo.passengers.adults.length; a++) {
        this.travellersListForm.push(this.newQuantity(this.bookingInfo.passengers.adults[a], 'ADULT', a));
      }
    }
    if (
      this.bookingInfo &&
      this.bookingInfo.passengers &&
      this.bookingInfo.passengers.children &&
      this.bookingInfo.passengers.children.length
    ) {
      for (let c = 0; c < this.bookingInfo.passengers.children.length; c++) {
        this.travellersListForm.push(this.newQuantity(this.bookingInfo.passengers.children[c], 'CHILD', c));
      }
    }
    if (
      this.bookingInfo &&
      this.bookingInfo.passengers &&
      this.bookingInfo.passengers.infants &&
      this.bookingInfo.passengers.infants.length
    ) {
      for (let i = 0; i < this.bookingInfo.passengers.infants.length; i++) {
        this.travellersListForm.push(this.newQuantity(this.bookingInfo.passengers.infants[i], 'INFANT', i));
      }
    }
  }

  newQuantity(travllerValue: any, travellerType: any, traveller: any) {
    return this.fb.group({
      firstName: [travllerValue.firstName],
      lastName: [travllerValue.lastName],
      dob: (() => {
        if (this.showPassportDetails()) {
          return '';
        } else {
          return travllerValue.dob;
        }
      })(),
      middleName: (() => {
        if (travllerValue.middleName) {
          return travllerValue.middleName;
        } else {
          return null;
        }
      })(),
      type: [travllerValue.type],
      passportNumber: ['', Validators.required],
      passportExpiry: ['', Validators.required],
      passPortCountry: ['', Validators.required],
      nationality: ['', Validators.required],
      title: [travllerValue.title],
    });
  }
  showPassportDetails() {
    if (
      this.bookingInfo &&
      (this.bookingInfo?.passengerSettings?.adultSettings?.requirePassport ||
        this.bookingInfo?.passengerSettings?.childSettings?.requirePassport ||
        this.bookingInfo?.passengerSettings?.infantSettings?.requirePassport)
    ) {
      return true;
    } else {
      return false;
    }
  }

  getPsgDob(paxDob: any) {
    let dob: any;
    if (typeof paxDob == 'object') {
      let psgDob = this.ngbDateParserFormatter.format(paxDob);
      dob = this.datePipe.transform(psgDob, 'dd/MM/yyyy');
    } else {
      dob = paxDob;
    }
    return dob;
  }

  viewPaymentOptions() {
    this.submitted = true;
    if (this.contactNumber.invalid) {
      this.mobileNumber?.nativeElement?.focus();
      return;
    } else {
      this.storage.removeItem('paxDetails');
      this.storage.setItem('paxDetails', JSON.stringify(this.travellerForm.value), 'session');
      const contactNumber = this.contactNumber?.value?.number ? this.contactNumber?.value?.number : this.contactNumber.value;
      let contactNumData = {
        dialcode: this.i18nService.countryDialCode ?? '1',
        countryCode: (() => {
          if (this.countrydata) {
            return this.countrydata.split('-')[1];
          }
        })(),
        Number: contactNumber,
      };
      this.storage.setItem('contactData', JSON.stringify(contactNumData), 'session');
      let paymentInfo = this.getPaymentInfo();
      this.getUserPaymentMethods(paymentInfo);
    }
  }

  getUserPaymentMethods(paymentInfo: any) {
    this.isLoading = true;
    this.bookingService.getPaymentMethods(this.getPaymentInfo()).subscribe(
      (res: any) => {
        this.isLoading = false;
        let payment_Data = res;
        if (!res.errors) {
          this.storage.setItem('paymentReqInfo', JSON.stringify(paymentInfo), 'session');
          this.storage.setItem('paymentMethods', JSON.stringify(payment_Data), 'session');
          if (this.isB2BApp()) {
            this.router.navigate(['/payments/wallet-pay'], { queryParamsHandling: 'preserve' });
          } else {
            this.router.navigate(['/payments'], { queryParamsHandling: 'preserve' });
          }
        } else {
          $('#payment_error_modal').modal('show');
          this.noCorrectInfo = false;
          this.isB2BError = true;
        }
      },
      (error) => {
        if (error.error) {
          $('#payment_error_modal').modal('show');
          $('#view_itinerary_error_modal').modal('hide');
          this.noCorrectInfo = false;
          this.isB2BError = true;
        }
      }
    );
  }

  getPaymentInfo() {
    let paymentInfo: any;
    const contactNumber = this.contactNumber.value?.number ? this.contactNumber.value?.number : this.contactNumber.value;
    paymentInfo = {
      products: this.getselectedProducts(),
      passengers: this.passengersList(),
      data: this.bookingInfo.data,
      contact: {
        email: '',
        firstName: '',
        lastName: '',
        mobileCode: (() => {
          if (this.dialCode.value?.iso2 == 'us') {
            return this.dialCode.value.dialCode;
          } else {
            return this.dialCode.value;
          }
        })(),
        mobileCodeKey: '',
        mobileNo: contactNumber,
        title: '',
        validation: { validationFields: {} },
      },
    };
    return paymentInfo;
  }

  private getselectedProducts() {
    this.selectedProducts = [];
    this.productDetails = JSON.parse(this.storage.getItem('products', 'session'));
    if (this.productDetails && this.productDetails.length > 0) {
      for (let i in this.productDetails) {
        if (this.productDetails && this.productDetails[i].id) {
          const product = {
            id: this.productDetails[i].id,
            selectedValue: this.productDetails[i].initSelected,
          };
          this.selectedProducts.push(product);
        }
      }
    }
    return this.selectedProducts;
  }

  private passengersList() {
    const adults = [];
    const children = [];
    const infants = [];
    let passengers: any;
    if (this.travellerForm.value.travellersList) {
      for (let i in this.travellerForm.value.travellersList) {
        let pax = this.getPaxInfo(this.travellerForm.value.travellersList[i]);
        if (pax.type === 'ADULT') {
          adults.push(pax);
        } else if (pax.type === 'CHILD') {
          children.push(pax);
        } else if (pax.type === 'INFANT') {
          infants.push(pax);
        }
      }
    }
    passengers = {
      infants: infants,
      adults: adults,
      children: children,
    };
    return passengers;
  }
  private getPaxInfo(passengerInfo: any) {
    this.frequentFlyerDetails = [];
    this.baggage_Data = [];
    let paxInfo: any;
    paxInfo = {
      // id:generateUUID(),
      email: '',
      firstName: passengerInfo.firstName,
      middleName: passengerInfo.middleName,
      lastName: passengerInfo.lastName,
      documentType: <any>null,
      documentNumber: <any>null,
      passportNumber: passengerInfo.passportNumber.trim(),
      passportCountry: (() => {
        for (let i in this.countriesArray) {
          if (this.countriesArray[i]['name'] == passengerInfo.passPortCountry) {
            return this.countriesArray[i]['isoCode'];
          }
        }
      })(),
      nationality: (() => {
        for (let i in this.countriesArray) {
          if (this.countriesArray[i]['name'] == passengerInfo.nationality) {
            return this.countriesArray[i]['isoCode'];
          }
        }
      })(),
      isShowPassport: (() => {
        if (passengerInfo.passportExpiry) {
          return true;
        } else {
          return false;
        }
      })(),
      dob: (() => {
        if (passengerInfo.dob && typeof passengerInfo.dob == 'object') {
          return passengerInfo.dob;
        } else if (typeof passengerInfo.dob === 'string') {
          let psgDob = passengerInfo.dob;
          const month = parseInt(psgDob.slice(3, 5));
          const day = parseInt(psgDob.slice(0, 2));
          const year = parseInt(psgDob.slice(6, 10));
          return { day: day, month: month, year: year };
        }
      })(),
      dobFormatted: (() => {
        if (passengerInfo.dob === 'string') {
          return (
            parseInt(passengerInfo.dob.slice(6, 10)) +
            '-' +
            parseInt(passengerInfo.dob.slice(3, 5)) +
            '-' +
            parseInt(passengerInfo.dob.slice(0, 2))
          );
        } else if (typeof passengerInfo.dob === 'object') {
          let formattedDob: any;
          formattedDob = this.ngbDateParserFormatter.format(passengerInfo.dob);
          let dobFormatted = this.datePipe.transform(formattedDob, 'yyyy-MM-dd');
          return dobFormatted;
        }
      })(),
      type: passengerInfo.type,
      title: passengerInfo.title,
      passportExpiryFormatted: (() => {
        if (passengerInfo.passportExpiry) {
          if (typeof passengerInfo.passportExpiry === 'string') {
            return (
              parseInt(passengerInfo.passportExpiry.slice(6, 10)) +
              '-' +
              parseInt(passengerInfo.passportExpiry.slice(3, 5)) +
              '-' +
              parseInt(passengerInfo.passportExpiry.slice(0, 2))
            );
          } else if (typeof passengerInfo.passportExpiry === 'object') {
            let expiryDate: any;
            expiryDate = formatDate(passengerInfo.passportExpiry, 'yyyy-MM-dd', 'en_US');
            return expiryDate;
          }
        } else {
          return {};
        }
      })(),
      passportExpiry: (() => {
        if (passengerInfo.passportExpiry) {
          if (typeof passengerInfo.passportExpiry === 'string') {
            const month = parseInt(passengerInfo.passportExpiry.slice(3, 5));
            const day = parseInt(passengerInfo.passportExpiry.slice(0, 2));
            const year = parseInt(passengerInfo.passportExpiry.slice(6, 10));
            return { day: day, month: month, year: year };
          } else if (typeof passengerInfo.passportExpiry === 'object') {
            let expiryDate = formatDate(passengerInfo.passportExpiry, 'dd/MM/yyyy', 'en_US');
            const month = parseInt(expiryDate.slice(3, 5));
            const day = parseInt(expiryDate.slice(0, 2));
            const year = parseInt(expiryDate.slice(6, 10));
            return { day: day, month: month, year: year };
          }
        } else {
          return {};
        }
      })(),
      specialRequests: {
        frequentFlyerDetailsList: null,
        mealSelection: null,
        seatDetails: <any>[],
      },
      baggageSelection: null, // To Do
    };
    return paxInfo;
  }
  /* To check It is B2B or not B2B */
  isB2BApp() {
    return this.iframewidgetservice.isB2BApp();
  }
  /**To update B2B url with search correlationId  */
  updateB2BParentUrl(correlationId: any) {
    if(!this.isBrowser) return;
    window.parent.postMessage({ type: 'updateCorrelationId', correlationId: correlationId }, '*');
  }
  ngOnDestroy() {
    $('#payment_error_modal').modal('hide');
    $('#view_itinerary_error_modal').modal('hide');
  }
  /**To get itinerary details for B2B payment link flow  */
  public getB2BItineraryValues(queryParamString: any) {
    this.storage.removeItem('paymentDeeplinkData');
    this.searchService.b2BPaymentLinkViewItinerary(queryParamString).subscribe(
      (data: any) => {
        if (data && !data.errors) {
          this.storage.setItem('paymentDeeplinkData', JSON.stringify(data), 'session');
          this.storage.setItem('products', JSON.stringify(data.products), 'session');
          this.getBookingInfo();
        /**we can redirect to payment page direclty once get response and products length is 0  from view-itinerary api */
          if (this.bookingInfo) {
            this.contactNumber.setValue(this.bookingInfo?.phoneNumber);
            this.dialCode.setValue(this.bookingInfo?.countryCode);
            if(this.bookingInfo?.products?.length == 0){
              this.viewPaymentOptions();
            }
          }

        } else if (
          (data.errors && data.errors[0].errorWarningAttributeGroup.shortText === 'invoice is expired') ||
          data.errors
        ) {
          this.deepLinkService.changeViewItineraryError('invoice is expired');
        }
      },
      (error) => {
        if (error) {
          this.deepLinkService.changeViewItineraryError('viewItinerayFailed');
        }
      }
    );
  }
}
