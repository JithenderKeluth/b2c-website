import { Component, EventEmitter, HostListener, OnInit, Output, Inject, PLATFORM_ID } from '@angular/core';
import { Router, NavigationStart, ActivatedRoute } from '@angular/router';
import { AuthenticationService, CredentialsService } from '@app/auth';
import { MyAccountServiceService } from './../../../my-account/my-account-service.service';
import { GoogleTagManagerServiceService } from './../../../_core/tracking/services/google-tag-manager-service.service';
import { SearchService } from '@app/flights/service/search.service';
import { responsiveService } from './../../../_core/services/responsive.service';
import { DeepLinkService } from '@app/general/deeplinks/deep-link.service';
import { IframeWidgetService } from '@app/general/services/iframe-widget.service';
import { ApiService } from '@app/general/services/api/api.service';
import { SessionStorageService } from 'ngx-webstorage';
import { SessionUtils } from '@app/general/utils/session-utils';
import { checkMyAccountParams, hasMyAccountParamsInfo } from '@app/general/deeplinks/deep-link.utils';
import { QueryStringAffid } from '@app/general/utils/querystringAffid-utils';
import { checkAirlineParam } from '@app/flights/utils/search-results-itinerary.utils';
import { MeiliIntegrationService } from '@app/general/services/meili-integration.service';
import { Location } from '@angular/common';
import { SessionService } from '../../../general/services/session.service';
import { UniversalStorageService } from '@app/general/services/universal-storage.service';
import { isPlatformBrowser } from '@angular/common';
import { GoogleAuthService } from '@app/auth/google-auth.service';
declare let $: any;

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  googleLoginUserData;
  saveLocalStorage = false;
  public showBusesHead = false;
  showLoader = false;
  public countryValue: any;
  enteredButton = false;
  isMatMenuOpen = false;
  queryStringKeys: any;
  clickedOutSide = false;
  isValidCarWidgetPage : boolean = false; 
  activeButton: string = '';
  @Output() tabSelectionEvents = new EventEmitter<string>();
  private isBrowser: boolean;

  constructor(
    public responsiveService: responsiveService,
    private router: Router,
    private deepLinkService: DeepLinkService,
    private searchService: SearchService,
    private googleAuthService : GoogleAuthService,
    private authenticationService: AuthenticationService,
    public credentialsService: CredentialsService,
    private myAccountServiceService: MyAccountServiceService,
    private googleTagManagerServiceService: GoogleTagManagerServiceService,
    public apiService: ApiService,
    public iframeWidgetService: IframeWidgetService,
    private sessionStorageService: SessionStorageService,
    private activatedRoute: ActivatedRoute,
    public queryStringAff: QueryStringAffid,
    private location: Location,
    private meiliService: MeiliIntegrationService,
    private sessionService :SessionService,
    private storage: UniversalStorageService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    router.events.subscribe((event: NavigationStart) => {
      if (event.navigationTrigger === 'popstate') {
        // Perform actions
        $('#loginModal').modal('hide');
      }
    });
    this.activatedRoute.queryParams.subscribe((params: any) => {
      this.queryStringKeys = Object.assign(params);
    });
    this.showBusesHead = !Object.values(this.queryStringKeys).includes('affiliate');
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    this.countryValue = this.apiService.extractCountryFromDomain();
    this.openLoginModal();
    this.activeTabsByPathName();
  }

  hideLoader() {
    if (!this.isBrowser) return;
    const queryParameterString = window.location.href;
    if (this.queryStringKeys?.airline) {
      this.queryStringKeys = checkAirlineParam();
    }
    hasMyAccountParamsInfo(queryParameterString)
      ? this.router.navigate([''], { queryParams: checkMyAccountParams(this.queryStringKeys) })
      : this.router.navigate([''], { queryParams: this.queryStringKeys });
    this.storage.removeItem('deepLinkRequest');
    this.storage.removeItem('correlationId');
    this.storage.removeItem('priceData');
    this.storage.removeItem('paymentDeeplinkData');
    this.storage.removeItem('openedModal');
    if (this.isBrowser) {
      this.sessionStorageService.clear(SessionUtils.CORRELATION_ID);
    }
    this.deepLinkService.changeIsPriceDeepLink(false);
    this.searchService.changeShowSpinner(false);
  }
  goToContactUs() {
    this.googleTagManagerServiceService.pushSupportEvent();
    this.router.navigate(['/contact-us'], { queryParamsHandling: 'preserve' });
  }
  /**To get logged user data from session */
getUserCredentials(){
  let credentials :any = null;
  if (this.storage.getItem('credentials', 'session')) {
    this.saveLocalStorage = false;
    credentials = JSON.parse(this.storage.getItem('credentials', 'session'));
  }
  if (this.storage.getItem('credentials', 'local')) {
    credentials = JSON.parse(this.storage.getItem('credentials', 'local'));
    this.saveLocalStorage = true;
  }
  return credentials;
}

  goToMyAccount() {
    this.googleTagManagerServiceService.pushProfileEvent();
    this.router.navigate(['/my-account'], { queryParamsHandling: 'preserve' });
  }
  username(): string | null {
    let username: string | null = null;

    if (this.countryValue === 'MM') {
      username = this.getPrimaryUser();
      return username;
    }

    this.googleLoginUserData = JSON.parse(this.storage.getItem('googleUserDetails', 'session'));
    if (this.googleLoginUserData) {
      username = this.googleLoginUserData.firstName;
    } else if (this.credentialsService?.credentials?.data) {
      const credentials = this.credentialsService.credentials?.data;
      username = credentials ? credentials.firstName : null;
    }
    if (username !== null && username != undefined) {
      this.searchService.updateUserCredentials(this.credentialsService?.credentials);
      $('#loginModal').modal('hide');
    }
    return username;
  }

  logout() {
    this.googleTagManagerServiceService.pushLogoutEvent();
   // this.googleTagManagerServiceService.setUserEmail();
    if (this.googleLoginUserData) {
      this.googleAuthService.signOut();
      this.searchService.updateUserCredentials(null);
      this.storage.removeItem('googleUserDetails');
      this.storage.removeItem('credentials');
      this.storage.removeItem('credentials', 'local');
      this.authenticationService.logout();
    } else {
      this.authenticationService.logout();
      this.storage.removeItem('credentials');
      this.storage.removeItem('credentials');
      this.searchService.updateUserCredentials(null);
    }
    if (this.isBrowser && window.location.href.includes('my-account')) {
      this.router.navigate(['']);
    }
    this.storage.removeItem('hideCurrentpassword');
    this.storage.setItem('hideCurrentpassword', JSON.stringify(false), 'session');
    this.sessionService.userLoginSession('userLoggedOut');
  }
  loginSignupClick() {
    $('#loginModal').modal('show');
    this.authenticationService.changeCloseForgotPwd(true);
  }

  /**It sets the links for the header */
  captureLink(param: string) {
    if (this.isBrowser) {
      this.sessionStorageService.clear(SessionUtils.CORRELATION_ID);
    }
    this.googleTagManagerServiceService.pushVisitedLink(param);
    const headresLinks: any =
      this.countryValue === 'FS'
        ? {
            Hotels: 'https://flightsite.safarinow.com/',
            Buses: 'https://bus.flightsite.co.za/',
            packages: 'https://holidays.flightsite.co.za/travel-packages/',
          }
        : {
            Hotels: 'https://hotel.travelstart.com/?source=9918',
            Cars: 'https://cars.travelstart.com/#/searchcars',
            Buses:
              this.countryValue === 'NG' ? 'https://www.travelstart.com.ng/lp/buses' : 'https://bus.travelstart.co.za/',
            packages: 'https://packages.travelstart.co.za/?_ga=2.134919800.881583358.1653650672-1941573723.1650459231',
            activities:
              'https://activities.travelstart.co.za/?_ga=2.134919800.881583358.1653650672-1941573723.1650459231',
            corporateTravel: 'https://www.travelstart.co.za/lp/corporate-flight-bookings',
          };
    const url = headresLinks[param];
    if (this.isBrowser && url) {
      window.open(url, '_blank', 'noopener');
    }
  }
  showSpinningLoader(event: any) {
    this.showLoader = event;
  }

  menuenter() {
    this.isMatMenuOpen = true;
  }

  menuLeave(trigger: any) {
    setTimeout(() => {
      if (!this.enteredButton) {
        this.isMatMenuOpen = false;
        trigger.closeMenu();
      } else {
        this.isMatMenuOpen = false;
      }
    }, 80);
  }

  buttonEnter(trigger: any) {
    setTimeout(() => {
      trigger.openMenu();
    });
  }

  buttonLeave(trigger: any) {
    setTimeout(() => {
      if (this.enteredButton && !this.isMatMenuOpen) {
        trigger.closeMenu();
      } else if (!this.isMatMenuOpen) {
        trigger.closeMenu();
      } else {
        this.enteredButton = false;
      }
    }, 100);
  }
  upgradeTsPlus() {
    const routeUrl = this.router.serializeUrl(
      this.router.createUrlTree(['/ts-plus/ts-plus-benefits'], { queryParamsHandling: 'preserve' })
    );
    if (this.isBrowser) {
      window.open(routeUrl, '_blank');
    };
  }
  showTsPlus() {
    return this.apiService.isShowTSPLUSLabel();
  }
  isShowHeaderLinks() {
    if (!this.isBrowser) return;
    return !(window.location.pathname !== '/' && this.countryValue === 'FS');
  }
  /**here if we have url includes my account and user is not logged so we are open login modal   */
  openLoginModal() {
    if ( this.isBrowser && 
      window.location.href.includes('my-account') &&
      !this.storage.getItem('credentials', 'session') &&
      !this.storage.getItem('credentials', 'local')
    ) {
      this.loginSignupClick();
    }
  }
  /**showing the buses based on conditions */
  showBusesLabel() {
    return Boolean(this.countryValue === 'NG' && !this.iframeWidgetService.isWhiteLabelSite() && this.showBusesHead);
  }
  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    if (!this.isBrowser) return;
    const target = event.target as HTMLElement;
    const modal = document.getElementById('loginModal');
    if (modal && !modal.contains(target) && !modal.classList.contains('show')) {
      this.onOutsideLoginModalClick();
    }
  }

  onOutsideLoginModalClick() {
    this.clickedOutSide = true;
    this.searchService.changeloginModalOutSideClick(true);
  }

  /**Showing the Buses link in the header */
  showBusesBtn() {
    return Boolean(
      (this.countryValue === 'NG' || this.countryValue === 'FS') &&
        !this.iframeWidgetService.isWhiteLabelSite() &&
        this.showBusesHead
    );
  }

  /**show and hide for white labels based on domains*/
  hideForWhitelabels() {
    return Boolean(
      (this.countryValue === 'ZA' || this.countryValue === 'FS') && !this.iframeWidgetService.isWhiteLabelSite()
    );
  }
  /**To check its home page or not to display momentum header items */
  isHomePage() {
    if (!this.isBrowser) return;
    return Boolean(window.location.pathname === '/' || window.location.pathname === '');
  }
  /**here we are consider path to navigate back page based on location path.
   *  if user in confirmation page then click back button land on home page instead of back page */
  goToBackPage() {
    if(this.isBrowser && window.location.pathname === '/payments/bookingConfirm'){
      this.router.navigate([''],{ queryParamsHandling: 'preserve' })
    }else{
      this.location.back();
    }
   
  }
  /**To Navigate manage bookings section */
  goToManageBookings(){
    this.router.navigate(['/my-account/dashboard'], { queryParamsHandling: 'preserve' });
  }
  getPrimaryUser() {
    let userName :any= null;
    let primaryTraveler = this.meiliService.getPrimaryUser();
    userName = primaryTraveler != undefined && primaryTraveler != null ? primaryTraveler?.personName?.givenName + ' ' + primaryTraveler?.personName?.surname : null ;
    return userName;
  }
  /**here based on header tab selection active tabs in web-view component
   * emmiting value to web-view component and call setActive() method 
   */
  setActiveTab(button: string) {
    this.activeButton = button;
    if (button === 'flights') {
      this.router.navigate(['/'], { queryParamsHandling: 'preserve' });
    } else if (button === 'hotels') {
      this.router.navigate(['/hotels'], { queryParamsHandling: 'preserve' });
    }else if (button === 'cars') {
      this.router.navigate(['/'], { queryParamsHandling: 'preserve' });
    }
    this.tabSelectionEvents.emit(this.activeButton);
    this.meiliService.updateHeadersTabInfo(this.activeButton);
  }
  /**set header tab active based on pathnames */
  activeTabsByPathName(){
    let flightTabList = [ '/flights/results', '/booking/flight-details','/booking/products','/payments','/payments/bookingConfirm']
    if(this.isBrowser && flightTabList.includes(window.location.pathname)){
      this.activeButton = 'flights';
    }else if(this.isBrowser && window.location.pathname == '/hotels'){
      this.activeButton = 'hotels';
    }else{
      this.activeButton = '';
    }
  }
  navigateToBookings(){
    //this.googleTagManagerServiceService.pushMyTripsEvent();
    this.googleTagManagerServiceService.pushManageBookingEvent();
    this.router.navigate(['/my-account/dashboard'], { queryParamsHandling: 'preserve' });
  }
}
