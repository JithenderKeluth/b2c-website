import { InjectionToken, PLATFORM_ID, FactoryProvider, Inject, Injectable } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/** Create a new injection token for injecting the window safely */
export const WINDOW = new InjectionToken<Window | object>('WindowToken');

/** Abstract reference to window */
export abstract class WindowRef {
  abstract get nativeWindow(): Window | object;
}

/** Browser implementation with safe fallback */
@Injectable()
export class BrowserWindowRef extends WindowRef {
  get nativeWindow(): Window | object {
    // ❗ Safely guard window access
    return typeof window !== 'undefined' ? window : {};
  }
}

/** Factory function to return correct window object */
export function windowFactory(
  browserWindowRef: BrowserWindowRef,
  platformId: Object
): Window | object {
  if (isPlatformBrowser(platformId)) {
    return browserWindowRef.nativeWindow;
  }
  return {}; // ✅ Return empty object for SSR
}

/** Provider for injecting BrowserWindowRef */
export const browserWindowProvider = {
  provide: WindowRef,
  useClass: BrowserWindowRef,
};

/** Provider using the factory above */
export const windowProvider: FactoryProvider = {
  provide: WINDOW,
  useFactory: windowFactory,
  deps: [WindowRef, PLATFORM_ID],
};

/** Export providers to include in AppModule and AppServerModule */
export const WINDOW_PROVIDER = [browserWindowProvider, windowProvider];
