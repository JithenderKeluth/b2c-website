import { ErrorHandler, Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, NavigationEnd  } from '@angular/router';
import { SessionStorageService } from 'ngx-webstorage';
import { SessionUtils } from './../../general/utils/session-utils';
import { GoogleTagManagerServiceService } from './../../_core/tracking/services/google-tag-manager-service.service';
import { isPlatformBrowser } from '@angular/common';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {

  constructor(private router: Router, private sessionStorageService: SessionStorageService, private sessionUtils: SessionUtils, private googleTagManagerService : GoogleTagManagerServiceService, @Inject(PLATFORM_ID) private platformId: Object) { this.handleError(); }

  handleError(error?: any): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const url = this.router.url; // Get the current URL path
    const correlation_id = this.sessionStorageService.retrieve(SessionUtils.CORRELATION_ID);

    let errorObjHandler:any = {};

    if (error instanceof Error) {
      // Client-side error
      errorObjHandler = {
        errorType : 'client-side-error',
        url : url,
        error : error,
        correlation_id : correlation_id,
      } 
    } else if (error instanceof HttpErrorResponse) {
      // Server-side error
      errorObjHandler = {
        errorType : 'server-side-error',
        url : error?.url || '',
        correlation_id : correlation_id,
        status : error?.status || '',
        message : error?.message || '',
        error : error?.error || null,
        errorObj : error || null
      }
      console.error('Server-side error occurred on page:', errorObjHandler);
    } else {
      // Other types of errors
      errorObjHandler = {
        errorType : 'other-errors',
        url : url,
        correlation_id : correlation_id,
      }
      console.error('Error occurred on page:', errorObjHandler);
    }

    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        // Track navigation events 
        errorObjHandler.navigatedUrl = event.url;
      }
    });
 

    this.googleTagManagerService.pushGlobalErrorHandler(errorObjHandler);
  }
}
