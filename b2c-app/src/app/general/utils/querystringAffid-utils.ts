import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SessionUtils } from './session-utils';
import { responsiveService } from '../../_core/services/responsive.service';
import { ApiService } from '../services/api/api.service';
import { checkMyAccountParams } from '../deeplinks/deep-link.utils';
import { MeiliIntegrationService } from '../services/meili-integration.service';
import { MomentumApiService } from './../../general/services/momentum-api.service';
import { UniversalStorageService } from '@app/general/services/universal-storage.service';
import { SessionStorageService } from 'ngx-webstorage';
@Injectable()
export class QueryStringAffid {
  public uriPath: any;
  public deepLinkParams: any;
  public isMobile: boolean;
  public constructor(
    private activatedRoute: ActivatedRoute,
    private sessionUtils: SessionUtils,
    private responsiveService: responsiveService,
    private apiService: ApiService,
    private meiliIntegrationService: MeiliIntegrationService,
    private momentumApiService: MomentumApiService,
    private storage: UniversalStorageService,
    private sessionStorageService: SessionStorageService,
    private router: Router
  ) {
    this.responsiveService.getMobileStatus().subscribe((isMobile: any) => {
      this.isMobile = isMobile;
      this.getQueryParameterValues();
    });
  }
  // takes query string values for deep links
  public getQueryParameterValues() {
    this.activatedRoute.queryParams.subscribe((data: any) => {
      if (data) {
        const modifiedData = { ...data };
        if (modifiedData['b2b_Token']) {
          delete modifiedData['b2b_Token'];
        }
        if (modifiedData['b2b_CorrelationId']) {
          delete modifiedData['b2b_CorrelationId'];
        }
        if (modifiedData['organization']) {
          delete modifiedData['organization'];
        }
        this.deepLinkParams = modifiedData;
      }
    });
    if (this.deepLinkParams) {
      let deepLinkParamsValue = this.removeQueryStringDuplication(this.deepLinkParams);
      let deeplinkData = this.getUTMCampaigns(deepLinkParamsValue);
      this.deepLinkParams = checkMyAccountParams(deeplinkData);
    }
  }

  // get query string values and construct an api path with query string values
  public getParamPath(param: any) {
    this.uriPath = this.getQueryString(param);
  }
  public getQueryString(param: any) {
    const paramJSON = JSON.stringify(param);
    const newstr = paramJSON?.replace(/["{}]/g, '');
    const newstr1 = newstr?.replace(/:/g, '=');
    const newstr2 = newstr1?.replace(/,/g, '&');
    return newstr2;
  }
  // append deeplink params as a path to API call
  public getParamApiPath() {
    const deepLinkParamsValue = this.removeQueryStringDuplication(this.deepLinkParams);
    const deeplinkParams = checkMyAccountParams(deepLinkParamsValue);
    this.deepLinkParams = this.updateQueryParams(deeplinkParams);
    if (this.apiService.extractCountryFromDomain() === 'MM' && this.meiliIntegrationService.getTierInfo()) {
      this.deepLinkParams['affid'] = this.momentumApiService.affIdAsPerSpendLimits(
        this.meiliIntegrationService.getTierInfo()?.activeCode
      );
    }

     
    if (this.apiService.extractCountryFromDomain() === 'ABSA') {
      this.deepLinkParams['cpysource'] = 'absatravel';
      this.deepLinkParams['affid'] = 'absatravel';
      this.deepLinkParams['appsource'] = 'partnership';
    }

     if (this.apiService.extractCountryFromDomain() === 'mastercardtravel') {
      this.deepLinkParams['cpysource'] = 'mastercardtravel';
      this.deepLinkParams['affid'] = 'mastercardtravel';
      //this.deepLinkParams['appsource'] = 'partnership';
    }
    this.uriPath = this.getQueryString(this.deepLinkParams);
    if (this.deepLinkParams?.isiframe) {
      this.storage.setItem('affiliateData', JSON.stringify(this.deepLinkParams), 'session');
    } else if (Object?.keys(this.deepLinkParams).length !== 0) {
      this.updateSessionParams(this.deepLinkParams);
    }
    if (this.deepLinkParams?.correlation_id && this.uriPath) {
      this.deepLinkParams.correlation_id = this.sessionUtils?.getCorrelationId();
      this.uriPath = this.getQueryString(this.deepLinkParams);
      return this.apiService.isTS_PLUSUser && this.apiService.extractCountryFromDomain() === 'ZA'
        ? this.uriPath + this.appendCpyPath()
        : this.uriPath;
    } else if (this.deepLinkParams && !this.deepLinkParams.correlation_id && this.uriPath) {
      return this.apiService.isTS_PLUSUser && this.apiService.extractCountryFromDomain() === 'ZA'
        ? `${this.uriPath}&language=en&correlation_id=${this.sessionUtils.getCorrelationId()}${this.appendCpyPath()}`
        : `${this.uriPath}&language=en&correlation_id=${this.sessionUtils.getCorrelationId()}`;
    } else {
      return this.apiService.isTS_PLUSUser && this.apiService.extractCountryFromDomain() === 'ZA'
        ? `language=en&correlation_id=${this.sessionUtils.getCorrelationId()}${this.appendCpyPath()}`
        : `language=en&correlation_id=${this.sessionUtils.getCorrelationId()}`;
    }
  }

  /**Removing the utm_campaign duplication from the querystring*/
  public getUTMCampaigns(deepLinkParams: any) {
    if (deepLinkParams?.utm_medium && Array.isArray(deepLinkParams['utm_campaign'])) {
      deepLinkParams['utm_campaign'] = deepLinkParams['utm_campaign'][0];
    }
    if (deepLinkParams?.utm_medium && Array.isArray(deepLinkParams['utm_term'])) {
      deepLinkParams['utm_term'] = deepLinkParams['utm_term'][0];
    }
    if (deepLinkParams?.utm_medium && Array.isArray(deepLinkParams['utm_source'])) {
      deepLinkParams['utm_source'] = deepLinkParams['utm_source'][0];
    }
    return deepLinkParams;
  }

  /**Removing the cpysource duplication from the querystring*/
  public removeQueryStringDuplication(deepLinkParams: any) {
    Object.keys(deepLinkParams).forEach((key) => {
      if (Array.isArray(deepLinkParams[key])) {
        deepLinkParams[key] = deepLinkParams[key][0];
      }
    });
    return deepLinkParams;
  }

  /**Updating Query string for TS PLUS */
  public updateQueryParams(deepLinkParams: any): any {
    const isTSPlusUserInZA = this.apiService.extractCountryFromDomain() === 'ZA' && this.apiService.isTS_PLUSUser();
    const isTszawebSource = deepLinkParams['cpysource'] === 'tszaweb' || deepLinkParams['cpy_source'] === 'tszaweb';
    const isTszawebUtmSource = deepLinkParams['utmsource'] === 'tszaweb' || deepLinkParams['utm_source'] === 'tszaweb';

    if (isTSPlusUserInZA && isTszawebSource && isTszawebUtmSource) {
      const platform = this.isMobile ? 'TSplusmobi' : 'TSplusweb';
      return this.updateParams(deepLinkParams, platform);
    } else {
      this.updateSessionParams(this.deepLinkParams);
      return deepLinkParams;
    }
  }

  /**updating cpysource for TSPLUS user */
  public updateParams(deepLinkParams: any, updateStr: string) {
    if (deepLinkParams.cpy_source) {
      deepLinkParams.cpy_source = updateStr;
    } else {
      deepLinkParams.cpysource = updateStr;
    }
    return deepLinkParams;
  }

  /**appending the cpysource for TSPlus subscribers*/
  public appendCpyPath(): string {
    if (this.deepLinkParams.hasOwnProperty('cpysource') || this.deepLinkParams.hasOwnProperty('cpy_source')) {
      return this.apiService.isTS_PLUSUser() ? '' : '';
    }
    const cpyPath = this.isMobile ? '&cpysource=TSplusmobi' : '&cpysource=TSplusweb';
    return this.apiService.isTS_PLUSUser() ? cpyPath : '';
  }

  /**Updating the query params in session storage */
  public updateSessionParams(params: any) {
    if (params && Object.keys(params).length) {
      this.storage.removeItem('queryStringParams');
      this.storage.setItem('queryStringParams', JSON.stringify(params), 'session');
    }
  }
  /**here we are re-initiate new search when user getting flight not available error or supplier related errors
   *  if we get above errors then we are redirected to SRP then trigger the search API again to get updated results */
  public reIntiateNewSearch() {
    this.storage.removeItem('flightResults');
    this.sessionStorageService.clear(SessionUtils.CORRELATION_ID);
    this.storage.removeItem('correlationId');
    const cId = this.sessionUtils.getCorrelationId();
    const qparams = JSON.parse(this.storage.getItem('queryStringParams')) || {};
    let paramStrings = { ...qparams };
    paramStrings['correlation_id'] = cId;
    if (qparams) {
      this.storage.removeItem('queryStringParams');
      this.storage.setItem('queryStringParams', JSON.stringify(paramStrings));
    }
    this.router.navigate(['/flights/results'], {
      queryParams: paramStrings,
      relativeTo: this.activatedRoute,
      queryParamsHandling: 'merge',
    });
  }
}
