import { Injectable } from '@angular/core';
import { UniversalStorageService } from '@app/general/services/universal-storage.service';

export interface Credentials {
  // Customize received credentials here
  username: string;
  token: string;
  data: any;
}

const credentialsKey = 'credentials';

/**
 * Provides storage for authentication credentials.
 * The Credentials interface should be replaced with proper implementation.
 */
@Injectable({
  providedIn: 'root',
})
export class CredentialsService {
  public _credentials: Credentials | null = null;

  constructor(private storage: UniversalStorageService) {
  }

  /**
   * Checks is the user is authenticated.
   * @return True if the user is authenticated.
   */
  isAuthenticated(): boolean {
    return !!this.credentials;
  }

  /**
   * Gets the user credentials.
   * @return The user credentials or null if the user is not authenticated.
   */
  get credentials(){
    const savedCredentials = this.storage.getItem(credentialsKey, 'session') || this.storage.getItem(credentialsKey, 'local');
    if (savedCredentials) {
      this._credentials = JSON.parse(savedCredentials);
    }
    return this._credentials;
  }

  /**
   * Sets the user credentials.
   * The credentials may be persisted across sessions by setting the `remember` parameter to true.
   * Otherwise, the credentials are only persisted for the current session.
   * @param credentials The user credentials.
   * @param remember True to remember credentials across sessions.
   */
  setCredentials(credentials?: Credentials, remember?: boolean) {
    this._credentials = credentials || null;

    if (credentials) {
      const storage = remember ? localStorage : sessionStorage;
      storage.setItem(credentialsKey, JSON.stringify(credentials));
    } else {
      this.storage.removeItem(credentialsKey);
      this.storage.removeItem(credentialsKey);
      this.storage.removeItem('googleUserDetails');
      this.storage.removeItem('credentials');
      this.storage.removeItem('credentials');
    }
  }
}
