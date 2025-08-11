import { Component, OnInit, Input, Inject, PLATFORM_ID } from '@angular/core';
import { BookingService } from './../services/booking.service';
import { UntypedFormBuilder, UntypedFormGroup, Validators, AbstractControl } from '@angular/forms';
import { SearchService } from '@app/flights/service/search.service';
import { CountryCodes } from './../../general/utils/country-code';
import { I18nService } from '@app/i18n/i18n.service';
import { NavigationStart, Router } from '@angular/router';
import { responsiveService } from '@app/_core/services/responsive.service';
import { numInputNoChars } from '@app/flights/utils/odo.utils';
import { updateProducts } from '../utils/products.utils';
import { IframeWidgetService } from '@app/general/services/iframe-widget.service';
import { restrictEditOption } from '../../general/utils/common-utils';
import { ApiService } from '../../general/services/api/api.service';
import { SearchCountryField, CountryISO, PhoneNumberFormat } from 'ngx-intl-tel-input';
import { UniversalStorageService } from '@app/general/services/universal-storage.service';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-contact-info',
  templateUrl: './contact-info.component.html',
  styleUrls: [
    './contact-info.component.scss',
    './../../../theme/travellerInfoExtras.scss',
    './../../../theme/toggle.scss',
  ],
})
export class ContactInfoComponent implements OnInit {
  public isValidPhoneNumber = false;
  public contactForm: UntypedFormGroup;
  public products: any;
  public submitForm = false;
  public smsProduct: any = null;
  public credentials: any;
  public phoneNumber: number;
  public country: any;
  public userCountryCode: any;
  public countryName: any;
  public mobileCodeInvalid = false;
  public mobileNumLengthFailed = false;
  public isMobile = false;
  public showPhoneNumSug = false;
  currency: any;
  countrydata: any = null;
  public invalidEmail = false;
  @Input()
  set contactFormDetails(value: any) {
    if (this.contactForm) {
      this.contactForm?.get('phone')?.setValidators([Validators.required, this.phoneNumberValidator]);
      this.contactForm.get('phone').updateValueAndValidity();
    }
  }
  @Input() set pricedResult_dataInfo(value: any) {
    if (value && value.products) {
      this.currency = value.currencyCode;
      this.updateContactProducts(value.products);
    }
  }
  whatsappProduct: any = null;

  separateDialCode = true;
  SearchCountryField = SearchCountryField;
  CountryISO = CountryISO;
  PhoneNumberFormat = PhoneNumberFormat;
  preferredCountries: CountryISO[] = [CountryISO.UnitedStates, CountryISO.UnitedKingdom];
  selectedCountryCode: string = CountryISO.UnitedStates;

  constructor(
    private fb: UntypedFormBuilder,
    private bookingService: BookingService,
    private i18nService: I18nService,
    public responseService: responsiveService,
    private router: Router,
    private searchService: SearchService,
    public iframeWidgetService: IframeWidgetService,
    private apiService: ApiService,
    private storage: UniversalStorageService,
    @Inject(PLATFORM_ID) private platformId: any
  ) {
    this.country = apiService.extractCountryFromDomain();
  }

  ngOnInit(): void {
    this.invalidEmail = false;
    this.checkContactDetailsValidity();
    this.initForm();
    this.onResize();
    this.bookingService.currentProducts.subscribe((products) => {
      this.products = this.storage.getItem('products', 'session') ? JSON.parse(this.storage.getItem('products', 'session')) : products;
      this.updateContactProducts(this.products);
    });
    this.searchService.currentUserCredentials.subscribe((credentials: any) => {
      if (!this.credentials) {
        this.setCredentialsData();
      }
    });
    if ((this.iframeWidgetService.isB2BApp() || this.country === 'ABSA') && this.whatsappProduct) {
      updateProducts(this.whatsappProduct.id, false);
      this.bookingService.changeProducts(JSON.parse(this.storage.getItem('products', 'session')));
    }
  }
  setCredentialsData() {
    if (this.storage.getItem('credentials', 'session')) {
      this.credentials = JSON.parse(this.storage.getItem('credentials', 'session'));
    } else if (this.storage.getItem('credentials', 'local')) {
      this.credentials = JSON.parse(this.storage.getItem('credentials','local'));
    }
    if (this.storage.getItem('contactInfo', 'session')) {
      this.updateContactForm();
    } else if (this.credentials) {
      this.userDetails();
    } else {
      this.checkUserCredentials();
    }
  }
  initForm(): void {
    const bookInfo = JSON.parse(this.storage.getItem('bookingInfo', 'session'));
    if (bookInfo) {
      this.contactForm = this.fb.group(bookInfo.contactDetails);
      this.contactForm?.get('phone')?.setValidators([Validators.required, this.phoneNumberValidator]);
      this.contactForm
        .get('email')
        .setValidators([
          Validators.required,
          Validators.pattern('[a-zA-Z0-9.+-_]{1,}@[a-zA-Z0-9.-]{2,}[.]{1}[a-zA-Z]{2,}'),
        ]);

      // set the country
      if (bookInfo.contactDetails && bookInfo.contactDetails.dialCode) {
            this.setDialCode('dial_code',bookInfo.contactDetails.dialCode);
      }
    } else {
      this.contactForm = this.fb.group({
        email: [
          '',
          [Validators.required, Validators.pattern('[a-zA-Z0-9.+-_]{1,}@[a-zA-Z0-9.-]{2,}[.]{1}[a-zA-Z]{2,}')],
        ],
        phone: [null, [Validators.required, this.phoneNumberValidator]],
        dialCode: [null],
      });
    }
  }
  userDetails() {
    if (this.credentials?.data?.contactInfo) {
      if (
        this.credentials.data.contactInfo?.telephoneList?.length !== 0 &&
        !this.contactForm?.get('phone')?.value?.number &&
        this.credentials?.data?.contactInfo?.telephoneList[0]?.countryAccessCode
      ) {
        this.contactForm.get('dialCode').setValue(this.credentials.data.contactInfo.telephoneList[0].countryAccessCode);
        this.setDialCode('dial_code',this.credentials.data.contactInfo.telephoneList[0].countryAccessCode);
      } else {
        setTimeout(() => {
          this.countrydata = this.i18nService.userCountry;
          this.setCountryCode();
        }, 4000);
      }
      const ignoreEmail =
        this.country === 'ABSA' &&
        this.credentials.data.userID &&
        this.credentials.data.contactInfo.email
          ?.toLowerCase()
          .includes(this.credentials.data.userID.toString().toLowerCase());

      if (!ignoreEmail && !this.contactForm?.get('email')?.value) {
        this.contactForm.get('email').setValue(this.credentials.data.contactInfo.email);
      }
      if (
        !this.contactForm?.get('phone')?.value?.number &&
        this.credentials.data.contactInfo.telephoneList.length !== 0
      ) {
        this.credentials.data.contactInfo.telephoneList.filter((x: any) => {
          this.phoneNumber = (x.areaCityCode + x.phoneNumber).split(' ').join('');
        });
        this.contactForm.get('phone').setValue(this.phoneNumber);
      }
    }
  }

  onResize() {
    this.responseService.getMobileStatus().subscribe((isMobile) => {
      this.isMobile = isMobile;
    });
  }
  isValidInput(fieldName: any): boolean {
    return (
      this.contactForm.controls[fieldName].invalid &&
      (this.contactForm.controls[fieldName].dirty || this.contactForm.controls[fieldName].touched)
    );
  }
  filterEmailCharacters(event: any): void {
    const input = event.target;
    const allowedPattern = /[^a-zA-Z0-9@._-]/g; // anything not in the allowed set
    const cleaned = input.value.replace(allowedPattern, '');

    input.value = cleaned;
    this.contactForm.get('email')?.setValue(cleaned, { emitEvent: false });
  }
  saveContactDetails() {
    if (!isPlatformBrowser(this.platformId)) return;
    /**
     * focus input values if  invalid
    //  */
    if (!this.contactForm.value.phone || this.contactForm.get('phone').invalid) {
      document.getElementById('mobileNumber').focus();
      return this.contactForm.controls.phone.invalid;
    } else if (!this.contactForm.value.email || this.contactForm.get('email').invalid) {
      document.getElementById('email').focus();
      return this.contactForm.controls.email.invalid;
    }
  }
  CountryCode() {
    if (this.countrydata && this.countrydata.includes('en-')) {
      if (this.countrydata && this.countrydata.split('-')[1] != 'GO') {
        this.setDialCode('code',this.countrydata.split('-')[1])
      } else {
        this.contactForm.get('dialCode').setValue('1');
        return 'US';
      }
    } else {
      return this.countrydata;
    }
  }
  ngOnDestroy() {
    this.onResize();
    if (isPlatformBrowser(this.platformId) && this.isMobile) {
      this.router.events.subscribe((event: NavigationStart) => {
        let bodyElement = document.getElementsByClassName('iti__country-list');
        if (bodyElement && bodyElement[0]) {
          bodyElement[0].remove();
        }
      });
    }
  }

  setCountryCode() {
    const code = this.CountryCode();
    if (code) {
      setTimeout(() => {
        this.selectedCountryCode = code;
        if (code == CountryISO.UnitedStates) {
          this.contactForm.get('dialCode').setValue('1');
        }
      }, 60);
    }
  }

  onCountryChange(event: any) {
    this.contactForm.get('dialCode').setValue(event.dialCode);
    this.contactForm.get('phone').updateValueAndValidity();
  }
  getNumber(q: any) {}
  hasError(q: any) {
    this.isValidPhoneNumber = !q;
  }
  onSMSChange(param: any) {
    this.smsProduct.initSelected = !this.smsProduct.initSelected;
    updateProducts('SMS', this.smsProduct.initSelected);
    this.bookingService.changeProducts(JSON.parse(this.storage.getItem('products', 'session')));
  }
  // allows users to type only numbers
  onlyNumberKey(event: any) {
       numInputNoChars(event);
  }
  keyEvent() {
    this.invalidEmail = false;
  }

  checkContactDetailsValidity() {
    let mobileNumLengthFailedUpdated = false;
    this.bookingService.currentContactDetailsvalid.subscribe((value: any) => {
      if (isPlatformBrowser(this.platformId) && value) {
        if (!value?.invalidFields?.emailValid && value?.invalidFields?.mobileNoLengthValid === undefined) {
          this.invalidEmail = true;
          document.getElementById('email')?.focus();
          mobileNumLengthFailedUpdated = false;
        } else if (!value?.invalidFields?.mobileNoLengthValid && value?.invalidFields?.emailValid === undefined) {
          document.getElementById('mobileNumber')?.focus();
          mobileNumLengthFailedUpdated = true;
          this.invalidEmail = false;
        } else if (!value?.invalidFields?.emailValid && !value?.invalidFields?.mobileNoLengthValid) {
          mobileNumLengthFailedUpdated = true;
          this.invalidEmail = true;
          document.getElementById('email')?.focus();
          return document.getElementById('mobileNumber')?.focus();
        } else {
          this.invalidEmail = false;
          mobileNumLengthFailedUpdated = false;
        }
      }
    });
    this.bookingService.currentInvalidMobileCode.subscribe((value: boolean) => {
      if (isPlatformBrowser(this.platformId) && value) {
        this.mobileCodeInvalid = value;
        document.getElementById('mobileNumber').focus();
      }
    });
    this.mobileNumLengthFailed = mobileNumLengthFailedUpdated;
  }

  checkUserCredentials() {
    if (!this.credentials) {
      setTimeout(() => {
        if (JSON.parse(sessionStorage.getItem('dialCode'))) {
          let dialCode = JSON.parse(sessionStorage.getItem('dialCode'));
          for (let x in CountryCodes) {
            if (CountryCodes[x].dial_code == dialCode.dialCode) {
              this.countrydata = CountryCodes[x].code;
              this.selectedCountryCode = CountryCodes[x].code;
              this.selectedCountryCode = CountryCodes[x].code.toLowerCase();
            }
          }
          if (this.countrydata && this.countryName) {
            this.setCountryCode();
          }
        } else if (this.i18nService.userCountry) {
          this.countrydata = this.i18nService.userCountry;
          this.setDialCode('dial_code',this.i18nService.countryDialCode);
          this.setCountryCode();
        }
      }, 500);
    }
  }

  onWhatsappChange(event: any) {
    this.whatsappProduct.initSelected = !this.whatsappProduct.initSelected;
    updateProducts(this.whatsappProduct.id, this.whatsappProduct.initSelected);
    this.bookingService.changeProducts(JSON.parse(this.storage.getItem('products', 'session')));
  }
  /**To get whatsapp & sms products amount to diplay in respective section */
  updateContactProducts(products: any) {
    if (products.length > 0) {
      products.forEach((x: any) => {
        if (x.id == 'SMS') {
          this.smsProduct = x;
        }
        if (x.id == 'WHATSAPP') {
          this.whatsappProduct = x;
        }
      });
    }
  }
  /**To update contact-form with session contactInfo data  */
  updateContactForm() {
    if (this.storage.getItem('contactInfo', 'session')) {
      const contact = JSON.parse(this.storage.getItem('contactInfo', 'session'));
      for (let x in CountryCodes) {
        if (CountryCodes[x].dial_code == contact?.dialCode) {
          this.countrydata = CountryCodes[x].code;
        }else if(contact?.phone?.countryCode){
            this.countrydata = contact?.phone?.countryCode;
        }
      }
      this.setCountryCode();
      const ignoreEmail =
        this.country === 'ABSA' &&
        this.credentials?.data?.userID &&
        this.credentials?.data?.contactInfo?.email &&
        this.credentials.data.contactInfo.email
          .toLowerCase()
          .includes(this.credentials.data.userID.toString().toLowerCase());

      if (!ignoreEmail && contact.email) {
        this.contactForm.get('email').setValue(contact.email);
      }
      this.contactForm.get('dialCode').setValue(contact?.dialCode ?? contact.phone.dialCode.split('+')[1]);
      this.contactForm.get('phone').setValue(contact.phone.number.split(' ').join(''));
    }
  }

  /**To check allow  user to edit input fields or not based on country and input value  */
  restrictInputEditOption(inputValue: any) {
    return restrictEditOption(this.apiService.extractCountryFromDomain(), inputValue);
  }

  onPaste(e: ClipboardEvent) {
    return false;
  }
  /**Custome validator for phone number */
  phoneNumberValidator(control: AbstractControl) {
    const phoneValue = control.value;

    if (!phoneValue || typeof phoneValue !== 'object') {
      return { invalidPhone: true };
    }

    if (!phoneValue.number || phoneValue.number.length < 6) {
      return { minlengthError: true };
    }

    if (!phoneValue.number || phoneValue.number.length > 15) {
      return { maxlengthError: true };
    }

    return null; // valid
  }
  setDialCode(keyName:any, dialCode:any){
            for (let x in CountryCodes) {
          if (CountryCodes[x][keyName] == dialCode) {
            // OEM this.countrydata = CountryCodes[x].code;
            this.selectedCountryCode = CountryCodes[x].code;
            this.contactForm.get('dialCode').setValue(CountryCodes[x].dial_code);
          }
        }
  }
}
