import { v4 as uuidv4 } from 'uuid';
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { SessionStorageService } from 'ngx-webstorage';
import { UniversalStorageService } from '@app/general/services/universal-storage.service';
import { isPlatformBrowser } from '@angular/common';

@Injectable()
export class SessionUtils {
  public static readonly CORRELATION_ID: string = 'correlation_id';

  constructor(
    private sessionStorageService: SessionStorageService,
    private storage: UniversalStorageService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  public getCorrelationId(): string {
    if (!isPlatformBrowser(this.platformId)) return;
    let correlationId;
    if (!this.storage.getItem('correlationId', 'session')) {
      correlationId =
        // 1st priority would be to use the query parameter
        // this.apiUtils.getQueryParameterValue(SessionUtils.CORRELATION_ID) ||
        // 2nd priority would be to use the one is angular session storage
        this.sessionStorageService.retrieve(SessionUtils.CORRELATION_ID) ||
        // 3rd priority would be to generate one
        this.createCorrelationId();
      this.sessionStorageService.store(SessionUtils.CORRELATION_ID, correlationId);
    } else if (
      (this.storage.getItem('deepLinkRequest', 'session') && this.storage.getItem('correlationId', 'session')) || this.storage.getItem('authToken', 'session')
      // || this.iframeWidgetService.isB2BApp()  enable this for B2B
    ) {
      correlationId = this.storage.getItem('correlationId', 'session');
    } else {
      return this.createCorrelationId();
    }
    if (!correlationId || correlationId === 'correlation_id') {
      return this.createCorrelationId();
    }
    return correlationId;
  }

  public createCorrelationId(): string {
    return uuidv4();
  }
}

