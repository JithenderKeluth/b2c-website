import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
import { SearchService } from '@app/flights/service/search.service';
import { numInputNoChars } from '@app/flights/utils/odo.utils';
import { CountryCodes } from '@app/general/utils/country-code';
import { I18nService } from '@app/i18n/i18n.service';
import { responsiveService } from '@app/_core';
import { MyAccountServiceService } from '../my-account-service.service';
import { GoogleTagManagerServiceService } from '@app/_core/tracking/services/google-tag-manager-service.service';
import { AuthenticationService } from '@app/auth/authentication.service';
import { ApiService } from '../../general/services/api/api.service';
import { SessionService } from '../../general/services/session.service';
import { SearchCountryField, CountryISO, PhoneNumberFormat } from 'ngx-intl-tel-input';
import { UniversalStorageService } from '@app/general/services/universal-storage.service';

import { GoogleAuthService } from './../../auth/google-auth.service';
import { isPlatformBrowser } from '@angular/common';

declare let $: any;
@Component({
  selector: 'app-profile-info',
  templateUrl: './profile-info.component.html',
  styleUrls: ['./profile-info.component.scss'],
})
export class ProfileInfoComponent implements OnInit {
  private isBrowser: boolean;
  public changePasswordShow = false;
  myprofileForm: UntypedFormGroup;
  public path: string[] = [];
  get form() {
    return this.myprofileForm.controls;
  }
  submitted = false;
  contrycode: any;
  credentials: any;
  contact: number;
  cityCode: any;
  phoneNo: any;
  public countryName: any;

  country: any;
  userAgent: any;
  saveLocalStorage = false;
  countrydata: any;
  profileData: any;
  isMobile: boolean = false;
  deleteAccountReason: string = null;
  deleteInput = new UntypedFormControl('', [Validators.required, Validators.pattern('DELETE')]);
  submittedDeleteAccount = false;
  deleteAccountLoading = false;
  googleLoginUserData;
  hideCurrentpassword = false;
  queryParamsSubscription: any;
  isLoading: boolean = false;

  separateDialCode = true;
  SearchCountryField = SearchCountryField;
  CountryISO = CountryISO;
  PhoneNumberFormat = PhoneNumberFormat;
  preferredCountries: CountryISO[] = [CountryISO.UnitedStates, CountryISO.UnitedKingdom];
  selectedCountryCode:string = CountryISO.UnitedStates ;
  region: string;

  constructor(
    private formbuilder: UntypedFormBuilder,
    private myacountService: MyAccountServiceService,
    private _snackBar: MatSnackBar,
    private searchService: SearchService,
    private i18nService: I18nService,
    private route: Router,
    private responsiveService: responsiveService,
    private googleTagManagerServiceService: GoogleTagManagerServiceService,
    private socialAuthService: GoogleAuthService,
    private authenticationService: AuthenticationService,
    private activatedRoute: ActivatedRoute,
    private apiService : ApiService,
    private storage: UniversalStorageService,
    private sessionService: SessionService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    if(this.isBrowser){
      this.route.events.subscribe((event: NavigationStart) => {
      let bodyElement = document.getElementsByClassName('iti__country-list');
      if (bodyElement && bodyElement[0]) {
        bodyElement[0].remove();
      }
    });
    }
    this.region = this.apiService.extractCountryFromDomain();
  }

  ngOnInit(): void {
    this.path = this.route.url.split('/');
    if (this.storage.getItem('credentials', 'local')) {
      this.credentials = JSON.parse(this.storage.getItem('credentials', 'local'));
      this.saveLocalStorage = true;
    } else if (this.storage.getItem('credentials', 'session')) {
      this.credentials = JSON.parse(this.storage.getItem('credentials', 'session'));
      this.saveLocalStorage = false;
    }
    this.initForm();
    this.searchService.langValue.subscribe((val: any) => {
      this.userAgent = this.myacountService.countrydata;
    });
   if(this.region !== 'MM') this.getUserData();
    this.onresize();
    this.googleLoginUserData = JSON.parse(this.storage.getItem('googleUserDetails', 'session'));
    this.checkIsGuestUser();
  }
  onresize() {
    this.responsiveService.getMobileStatus().subscribe((isMobile: any) => {
      if (isMobile) {
        // window.open("https://m.travelstart.com/", "_self");
        this.isMobile = true;
      } else {
        this.isMobile = false;
      }
    });
  }
  public initForm() {
    // Initialize the form first with empty/default values
    this.myprofileForm = this.formbuilder.group({
      gender: '',
      firstName: ['', [Validators.required]],
      surName: ['', [Validators.required]],
      email: [
        '',
        [Validators.pattern('[a-zA-Z0-9._+-]{1,}@[a-zA-Z0-9.-]{2,}[.]{1}[a-zA-Z]{2,}')],
      ],
      phone: ['', [Validators.required]],
      dialCode: [''],
      currentpassword: '',
      newpassword: '',
      confirmpassword: '',
    });

    // Populate form with values only if available
    if (this.credentials?.data) {
      const data = this.credentials.data;

      if (data.contactInfo?.telephoneList?.[0]) {
        const phoneInfo = data.contactInfo.telephoneList[0];
        this.contact = (phoneInfo.areaCityCode || '') + (phoneInfo.phoneNumber || '');

        for (let x in CountryCodes) {
          if (CountryCodes[x].dial_code === phoneInfo.countryAccessCode) {
            this.countrydata = CountryCodes[x].code;
            this.contrycode = CountryCodes[x].dial_code.replace('+', '');
            this.selectedCountryCode = CountryCodes[x].code;
            this.myprofileForm.get('dialCode')?.setValue(CountryCodes[x].dial_code);
          }
        }
      }

      // Patch the form with values
      this.myprofileForm.patchValue({
        firstName: data.firstName || '',
        surName: data.surname || '',
        email: data.contactInfo?.email || '',
        phone: this.contact || '',
      });
    } else {
      // Default country fallback if no data
      if (this.i18nService.userCountry) {
        this.countrydata = this.i18nService.userCountry;
        this.setCountryCode();
      }
    }
  }

  getPhoneObject(raw: string) {
    return raw
      ? {
          number: raw,
          internationalNumber: '',
          nationalNumber: '',
          e164Number: '',
          countryCode: this.selectedCountryCode,
          dialCode: '+' + this.contrycode,
        }
      : null;
  }

  ngAfterViewInit() {
    this.myprofileForm.get('confirmpassword').valueChanges.subscribe((val: any) => {
      if (val) {
        if (this.myprofileForm.get('confirmpassword').value != this.myprofileForm.get('newpassword').value) {
          this.myprofileForm
            .get('confirmpassword')
            .setValidators(Validators.pattern(this.myprofileForm.get('newpassword').value));
          this.myprofileForm.updateValueAndValidity();
        }
      }
    });
  }
  CountryCode() {
    if (this.countrydata && this.countrydata.includes('en-')) {
      if (this.countrydata && this.countrydata.split('-')[1] != 'GO') {
        return this.countrydata.split('-')[1];
      } else {
        return 'US';
      }
    } else {
      return this.countrydata;
    }
  }

  setCountryCode = () => {
    const code = this.CountryCode();
    if (code) {
      setTimeout(() => {
        this.selectedCountryCode = code;
        if (code == CountryISO.UnitedStates) {
          this.contrycode = '1';
        }
        this.myprofileForm?.get('phone')?.updateValueAndValidity();
      }, 60);
    }
  };

  onCountryChange(q: any) {
    this.contrycode = q.dialCode.replace('+', '');

    if (this.myprofileForm) {
      this.myprofileForm.get('phone')?.updateValueAndValidity();
    }

    this.selectedCountryCode = q.iso2?.toUpperCase() || q.countryCode;
  }

  getNumber(q: any) {}

  hasError(q: any) {}

  changePassword() {
    this.changePasswordShow = !this.changePasswordShow;
    if (this.changePasswordShow == true && !this.hideCurrentpassword) {
      this.form.currentpassword.setValidators(Validators.required);
    }
    if (this.changePasswordShow == true) {
      this.form.newpassword.setValidators(Validators.required);
      this.form.confirmpassword.setValidators(Validators.required);
    }
    if (this.changePasswordShow == false) {
      this.initForm();
    }
    this.myprofileForm.updateValueAndValidity();
  }
  save() {
    this.submitted = true;
    if (this.myprofileForm.invalid) {
      return;
    } else {
      if (this.myprofileForm.get('phone').value?.number) {
        let val = this.myprofileForm.get('phone').value?.number;
        this.cityCode = val.slice(0, 3);
        this.phoneNo = val.slice(3, val.length);
      } 
      this.profileData = {
        contactInfo: {
          birthDate: '',
          email: this.myprofileForm.get('email').value,
          personName: {
            nameTitle: this.myprofileForm.get('gender').value,
            givenName: this.myprofileForm.get('firstName').value,
            middleName: '',
            surname: this.myprofileForm.get('surName').value,
          },
          telephoneList: [
            {
              phoneTech: 5,
              countryAccessCode: this.contrycode,
              areaCityCode: this.cityCode,
              phoneNumber: this.phoneNo,
            },
          ],
          address: {
            streetNmbr: '',
            bldgRoom: '',
            addressLine: '',
            cityName: '',
            postalCode: '',
            countryName: '',
            countryCode: '',
          },
          dialingCode: this.contrycode,
          contactNumber: this.myprofileForm?.get('phone')?.value?.number,
        },
        userAgent: this.userAgent,
      };
      if (
        this.changePasswordShow == true &&
        ((!this.hideCurrentpassword && this.myprofileForm.get('currentpassword').value) || this.hideCurrentpassword) &&
        this.myprofileForm.get('newpassword').value &&
        this.myprofileForm.get('confirmpassword').value &&
        this.myprofileForm.get('newpassword').value === this.myprofileForm.get('confirmpassword').value
      ) {
        let changePassword = {
          newPassword: this.myprofileForm.get('newpassword').value,
          oldPassword: this.myprofileForm?.get('currentpassword')?.value
            ? this.myprofileForm.get('currentpassword').value
            : '',
          isGuestUser: this.hideCurrentpassword ? true : false,
          userAgent: this.userAgent,
        };
        this.myacountService.updatePassword(changePassword).subscribe((data: any) => {
          if (data.result === 'OK' && data.code === 200) {
            this.changePasswordShow = false;
            this.myprofileForm.get('currentpassword').reset();
            this.myprofileForm.get('newpassword').reset();
            this.myprofileForm.get('confirmpassword').reset();
            this.form.currentpassword.setValidators(null);
            this.form.newpassword.setValidators(null);
            this.form.confirmpassword.setValidators(null);
            this.myprofileForm.updateValueAndValidity();
            this.updateProfile();
          } else {
            if (data.result === 'Current password incorrect for logged on user') {
              this._snackBar.open('Current password incorrect for logged in user', '');
            } else {
              this._snackBar.open(
                'Your password should at least be 6 characters long and contain Letter, Number and Special character (e.g. !,@,#,$,%)',
              );
            }
            setTimeout(() => {
              this._snackBar.dismiss();
            }, 3000);
          }
        });
      } else {
        this.updateProfile();
      }
    }
  }
  cancel() {
    this.myprofileForm.reset();
    this.changePasswordShow = false;
    this.initForm();
    this.route.navigate(['/my-account/dashboard'], { queryParamsHandling: 'preserve' });
    // this.route.navigate([this.path[1] + '/dashboards']);
  }
  getUserData() {
    this.myacountService.getUserData(this.credentials.data.token).subscribe((res: any) => {
      if (res.data) {
        this.credentials = res;
        //store data in session storage & local storage
        this.sessionService.setStorageDataInSession(res, this.saveLocalStorage);
      }
    });
  }
  updateProfile() {
    this.isLoading = true;
    this.myacountService.updateProfile(this.profileData).subscribe((data: any) => {
      if (data.result === 'OK' && data.code === 200) {
        this.credentials = data;
        this.getUserData();
        this.isLoading = false;
        this._snackBar.open('Profile updated Successfully', '');
        setTimeout(() => {
          this._snackBar.dismiss();
        }, 3000);
        this.hideCurrentpassword = false;
        this.storage.removeItem('hideCurrentpassword');
        this.storage.setItem('hideCurrentpassword', JSON.stringify(false), 'session');
        this.queryParamsSubscription.unsubscribe();
      } else {
        this._snackBar.open(data.result, '');
        this.isLoading = false;
      }
    });
  }
  showChangePwd() {
    if (this.storage.getItem('googleUserDetails')) {
      return false;
    } else {
      return true;
    }
  }
  // allows users to type only numbers
  onlyNumberKey(event: any) {
    return numInputNoChars(event);
  }
  openDeleteAccountModal() {
    $('#delete_Account_Modal').modal('show');
  }
  selectReason(param: any) {
    this.deleteAccountReason = param;
  }
  /**To submit delete form and trigger API call */
  submitDelete() {
    this.submittedDeleteAccount = true;
    if (this.deleteAccountReason == null || this.deleteInput.invalid) {
      return;
    } else {
      this.googleTagManagerServiceService.pushDelete_UserEvent(this.deleteAccountReason);
      this.deleteMyAccount();
    }
  }
  /**To Trigger delete account API */
  deleteMyAccount() {
    this.submittedDeleteAccount = false;
    this.deleteAccountLoading = true;
    // this.myacountService.deleteAccount(this.credentials.data.token).subscribe((data: any) => {
    //   if (data.code == 200) {
    //     this.deleteSuccess('Your account is deleted successfully');
    //     this.logout();
    //   } else if (data.result) {
    //     this.deleteSuccess(data.result);
    //   }
    //   this.deleteAccountLoading = false;
    // });
  }
  /**To display toast message based on response */
  deleteSuccess(param: any) {
    $('#delete_Account_Modal').modal('hide');
    this._snackBar.open(param, '');
    this.deleteAccountReason = null;
    this.deleteInput.reset();
    setTimeout(() => {
      this._snackBar.dismiss();
    }, 5000);
  }
  ngOnDestroy() {
    $('#delete_Account_Modal').modal('hide');
  }
  /**To logout once account has been deleted successfully */
  logout() {
    this.googleTagManagerServiceService.pushLogoutEvent();
   // this.googleTagManagerService.setUserEmail();
    if (this.googleLoginUserData) {
      this.socialAuthService.signOut();
      this.searchService.updateUserCredentials(null);
      this.storage.removeItem('googleUserDetails');
      this.storage.removeItem('credentials');
      this.authenticationService.logout();
    } else {
      this.authenticationService.logout();
      this.searchService.updateUserCredentials(null);
    }
  }
  checkIsGuestUser() {
    this.queryParamsSubscription = this.activatedRoute.queryParams.subscribe((x) => {
      if (
        x?.hasOwnProperty('prompt-password') &&
        x['prompt-password'] === 'true' &&
        !this.storage.getItem('hideCurrentpassword')
      ) {
        this.hideCurrentpassword = true;
        this.changePasswordShow = !this.changePasswordShow;
        this.setPwdValidations();
      }
    });
  }
  setPwdValidations() {
    this.myprofileForm.get('newpassword').setValidators([Validators.required]);
    this.myprofileForm.get('confirmpassword').setValidators([Validators.required]);
  }

  onPaste(e: ClipboardEvent) {
    return false;
  }
}
