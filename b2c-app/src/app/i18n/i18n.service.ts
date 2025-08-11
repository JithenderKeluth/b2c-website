import { Inject, Injectable, Renderer2, RendererFactory2, PLATFORM_ID } from '@angular/core';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { CountryCodes } from '../general/utils/country-code';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { WINDOW } from '../../assets/window.providers';

import { Logger } from './../_core/logger.service';
import { HttpClient } from '@angular/common/http';
import {
  ASSET_TRANSLATION_PATH,
  LOCO_API_LIVE_PATH,
  LOCO_TRANSLATIONS_PATH,
  S3_BUCKET_PATH,
} from '@app/general/services/api/api-paths';
import Bowser from 'bowser';
import { BookingService } from '@app/booking/services/booking.service';
import { Title } from '@angular/platform-browser';
import { ApiService } from '@app/general/services/api/api.service';
import countries from '../../countries.json';
import { updateFavIcon } from '../general/utils/updatefavIcon';
import { UniversalStorageService } from '@app/general/services/universal-storage.service';


const log = new Logger('I18nService');
const languageKey = 'language';

@Injectable({
  providedIn: 'root',
})
export class I18nService {
  defaultLanguage!: string;
  supportedLanguages!: string[];
  lang: any;
  country: any;
  userCountry: any;
  userCountryCode: any;
  currencyVal: any = 'USD';
  applicationval: any;
  countryDialCode: any;
  selectedCountry: any;
  countryDomain: any = null;
  affliateSite = false;
  dialCode_Info: any = {};
  tsJSON: any = {};
  ipCountry: string;
  private renderer: Renderer2;

  private langChangeSubscription!: Subscription;
  private userCountrySubject = new BehaviorSubject<any>(null);
  public userCountry$ = this.userCountrySubject.asObservable();
  constructor(
    private translateService: TranslateService,
    @Inject(DOCUMENT) private doc: Document,
    @Inject(WINDOW) private window: Window,
    private bookingService: BookingService,
    private title: Title,
    private apiService: ApiService,
    private httpClient: HttpClient,
    rendererFactory: RendererFactory2,
    private storage: UniversalStorageService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.renderer = rendererFactory.createRenderer(null, null);
    updateFavIcon(this.apiService.extractCountryFromDomain(), this.platformId);
    this.countryDomain = 'en-' + this.apiService.extractCountryFromDomain();
    this.title.setTitle(this.getAppTitle());
    this.loadContentJSON();
  }

  /**
   * Initializes i18n for the application.
   * Loads language from local storage if present, or sets default language.
   * @param defaultLanguage The default language to use.
   * @param supportedLanguages The list of supported languages.
   */
  init(defaultLanguage: string, supportedLanguages: string[]) {
    this.updateCanonicalUrl();
    this.defaultLanguage = defaultLanguage;
    this.supportedLanguages = supportedLanguages;
    this.language = this.countryDomain;
    // Warning: this subscription will always be alive for the app's lifetime
    this.langChangeSubscription = this.translateService.onLangChange.subscribe((event: LangChangeEvent) => {
      // localStorage.setItem(languageKey, event.lang);
    });
    this.storage.setItem('countries', JSON.stringify(countries), 'session');
    this.bookingService.getUserCountry().subscribe((data: any) => {
      for (let x in CountryCodes) {
        if (CountryCodes[x].code === data.country) {
          this.countryDialCode = CountryCodes[x].dial_code;
          this.dialCode_Info['dialCode'] = CountryCodes[x].dial_code;
          this.dialCode_Info['iso2'] = CountryCodes[x].code;
        }
      }
      this.storage.removeItem('userCountry');
      this.storage.setItem('userCountry', JSON.stringify(data), 'session');
      this.userCountrySubject.next(data);
      this.userCountry = 'en-' + data.country;
      this.selectedCountry = 'en-' + data.country;
      this.ipCountry = data.country;
      //this.setURLPath(this.selectedCountry);
    });
  }

  setIpBased_ForcedRedirection() {
    if (isPlatformBrowser(this.platformId)) {
      const hostname = this.window.location.hostname;
      const ipCountry = JSON.parse(this.storage.getItem('userCountry', 'session'))?.country;
      if (this.isTravelstartDomain(hostname) && ipCountry === 'ZA') {
        return true;
      } else {
        return false;
      }
    }
  }

  private isTravelstartDomain(hostname: string): boolean {
    return [
      'travelstart.com',
      'www.travelstart.com',
      'preprod.travelstart.com',
      'www.preprod.travelstart.com',
    ].includes(hostname);
  }

  /**
   * Cleans up language change subscription.
   */
  destroy() {
    if (this.langChangeSubscription) {
      this.langChangeSubscription.unsubscribe();
    }
  }

  /**
   * It adds the canonical tag related to the domain and removes the other link tag specific to the domain
   */

  updateCanonicalUrl(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const hostname = this.window.location.origin;
    const hostLink = hostname + '/';
    const links = Array.from(this.doc.getElementsByTagName('link'));

    // Remove any 'alternate' links pointing to the host
    links.forEach((link) => {
      if (link.rel === 'alternate' && link.href === hostLink) {
        link.remove();
      }
    });

    // Determine the correct canonical URL based on the environment
    let canonicalTag = hostname;
    const environment = this.apiService?.getEnvironment();
    const envMap = { preprod: 'www', beta: 'www', alpha: 'www' };

    if (environment in envMap) {
      canonicalTag = canonicalTag.replace(new RegExp(`^https?://${environment}\\.`), 'https://www.');
    }

    // Check if a canonical tag already exists
    let canonicalLink = links.find((link) => link.rel === 'canonical');

    if (canonicalLink) {
      canonicalLink.setAttribute('href', canonicalTag);
    } else {
      // Create and append new canonical tag if not found
      const newCanonicalTag = this.doc.createElement('link');
      newCanonicalTag.setAttribute('rel', 'canonical');
      newCanonicalTag.setAttribute('href', canonicalTag);
      this.doc.head.appendChild(newCanonicalTag);
    }
  }

  /**
   * Sets the current language.
   * Note: The current language is saved to the local storage.
   * If no parameter is specified, the language is loaded from local storage (if present).
   * @param language The IETF language code to set.
   */
  set language(language: string) {
    /* default value is countrydomain value if we enable country dropdown use the  language value*/
    language = this.countryDomain || language;
    if (this.supportedLanguages && !this.supportedLanguages.includes(language)) {
      language = 'en-GO';
    }

    //this.setURLPath(language);
    this.selectedCountry = language;
    let isSupportedLanguage = this.supportedLanguages.includes(language);
    this.country = language.split('-')[1];
    this.lang = language.split('-')[0];
    this.updateCanonicalUrl();
    // If no exact match is found, search without the region
    if (language && !isSupportedLanguage) {
      language = language.split('-')[0];
      language = this.supportedLanguages.find((supportedLanguage) => supportedLanguage.startsWith(language)) || '';
      isSupportedLanguage = Boolean(language);
    }

    // Fallback if language is not supported
    if (!isSupportedLanguage) {
      language = this.defaultLanguage;
    }
    // log.debug(`Language set to ${language}`);
    this.translateService.use(language);
  }
  getB2cLinks() {
    return this.httpClient.get(
      `${LOCO_API_LIVE_PATH}${LOCO_TRANSLATIONS_PATH}?country=${this.country}&language=${this.lang}&`
    );
  }
  /**
   * Gets the current language.
   * @return The current language code.
   */
  get language(): string {
    return this.countryDomain;
  }

  /**
   * Sets the current language.
   * Note: The current language is saved to the local storage.
   * If no parameter is specified, the language is loaded from local storage (if present).
   currency The IETF language code to set.
   */
  set currencyCode(currency: string) {
    if (this.storage.getItem('currencycode', 'session')) {
      this.storage.removeItem('currencycode');
      this.storage.setItem('currencycode', currency, 'session');
    }
  }

  get browser(): string {
    if (isPlatformBrowser(this.platformId)) {
      const browser = Bowser.getParser(window.navigator.userAgent);
      const browserName = browser.getBrowser()?.name || 'Unknown';
      return `Web-${browserName}`;
    }
    return 'Web-SSR'; // fallback during SSR
  }
    
  /**Fetching the translations*/
  fetchJSONData(param?: any) {
    let jsonCountry = param ? param : this.apiService.extractCountryFromDomain();
    const url = `${S3_BUCKET_PATH}${ASSET_TRANSLATION_PATH}en-${jsonCountry}.json`;
    return this.httpClient.get(url);
  }
  /**getting the JSON content file based on country*/
  loadContentJSON(param?: any) {
    this.fetchJSONData(param).subscribe((data: any) => {
      if (data) {
        this.tsJSON = { ...data };
        this.title.setTitle(this.getAppTitle());
        this.translateService.setTranslation(this.countryDomain, data);
      }
    });
  }
  /**setting the title to the App */
  getAppTitle() {
    switch (this.countryDomain) {
      case 'en-ZA':
        return 'Cheap flights and Travel Deals | Travelstart';
      case 'en-NG':
        return 'Search and Book Cheap Flights | Travelstart.com.ng';
      case 'en-IB':
        return 'Search and Book Cheap Flights | investec.co.za';
      case 'en-GO':
        return 'Search and Book Cheap Flights | Travelstart.com';
      case 'en-FS':
        return 'Search and Book Cheap Flights | meta.flightsite.co.za';
      default:
        return 'Search and Book Cheap Flights | Travelstart.com';
    }
  }

  /**Updating fav icon for meta-flightsite */
  updateFavIcons() {
    if (!isPlatformBrowser(this.platformId)) {
      return; // Exit early if not running in the browser
    }
    const fs_fav_icn = `https://cdn1.travelstart.com/assets/flight-site-assets/TS_FS.ico`;
    const head = document.head;
    const existingFavicon = document.querySelector('link[rel="icon"]');
    existingFavicon?.remove();
    const link = this.renderer.createElement('link');
    this.renderer.setAttribute(link, 'rel', 'icon');
    this.renderer.setAttribute(link, 'type', 'image/x-icon');
    this.renderer.setAttribute(link, 'href', fs_fav_icn);
    this.renderer.appendChild(head, link);
  }
  /**To load centerlized content from S3 */
  getCenterlizedJSONData() {
    const url = `${S3_BUCKET_PATH}assets/json/centralized-info.json`;
    return this.httpClient.get(url);
  }
  /**To get AI travelAgent copysource list to display AI travelAgent widget to those copysources only */
  getAItravelAgentJSONData() {
    const url = `${S3_BUCKET_PATH}assets/json/AI-travelAgent-info.json`;
    return this.httpClient.get(url);
  }

}
