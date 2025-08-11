import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { GoogleTagManagerServiceService } from '@core/tracking/services/google-tag-manager-service.service';
import { ApiService } from '../services/api/api.service';
import { AFFILIATE_PATH } from './../../general/services/api/api-paths';
import { SessionUtils } from './../../general/utils/session-utils';
import { UniversalStorageService } from '@app/general/services/universal-storage.service';
import { isPlatformBrowser } from '@angular/common';
import moment from 'moment';

@Injectable({
  providedIn: 'root',
})
export class AffiliateService {
  private translatedAffId = '';
  private queryAffId = '';

  constructor(
    private http: HttpClient,
    private cookieService: CookieService,
    private googleTagManagerServiceService: GoogleTagManagerServiceService,
    private apiService: ApiService,
    private sessionUtils: SessionUtils,
    private storage: UniversalStorageService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  private sendAffiliateIdToDatalayer() {
    let affiliateId = '';
    const storedAffId = this.cookieService.get('TSAffiliateCode');
    if (this.translatedAffId) {
      affiliateId = this.translatedAffId;
    } else if (this.queryAffId) {
      affiliateId = this.queryAffId === this.cookieService.get('affiliate_param_id') ? storedAffId : this.queryAffId;
    } else if (storedAffId) {
      affiliateId = storedAffId;
    }

    affiliateId = affiliateId ? affiliateId.replace(/"/g, '') : null;

    if (affiliateId) {
      this.googleTagManagerServiceService.pushAffiliateId(affiliateId);
      this.storage.setItem('sessionAffId', affiliateId, 'session');
    }
  }

  private fetchAffiliateCookieInfo(affId: string) {
    this.sendAffiliateIdToDatalayer();
    const url = `${this.apiService.fetchApiHostUrl()}${AFFILIATE_PATH}/?affid=${affId}&language=en&correlation_id=${this.sessionUtils.getCorrelationId()}`;

    this.http.post<any>(url, {}).subscribe((res) => {
      if (res && res.affId) {
        this.translatedAffId = res.affId || '';
        if (res.searchTimeoutDays && res.searchTimeoutDays > 0) {
          const timeoutMoment = moment().add(res.searchTimeoutDays, 'days');
          this.cookieService.set('TSAffiliateCode', res.affId, { expires: timeoutMoment.toDate() });
          this.cookieService.set('affiliate_param_id', affId, { expires: timeoutMoment.toDate() });
        }
      }
      this.sendAffiliateIdToDatalayer();
    });
  }

  public performAffiliateCookieCheck() {
    const sessionAffId: any = this.storage.getItem('sessionAffId', 'session'); // Get sessionAffId from your DataLayer equivalent
    if (sessionAffId) {
      return;
    }

    if (isPlatformBrowser(this.platformId)) {
      const urlParams = new URLSearchParams(window.location.search);
      this.queryAffId =
        urlParams.get('affId') ||
        urlParams.get('affid') ||
        urlParams.get('aff_id') ||
        urlParams.get('gclid') ||
        urlParams.get('tduid') ||
        urlParams.get('TDUID');

      if (this.queryAffId) {
        this.fetchAffiliateCookieInfo(this.queryAffId);
        return;
      }
    }
    

    this.sendAffiliateIdToDatalayer();
  }

  public performMetaCpySourceCheck() {
    if (isPlatformBrowser(this.platformId)) {
      const urlParams = new URLSearchParams(window.location.search);
      const restrictedCpySources  = ['absatravel','mastercardtravel']
      let queryCpySource =
        urlParams.get('cpysource') ||
        urlParams.get('cpy_source') ||
        urlParams.get('cpy_Source') ||
        urlParams.get('cpySource');

    return !!queryCpySource && !restrictedCpySources.includes(queryCpySource.toLowerCase());
    }
  }
}
