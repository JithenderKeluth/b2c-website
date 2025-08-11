import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PTIDService } from '@core/services/ptid.service';
import { ErrorPopupComponent, ErrorPopupData } from '@app/_shared/components/error-popup/error-popup.component';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { PROXY_SERVER_PATH, PROXY_MM_REDEMPTION } from './api/api-paths';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ApiService } from '@app/general/services/api/api.service';
import { UniversalStorageService } from '@app/general/services/universal-storage.service';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class MeiliIntegrationService {
  private sectionVisibility = new BehaviorSubject<Record<string, boolean>>({});
  sectionVisibility$ = this.sectionVisibility.asObservable();
  private isBrowser: boolean;

  private urlSubject: BehaviorSubject<string>;
  public url$;

  constructor(
    private ptidService: PTIDService,
    private dialog: MatDialog,
    private http: HttpClient,
    private apiService: ApiService,
    private storage: UniversalStorageService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);

    // Fix: Avoid accessing window directly in SSR
    const initialUrl = this.isBrowser ? window.location.href : '';
    this.urlSubject = new BehaviorSubject<string>(initialUrl);
    this.url$ = this.urlSubject.asObservable();
  }

  encodeToBase64(data: any): string {
    const jsonString = JSON.stringify(data);
    return btoa(jsonString);
  }

  updateSectionVisibility(section: string, isVisible: boolean): void {
    const currentVisibility = this.sectionVisibility.value;
    this.sectionVisibility.next({ ...currentVisibility, [section]: isVisible });
  }

  updateUrl(newUrl: string): void {
    this.urlSubject.next(newUrl);
  }

  getMeiliData(meili_B2BInfo?: any): any {
    const ptid = this.ptidService.getPTID();
    return {
      ptid: ptid,
      locale: 'en-ZA',
      currency: 'ZAR',
      queryData: this.encodeToBase64(this.getQueryData(meili_B2BInfo)),
    };
  }

  getQueryData(meili_B2BInfo?: any) {
    let userData: any;
    if (this.storage.getItem('mmfTravellerData', 'session')) {
      userData = JSON.parse(this.storage.getItem('mmfTravellerData', 'session'));
    }
    let currencyCode = this.storage.getItem('currencycode', 'session') || null;
    const travelData = this.getTravelData();
    const travelers = userData || [];
    let primaryTraveler = travelers.length > 0 ? travelers[0] : null;

    let queryData: any = {
      numberOfPassengers: travelers.length,
      departureAirport: travelData?.departAirport,
      arrivalAirport: travelData?.arrivalAirport,
      airlineFareAmount: travelData?.fare,
      airlineFareCurrency: currencyCode,
      email: userData?.data?.username,
      phoneNumbers:
        userData?.data?.contactInfo?.telephoneList?.length > 0
          ? userData?.data?.contactInfo?.telephoneList[0]?.phoneNumber
          : null,
      firstName: primaryTraveler?.personName?.givenName,
      lastName: primaryTraveler?.personName?.surname,
    };

    if (meili_B2BInfo) {
      queryData = { ...queryData, ...meili_B2BInfo };
      const popupDataStr = `(roseId:  ${queryData.additionalData.roseId}) || (avisAssignedNumber: ${queryData.additionalData.avisAssignedNumber}) ||  (iataNumber : ${queryData.iataNumber}) || (corporateCode: ${queryData.corporateCode}) || (agentId : ${queryData.agentId})`;
      this.showError(popupDataStr);
    }

    if (this.apiService.extractCountryFromDomain() === 'MM') {
      let momentumData = {
        partnerLoyaltyAccount: primaryTraveler?.idNumber,
        partnerLoyaltyAccountTier: this.checkingCarSpendLimit(this.getTierInfo()?.activeCode) || 'Alpha',
      };
      queryData = { ...queryData, ...momentumData };
    }  
    return queryData;
  }

  checkingCarSpendLimit(code: string): string {
    const primaryTraveler = this.getPrimaryUser();
    if (!primaryTraveler) return code;
    const carDaysRemaining = this.getTravelLimitsStatus()?.carhireLimits;
    return !carDaysRemaining ? `${code}0` : code;
  }

  calculateAge(birthDate: any) {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }

  getTravelData() {
    let searchInfo: any;
    let itinerary: any;
    if (this.storage.getItem('flightsearchInfo', 'session')) {
      searchInfo = JSON.parse(this.storage.getItem('flightsearchInfo', 'session'));
    }
    if (this.storage.getItem('bookingDetails', 'session')) {
      searchInfo.bookingInformation = JSON.parse(this.storage.getItem('bookingDetails', 'session'));
      itinerary = searchInfo.bookingInformation.itineraries;
      searchInfo.departAirport = itinerary[0].odoList[0].segments[0].origCode;
      searchInfo.arrivalAirport =
        itinerary[0].odoList[0].segments[itinerary[0].odoList[0].segments.length - 1].destCode;
      searchInfo.fare = itinerary[0]?.fareBreakdown;
    }
    return searchInfo;
  }

  getPrimaryUser() {
    let userData: any;
    if (this.storage.getItem('credentials', 'session')) {
      userData = JSON.parse(this.storage.getItem('credentials', 'session'));
    }
    const travelers = userData?.data?.travellerList || [];
    let primaryTraveler = travelers.find(
      (t: any) => t.clientNumber === userData?.data?.loggedInClientNumber
    );
    if (!primaryTraveler) {
      primaryTraveler = travelers.find((t: any) => this.calculateAge(t.birthDate) > 18) || travelers[0];
    }
    return primaryTraveler;
  }

  getTravelLimitsStatus(): {
    accommodationLimits: boolean;
    carhireLimits: boolean;
    domesticFlightLimit: boolean;
    internationalTravelLimits: boolean;
  } {
    let response: any;
    if (this.storage.getItem('credentials', 'session')) {
      response = JSON.parse(this.storage.getItem('credentials', 'session'));
    }

    const travellers = response?.data?.travellerList || [];
    const carAdultTravellers = travellers.filter((x: any) => x.paxType == 'ADULT');
    return {
      accommodationLimits: travellers.every((t: any) => t.accommodationLimits?.hotelDaysRemaining > 0),
      carhireLimits: carAdultTravellers.every((t: any) => t.carhireLimits?.carDaysRemaining > 0),
      domesticFlightLimit: travellers.every((t: any) => t.domesticFlightLimit?.numberOfDomesticFlightsRemaining > 0),
      internationalTravelLimits: travellers.every(
        (t: any) => t.internationalTravelLimits?.numberOfInternationalFlightsRemaining > 0
      ),
    };
  }

  showError(errMsg: any): void {
    const popupData: ErrorPopupData = {
      header: 'Error Occurred',
      imageUrl: 'assets/icons/Icon/Negative-scenarios/dummy_error_icon.svg',
      message: errMsg,
      buttonText: 'Ok',
      showHeader: false,
      showImage: false,
      showButton: true,
      onButtonClick: () => {
        console.log('button clicked');
      },
    };

    this.dialog.open(ErrorPopupComponent, {
      width: '360px',
      data: popupData,
    });
  }

  getTierInfo() {
    let matchedTier: any = null;
    const tiers = JSON.parse(this.storage.getItem('appCentralizedInfo', 'session'))?.tiers;
    const planDescription = JSON.parse(this.storage.getItem('credentials', 'session'))?.data?.planDescription;

    tiers.find((tier: any) => {
      if (planDescription?.includes(tier.name)) {
        matchedTier = tier;
      } else if (tier.name == 'Free') {
        matchedTier = tier;
      }
    });

    return matchedTier;
  }

  momentumRedemption(sessionId: any, reqData: any) {
    let Url = `${PROXY_SERVER_PATH}${PROXY_MM_REDEMPTION}`;
    return this.http.post(Url, reqData);
  }

  private headersTabInfo = new BehaviorSubject(null);
  currentHeadersTabInfo = this.headersTabInfo.asObservable();

  updateHeadersTabInfo(value: any) {
    this.headersTabInfo.next(value);
  }
}
