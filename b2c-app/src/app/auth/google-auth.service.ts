import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

declare const gapi: any;

@Injectable({
  providedIn: 'root'
})
export class GoogleAuthService {
  private clientId = '119943617884-q8pjfsgga9i4qndfk388b2kbcdhtgq9j.apps.googleusercontent.com';
  private authInstance: any;
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.loadGapiClient();
  }

  private loadGapiClient(): void {
    if (!this.isBrowser) return;
    const onLoad = () => {
      gapi.load('auth2', () => {
        this.authInstance = gapi.auth2.init({
          client_id: this.clientId,
          scope: 'profile email openid https://www.googleapis.com/auth/userinfo.email'
        });
      });
    };

    if (typeof gapi === 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = onLoad;
      document.body.appendChild(script);
    } else {
      onLoad();
    }
  }

  async signIn(): Promise<any> {
    if (!this.authInstance) {
      throw new Error('Google Auth instance not initialized');
    }

    const googleUser = await this.authInstance.signIn();

    const profile = googleUser.getBasicProfile();
    const response = googleUser.getAuthResponse(true); 

    return {
      id: profile.getId(),
      name: profile.getName(),
      email: profile.getEmail(),
      photoUrl: profile.getImageUrl(),
      firstName: profile.getGivenName(),
      lastName: profile.getFamilyName(),
      authToken: response.access_token,
      idToken: response.id_token,
      response: response,
      provider: 'GOOGLE'
    };
  }

  signOut(): void {
    this.authInstance?.signOut();
  }
}
