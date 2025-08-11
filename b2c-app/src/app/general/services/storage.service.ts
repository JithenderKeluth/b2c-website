import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  logLocalStorage(): void {
    if (!this.isBrowser) return;
    // console.log('localStorage:', this.getAllItems(localStorage));
    // console.log('localStorage memory usage (MB):', this.calculateMemoryUsage(localStorage));
  }

  logSessionStorage(): void {
    if (!this.isBrowser) return;
    // console.log('sessionStorage:', this.getAllItems(sessionStorage));
    // console.log('sessionStorage memory usage (MB):', this.calculateMemoryUsage(sessionStorage));
  }

  clearAllLocalStorageExceptKey(keyToKeep: string): void {
    if (!this.isBrowser) return;
    const valueToKeep = localStorage.getItem(keyToKeep);
    localStorage.clear();
    if (valueToKeep !== null) {
      localStorage.setItem(keyToKeep, valueToKeep);
    }
  }

  getAllItems(storage: Storage): { [key: string]: any } {
    const items: { [key: string]: any } = {};
    if (!this.isBrowser) return items;

    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (key !== null) {
        const value = storage.getItem(key);
        items[key] = value;
      }
    }
    return items;
  }

  calculateMemoryUsage(storage: Storage): number {
    if (!this.isBrowser) return 0;

    let totalSize = 0;
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      const value = storage.getItem(key);
      if (key && value) {
        totalSize += key.length + value.length;
      }
    }
    return totalSize / (1024 * 1024); // Convert bytes to MB
  }

  clearStoragesExcept(keysToKeep: string[]): void {
    if (!this.isBrowser) return;

    const valuesToKeep: { [key: string]: string } = {};
    keysToKeep.forEach((key) => {
      const value = localStorage.getItem(key);
      if (value !== null) {
        valuesToKeep[key] = value;
      }
    });
    localStorage.clear();
    Object.entries(valuesToKeep).forEach(([key, value]) => {
      localStorage.setItem(key, value);
    });
  }
}
