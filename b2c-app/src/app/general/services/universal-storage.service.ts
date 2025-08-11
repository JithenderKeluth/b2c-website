import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class UniversalStorageService {
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  getItem(key: string, storageType: 'local' | 'session' = 'local'): string | null {
    if (!this.isBrowser) return null;
    return storageType === 'local'
      ? localStorage.getItem(key)
      : sessionStorage.getItem(key);
  }

  setItem(key: string, value: string, storageType: 'local' | 'session' = 'local'): void {
    if (!this.isBrowser) return;
    storageType === 'local'
      ? localStorage.setItem(key, value)
      : sessionStorage.setItem(key, value);
  }

  removeItem(key: string, storageType: 'local' | 'session' = 'local'): void {
    if (!this.isBrowser) return;
    // storageType === 'local'
    //   ? localStorage.removeItem(key)
    //   : sessionStorage.removeItem(key);
    sessionStorage.removeItem(key);
    localStorage.removeItem(key)
  }

  clear(storageType: 'local' | 'session' = 'local'): void {
    if (!this.isBrowser) return;
    storageType === 'local' ? localStorage.clear() : sessionStorage.clear();
  }
}
