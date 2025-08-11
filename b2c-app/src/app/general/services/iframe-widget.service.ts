import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { responsiveService } from '@app/_core';
import { isIframeWidget } from '../utils/widget.utils';
import { getStorageData } from '../utils/storage.utils';
import { UniversalStorageService } from '@app/general/services/universal-storage.service';

@Injectable({
  providedIn: 'root',
})
export class IframeWidgetService {
  isIframe: boolean = false;
  scrollIframe: boolean = false;
  private isBrowser: boolean;

  constructor(
    public router: Router,
    private activatedRoute: ActivatedRoute,
    private responsive_service: responsiveService,
    private storage: UniversalStorageService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);

    if (this.isBrowser) {
      this.activatedRoute.queryParams.subscribe((params) => {
        this.isIframe = params?.isIframe === 'iframe';
      });
    }
  }

  public isFrameWidget(): boolean {
    if (this.isBrowser) {
      return isIframeWidget(this.isIframe); 
    }
  }

  public isB2BApp(): boolean {
    if (this.isFrameWidget() === false && this.isBrowser) {
      return Boolean(this.storage.getItem('authToken', 'session'));
    }
    return false;
  }

  public b2bOrganization(): string | undefined {
    if (this.isBrowser && this.isB2BApp()) {
      const b2bUser = this.storage.getItem('b2bUser', 'session');
      try {
        return b2bUser ? JSON.parse(b2bUser)?.organization_id : 'TS_NG';
      } catch {
        return 'TS_NG';
      }
    }
    return undefined;
  }

  public isShowComponent(): boolean {
    if (this.isBrowser) {
      return this.isFrameWidget();
    }
  }

  public isZenithbank_Iframe(): boolean {
    return this.isBrowser && typeof window !== 'undefined'
      ? window.location.href.includes('affId=217889')
      : false;
  }

  public iframeStripScroll(): void {
    if (!this.isBrowser || typeof window === 'undefined' || typeof document === 'undefined') return;

    const scrollPosition =
      window.pageYOffset ||
      document.documentElement.scrollTop ||
      document.body.scrollTop ||
      0;

    const isSmallOrMediumScreen =
      this.responsive_service.screenWidth === 'sm' ||
      this.responsive_service.screenWidth === 'md';

    if (!this.isShowComponent() && isSmallOrMediumScreen) {
      if (scrollPosition > 150 && !this.scrollIframe) {
        document.body.scrollIntoView({ block: 'end', behavior: 'smooth' });
        this.scrollIframe = true;
      } else if (scrollPosition < 20) {
        this.scrollIframe = false;
      }
    } else if (
      !this.isShowComponent() &&
      getStorageData &&
      this.router.url.includes('results')
    ) {
      try {
        const results = getStorageData('flightResults');
        const parsed = results ? JSON.parse(results) : null;

        if (
          this.isBrowser &&
          parsed &&
          !parsed.isBundled &&
          scrollPosition > 20 &&
          !this.scrollIframe
        ) {
          document.body.scrollIntoView({ block: 'end', behavior: 'smooth' });
          this.scrollIframe = true;
        } else if (scrollPosition < 10) {
          this.scrollIframe = false;
        }
      } catch {
        // Fail silently
      }
    }
  }

  public isWhiteLabelSite(): boolean {
    return (
      this.isBrowser &&
      typeof window !== 'undefined' &&
      (window.location.href.includes('cpysource=mastercardtravel') ||         
        window.location.hostname.includes('mastercard.travelstart.com'))
    );
  }

  public isMasterCardRegistrationWhiteLabelSite(): boolean {
    const hostname = window.location.hostname;
    return (
      this.isBrowser &&
      typeof window !== 'undefined' &&
      hostname.includes('mastercard.travelstart.co.za')
    );
  }

}
