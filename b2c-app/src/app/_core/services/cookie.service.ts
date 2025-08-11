import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { DOCUMENT } from '@angular/common';
import { REQUEST, RESPONSE } from '@nguniversal/express-engine/tokens';

@Injectable({
  providedIn: 'root',
})
export class CookieStorageService  {
  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    @Inject(DOCUMENT) private document: Document,
    @Inject(REQUEST) private request: any,
    @Inject(RESPONSE) private response: any
  ) {}

  getCookie(name: string): string | null {
    if (isPlatformBrowser(this.platformId)) {
      const match = this.document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
      return match ? decodeURIComponent(match[2]) : null;
    }

    if (isPlatformServer(this.platformId)) {
      const cookies = this.request?.headers?.cookie || '';
      const match = cookies.match(new RegExp('(^| )' + name + '=([^;]+)'));
      return match ? decodeURIComponent(match[2]) : null;
    }

    return null;
  }

  setCookie(name: string, value: string, days: number = 1): void {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    const cookieStr = `${name}=${encodeURIComponent(value)}; Path=/; Expires=${expires}; Secure; SameSite=Strict`;
  
    if (isPlatformBrowser(this.platformId)) {
      this.document.cookie = cookieStr;
    }
  
    if (isPlatformServer(this.platformId)) {
      this.response?.cookie?.(name, value, {
        maxAge: days * 86400000,
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        path: '/',
      });
    }
  }
  

  deleteCookie(name: string): void {
    this.setCookie(name, '', -1);
  }
}
