import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

const APP_PREFIX = 'ANMS-';

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  static loadInitialState(): any {
    if (typeof localStorage === 'undefined') return {}; // SSR safety

    return Object.keys(localStorage).reduce((state: any, storageKey) => {
      if (storageKey.includes(APP_PREFIX)) {
        const stateKeys = storageKey
          .replace(APP_PREFIX, '')
          .toLowerCase()
          .split('.')
          .map((key) =>
            key
              .split('-')
              .map((token, index) => (index === 0 ? token : token.charAt(0).toUpperCase() + token.slice(1)))
              .join('')
          );

        let currentStateRef = state;
        stateKeys.forEach((key, index) => {
          if (index === stateKeys.length - 1) {
            try {
              currentStateRef[key] = JSON.parse(localStorage.getItem(storageKey) || 'null');
            } catch {
              currentStateRef[key] = null;
            }
            return;
          }
          currentStateRef[key] = currentStateRef[key] || {};
          currentStateRef = currentStateRef[key];
        });
      }
      return state;
    }, {});
  }

  setItem(key: string, value: any): void {
    if (!this.isBrowser) return;
    localStorage.setItem(`${APP_PREFIX}${key}`, JSON.stringify(value));
  }

  getItem(key: string): any {
    if (!this.isBrowser) return null;
    try {
      return JSON.parse(localStorage.getItem(`${APP_PREFIX}${key}`) || 'null');
    } catch {
      return null;
    }
  }

  removeItem(key: string): void {
    if (!this.isBrowser) return;
    localStorage.removeItem(`${APP_PREFIX}${key}`);
  }

  /** Tests that localStorage exists, can be written to, and read from. */
  testLocalStorage(): void {
    if (!this.isBrowser) return;

    const testValue = 'testValue';
    const testKey = 'testKey';
    const errorMessage = 'localStorage did not return expected value';

    this.setItem(testKey, testValue);
    const retrievedValue = this.getItem(testKey);
    this.removeItem(testKey);

    if (retrievedValue !== testValue) {
      throw new Error(errorMessage);
    }
  }
}
