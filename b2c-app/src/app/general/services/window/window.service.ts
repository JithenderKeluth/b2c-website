/**
 * Window provider adapted from: http://brianflove.com/2018/01/11/angular-window-provider/
 */
import { isPlatformBrowser } from '@angular/common';
import { ClassProvider, FactoryProvider, InjectionToken, PLATFORM_ID } from '@angular/core';

import { BrowserWindowRef } from './../../../general/window/browser-window-ref';
import { IWindow } from './../../../general/window/window-interface';
import { ServerWindowRef } from './../../../general/window/server-window-ref';
import { ServerRequestService } from './../../../general/window/server-request.service';

/* Create a new injection token for injecting the window into a component. */
export const WINDOW = new InjectionToken('WindowToken');

/* Create an factory function that returns the native window object. */
export function windowFactory(
  browserWindowRef: BrowserWindowRef,
  serverWindowRef: ServerWindowRef,
  platformId: object
): IWindow {
  if (isPlatformBrowser(platformId)) {
    return browserWindowRef.nativeWindow;
  }

  return serverWindowRef.nativeWindow;
}

/* Create a injectable provider for the WindowRef token that uses the BrowserWindowRef class. */
const browserWindowProvider: ClassProvider = {
  provide: BrowserWindowRef,
  useClass: BrowserWindowRef,
};

let serverWindowProvider: ClassProvider = {
  provide: ServerWindowRef,
  useClass: ServerWindowRef,
};

if (process.env.NODE_ENV === 'test') {
  serverWindowProvider = {
    provide: ServerWindowRef,
    useClass: BrowserWindowRef,
  };
}

const serverRequestServiceProvider: ClassProvider = {
  provide: ServerRequestService,
  useClass: ServerRequestService,
};

/* Create an injectable provider that uses the windowFactory function for returning the native window object. */
export const windowProvider: FactoryProvider = {
  deps: [BrowserWindowRef, ServerWindowRef, PLATFORM_ID],
  provide: WINDOW,
  useFactory: windowFactory,
};

/* Create an array of providers. */
export const WINDOW_PROVIDERS = [
  browserWindowProvider,
  serverWindowProvider,
  serverRequestServiceProvider,
  windowProvider,
];
