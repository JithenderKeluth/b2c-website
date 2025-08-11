import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { SessionService } from './session.service';
import { ApiService } from '@app/general/services/api/api.service';
import { ABSA_USER_PATH, PROXY_SERVER_PATH, PROXY_ABSA_USER } from '@app/general/services/api/api-paths';
import { WindowReferenceService } from '@core/services/window-reference.service';
import { Router } from '@angular/router';
import { MyAccountServiceService } from '../../my-account/my-account-service.service';
import { UniversalStorageService } from '@app/general/services/universal-storage.service';

declare global {
  interface Window {
    sessionData?: {
      status?: string;
      session_id?: string;
      cpysource?: string;
    };
  }
}

/**
 * Interface representing a person's name.
 */
interface PersonName {
  nameTitle: string;
  givenName: string;
  middleName: string;
  surname: string;
};

/**
 * Interface representing an address.
 */
interface Address {
  streetNmbr: string;
  bldgRoom: string;
  addressLine: string;
  cityName: string;
  postalCode: string;
  countryName: string;
  countryCode: string;
};

/**
 * Interface representing contact information of a user.
 */
interface ContactInfo {
  birthDate: string;
  email: string;
  personName: PersonName;
  telephoneList: any[]; // You can define this further if needed
  address: Address;
};

/**
 * Interface representing user data.
 */
interface UserData {
  userAgent: string | null;
  appToken: string | null;
  username: string;
  password: string | null;
  socialToken: string | null;
  provider: string;
  email: string | null;
  firstName: string;
  surname: string;
  contactInfo: ContactInfo;
  travellerList: any[];
  paymentCardList: any[];
  token: string;
  status: string;
  isFirstTimeLogin: boolean;
  itineraryIdList: any[];
  isBusinessAccount: boolean;
  authorizationCode: string | null;
  providerId: string | null;
  refreshToken: string | null;
  subscriptionResponse: any;
  isTSPlusSubscriber: boolean;
  isTSPlusSubscriptionActive: boolean;
  travellerID: String | null;
  absaEmailID: String | null;
};

/**
 * Interface representing the structure of a logged-in user.
 */
interface loggedUserInterface {
  data: UserData;
  code: number;
  result: string;
}

@Injectable({
  providedIn: 'root',
})
export class AbsaAuthService {
  private window: any;
  
  constructor(
    private http: HttpClient , 
    private sessionService: SessionService , 
    private apiservice: ApiService , 
    private _windowRef: WindowReferenceService,
    private router: Router,
    private myacountService: MyAccountServiceService,
    private storage: UniversalStorageService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    if (this.isBrowser()){
      this.window = this._windowRef.nativeWindow;
    }
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

   /**
   * Fetches the session ID and attempts auto-login for the user.
   */
   async fetchSessionId(): Promise<void> {
    if (!this.isBrowser()) return;
    return new Promise(async (resolve, reject) => {
      if (this.apiservice.extractCountryFromDomain() === 'ABSA') {
        try {
          this.storage.removeItem('credentials');
          this.storage.removeItem('credentials');
  
          const sessionIDFromURL = this.getSessionIdFromCurrentUrl();
  
          if (sessionIDFromURL) {
            try {
              const userData = await this.getAbsaUserDetails(sessionIDFromURL);
              this.autoLoginAbsaUser(userData);
              resolve();
            } catch (error) {
              reject(error); // ✅ properly reject on inner error
            }
          } else {
            const sessionData = this.getSessionData();
            const windowSessionData: any = window.sessionData;
  
            if (!sessionData) {
              if (windowSessionData?.status === "error") {
                alert(windowSessionData?.errorMessage);
                this.router.navigateByUrl('/absa-complete-journey');
                return resolve();
              } else if (windowSessionData?.status === "success") {
                this.storage.setItem('session_id', JSON.stringify(windowSessionData.session_id), 'session');
                this.storage.setItem('cpysource', JSON.stringify(windowSessionData.cpysource), 'session');
                const sessionId = windowSessionData.session_id;
  
                setTimeout(async () => {
                  try {
                    const userData = await this.getAbsaUserDetails(sessionId);
                    this.autoLoginAbsaUser(userData);
                    resolve();
                  } catch (error) {
                    reject(error); // ✅ handle async error inside setTimeout
                  }
                }, 500);
              } else {
                console.warn("Authentication status unknown ...");
                this.router.navigateByUrl('/absa-complete-journey');
                return resolve();
              }
            } else {
              try {
                const storedSessionId = this.extractSessionId(sessionData.session_id);
                const userData = await this.getAbsaUserDetails(storedSessionId!);
                this.autoLoginAbsaUser(userData);
                resolve();
              } catch (error) {
                reject(error); // ✅ propagate error properly
              }
            }
          }
        } catch (error) {
          console.error("fetchSessionId outer error:", error);
          reject(error);
        }
      } else {
        resolve(); // not ABSA country
      }
    });
  }
  
  

   /**
   * Extracts the cpysource from the current URL parameters.
   * @returns The cpysource if found, otherwise null.
   */
   getCpySourceFromCurrentUrl(): any | null {
    if (!this.isBrowser()) return;
    return new URLSearchParams(window.location.search).get('cpysource');
  }
   /**
   * Extracts the session ID from the current URL parameters.
   * @returns The session ID if found, otherwise null.
   */
  getSessionIdFromCurrentUrl(): any | null {
    if (!this.isBrowser()) return;
    return new URLSearchParams(window.location.search).get('session_id');
  }

   /**
   * Fetches ABSA user details using the provided session ID.
   * @param sessionId - The session ID used to retrieve user details.
   * @returns A Promise resolving to user data.
   */
  async getAbsaUserDetails(sessionId:string) {
    if (!this.isBrowser()) return;
    const getUserURL = `${PROXY_SERVER_PATH}${PROXY_ABSA_USER}` ;
    const body = {
      sessionId : sessionId
    };

    try {
      const response: any = await this.http.post(getUserURL, body).toPromise(); 
      return response ;
    } catch (error) { 
      this.storage.removeItem('credentials');
      this.storage.removeItem('credentials');
      throw error;
    }

  }

   /**
   * Extracts the session ID from a redirect URL.
   * @param redirectURL - The URL containing the session ID.
   * @returns The session ID if found, otherwise null.
   */
  private extractSessionId(redirectURL: string): string | null {
    const url = new URL(redirectURL);
    return url.searchParams.get('session_id');
  }

  /**
   * Retrieves stored session data from sessionStorage.
   * @returns The stored session data if available, otherwise null.
   */
  private getSessionData(){
    try {
      return this.storage.getItem('session_id', 'session') ? JSON.parse(this.storage.getItem('session_id', 'session')) : null;
    } catch {
      return null;
    }
  }

  /**
   * Logs in the user automatically based on the provided user data.
   * @param userData - The user data obtained from the authentication process.
   */
  private autoLoginAbsaUser(userData:any){
    let loggedUser : loggedUserInterface = {
      "data": {
          "userAgent": null,
          "appToken": null,
          "username": userData.data?.absaUser?.email ,
          "password": null,
          "socialToken": null,
          "provider": "travelstart",
          "email": userData.data?.absaUser?.email,
          "firstName": userData.data?.absaUser?.firstName,
          "surname": userData.data?.absaUser?.lastName,
          "contactInfo": {
              "birthDate": "",
              "email": userData.data?.absaUser?.email,
              "personName": {
                  "nameTitle": userData.data?.signinResponse?.title,
                  "givenName": userData.data?.absaUser?.firstName,
                  "middleName": "",
                  "surname": userData.data?.absaUser?.lastName
              },
              "telephoneList": [userData.data?.absaUser?.phoneNumber],
              "address": {
                  "streetNmbr": "",
                  "bldgRoom": "",
                  "addressLine": "",
                  "cityName": "",
                  "postalCode": "",
                  "countryName": "",
                  "countryCode": ""
              }
          },
          "travellerList": [],
          "paymentCardList": [],
          "token": userData.data?.signinResponse?.token,
          "status": "ACTIVE",
          "isFirstTimeLogin": false,
          "itineraryIdList": [],
          "isBusinessAccount": userData.data?.signinResponse?.isBusinessAccount,
          "authorizationCode": null,
          "providerId": null,
          "refreshToken": userData.data?.signinResponse?.refreshToken,
          "subscriptionResponse": null,
          "isTSPlusSubscriber": false,
          "isTSPlusSubscriptionActive": false,
          "travellerID": userData.data?.absaUser?.travelerId, // userData.data?.absaUser?.id
          "absaEmailID":userData.data?.absaUser?.email
      },
      "code": 200,
      "result": "OK"
    }

   // Updating session data
   
    this.sessionService.updateSessionData('credentials', loggedUser);
    this.storage.setItem('credentials', JSON.stringify(loggedUser), 'local');
    this.sessionService.userLoginSession('userLoggedIn');

    this.getUserData(userData.data?.signinResponse?.token);

  }

  getUserData(refreshToken: any) {
    this.myacountService.getUserData(refreshToken).subscribe((res: any) => {
      if (res.data) {
        //store data in session storage & local storage
        this.sessionService.setStorageDataInSession(res, true);
      }
    });
  }

}