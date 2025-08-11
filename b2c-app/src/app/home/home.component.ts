import { Component, ElementRef, OnDestroy, OnInit, ViewChild, Inject, PLATFORM_ID } from '@angular/core';
import { UntypedFormControl, Validators } from '@angular/forms';
import { NavigationStart, Router } from '@angular/router';
import { SearchService } from '@app/flights/service/search.service';
import { CredentialsService } from './../auth/credentials.service';
import { GoogleTagManagerServiceService } from './../_core/tracking/services/google-tag-manager-service.service';
import { responsiveService } from './../_core/services/responsive.service';
import { AuthenticationService } from '@app/auth';
import { HeaderComponent } from '@app/_shared/components/header/header.component';
import { IframeWidgetService } from '@app/general/services/iframe-widget.service';
import { NavigationService } from '@app/general/services/navigation.service';
import { SessionStorageService } from 'ngx-webstorage';
import { ApiService } from '@app/general/services/api/api.service';
import { BookingCountdownService } from '@app/general/utils/bookingFlowCountdown';
import { I18nService } from './../i18n/i18n.service';
import { Subscription } from 'rxjs';
import { clearAllSessionStorageData } from '@app/general/utils/storage.utils';
import { UniversalStorageService } from '@app/general/services/universal-storage.service';
import { isPlatformBrowser } from '@angular/common';
declare const $: any;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy {
  public credentials: any;
  public showMyBookingsBtn = false;
  public email = new UntypedFormControl('', [
    Validators.required,
    Validators.pattern('^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:.[a-zA-Z0-9-]+)*$'),
  ]);
  public name = new UntypedFormControl('');
  public submitEmail = false;
  public path: string[] = [];
  public cookie: any;
  public validEmail = false;
  public userName: any;
  public showCookieBanner = true;
  @ViewChild('subscribeEmail') subscribeEmail: ElementRef;
  @ViewChild('header') header: HeaderComponent;
  enableForceRedirection = false;
  public region: string;
  isBrowser: boolean;

  private subscriptions: Subscription = new Subscription();
  aI_TravelAgent_Data :any =null;

  constructor(
    public responsiveService: responsiveService,
    public credentialsService: CredentialsService,
    private googleTagManagerServiceService: GoogleTagManagerServiceService,
    private router: Router,
    private searchService: SearchService,
    private authService: AuthenticationService,
    public iframeWidgetService: IframeWidgetService,
    public apiService: ApiService,
    public navService: NavigationService,
    private sessionStorageService: SessionStorageService,
    private i18nService: I18nService,
    private bookingCountdownService: BookingCountdownService,
    private storage: UniversalStorageService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.subscriptions.add(
      this.router.events.subscribe((event: any) => {
        if (event instanceof NavigationStart && event.navigationTrigger === 'popstate') {
          if (this.isBrowser && window.location.href === '') {
            this.router.navigate(['']);
          }
        }
      })
    );
  }

  ngOnInit(): void {
    this.googleTagManagerServiceService.pushPageLoadEvent('/', 'Search and Book Cheap Flights | Travelstart');
    this.googleTagManagerServiceService.pushHomeEvent();
    if(this.isBrowser){
      window.history.pushState(null, null, window.location.href);
    }
    /** NOTE : we can enable if we are facing any issue when back to home page  we caan enable it 
     *     window.onpopstate = () => {
      if (location.pathname === '/' || location.pathname === '') {
        window.history.go(0);
      }
    };
    */

    // For testing proxy server setup and end-points
    // this.authService.bookFlight({name: 'B2C Book api test', description: 'testing SSR and proxy endpoint route testing'}).subscribe((data)=>{
    //   console.log('SSr api route testing', data);
    // });

    this.storage.removeItem('isDeepLink');
    if (this.isBrowser && location.pathname === '/home') {
      this.router.navigate(['']);
    }

    this.subscriptions.add(
      this.authService.currentResetPassword.subscribe((data: any) => {
        if (this.isBrowser && data) {
          $('#resetPassword_Modal').modal('show');
        }
      })
    );

    this.loadCredentials();

    this.initializeCookieBanner();
    if(this.apiService.extractCountryFromDomain() !== 'MM'){
      this.bookingCountdownService.stopBookingFlowCountdown();
    }
    setTimeout(() => {
      this.enableForceRedirection = this.i18nService.setIpBased_ForcedRedirection();
      this.subscriptions.add(
        this.searchService.currentUserCredentials.subscribe((userCredentials: any) => {
          this.userName = userCredentials?.data?.firstName || null;
        })
      );
    }, 1000);

    this.clearSessionStorage();
    if (this.iframeWidgetService.isB2BApp()) {
      this.storage.removeItem('queryStringParams');
      this.getB2BUserData();
    }
    this.region = this.apiService.extractCountryFromDomain();
  }

  ngOnDestroy() {
    if(this.isBrowser){
      $('#resetPassword_Modal').modal('hide');
    }
    this.subscriptions.unsubscribe();
  }


  private loadCredentials() {
    const sessionCredentials = this.storage.getItem('credentials', 'session');
    const localCredentials = this.storage.getItem('credentials', 'local');

    if (sessionCredentials) {
      this.credentials = JSON.parse(sessionCredentials);
    } else if (localCredentials) {
      this.credentials = JSON.parse(localCredentials);
    }

    if (this.credentials) {
      this.userName = this.credentials?.data?.firstName;
      this.showMyBookingsBtn = true;
    }
  }

  private initializeCookieBanner() {
    const localCookies = this.storage.getItem('cookies', 'local');
    if (localCookies) {
      this.cookie = JSON.parse(localCookies);
      this.showCookieBanner = this.cookie !== 'Yes';
    } else {
      this.showCookieBanner = true;
    }
  }

  private clearSessionStorage() {
    clearAllSessionStorageData();
    if(this.isBrowser){
      this.sessionStorageService.clear('seatInfo');
    }
    this.storage.removeItem('voucherAmount');
  }

  viewFindBookings() {
    this.storage.removeItem('deepLinkRequest');
    this.storage.removeItem('correlationId');
    this.storage.removeItem('priceData');
    this.router.navigate(['/my-account/dashboard']);
  }

  subscribe() {
    this.submitEmail = true;
    if (this.email.valid) {
      this.validEmail = true;
      const data = {
        email: this.email.value,
        name: this.name.value,
        subscribeSignupType: 'TS',
        campaignType: 'Travelstart',
      };
      this.googleTagManagerServiceService.pushNewsletterSubscribeData(data);
      this.submitEmail = false;
      setTimeout(() => {
        this.validEmail = false;
        this.email.reset();
        this.name.reset();
      }, 5000);
    } else if (!this.email.value) {
      this.subscribeEmail.nativeElement.focus();
    }
  }

  cookieConfirmation(param: string) {
    if (param === 'Yes') {
      this.storage.setItem('cookies', JSON.stringify('Yes'), 'local');
    }
    this.showCookieBanner = false;
  }

  closePwdmodel(event: boolean) {
    this.authService.changeshowResetPassword(false);
    if(this.isBrowser){
      $('#resetPassword_Modal').modal('hide');
    }
    if (event) {
      this.router.navigate(['']);
      setTimeout(() => {
        this.header.loginSignupClick();
      }, 1000);
    } else {
      this.router.navigate(['']);
    }
  }

  closeRedirectOverlayPopup() {
    this.enableForceRedirection = false;
  }

  enableForceRedirect() {
    if(!this.isBrowser) return;
    const environment = this.apiService.getEnvironment();
    if (environment === 'preprod') {
      window.location.href = 'https://preprod.travelstart.co.za';
    } else if (environment === 'live') {
      window.location.href = 'https://www.travelstart.co.za';
    }
  }
  getB2BUserData() {
    this.searchService.getB2BUserData().subscribe((user: any) => {
      if (user.success) {
        this.storage.setItem('b2bUser', JSON.stringify(user.data), 'session');
        this.i18nService.loadContentJSON(user?.data?.organization_id?.split('_')[1]);
        if(this.isBrowser){
          window.parent.postMessage({ type: 'B2BIframeloaded' }, '*');
        }
      }
    });
  }

  upgradeTsPlus() {
    const routeUrl = this.router.createUrlTree(['/ts-plus/ts-plus-benefits'], { 
      queryParams: {
        utm_source: 'hp',
        utm_medium: 'banner',
        utm_campaign: 'ts-plus',
        utm_content: 'tsplus-hp'
      }, 
      queryParamsHandling: 'merge'  
    });
  
    if(this.isBrowser){
      const fullUrl = `${window.location.origin}${this.router.serializeUrl(routeUrl)}`;
      window.open(fullUrl, '_blank');
    }
  }
}
