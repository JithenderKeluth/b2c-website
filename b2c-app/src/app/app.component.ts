import { MeiliIntegrationService } from './general/services/meili-integration.service';
import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

import { environment } from '@env/environment';
import { Logger } from './_core';
import { I18nService } from '@app/i18n';
import { responsiveService } from './_core/services/responsive.service';
import { AuthenticationService } from '@app/auth';
import { SessionUtils } from './general/utils/session-utils';
import { QueryStringAffid } from './general/utils/querystringAffid-utils';

import { GoogleTagManagerServiceService } from './_core/tracking/services/google-tag-manager-service.service';
import { ApiService } from './general/services/api/api.service';
import { SearchService } from './flights/service/search.service';
import { languageArray } from './i18n/language-selection';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { IframeWidgetService } from './general/services/iframe-widget.service';
import { ThemeService } from '@core/services/theme.service';
import { AppSessionService } from '@shared/session/app-session.service';
import { SessionStorageService } from 'ngx-webstorage';
import { initTawkScript } from './general/utils/tawkscript';
import { searchOrUpdatePrice } from './booking/utils/traveller.utils';
import { GtmService } from '@core/services/gtm.service';
import { getContainerIdByCountry } from './_core/tracking/utils/data-layer-parser.utils';
import { AffiliateService } from './general/services/affiliate.service';
import { UniversalStorageService } from './general/services/universal-storage.service';
import { isPlatformBrowser } from '@angular/common';

import { IterableService } from './_core/tracking/services/iterable.service';
import { MessagingService } from './general/services/messaging/messaging.service';
import { UiStateService } from '@shared/services/ui-state.service';

declare const $: any;
const log = new Logger('App');

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  queryStringKeys = {};
  languagesArray: any = languageArray;
  selectedLanguage: any;
  idleState = 'Not started.';
  timedOut = false;
  lastPing?: Date = null;
  scrollIframe = false;
  isConnected = true;
  selectedVertical: string | null = null;
  domainCountry : any = null;
  isAppInitialized = false;
  showMask = false;
  constructor(
    public router: Router,
    private activatedRoute: ActivatedRoute,
    private queryString: QueryStringAffid,
    private i18nService: I18nService,
    private responsiveService: responsiveService,
    private apiService: ApiService,
    private googleTagManagerService: GoogleTagManagerServiceService,
    private searchService: SearchService,
    private authService: AuthenticationService,
    private snackBar: MatSnackBar,
    public iframeWidgetService: IframeWidgetService,
    private themeService: ThemeService,
    private appSessionService: AppSessionService,
    private sessionStorageService: SessionStorageService,
    private gtmService: GtmService,
    private affiliateService: AffiliateService,
    private meiliService : MeiliIntegrationService,
    private storage: UniversalStorageService,
    @Inject(PLATFORM_ID) private platformId: any,
    private iterableService: IterableService,
    private uiState: UiStateService
  ) {}

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return;
    if (isPlatformBrowser(this.platformId)) {
      this.initializeUser().then(() => {
        this.loadInAppMessages();
      });
      console.log('✅ AppComponent initialized on client');
      document.querySelector('app-root')?.removeAttribute('app-boot');
      setTimeout(() => {this.isAppInitialized = true;},1000); 
    }
    const country = this.apiService.extractCountryFromDomain();

    this.domainCountry = this.apiService.extractCountryFromDomain();
    if (!this.iframeWidgetService.isB2BApp() && isPlatformBrowser(this.platformId)) {
      const gtmContainerId = getContainerIdByCountry(country);
      this.gtmService.addGtmScript(gtmContainerId);
    }
    this.onResize();
    this.initializeApp(country);
    this.updateJsonContent();
    this.subscribeToRouterEvents();
    this.subscribeToNetworkEvents();
    this.logStorage();
    this.affiliateService.performAffiliateCookieCheck();
    this.loadCentalizedJSONData();

    if (isPlatformBrowser(this.platformId) && country === 'MM') {
      window.addEventListener('message', this.handleMessage.bind(this), false);
    }

    this.uiState.showMask$.subscribe(val => this.showMask = val);
  }

  async initializeUser() {
    try {
      await this.iterableService.setUserEmail();
    } catch (error) {
      console.error('Error setting user:', error);
    }
  }

  async loadInAppMessages() {
    try {
      const messages = await this.iterableService.fetchInAppMessages();
    } catch (error) {
      console.error('Error fetching in-app messages:', error);
    }
  }


  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    if (isPlatformBrowser(this.platformId)) {
      window.removeEventListener('message', this.handleMessage.bind(this));
    }
  }

  private initializeApp(country: any) {
    this.setThemeByCountry(country);
    this.authDeeplink();
    this.initializeExternalScripts();
    this.i18nService.init(environment.defaultLanguage, environment.supportedLanguages);
    // this.storageService.testLocalStorage();
    if (environment.production) Logger.enableProductionMode();

    this.responsiveService
      .getMobileStatus()
      .pipe(takeUntil(this.destroy$))
      .subscribe((isMobile) => {
        this.googleTagManagerService.pushDeviceId(isMobile ? 'M-WEB' : 'WEB');
      });

    this.handleQueryParams();
    this.updateAppVersion();
    this.setDomainCountry();
  }

  private subscribeToRouterEvents() {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        if (isPlatformBrowser(this.platformId)) {
          const iframeUrl = window.location.href;
          window.parent.postMessage({ type: 'iframeUrlChanged', url: iframeUrl }, '*');
        }
      });
  }

  private subscribeToNetworkEvents() {
    this.apiService
      .checkInternetConnection()
      .pipe(takeUntil(this.destroy$))
      .subscribe((isConnected: boolean) => {
        this.isConnected = isConnected;
      });
  }

  private logStorage() {
    // const keysToKeep = ['cookies', 'flightResults', 'app_version', 'credentials'];
    // this.storageService.clearStoragesExcept(keysToKeep);
    // this.storageService.logLocalStorage();
    // this.storageService.logSessionStorage();
  }

  onResize() {
    this.responsiveService.checkWidth();
  }

  private handleQueryParams() {
    this.activatedRoute.queryParams
      .pipe(
        filter((params) => !!params),
        takeUntil(this.destroy$)
      )
      .subscribe((params) => {
        if (params['b2b_Token']) this.storage.setItem('authToken', params['b2b_Token'], 'session');
        if (params['b2b_CorrelationId']) this.storage.setItem('correlationId', params['b2b_CorrelationId'], 'session');
        if (params['organization']) {
          this.setThemeByCountry(params['organization'].split('_')[1]);
          this.storage.removeItem('B2BOrganization');
          this.storage.setItem('B2BOrganization', params['organization'], 'session');
        }
      });
  }

  private handleMessageEvent(event: MessageEvent) {
    if (event.origin !== 'https://business.travelstart.com/') return;

    let message;
    try {
      message = JSON.parse(event.data);
    } catch {
      message = null;
    }

    if (message?.key1) {
      if (isPlatformBrowser(this.platformId)) {
        this.sessionStorageService.clear(SessionUtils.CORRELATION_ID);
      }
      this.storage.removeItem('correlationId');
      this.storage.removeItem('authToken');
      this.storage.removeItem('b2bUser');
      this.storage.setItem('correlationId', message.key2, 'session');
      if (isPlatformBrowser(this.platformId)) {
        this.sessionStorageService.store(SessionUtils.CORRELATION_ID, message.key2);
      }
      this.storage.setItem('authToken', message.key1, 'session');
      this.storage.setItem('b2bUser', JSON.stringify(message.key3), 'session');
    }
  }
  // ngAfterViewInit() {
  //   window.addEventListener('message', (event) => {
  //     // Ensure that the message is from the parent website
  //     this.handleMessageEvent(event);
  //   });
  // }
  private initializeExternalScripts() {
    /**here we are disable tawk script bcoz we are using enable whatsapp widget on contact-us page
     * if (
      environment.production &&
      ['/', '/contact-us'].includes(window.location.pathname) &&
      !this.iframeWidgetService.isB2BApp()
    ) {
      initTawkScript(this.apiService.extractCountryFromDomain(), true);
    }
     */
  }

  private setThemeByCountry(country: string) {
    switch (country) {
      case 'GI':
        this.changeTheme('gigm');
        break;
      case 'IB':
        this.changeTheme('investec');
        break;
      case 'CT':
        this.changeTheme('clubhub');
        break;
      case 'MM':
        this.changeTheme('momentum');
        break;
      case 'ABSA':
        this.changeTheme('absa');
        break;
      case 'SB':
          this.changeTheme('standardbank');
          break;
      default:
        this.changeTheme('default');
    }
  }

  private authDeeplink() {
    this.activatedRoute.queryParams.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      if (!params) return;

      this.queryStringKeys = { ...params };
      this.queryString?.getQueryParameterValues();

      if (params.utm_campaign === 'account-reset-password-biz') {
        this.resetPasswordLink(params);
      } else if (params.utm_campaign === 'account-activation') {
        this.activateAccount(params);
      }
    });
  }

  private resetPasswordLink(data: any) {
    this.authService.changeshowResetPassword(true);
    if (!this.storage.getItem('resetPasswordData', 'session')) {
      this.storage.setItem('resetPasswordData', JSON.stringify(data), 'session');
    }
  }

  private activateAccount(value: any) {
    if (!this.storage.getItem('activateAccount', 'session')) {
      this.storage.setItem('activateAccount', JSON.stringify(value), 'session');
      this.authService
        .userActivateAccount(value)
        .pipe(takeUntil(this.destroy$))
        .subscribe(
          (credentials: any) => {
            if (!credentials.data) {
              this.snackBar.open(credentials.result);
              this.storage.setItem('hideCurrentpassword', JSON.stringify(false), 'session');
            } else {
              this.snackBar.open('The account has been activated');
              this.storage.removeItem('hideCurrentpassword');
              this.router.navigate(['/my-account'], { queryParamsHandling: 'preserve' });
            }
            setTimeout(() => this.snackBar.dismiss(), 3000);
          },
          (error) => log.error(`Login error: ${error}`)
        );
    }
  }

  private setDomainCountry() {
    this.selectedLanguage = this.apiService.getDomainInfo();
    setTimeout(() => {
      if (!this.storage.getItem('country-language', 'session')) {
        this.i18nService.language = this.selectedLanguage?.code;
        this.searchService.languagedata = this.selectedLanguage.code;
        this.storage.setItem('country-language', this.selectedLanguage.code, 'session');
      }

      if (!this.storage.getItem('currencycode', 'session')) {
        this.storage.setItem('currencycode', this.selectedLanguage.currency, 'session');
        this.i18nService.currencyCode = this.selectedLanguage.currency;
        this.searchService.currencyCode = this.selectedLanguage.currency;
      }
    }, 500);
  }

  /*It checks the latest version of the app and updates the local storage*/
  updateAppVersion() {
    let newVersion = environment.appVersion;
    if (!this.storage.getItem('app_version', 'local')) {
      this.storage.setItem('app_version', newVersion, 'local');
    } else if (this.storage.getItem('app_version', 'local')) {
      let appVersion = this.storage.getItem('app_version', 'local');
      if (appVersion !== newVersion) {
        this.storage.removeItem('app_version');
        this.storage.setItem('app_version', newVersion, 'local');
      }
    } 
    console.log("App Version > ", newVersion);
  }

  private changeTheme(name: any) {
    this.appSessionService.setUser(name);
    this.themeService.setTheme(name);
  }

  public refreshResultsOrUpdatePrice() {
    const sessionObj = searchOrUpdatePrice(this.router.url === '/flights/results' ? 'refreshResults' : 'updatePrice');
    this.searchService.changeNewSearch(sessionObj);
    if (isPlatformBrowser(this.platformId)) {
      $('#idleTimeOut').modal('hide');
    }
  }

  public newSearch() {
    if (!isPlatformBrowser(this.platformId)) return;
    $('#idleTimeOut').modal('hide');
    this.router.navigate(['/'], { queryParamsHandling: 'preserve' });
  }
  updateJsonContent() {
    if (this.storage.getItem('b2bUser', 'session')) {
      let contentCountry = JSON.parse(this.storage.getItem('b2bUser', 'session'));
      this.i18nService.loadContentJSON(contentCountry?.organization_id?.split('_')[1]);
      if (isPlatformBrowser(this.platformId)) {
        window.parent.postMessage({ type: 'B2BIframeloaded' }, '*');
      }
    } else {
      setTimeout(() => {
        this.getB2BUserDataInfo();
      }, 1000);
    }
  }
  getB2BUserDataInfo() {
    if (this.storage.getItem('authToken', 'session') && !this.storage.getItem('b2bUser', 'session')) {
      this.searchService.getB2BUserData().subscribe((user: any) => {
        if (user.success) {
          this.storage.setItem('b2bUser', JSON.stringify(user.data), 'session');
          this.i18nService.loadContentJSON(user?.data?.organization_id?.split('_')[1]);
          if (isPlatformBrowser(this.platformId)) {
            window.parent.postMessage({ type: 'B2BIframeloaded' }, '*');
          }
        }
      });
    }
  }
  /**here to get centerlized Json for app configurations  */
  loadCentalizedJSONData() {
    this.i18nService.getCenterlizedJSONData().subscribe((data: any) => {
      if (data) {
        let centralizedData = data;
        /**here if we want to enable wallet for ZA then we can do from here instead of S3 
         * currenly we are disable wallet for ZA
         *         if(this.apiService.getEnvironment() !== 'live' && centralizedData?.wallet[this.apiService.extractCountryFromDomain()]){
          centralizedData.wallet[this.apiService.extractCountryFromDomain()].enable_wallet = true;
        }
         */

        this.storage.setItem('appCentralizedInfo', JSON.stringify(centralizedData), 'session');
      }
    });
  }

  handleMessage(event: MessageEvent) {
    // Validate origin (Replace 'https://hotel-widget.com' with the actual domain)
    if (event.origin !== 'https://hotels-momentum.travelstart.com') {
      return;
    }

    if (event.data && event.data.type === 'verticalSelection') {
      this.selectedVertical = event.data.selectedVertical;
      this.updateUI(this.selectedVertical);
    }
  }

  updateUI(vertical: any) { 
    if (vertical !== 'hotels') {
      this.meiliService.updateHeadersTabInfo(vertical);
      this.router.navigate(['/'], { queryParamsHandling: 'preserve' });
    }
  }

}
