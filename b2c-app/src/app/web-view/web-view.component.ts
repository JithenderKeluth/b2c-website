import { Component, OnInit, ViewChild, Inject, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { Subscription, interval } from 'rxjs';
import { filter } from 'rxjs/operators';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { MeiliIntegrationService } from '@app/general/services/meili-integration.service';
import { MomentumApiService } from '@app/general/services/momentum-api.service';
import { SessionService } from './../general/services/session.service';
import { ErrorPopupComponent, ErrorPopupData } from './../_shared/components/error-popup/error-popup.component';
import { MeiliEmbedComponent } from './../general/components/meili-embed/meili-embed.component';
import { ApiService } from '@app/general/services/api/api.service';
import { BookingCountdownService } from '../general/utils/bookingFlowCountdown';
import { HeaderComponent } from '@app/_shared/components/header/header.component';
import { MyAccountServiceService } from '../my-account/my-account-service.service';
import { stayDaysCount } from '../general/utils/my-account.utils';
import { UniversalStorageService } from '../general/services/universal-storage.service';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-web-view',
  templateUrl: './web-view.component.html',
  styleUrls: ['./web-view.component.scss', './../../theme/overlay-loader.scss'],
})
export class WebViewComponent implements OnInit {
  enteredButton = false;
  isMatMenuOpen = false;
  public userName: any;
  activeButton: string = 'flights';
  isValidPage = false;
  errorMessage: any;
  paxSelectedList: any = [];
  loading: boolean = true; 
  private subscriptions: Subscription[] = [];
  private lastUrl: string = '';
  private clientNumber: string = '';
  @ViewChild(MeiliEmbedComponent) meiliEmbedComponent!: MeiliEmbedComponent;
  @ViewChild(HeaderComponent) headerComponent: HeaderComponent;
  meiliBookingId : any = null;
  isBrowser: boolean;
  familyAPITriggerCount :number = 0;
  constructor(
    private router: Router,
    private meiliService: MeiliIntegrationService,
    private momentumApiService: MomentumApiService,
    private sessionService: SessionService,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    public apiService: ApiService,
    private bookingCountdownService: BookingCountdownService,
    private myaccountService : MyAccountServiceService,
    private storage: UniversalStorageService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    // Listen to router events (for route changes)
    const routerSub = this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      this.detectUrlChange();
    });
    this.subscriptions.push(routerSub);

    // Poll the URL for dynamic query and fragment changes
    const pollSub = interval(500).subscribe(() => {
      if (this.isBrowser && this.lastUrl !== window.location.href) {
        this.detectUrlChange();
      }
    });
    this.subscriptions.push(pollSub);
    // Initial detection
    this.detectUrlChange();

    this.generateSessionId();
    const headersTabSubScription = this.meiliService.currentHeadersTabInfo.subscribe((data: any) => {
      if (data) {
        this.activeButton = data;
      }
    });
    this.subscriptions.push(headersTabSubScription);
  }

  handleUserData(data: string): void {
    const paxSelectedList: any = this.storage.getItem('mmfTravellerData', 'session');
      this.paxSelectedList = JSON.parse(paxSelectedList);
    if (this.activeButton === 'cars') {
      if (this.meiliEmbedComponent) {
        this.meiliEmbedComponent.initilizeMeiliWidget();
      }
    }
  }

  ngOnDestroy(): void {
    // Clean up all subscriptions
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  private detectUrlChange(): void {
    if(!this.isBrowser) return;
    const currentUrl = window.location.href;
    if (this.lastUrl !== currentUrl) {
      this.lastUrl = currentUrl;

      // Update the URL in the service
      this.meiliService.updateUrl(currentUrl);

      // Call your custom method here
      this.handleUrlChange(currentUrl);
    }
  }

  private handleUrlChange(url: string): void {
    if(!this.isBrowser) return;
    const queryString = new URLSearchParams(window.location.search).toString();
    const fragment = window.location.hash;

    // Custom logic to manage visibility
    if (
      queryString.includes('cpysource=momentum') &&
      (fragment.includes('results') ||
        fragment.includes('options') ||
        fragment.includes('checkout') ||
        fragment.includes('confirmation'))
    ) {
      this.isValidPage = true;
      console.log('Valid "momentum" page with results');
    } else {
      this.isValidPage = false;
      console.log('Invalid or unsupported page');
    }
    if (this.headerComponent) {
      this.headerComponent.isValidCarWidgetPage = this.isValidPage;
      if (this.isValidPage) {
        this.headerComponent.activeButton = 'cars';
      }
    }
  }

  updateUrl(): void {
    if(!this.isBrowser) return;
    // Get the current URL without the fragment
    const currentUrl = window.location.href.split('#')[0];

    // Use History API to update the URL without reloading
    window.history.replaceState({}, '', currentUrl);
    this.handleUrlChange(currentUrl);
  }

  setActive(button: string,isDataFromheader? :boolean) {
    this.activeButton = button;
    if(!isDataFromheader)this.paxSelectedList = [];
    if (button === 'flights') {
      this.updateUrl();
      if(isDataFromheader){
        this.getFamilyComposition();
      }
    } else if (button === 'hotels') {
      this.router.navigate(['/hotels'], { queryParamsHandling: 'preserve' });
    }else if (this.activeButton != 'cars') {
      this.paxSelectedList = [];
    }
  }

  generateSessionId(): void {
    this.subscribeToQueryParams();

    const sessionId = this.sessionService.getSessionId();

    if (sessionId) {
      this.getFamilyComposition();
    } else if (this.clientNumber) {
      this.momentumApiService.generateSessionId(this.clientNumber).subscribe(
        (response) => {
          this.storage.removeItem('mmfTravellerData');
          const redirectUrl = response.RedirectURL;
          const sessionId = this.extractSessionId(redirectUrl);

          if (sessionId) {
            this.sessionService.setSessionId(sessionId);
            this.getFamilyComposition();
          }
        },
        (error) => {
          this.errorMessage = error?.error?.detail?.error || error;
          this.showError(this.errorMessage);
        }
      );
    } else {
      this.showError('Invalid client number, please try again');
    }
  }

  // Extract session_id from the RedirectURL
  extractSessionId(redirectUrl: string): string {
    const url = new URL(redirectUrl);
    return url.searchParams.get('session_id');
  }

  subscribeToQueryParams() {
    this.route.queryParams.subscribe((params) => {
      const sessionId = params['session_id'];
      this.clientNumber = params['client_number'];
      if (sessionId) {
        this.updateQueryStrSession(sessionId);
        this.sessionService.setSessionId(sessionId);
      }
    });
  }

  /* Have to update the query string session everytime the new sessionId is created */
  updateQueryStrSession(newSessionId: string): void {
    const queryStringParamsString = this.storage.getItem('queryStringParams', 'session');
    if (queryStringParamsString) {
      try {
        const queryStringParams = JSON.parse(queryStringParamsString);
        queryStringParams.session_id = newSessionId;
        this.storage.setItem('queryStringParams', JSON.stringify(queryStringParams), 'session');
      } catch (error) {
        console.error('Error parsing queryStringParams from sessionStorage:', error);
      }
    } else {
      console.warn('No queryStringParams found in sessionStorage to update.');
    }
  }

  getFamilyComposition(): void {
    this.loading = true;
    this.storage.removeItem('credentials');
    const sessionId = this.sessionService.getSessionId();

    if (!sessionId) {
      prompt('Session ID is missing.');
      this.errorMessage = 'Session ID is missing.';
      this.showError(this.errorMessage);
      return;
    }
    this.familyAPITriggerCount++;
    this.momentumApiService.getFamilyComposition(sessionId).subscribe(
      (response: any) => {
        this.loading = false;
        // Transform the response for traveler list
        // const convertedResponse = this.transformResponse(response);
        const convertedResponse = this.momentumApiService.transformResponse(
          response.data?.familyCompositionMultiplyResponse
        );
        const mappedContact_MMObject = this.momentumApiService.createContact_MMObject(
          response.data?.familyCompositionMultiplyResponse
        );

        const mmfResponseObj = this.momentumApiService.transformMmfResponse(response);
        const familyCompositionMultiplyResponse = response?.data?.familyCompositionMultiplyResponse;
        // Fetch credentials from storage
        let credentials = this.getStoredCredentials();

        // Update credentials with family composition data
        credentials = {
          ...credentials,
          data: {
            ...response,
            ...mmfResponseObj.data,
            ...mappedContact_MMObject,
            ...familyCompositionMultiplyResponse,
            travellerList: convertedResponse.travellerList,
          },
        };

        // Update session storage
        this.updateSessionStorageCredentials(credentials);
        this.getPrimaryUser();
        this.updateSessionId(sessionId);
        this.getUserData();
        /**here to start countdown 30 min for momentum user session logout */
        if (!this.storage.getItem('booking_Countdown_EndTime', 'session')) {
          this.bookingCountdownService.resetCountdown();
        }
      },
      (error: any) => {
        if(this.familyAPITriggerCount > 1){
        this.loading = false;
        this.errorMessage = error;
        this.bookingCountdownService.sendDataToFlutter({travelstartFamilyApiError : error});
        this.showError('Oops! We hit some turbulence. Please try again.');
        }else{
          this.getFamilyComposition();
        } 
      }
    );
  }

  private getStoredCredentials(): any {
    const sessionCredentials = this.storage.getItem('credentials', 'session');
    const localCredentials = this.storage.getItem('credentials', 'local');

    try {
      return (
        (sessionCredentials ? JSON.parse(sessionCredentials) : null) ||
        (localCredentials ? JSON.parse(localCredentials) : {})
      );
    } catch (error) {
      this.errorMessage = error;
      this.showError(error);
      console.error('Error parsing stored credentials:', error);
      return {};
    }
  }

  private updateSessionStorageCredentials(credentials: any): void {
    try {
      this.storage.removeItem('mmfTravellerData');
      // sessionStorage.setItem('credentials', JSON.stringify(credentials));
      this.sessionService.updateSessionData('credentials', credentials);
    } catch (error) {
      this.errorMessage = error;
      this.showError(error);
      console.error('Error updating session storage:', error);
    }
  }

  onGetPartnerRewards(): void {
    const sessionId = this.sessionService.getSessionId();
    const payload = {
      transactionalValue: 0,
      transactionIdentifier: 'string',
      productName: 'string',
      flightClass: 'string',
      carrier: 'string',
    };

    this.momentumApiService.getPartnerRewards(sessionId, payload).subscribe(
      (response) => {
         
      },
      (error) => {
        this.errorMessage = error;
        this.showError(error);
        console.error('Error fetching partner rewards:', error);
      }
    );
  }

  onRedeemPartnerRewards(): void {
    const sessionId = this.sessionService.getSessionId();
    const payload = {
      transactionalValue: 0,
      transactionIdentifier: 'string',
      productName: 'string',
      flightClass: 'string',
      carrier: 'string',
    };

    this.momentumApiService.redeemPartnerRewards(sessionId, payload).subscribe(
      (response) => {
         
      },
      (error) => {
        this.errorMessage = error;
        this.showError(error);
        console.error('Error redeeming rewards:', error);
      }
    );
  }

  showError(errMsg: any): void {
    const popupData: ErrorPopupData = {
      header: 'Error Occurred',
      imageUrl: 'assets/icons/Icon/Negative-scenarios/dummy_error_icon.svg',
      message: errMsg,
      buttonText: 'Ok',
      showHeader: false,
      showImage: true,
      showButton: true,
      onButtonClick: () => {
        console.log('button clicked');
      },
    };

    this.dialog.open(ErrorPopupComponent, {
      width: '300px',
      data: popupData,
    });
  }

  getPrimaryUser() {
    let primaryTraveler = this.meiliService.getPrimaryUser();
    this.userName = primaryTraveler?.personName?.givenName + ' ' + primaryTraveler?.personName?.surname;
    return primaryTraveler;
  }

  updateSessionId(sessionId: string): void {
    const newSessionId = sessionId;

    const queryParams = { ...this.route.snapshot.queryParams };

    queryParams['session_id'] = newSessionId;

    // Update the URL with the new query parameters
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: queryParams,
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }
  /**here get User profile data to get saved card payment list  */
  getUserData() {
    let credentials = this.getStoredCredentials();
    this.myaccountService.getUserData(credentials.data.token, false).subscribe((res: any) => {
      if (res.data) {
        credentials.data['paymentCardList'] = res?.data?.paymentCardList;
        this.sessionService.updateSessionData('credentials', credentials);
      }
    });
  }
  /**here to trigger momentum redemption API once get booking confirmation from car meili widget */
  triggerMomentumRedumptionAPI(data: any) {
    if(this.meiliBookingId == null || this.meiliBookingId !== data?.confirmationId ){
      let userInfo :any = null;
      if (this.storage.getItem('mmfTravellerData', 'session')) {
        userInfo = JSON.parse(this.storage.getItem('mmfTravellerData', 'session'));
      }
      this.meiliBookingId = data?.confirmationId;
      let duration = stayDaysCount(data.pickupDateTime,data.dropoffDateTime);
      let payloadReq = {
        clientIdentifier: userInfo[0]?.clientNumber || '',
        transactionalValue: data?.rentalSummary?.totalPrice?.cost?.amount || 0,
        transactionIdentifier: data?.confirmationId || '',
        productName: 'Carhire',
        quantity: duration
      };
      const sessionId = this.sessionService.getSessionId();
      this.meiliService.momentumRedemption(sessionId, payloadReq).subscribe((res: any) => {
        //console.log(res);
      });
    }
  }
}
