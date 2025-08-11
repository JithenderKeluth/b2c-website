import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { DeepLinkService } from '../general/deeplinks/deep-link.service';
import { ActivatedRoute, Router } from '@angular/router';
import { QueryStringAffid } from '../general/utils/querystringAffid-utils';
import { SearchService } from '../flights/service/search.service';
import { DatePipe, isPlatformBrowser } from '@angular/common';
import { NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { Travellers } from '@app/flights/models/travellers';
import { IframeWidgetService } from '@app/general/services/iframe-widget.service';
import { checkMyAccountParams, hasMyAccountParamsInfo } from '@app/general/deeplinks/deep-link.utils';
import { getStorageData, removeStorageData } from '@app/general/utils/storage.utils';
import { SessionStorageService } from 'ngx-webstorage';
import { SessionUtils } from '@app/general/utils/session-utils';
import { UniversalStorageService } from '@app/general/services/universal-storage.service';

@Component({
  selector: 'app-deeplink',
  templateUrl: './deeplink.component.html',
  styleUrls: ['./deeplink.component.scss'],
})
export class DeeplinkComponent implements OnInit {
  queryStringKeys = {};
  deepLinkType: any;
  public travellers = new Travellers();
  travellerCount: any;
  isBrowser: boolean;

  constructor(
    private deepLinkService: DeepLinkService,
    private activatedRoute: ActivatedRoute,
    private queryString: QueryStringAffid,
    private searchService: SearchService,
    private datePipe: DatePipe,
    private ngbDateParserFormatter: NgbDateParserFormatter,
    private iframewidgetService: IframeWidgetService,
    private sessionStorageService: SessionStorageService,
    private router: Router,
    private storage: UniversalStorageService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    this.deepLinksInfo();
    removeStorageData('flightResults');
  }

  deepLinksInfo() {
    if (!this.isBrowser) return;
    const queryParameterString = window.location.href;
    let deepLink = this.deepLinkService.getRequestType(queryParameterString);
    this.deepLinkType = deepLink;
    this.activatedRoute.queryParams.subscribe((x) => {
      if (x) {
        this.queryStringKeys = Object.assign(x);
        this.queryStringKeys = this.deepLinkService.checkDeeplinkParmsCid(this.queryStringKeys);
        if (
          typeof this.queryStringKeys === 'object' &&
          Object.keys(this.queryStringKeys).length !== 0 &&
          !this.queryStringKeys.hasOwnProperty('redirect')
        ) {
          this.storage.removeItem('queryStringParams');
          if (hasMyAccountParamsInfo(queryParameterString)) {
            this.queryStringKeys = checkMyAccountParams(this.queryStringKeys);
          }
          this.storage.setItem('queryStringParams', JSON.stringify(this.queryStringKeys), 'session');
          this.queryString.getQueryParameterValues();
          this.deepLinkRequests(this.queryStringKeys, deepLink, queryParameterString);
          this.searchService.changeQueryString(this.queryStringKeys);
        }
      }
    });
  }

  deepLinkRequests(queryParamString: any, deepLinkValue: string, param: string) {
    this.storage.removeItem('deepLinkRequest');
    this.storage.removeItem('correlationId');
    removeStorageData('flightResults');
    if (this.isBrowser && queryParamString.correlation_id) {
      this.storage.setItem('correlationId', queryParamString.correlation_id, 'session');
      this.sessionStorageService.clear(SessionUtils.CORRELATION_ID);
    }
    if (deepLinkValue === 'SEARCH' || (deepLinkValue === 'PRICE' && !getStorageData('flightResults'))) {
      this.storage.setItem('deepLinkRequest', JSON.stringify(true), 'session');
      this.searchService.changeShowSpinner(true);
      this.deepLinkService.changeIsPriceDeepLink(true);
      this.deepLinkService.search(param, deepLinkValue);
    } else if (deepLinkValue === 'PAYMENT_LINK' && queryParamString?.uuid && !this.iframewidgetService.isB2BApp()) {
      this.storage.setItem('deepLinkRequest', JSON.stringify(true), 'session');
      this.deepLinkService.getItineraryValues(queryParamString);
    }  else {
      this.searchService.changeShowSpinner(false);
    }
  }
  get flightSearchInfo() {
    const flightData = JSON.parse(this.storage.getItem('flightsearchInfo', 'session')) || null;
    if (flightData) {
      this.travellers = new Travellers(
        flightData.travellers.adults ?? 0,
        flightData.travellers.children ?? 0,
        flightData.travellers.infants ?? 0
      );
      this.travellerCount = this.travellers.getCount();
    }
    return flightData;
  }
  getDeptDate(deptDate: any) {
    let departureDate: any;
    if (typeof deptDate === 'object') {
      let date = this.ngbDateParserFormatter.format(deptDate);
      departureDate = this.datePipe.transform(date, 'd MMM yyyy');
    } else {
      departureDate = this.datePipe.transform(deptDate, 'd MMM yyyy');
    }
    return departureDate;
  }
  getPaxCount(paxNum: number) {
    return paxNum > 1 ? 'Travellers' : 'Traveller';
  }
}
