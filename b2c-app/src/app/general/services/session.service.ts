import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { UniversalStorageService } from '@app/general/services/universal-storage.service';
import { ApiService } from './api/api.service';

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  private sessionId: string;
  private sessionDataSubject = new BehaviorSubject<any>(null);

  constructor(private apiService: ApiService, private storage: UniversalStorageService) {
    // Initialize with data from sessionStorage if available
    const initialData = this.storage.getItem('credentials', 'session');
    if (initialData) {
      this.sessionDataSubject.next(JSON.parse(initialData));
    }
  }

  // Set the session ID
  setSessionId(sessionId: string): void {
    this.sessionId = sessionId;
  }

  // Get the session ID
  getSessionId(): string {
    return this.sessionId;
  }

  // Observable for session data
  get sessionData$() {
    return this.sessionDataSubject.asObservable();
  }

  // Update session data and notify subscribers
  updateSessionData(key: string, value: any): void {
    this.storage.setItem(key, JSON.stringify(value), 'session');
    this.sessionDataSubject.next(value); // Notify subscribers
  }
  /**here to get data when  user loggedIn or logout */
  private userloggedSession = new BehaviorSubject(null);
  userLoggedInfo = this.userloggedSession.asObservable();

  userLoginSession(value: any) {
    this.userloggedSession.next(value);
  }
  getUserCredentials(){
    let credentials = null;
    if (this.storage.getItem('credentials', 'session')) {
      credentials = JSON.parse(this.storage.getItem('credentials', 'session'));
    } else if (this.storage.getItem('credentials', 'local')) {
      credentials = JSON.parse(this.storage.getItem('credentials', 'local'));
    }
    return credentials;
  }

  setStorageDataInSession(res: any, saveLocalStorage: any){
      // Check if the current domain is for ABSA client
      if(this.apiService.extractCountryFromDomain() == 'ABSA'){
        // Retrieve previously stored credentials from sessionStorage
        const storedCredential = JSON.parse(this.storage.getItem('credentials', 'session') || '{}');
        
        // Extract userID and email from the stored credentials
        const userID = storedCredential?.data?.userID;
        const email = storedCredential?.data?.absaEmailID;

        // If the new response has a data object, bind the userID and email
        if (res?.data) {
          // Set userID at the root of the data object
          //res.data.userID = userID;
          res.data.travellerID = userID;

          // Update contactInfo.email while preserving existing contactInfo fields
          res.data.contactInfo = {
            ...res.data.contactInfo,
            email: email
          };
        }
        res.data.absaEmailID = email;
        
        // Clean up old credentials from both sessionStorage and localStorage
        this.storage.removeItem('credentials');
        this.storage.removeItem('credentials');
      }else{
        
        this.storage.removeItem('credentials');
        this.storage.removeItem('credentials');
      }

      if (saveLocalStorage == true) {
          this.storage.setItem('credentials', JSON.stringify(res), 'session');
          this.storage.setItem('credentials', JSON.stringify(res), 'local');
        } else {
          this.storage.setItem('credentials', JSON.stringify(res), 'session');
        }
  }
}
