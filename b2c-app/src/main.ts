/*
 * Entry point of the application.
 * Only platform bootstrapping code should be here.
 * For app-specific initialization, use `app/app.component.ts`.
 */

import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { platformBrowser } from '@angular/platform-browser';
import { AppBrowserModule } from './app/app.browser.module';


import { AppModule } from '@app/app.module';
import { environment } from '@env/environment';
import { hmrBootstrap } from './hmr';
import { setPlatform } from './app/general/utils/widget.utils'; 
setPlatform(true);

enableProdMode(); // Enable production mode

const bootstrap = () =>
  platformBrowser()
    .bootstrapModule(AppBrowserModule)
    .then((moduleRef) => {
      console.log('✅ App bootstrapped');
      return moduleRef;
    });

// ✅ Safe check for HMR
declare const module: any;

if (environment.hmr && typeof module !== 'undefined' && module.hot) {
  hmrBootstrap(module, bootstrap);
} else {
  bootstrap().catch((err) => console.error(err));
}

// Global Meili Event Listener
if(typeof document !== 'undefined'){
  document.addEventListener('MEILI_CONNECT_LISTENER', (event: any) => {
    // Handle Meili events globally, e.g., forward to GTM if needed
  });
}

