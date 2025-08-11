import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router, NavigationEnd } from '@angular/router';
import { SessionUtils } from './../../general/utils/session-utils';
import { GoogleTagManagerServiceService } from './../../_core/tracking/services/google-tag-manager-service.service';

@Injectable()
export class ErrorHandlerInterceptor implements HttpInterceptor {

  url: string;
  correlation_id: string;
  navigatedToUrl: string;

  constructor(
    private router: Router,
    private sessionUtils: SessionUtils,
    private googleTagManagerService: GoogleTagManagerServiceService
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error) => {
        this.url = this.router.url; // Get the current URL path
        this.correlation_id = this.sessionUtils.getCorrelationId() || '';
        this.router.events.subscribe(event => {
          if (event instanceof NavigationEnd) {
            this.navigatedToUrl = event.url;
          }
        });

        // Handle server-side errors
        if (error instanceof HttpErrorResponse) {
          this.handleServerError(error);
        } else {
          // Handle client-side errors
          this.handleClientError(error);
        }
        // Propagate the error further
        return throwError(error);
      })
    );
  }

  private handleServerError(error: HttpErrorResponse): void {
    // Server-side error
    const errorObjHandler = {
      errorType : 'server-side-error',
      url : error?.url || '',
      correlation_id : this.correlation_id,
      status : error?.status || '',
      message : error?.message || '',
      error : error?.error || null,
      errorObj : error || null,
      navigatedToUrl: this.navigatedToUrl
    }
    this.googleTagManagerService.pushGlobalErrorHandler(errorObjHandler);
  }

  private handleClientError(error: any): void {
    const client_errorObjHandler = {
      errorType: 'client-side-error',
      url: this.url,
      error: error,
      correlation_id: this.correlation_id,
      navigatedToUrl: this.navigatedToUrl
    };
    this.googleTagManagerService.pushGlobalErrorHandler(client_errorObjHandler);
  }
}
