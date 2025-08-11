import { isPlatformBrowser } from '@angular/common';
import {
  ClassProvider,
  FactoryProvider,
  InjectionToken,
  PLATFORM_ID,
  Injectable,
} from '@angular/core';

/**
 * Injection token for safely injecting the global window object.
 */
export const WINDOW = new InjectionToken<Window | object>('WindowToken');

/**
 * Abstract class to access the global window object.
 */
export abstract class WindowRef {
  abstract get nativeWindow(): Window | object;
}

/**
 * Browser implementation that safely accesses the real window object.
 */
@Injectable()
export class BrowserWindowRef extends WindowRef {
  get nativeWindow(): Window | object {
    return typeof window !== 'undefined' ? window : {};
  }
}

/**
 * Factory function that provides the appropriate window reference.
 */
export function windowFactory(
  browserWindowRef: BrowserWindowRef,
  platformId: object
): Window | object {
  return isPlatformBrowser(platformId)
    ? browserWindowRef.nativeWindow
    : {}; // Fallback for server-side
}

/**
 * Class provider for BrowserWindowRef.
 */
export const browserWindowProvider: ClassProvider = {
  provide: WindowRef,
  useClass: BrowserWindowRef,
};

/**
 * Factory provider for WINDOW token.
 */
export const windowFactoryProvider: FactoryProvider = {
  provide: WINDOW,
  useFactory: windowFactory,
  deps: [WindowRef, PLATFORM_ID],
};

/**
 * Export this array and spread it in AppModule and AppServerModule `providers`.
 */
export const WINDOW_PROVIDERS = [browserWindowProvider, windowFactoryProvider];
