import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { S3_BUCKET_PATH } from '@app/general/services/api/api-paths';
import { map } from 'rxjs/operators';
import { ApiService } from './api/api.service';
import { PROXY_MM_PARTNER_REWARDS, PROXY_SERVER_PATH, PROXY_MM_FAMILYCOMPOSITION, PROXY_REDEEM_PARTNER_REWARDS, PROXY_MM_REFRESH_SESSION } from './api/api-paths';
import { MeiliIntegrationService } from './meili-integration.service';
import { isInternational } from './../../flights/utils/search-data.utils';
import { UniversalStorageService } from '@app/general/services/universal-storage.service';

@Injectable({
  providedIn: 'root',
})
export class MomentumApiService {
  private baseUrl = 'https://partner-proxy-test-80142608037.europe-west2.run.app/';
  private ssoUrl = 'https://partner-proxy-test-80142608037.europe-west2.run.app/v2/sso/login';
  // private ssoUrl = 'https://webpre.multiply.co.za/multiply-api-gateway/travel/singleSignOn/v2';
  // private bearerToken = 'Bearer vOOFHmgONRU8pYc+aEEMXfUw6csRPfhtj4wyq2wImP8=';

  constructor(private http: HttpClient, private apiService: ApiService, private meiliIntegrationService: MeiliIntegrationService, private storage: UniversalStorageService) {}

  refreshToken(sessionId: string) {
    return this.http.get(`${PROXY_SERVER_PATH}${PROXY_MM_REFRESH_SESSION}?session_id=${sessionId}`);
  }

  // Single Sign-On: Generate Session ID and Redirect URL
  generateSessionId(clientNumber: string): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const payload = { clientNumber };
    return this.http.get(`${this.ssoUrl}?client_number=${clientNumber}`, { headers });
  }

  // Get Family Composition
  getFamilyComposition(sessionId: string): Observable<any> {
    const url = `${PROXY_SERVER_PATH}${PROXY_MM_FAMILYCOMPOSITION}`;
    const payload = { sessionId: sessionId };
    return this.http.post(url, payload);
  }

  // Get Partner Rewards
  getPartnerRewards(sessionId: string, payload: any): Observable<any> {
    const url = `${PROXY_SERVER_PATH}${PROXY_MM_PARTNER_REWARDS}?session_id=${sessionId}`
    return this.http.post(url, payload);
  }

  // Redeem Partner Rewards
  redeemPartnerRewards(sessionId: string, payload: any): Observable<any> {
    const url = `${PROXY_SERVER_PATH}${PROXY_REDEEM_PARTNER_REWARDS}?session_id=${sessionId}`;
    return this.http.post(url, payload);
  }

  transformResponse(newResponse: any): any {
    const titleMapping: any = { M: 'Mr', F: 'Ms' };
    const members = newResponse.members || [];

    const travellerList = members.map((member: any) => {
      const birthDate = new Date(member.birthDate);

      // Generate travellerId by combining Title, FirstName, and Surname
      const nameTitle = titleMapping[member.gender] || 'Mr';
      const givenName = member.firstName || '';
      const surname = member.surname || '';
      const travellerId = `${nameTitle}${givenName}${surname}`.toUpperCase();

      return {
        idNumber: member.idNumber,
        clientNumber: member.clientNumber,
        role: member.role,
        travellerId: travellerId,
        passengerType: 10,
        gender: member.gender === 'M' ? 'Male' : 'Female',
        uniqueTravalerId: '',
        birthDate: birthDate.toLocaleDateString('en-US', {
          month: 'short',
          day: '2-digit',
          year: 'numeric',
        }),
        email: '',
        mealOption: '',
        seatPreference: '',
        seatMappingList: <any>[],
        personName: {
          nameTitle: '',
          givenName: givenName,
          middleName: '',
          surname: surname,
        },
        telephoneList: <any>[],
        address: {
          streetNmbr: '',
          bldgRoom: '',
          addressLine: '',
          cityName: '',
          postalCode: '',
          countryName: '',
          countryCode: '',
        },
        passport: {
          passportNumber: '',
          docIssueCountry: '',
          docHolderNationality: '',
          effectiveExpireOptionalDate: '',
        },
        ffpList: <any>[],
        paxType: member.role === 'PRINCIPAL' ? 'ADULT' : 'CHILD',
        day: birthDate.getDate(),
        month: birthDate.getMonth() + 1,
        year: birthDate.getFullYear(),
        paxSelected: false,
        accommodationLimits: member.accommodationLimits || {},
        carhireLimits: member.carhireLimits || {},
        domesticFlightLimit: member.domesticFlightLimit || {},
        internationalTravelLimits: member.internationalTravelLimits || {},
      };
    });

    return { travellerList };
  }

  // Method to process the input response and create the required object
  createContact_MMObject(response: any): any {
    const outputObject: any = {
      contactInfo: {
        birthDate: '',
        email: '',
        personName: {
          nameTitle: '',
          givenName: '',
          middleName: '',
          surname: '',
        },
        telephoneList: [
          {
            phoneTech: '',
            countryAccessCode: '',
            areaCityCode: '',
            phoneNumber: '',
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
      },
    };

    if (response && response.members && Array.isArray(response.members)) {
      const loggedMember = response.members.find(
        (member: any) => member.clientNumber === response.loggedInClientNumber
      );
      /**here to get pricipal role member details  */
      const principalMember = response.members.find(
        (member: any) => member.role === 'PRINCIPAL'
      );
      if (loggedMember) {
        outputObject.contactInfo.email = principalMember.emailAddress || loggedMember.emailAddress || '';
        outputObject.contactInfo.personName.givenName = loggedMember.firstName || '';
        outputObject.contactInfo.personName.surname = loggedMember.surname || '';
        outputObject.contactInfo.telephoneList[0].phoneNumber = loggedMember.mobileNumber || '';
        outputObject.contactInfo.telephoneList[0].countryAccessCode = '';
        outputObject.contactInfo.telephoneList[0].areaCityCode = '';
      }
    }

    return outputObject;
  }

  transformMmfResponse(mmfResponseObj: any): any {
    return {
      data: {
        userAgent: null,
        appToken: null,
        username: null,
        password: null,
        socialToken: null,
        provider: null,
        email: null,
        firstName: mmfResponseObj?.data?.signinResponse?.firstName ?? null,
        surname: mmfResponseObj?.data?.signinResponse?.surname ?? null,
        token: mmfResponseObj?.data?.signinResponse?.token ?? null,
        status: mmfResponseObj?.data?.subscriptionStatus ?? null,
        isFirstTimeLogin: null,
        isBusinessAccount: mmfResponseObj?.data?.signinResponse?.isBusinessAccount ?? null,
        authorizationCode: null,
        providerId: null,
        refreshToken: mmfResponseObj?.data?.signinResponse?.refreshToken ?? null,
        subscriptionResponse: {
          id: mmfResponseObj?.data?.id ?? null,
          userId: mmfResponseObj?.data?.userId ?? null,
          planName: mmfResponseObj?.data?.planName ?? null,
          subscriptionStatus: mmfResponseObj?.data?.subscriptionStatus ?? null,
          autoRenew: mmfResponseObj?.data?.autoRenew ?? null,
          wallet: {
            walletId: mmfResponseObj?.data?.wallet?.walletId ?? null,
            loyaltyVoucherBalances:
              mmfResponseObj?.data?.wallet?.loyaltyVoucherBalances?.map((balance: any) => ({
                totalVoucherBalance: balance?.totalVoucherBalance ?? 0,
                currency: balance?.currency ?? null,
                loyaltyFlightVoucherBalance: {
                  totalVoucherBalance: balance?.loyaltyFlightVoucherBalance?.totalVoucherBalance ?? 0,
                  loyaltyVoucherList:
                    balance?.loyaltyFlightVoucherBalance?.loyaltyVoucherList?.map((voucher: any) => ({
                      voucherId: voucher?.voucherId ?? null,
                      voucherType: voucher?.voucherType ?? null,
                      voucherCode: voucher?.voucherCode ?? null,
                      amount: voucher?.amount ?? 0,
                      currency: voucher?.currency ?? null,
                      validFrom: voucher?.validFrom ?? null,
                      validUntil: voucher?.validUntil ?? null,
                      regionalityType: voucher?.regionalityType ?? null,
                      voucherStatus: voucher?.voucherStatus ?? null,
                      usageType: voucher?.usageType ?? null,
                    })) ?? [],
                },
                loyaltyHotelVoucherBalance: {
                  totalVoucherBalance: balance?.loyaltyHotelVoucherBalance?.totalVoucherBalance ?? 0,
                  loyaltyVoucherList:
                    balance?.loyaltyHotelVoucherBalance?.loyaltyVoucherList?.map((voucher: any) => ({
                      voucherId: voucher?.voucherId ?? null,
                      voucherType: voucher?.voucherType ?? null,
                      voucherCode: voucher?.voucherCode ?? null,
                      amount: voucher?.amount ?? 0,
                      currency: voucher?.currency ?? null,
                      validFrom: voucher?.validFrom ?? null,
                      validUntil: voucher?.validUntil ?? null,
                      regionalityType: voucher?.regionalityType ?? null,
                      voucherStatus: voucher?.voucherStatus ?? null,
                      usageType: voucher?.usageType ?? null,
                    })) ?? [],
                },
              })) ?? [],
            loyaltyPointsBalance: mmfResponseObj?.data?.wallet?.loyaltyPointsBalance ?? [],
          },
          nextBillingNotificationDate: mmfResponseObj?.data?.nextBillingNotificationDate ?? null,
          expirationDate: mmfResponseObj?.data?.expirationDate ?? null,
          message: mmfResponseObj?.data?.message ?? null,
        },
        isTSPlusSubscriber: mmfResponseObj?.data?.planName === 'TSPLUS',
        isTSPlusSubscriptionActive: mmfResponseObj?.data?.subscriptionStatus === 'ACTIVE',
      },
      code: mmfResponseObj?.code ?? null,
      result: mmfResponseObj?.result ?? null,
    };
  }

  private modifyResponse(response: any): any {
    // Helper function to calculate age
    const calculateAge = (birthDate: string): number => {
      const birth = new Date(birthDate);
      const today = new Date();
      const age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();
      const dayDiff = today.getDate() - birth.getDate();
      return monthDiff > 0 || (monthDiff === 0 && dayDiff >= 0) ? age : age - 1;
    };

    // Helper function to create a member
    const createMember = (birthDate: string, firstName: string, surname: string, role: string) => {
      const ageInYears = calculateAge(birthDate);
      let paxType: string;

      if (ageInYears >= 16) paxType = 'ADULT';
      else if (ageInYears >= 12) paxType = 'YOUNGADULT';
      else if (ageInYears > 2) paxType = 'CHILD';
      else paxType = 'INFANT';

      return {
        role,
        idNumber: Math.random().toString(36).substr(2, 13), // Generate a random ID
        clientNumber: Math.random().toString(36).substr(2, 13),
        birthDate,
        initials: firstName.charAt(0),
        gender: role === 'PRINCIPAL' ? 'M' : 'F',
        surname,
        firstName,
        emailAddress: `${firstName.toLowerCase()}@example.com`,
        mobileNumber: '0834416441',
        carhireLimits: { carDaysAllocated: 40, carDaysRemaining: 40, carDaysUsed: 0 },
        domesticFlightLimit: {
          totalNumberOfDomesticFlights: 6,
          numberOfDomesticFlightsUsed: 0,
          numberOfDomesticFlightsRemaining: 6,
        },
        internationalTravelLimits: {
          totalNumberOfInternationalFlights: 2,
          numberOfInternationalFlightsUsed: 0,
          numberOfInternationalFlightsRemaining: 2,
        },
        accommodationLimits: { hotelDaysAllocated: 40, hotelDaysRemaining: 40, hotelDaysUsed: 0 },
        paxType,
        paxSelected: false,
        isSelected: false,
        paxTypeCount: 1,
      };
    };

    // PRINCIPAL role already exists; assign other roles to new members
    response.data?.familyCompositionMultiplyResponse?.members.push(
      createMember('2017-07-15', 'John', 'DoeChild', 'DEPENDENT'), // Child (age 13)
      createMember('2023-02-25', 'Emma', 'DoeInfant', 'DEPENDENT'), // Infant (age 2)
      createMember('2012-04-12', 'Liam', 'DoeYoung', 'DEPENDENT') // Young Adult (age 17)
    );

    return response;
  }

  affIdAsPerSpendLimits(code: string, isAlertUser?:boolean, tripSelected?:any): any {
    const primaryTraveler = this.meiliIntegrationService.getPrimaryUser();

    if (!primaryTraveler) {
      return code;
    }
    const flightSearchInfo = this.storage.getItem('flightsearchInfo', 'session');
    if (!flightSearchInfo) {
      return code;
    }
    const parsedFlightSearchInfo = JSON.parse(flightSearchInfo);
    const isIntl = isInternational(parsedFlightSearchInfo);

    // Determine the remaining flight limits based on itinerary type
    const spendLimit = isIntl
      ? this.meiliIntegrationService.getTravelLimitsStatus()?.internationalTravelLimits
      : this.meiliIntegrationService.getTravelLimitsStatus()?.domesticFlightLimit;

      const isDomesticReturn = !isIntl && (tripSelected ? tripSelected === 'return': parsedFlightSearchInfo?.tripType === 'return');
      if(spendLimit && isDomesticReturn && this.storage.getItem('mmfTravellerData', 'session')){
        const selPaxList = JSON.parse(this.storage.getItem('mmfTravellerData', 'session'));
        const checkSpendLimits = selPaxList.every((t: any) => t.domesticFlightLimit?.numberOfDomesticFlightsRemaining >= 2);
        return !checkSpendLimits ? `${code}0` : code;
      }
    return !spendLimit ? `${code}0` : code;
  }
  
}
