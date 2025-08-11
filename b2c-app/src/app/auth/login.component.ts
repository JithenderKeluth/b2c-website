import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  ChangeDetectorRef,
  Output,
  EventEmitter,
  Input,
  SimpleChange,
  ViewChildren,
  QueryList,
  Injectable, Inject, PLATFORM_ID
} from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators, UntypedFormControl } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { Logger, untilDestroyed } from './../_core';
import { AuthenticationService } from './authentication.service';
import { GoogleTagManagerServiceService } from './../_core/tracking/services/google-tag-manager-service.service';
import { I18nService } from '@app/i18n';
import { SearchService } from '@app/flights/service/search.service';
import { CredentialsService } from '@app/auth/credentials.service';
import { ActivatedRoute, Router } from '@angular/router';
import { verifyUserOTP, getOTPReqData } from './../general/utils/otp-login-utils';

import { MyAccountServiceService } from '@app/my-account/my-account-service.service';
import { numInputNoChars } from '@app/flights/utils/odo.utils';
import { SessionService } from '../general/services/session.service';
import { UniversalStorageService } from '@app/general/services/universal-storage.service';
import { isPlatformBrowser } from '@angular/common';
import { GoogleAuthService } from './google-auth.service';
import { MessagingService } from '../general/services/messaging/messaging.service';
import { IterableService } from '../_core/tracking/services/iterable.service';
import { ApiService } from '../general/services/api/api.service';

declare const $: any;
declare var google: any;
const log = new Logger('Login');

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit, OnDestroy {
  //version: string | null = environment.version;
  error: string | undefined;
  loginForm!: UntypedFormGroup;
  signUpForm: UntypedFormGroup;
  isLoading = false;
  socialUser: any;
  submitSignUp = false;
  submitLogin = false;
  @ViewChild('email') email: ElementRef;
  @ViewChild('password') password: ElementRef;
  @ViewChild('forgotEmail') forgottenEmail: ElementRef;
  @ViewChild('firstName') firstName: ElementRef;
  @ViewChild('surName') surName: ElementRef;
  @ViewChild('signUpPassword') signUpPwd: ElementRef;
  @ViewChild('signUpEmail') signUpEmail: ElementRef;
  @Output() showLoader = new EventEmitter<boolean>();
  @Output() ts_user = new EventEmitter<boolean>();
  @Output() prompt_navigation = new EventEmitter<boolean>();
  signupResponse: string = '';

  pwdNotMatch: string;
  forgotPassword = false;
  pwdSent = false;

  showEyeIcon = true;
  forgotEmail = new UntypedFormControl('', [
    Validators.required,
    Validators.pattern("^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\\.[a-zA-Z0-9-]+)*$")
  ]);
  submitForgotEmail = false;
  showLogin = true;
  slideName = 'Book Flights';
  slide = false;
  showSpinner = false;
  tabVal: string = 'login';
  errorMsg: any;
  @Input() travelstartPlus = false;
  isTsPlus: boolean;
  isMastercardCountry = false;
  @Output() closeSignup: EventEmitter<boolean> = new EventEmitter();
  btnDisable = false;
  private timer: any;
  public otpData: any;
  public isPwdLogin = false;
  otp: string[] = new Array(6).fill('');
  displayTimer: any;
  isResendDisabled = false;
  successMsg: any;
  showEmailOTP = true;
  @ViewChildren('otp0, otp1, otp2, otp3, otp4, otp5') otpInputs!: QueryList<ElementRef>;
  loadOTP = false;

  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    private readonly cdRef: ChangeDetectorRef,
    private readonly authenticationService: AuthenticationService,
    private readonly googleTagManagerServiceService: GoogleTagManagerServiceService,
    private readonly i18Service: I18nService,
    private readonly searchService: SearchService,
    public readonly credentialsService: CredentialsService,
    public readonly router: Router,
    private readonly activeRoute: ActivatedRoute,
    private readonly myaccount: MyAccountServiceService,
    private sessionService: SessionService,
    private storage: UniversalStorageService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private googleAuth: GoogleAuthService,
    private messagingService: MessagingService,
    private iterableService: IterableService,
    private apiService: ApiService
  ) {
    this.createForm();
    this.initSignUpForm();
    this.showLogin = true;
  }

  ngOnInit() {
    this.otpData = null;
    this.btnDisable = false;
    this.signUpForm.reset();
    this.timer = setInterval(() => {
      this.animateData();
    }, 3500);
    this.forgotPassword = false;
    
    const hostname = window.location.hostname;
    this.isMastercardCountry = hostname.includes('mastercard.travelstart.co.za');
    
    this.authenticationService.currentCloseForgotPwd.subscribe((value: any) => {
      if (value) {
        this.forgotPassword = false;
        this.showLogin = true;
      }
    });
    this.selectTab('login');
    this.checkingModalOutsideClick();
  }

  ngOnChanges(changes: { [property: string]: SimpleChange }) {
    let change: SimpleChange = changes['travelstartPlus'];
    this.isTsPlus = change?.currentValue;
  }

  ngOnDestroy() {
    clearInterval(this.timer);
  }

  login(req?: any) {
    let loginReq: any;
    if (!req) {
      if (this.loginForm.status == 'VALID') {
        loginReq = this.loginForm.value;
      }
    } else {
      loginReq = req;
    }
    const login$ = this.authenticationService.login(loginReq);
    login$
      .pipe(
        finalize(() => {
          this.loginForm.markAsPristine();
          this.isLoading = false;
        }),
        untilDestroyed(this)
      )
      .subscribe(
        (credentials: any) => {
          if (!credentials.data) {
            this.errorMsg = credentials['result'];
            if (credentials['code'] == '1610') {
              this.triggerActEmail(loginReq?.username);
              this.errorMsg = 'The Account is in a Pending status. Please check your email for activation link';
            }
          } else {
            this.authenticationService.isLoggedInSubject.next(true);
                if (!credentials?.data?.isTSPlusSubscriptionActive) { 
                                this.prompt_navigation.emit(true);
                            }
            
            this.errorMsg = '';
             const userInfo = credentials?.data;
            var email = userInfo?.contactInfo?.email;
            this.googleTagManagerServiceService.setUserEmail(email);
             this.googleTagManagerServiceService.pushSignupData(credentials.data);
            setTimeout(() => {
                  this.googleTagManagerServiceService.pushLoginData(credentials?.data);
                  this.registerBrowserToken();
              },1000); 
          
            $('#loginModal').modal('hide');
            this.navigateToMyAccount();
            this.sessionService.updateSessionData('credentials', credentials);
            this.searchService.updateUserCredentials(credentials);
            this.sessionService.userLoginSession('userLoggedIn');
          }
        },
        (error) => {
          log.debug(`Login error: ${error}`);
          this.error = error;
        }
      );
  }

  // trigger email to the user when account is in pending state.
  triggerActEmail(username: string) {
    this.authenticationService.activationEmail(username).subscribe((res: any) => { 
    });
  }

  handleCredentialResponse(response: any) {
    if (response?.response?.access_token) {
      this.login({ provider: 'GOOGLEPL', socialToken: response?.response?.access_token });
      this.storage.setItem('googleUserDetails', JSON.stringify(response), 'session');
    }
  }

  closeForgotPwd() {
    this.forgotPassword = false;
  }

  async signInWithGoogle() {
    try {
      const user = await this.googleAuth.signIn();
      this.handleCredentialResponse(user);

    } catch (err) {
      console.error('Google login failed:', err);
    }
  }


  logOut(): void {
    this.googleAuth.signOut();
  }

  getForgotPasswordLink() {
    this.forgotPassword = true;
    this.pwdSent = false;
    this.showLogin = false;
    this.forgotEmail.reset();
    this.submitForgotEmail = false;
  }
  backToSignIn(param: string) {
    this.otpData = null;
    this.showEmailOTP = true;
    this.isPwdLogin = false;
    this.errorMsg = '';
    if (param === 'closeModal') {
      $('#loginModal').modal('hide');
      this.forgotPassword = false;
      this.showLogin = true;
    }
    if (param === 'returnSignIn') {
      this.forgotPassword = false;
      this.showLogin = true;
    }
  }

  sendResetLink(param: string) {
    if (param === 'click-here') {
      this.forgotPassword = false;
      this.showSpinner = true;
      this.showLoader.emit(true);
      setTimeout(() => {
        this.showSpinner = false;
        this.showLoader.emit(false);
        this.forgotPassword = true;
        this.pwdSent = true;
      }, 2500);
    }
    this.submitForgotEmail = true;
    if (this.forgotEmail.valid) {
      this.authenticationService.getForgotPassword(this.forgotEmail.value).subscribe((data: any) => {
        if (data['code'] === 200) {
          this.errorMsg = '';
          this.pwdSent = true;
          return;
        } else if (data['code'] === 1602) {
          this.errorMsg = 'Please check your e-mail address and try again.';
          this.submitForgotEmail = false;
        }
      });
      this.btnDisable = false;
    } else {
      return;
    }
  }

  private createForm() {
    this.loginForm = this.formBuilder.group({
      username: [
        '',
        [
          Validators.required,
          Validators.pattern("^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\\.[a-zA-Z0-9-]+)*$")
        ],
      ],
      password: ['', [Validators.required]],
      remember: true,
    });
  }

  private initSignUpForm() {
    this.signUpForm = this.formBuilder.group({
      firstName: ['', [Validators.pattern("^[a-zA-Z]+[-'s]?[a-zA-Z ]+$"), Validators.required]],
      surName: ['', [Validators.pattern("^[a-zA-Z]+[-'s]?[a-zA-Z ]+$"), Validators.required]],
      email: ['', [Validators.required, Validators.pattern('[a-zA-Z0-9._+-]{1,}@[a-zA-Z0-9.-]{2,}[.]{1}[a-zA-Z]{2,}')]],
      password: ['', Validators.required],
      specialOffers: [false],
    });
  }

  loginSubmit() {
    this.submitLogin = true;
    if (this.loginForm.invalid) {
      this.isLoading = false;
      if (this.loginForm.get('username').invalid) {
        this.email.nativeElement.focus();
      }
      if (this.loginForm.get('username').valid && this.loginForm.get('password').invalid) {
        this.password.nativeElement.focus();
      }
      return;
    } else {
      this.isLoading = true;
      this.login();
      this.errorMsg = '';
    }
  }
  /**Submitting the sign up form */
  signUpSubmit() {
    this.successMsg = '';
    this.submitSignUp = true;
    this.btnDisable = false;
    if (this.signUpForm.valid) {
      this.btnDisable = true;
      this.sendSpecialOffers();
      this.authenticationService.signUp(this.signUpForm.value).subscribe(
        (data) => {
          this.submitSignUp = false;
          this.signupResponse = '';
          if (data?.data) {
            this.authenticationService.isLoggedInSubject.next(true);
            const value = this.signUpForm.value.email;
            this.iterableService.generateJWT1(value);
            setTimeout(() => {
                  this.registerBrowserToken();
                   this.googleTagManagerServiceService.pushSignupData(data.data);
                },1000); 
          }
          if (data.code === 1616) {
            this.pwdNotMatch = data.result;
            this.signupResponse = '';
          } else if (data.code === 1009) {
            this.signupResponse = data.result;
            this.pwdNotMatch = '';
          } else if (data.code === 500) {
            this.signupResponse = 'An error occurred during Sign up';
          }
          this.btnDisable = false;
          if (data.code === 200) {
            if (data.data.status === 'PENDING') {
              this.loginForm?.get('username').setValue(this.signUpForm.value.email);
              this.isPwdLogin = false;
              this.signupResponse = '';
              this.successMsg = 'User registered succeesfully';
              this.getOTP();
            }
            setTimeout(() => {
              this.successMsg = '';
              this.showEmailOTP = false;
            }, 2000);
            this.submitSignUp = false;
            this.btnDisable = false;
            this.signUpForm.reset();
          }
        },
        (error) => {
          this.signupResponse = 'An error occurred during Sign up';
          this.btnDisable = false;
        }
      );
    }
    if (this.signUpForm.invalid) {
      this.focusOnFirstInvalidField();
    }
  }
  showPwd() {
    this.showEyeIcon = !this.showEyeIcon;
  }
  //  get name(){

  //     setTimeout(() => {
  //      this.animateData();

  //    }, 3000);
  //    return this.slideName
  //  }
  animateData() {
    this.slide = false;
    if (this.slideName === 'Book Flights') {
      this.slideName = 'Find Stays';
      this.slide = true;
    } else if (this.slideName === 'Rent Cars' && this.i18Service.language.split('-')[1] == 'ZA') {
      this.slideName = 'Book Buses';
      this.slide = true;
    } else if (this.slideName === 'Rent Cars' && this.i18Service.language.split('-')[1] !== 'ZA') {
      this.slideName = 'Book Flights';
      this.slide = true;
    } else if (this.slideName === 'Find Stays') {
      this.slideName = 'Rent Cars';
      this.slide = true;
    } else if (this.slideName === 'Book Buses') {
      this.slideName = 'Book Flights';
      this.slide = true;
    }
  }
  selectTab(param: any) {
    this.tabVal = param;
    this.submitSignUp = false;
    this.errorMsg = '';
    this.searchService.changeloginModalOutSideClick(false);
  }

  focusOnFirstInvalidField(): any {
    const controlNames = ['firstName', 'surName', 'email', 'password'];
    for (const controlName of controlNames) {
      const control = this.signUpForm.get(controlName);
      if (control?.invalid) {
        const element = this[`${controlName}Input`]?.nativeElement;
        element?.focus();
        return;
      }
    }
  }
  navigateToMyAccount() {
    if (isPlatformBrowser(this.platformId) && window.location.href.includes('my-account')) {
      this.router.navigate([this.activeRoute.snapshot.queryParams.redirect || '/my-account/dashboard']);
    }
  }

  /**sending the OTP to the user entered email */
  getOTP() {
    if (this.isResendDisabled) {
      return;
    }
    this.isResendDisabled = true;
    this.loadOTP = true;
    this.submitLogin = true;
    this.errorMsg = '';
    this.otpInputs.forEach((input) => {
      input.nativeElement.value = '';
    });
    setTimeout(() => {
      const otpArray = this.otpInputs.toArray();
      if (otpArray.length > 0) {
        otpArray[0].nativeElement.focus();
      }
    }, 0);

    if (this.loginForm?.get('username')?.valid) {
      const userEmail = this.loginForm?.get('username')?.value;
      const otpData = getOTPReqData(userEmail);
      this.authenticationService.getOTPToLogin(otpData).subscribe(
        (data: any) => {
          this.otpData = data;
          this.loadOTP = false;
          this.showEmailOTP = false;
          if (data?.code === 200) {
            this.isPwdLogin = false;
            this.successMsg = 'OTP has been sent to email';
            this.displayTimer = '00:00';
            this.otpTimer();
          }
          setTimeout(() => {
            this.successMsg = '';
          }, 2000);
        },
        (error) => {
          if (error) {
            if (error?.error?.code == 404) {
              this.errorMsg = '';
              this.errorMsg = 'User not found for this email!';
              this.loadOTP = false;
              this.isResendDisabled = false;
            } else {
              this.serverErrors();
            }
          }
        }
      );
    }
  }
  /**allowing the user to login with password */
  loginPWDOTP() {
    this.isPwdLogin = !this.isPwdLogin;
    this.errorMsg = '';
  }

  /**Validating the user OTP */
  validatingOTP() {
    this.errorMsg = '';
    const otpString = this.otpInputs.map((input: ElementRef) => input.nativeElement.value).join('');
    const otpToValidate = verifyUserOTP(this.otpData, this.loginForm?.get('username')?.value, otpString);
    if (otpString.length === 6) {
      this.loadOTP = false;
      this.authenticationService.validateOTP(otpToValidate).subscribe(
        (data: any) => {
          if (data?.code === 200) {
            this.authenticationService.isLoggedInSubject.next(true);
            this.myaccount.getUserDataOTPFlow(data.data.token, true).subscribe((data: any) => {
              this.otpData = null;
              this.storage.setItem('credentials', JSON.stringify(data), 'session');
              this.sessionService.updateSessionData('credentials', data);
              if (!data?.data?.isTSPlusSubscriptionActive) { 
                   this.prompt_navigation.emit(true);
                    }
                const email  = data?.data.contactInfo?.email; 
                 this.googleTagManagerServiceService.setUserEmail(email);
                 setTimeout(() => {
                  this.registerBrowserToken();
                  this.googleTagManagerServiceService.pushLoginData(data?.data);
                },1000); 
                
            });
            setTimeout(() => {
              this.credentialsService._credentials = JSON.parse(this.storage.getItem('credentials', 'session'));
              this.successMsg = '';
              this.isResendDisabled = false;
              this.loadOTP = false;
              this.closeSignup.emit(true);
            }, 1500);
          } else if (data?.code === 1550) {
            this.errorMsg = '';
            this.errorMsg = data.result;
            this.authenticationService.isLoggedInSubject.next(false);
          }
        },
        (error) => {
          if (error) {
            this.serverErrors();
          }
        }
      );
    }
  }

  showGetOTP() {
    this.errorMsg = '';
    this.isResendDisabled = false;
    this.otpData = null;
    this.loadOTP = false;
    this.showEmailOTP = true;
    this.tabVal = 'login';
    this.otp = ['', '', '', '', '', ''];
    clearInterval(this.timer);
  }

  /**Displaying the timer in the bottom of OTP inputs */
  otpTimer() {
    if (this.timer) {
      clearInterval(this.timer);
    }
    let seconds: number = 91;
    this.timer = setInterval(() => {
      seconds--;
      const sec = seconds.toString().padStart(2, '0');
      this.displayTimer = `00:${sec}`;
      if (seconds <= 0) {
        clearInterval(this.timer);
        this.isResendDisabled = false;
        this.displayTimer = null;
      }
    }, 1000);
  }
  keyEvent() {
    this.loadOTP = false;
    this.searchService.changeloginModalOutSideClick(false);
  }
  onlyNumberKey(event: any) {
    return numInputNoChars(event);
  }
  /**Sending the specails offers upon selecting it in the sign up form */
  sendSpecialOffers() {
    if (this.signUpForm.get('specialOffers').value) {
      const data = {
        email: this.signUpForm.get('email').value,
        subscribeSignupType: 'TS',
        campaignType: 'Travelstart',
      };
      this.googleTagManagerServiceService.pushNewsletterSubscribeData(data);
    }
  }
  /**Focusing in to the sequential input when the current input is filled*/
  onInput(event: any, index: number): void {
    const value = event.target.value;
    if (value) {
      this.otp[index] = value;
      if (index < 5) {
        this.otpInputs.toArray()[index + 1].nativeElement.focus();
      }
    }
  }

  /**Clearing the OTP inputs while pressing the back space */
  onKeydown(event: KeyboardEvent, index: number): void {
    if (event.key === 'Backspace') {
      this.otp = ['', '', '', '', '', ''];
      this.errorMsg = '';
      const otpArray = this.otpInputs.toArray();
      const currentInput = otpArray[index].nativeElement;
      if (currentInput.value === '') {
        if (index > 0) {
          const previousInput = otpArray[index - 1].nativeElement;
          previousInput.value = '';
          previousInput.focus();
        }
      } else {
        currentInput.value = '';
        this.otp[index] = '';
      }
    }
  }
  /**Resetting the OTP tab on the outSide click of login modal */
  checkingModalOutsideClick() {
    this.searchService.currentloginModalOutSideClick.subscribe((value: boolean) => {
      if (value) {
        this.showEmailOTP = true;
        this.errorMsg = '';
        this.isResendDisabled = false;
        this.loadOTP = false;
        this.tabVal = 'login';
      }
    });
  }

  /**Handling server errors for OTP */
  serverErrors() {
    this.errorMsg = '';
    this.errorMsg = 'There was an error with our server. Please try again later.';
    this.isResendDisabled = false;
    this.loadOTP = false;
  }
  registerBrowserToken() {
    this.messagingService.requestPermissionAndGetToken().then((token) => {
      if (token) { 
        this.iterableService.registerBrowserTokenData(token)?.subscribe((res: any) => {
        });
      }
    });
      this.messagingService.listenForMessages();
  }
}
