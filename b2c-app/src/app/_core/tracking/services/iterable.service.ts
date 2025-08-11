import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {
  initialize,
  getInAppMessages,
  track,
  trackInAppClick,
  trackInAppClose,
  trackInAppOpen,
  updateUser,
  updateUserEmail
} from '@iterable/web-sdk';
import { SessionUtils } from './../../../general/utils/session-utils';
import { ApiService } from '../../../general/services/api/api.service';
import { PROXY_SERVER_PATH, PROXY_ITERABLE_JWT_TOKEN } from '../../../general/services/api/api-paths';
import { UniversalStorageService } from '@app/general/services/universal-storage.service';

@Injectable({
  providedIn: 'root'
})
export class IterableService {
  //private apiKey = '418fd60df2634ca4a802042d69f46956';
  //private apiKey = 'c57a8715cce44f019907ff582f148a75';
  //private jwtEndpoint = 'https://partner-proxy-test-80142608037.europe-west1.run.app/jwt/generate/';
  //private jwtEndpoint = 'https://beta-b2b-admin.travelstart.com/jwt/generate/';
  //private jwtEndpoint = 'http://192.168.11.104:3000/iterable/generate-jwt';
  private jwtToken: string | null = null;
  private authInstance: any;
    iterableEndpoint = 'https://api.eu.iterable.com/api';
  registerBrowserToken = '/users/registerBrowserToken';

  constructor(private http: HttpClient, private sessionUtils: SessionUtils, private apiService: ApiService, private storage: UniversalStorageService,) {
    this.authInstance = initialize(this.apiService.iterableAPIKEY(), this.generateJWT);
  }

  /**
   * Fetch user email or fallback to correlation ID
   */
  public fetchUser(): string {
    try {
      const userInfo = this.storage.getItem('credentials', 'session');
      return JSON.parse(userInfo || '{}')?.data?.contactInfo?.email || this.sessionUtils.getCorrelationId();
    } catch (error) {
      console.error('Error fetching user:', error);
      return this.sessionUtils.getCorrelationId();
    }
  }

  /**
   * Generate JWT for authentication
   */
  public generateJWT = async (): Promise<string> => {
    try {
      const country = this.apiService.extractCountryFromDomain(); 
      const user = this.fetchUser();
      const payload = { payload: this.storage.getItem('credentials', 'session') ? { email: user, country: country} : { userId: user, country: country} };       
      // const url = this.apiService.iterableProxyUrl();
      const url = `${PROXY_SERVER_PATH}${PROXY_ITERABLE_JWT_TOKEN}`;
      const response = await this.http.post<{ token: string }>(url, payload).toPromise();
      this.jwtToken = response?.token || null;
      return this.jwtToken || '';
    } catch (error) {
      console.error('Failed to fetch JWT:', error);
      return '';
    }
  };

  public generateJWT1 = async (emailId?: string): Promise<string> => {
      try {
        let payload: { email?: string; userId?: string, country: String };
        const country = this.apiService.extractCountryFromDomain();
        if (emailId) {
          // If email is passed, use it
          payload = { email: emailId, country: country };
        } else {
          const user = this.fetchUser();

          // Decide based on sessionStorage
          if (this.storage.getItem('credentials', 'session')) {
            payload = { email: user, country: country };
          } else {
            payload = { userId: user, country: country };
          }
        }
        const payload1 = { payload: payload };
         const url = this.apiService.iterableProxyUrl();
        const response = await this.http
          .post<{ token: string }>(url, payload1)
          .toPromise();

        this.jwtToken = response?.token || null;
        return this.jwtToken || '';
      } catch (error) {
        return '';
      }
    };

  /**
   * Set user email or fallback to user ID
   */
  async setUserEmail(email?: any) { 
    if(email != null){
      return this.authInstance.setEmail(email, this.jwtToken);
    }else if (this.storage.getItem('credentials', 'session')) {
      return this.authInstance.setEmail(this.fetchUser(), this.jwtToken);
    } 
    return this.setUserID(this.fetchUser());
  }

  /**
   * Set user by ID
   */
  async setUserID(userID: string) {
    return this.authInstance.setUserID(userID);
  }

  /**
   * Logout user
   */
  logout() {
    this.authInstance.logout();
  }

  /**
   * Fetch in-app messages
   */
  async fetchInAppMessages(count: number = 10) {
    return getInAppMessages({ count, packageName: 'my-website' });
  }

  /**
   * Track a custom event
   */
  async trackEvent(eventName: string, data: any = {}) {
    return track({ eventName, dataFields: data });
  }

  /**
   * Track in-app message interactions
   */
  async trackInAppClick(messageId: string) {
    return trackInAppClick({ messageId, deviceInfo: { appPackageName: 'b2c-website' } });
  }

  async trackInAppClose(messageId: string) {
    return trackInAppClose({ messageId, deviceInfo: { appPackageName: 'b2c-website' } });
  }

  async trackInAppOpen(messageId: string) {
    return trackInAppOpen({ messageId, deviceInfo: { appPackageName: 'b2c-website' } });
  }

  /**
   * Update user information
   */
  async updateUser(data: any) {
    return updateUser({ dataFields: data });
  }

  /**
   * Update user email
   */
  async updateUserEmail(newEmail: string) {
    return updateUserEmail(newEmail);
  }
   /**register browser token  */
  registerBrowserTokenData(tokenID :any){
    let browserToken = tokenID;
    if(browserToken){
    const Url = `${this.iterableEndpoint}${this.registerBrowserToken}`
    let payload = {
        browserToken: browserToken,
        email: this.fetchUser(),
        userId: this.sessionUtils.getCorrelationId()
      }
    const header = new HttpHeaders().set('api-key',  `${this.apiService.iterableAPIKEY()}`)
    return this.http.post(Url, payload,{ headers: header })
    }
  }
}
