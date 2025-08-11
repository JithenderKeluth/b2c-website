import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { CredentialsService } from '@app/auth/credentials.service';
import { SearchService } from '@app/flights/service/search.service';
import { ApiService } from '@app/general/services/api/api.service';
import { MyAccountServiceService } from '@app/my-account/my-account-service.service';
import { GoogleTagManagerServiceService } from '@core/tracking/services/google-tag-manager-service.service';
import { Meta, Title } from '@angular/platform-browser';
import { UniversalStorageService } from '@app/general/services/universal-storage.service';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {
  PROXY_SERVER_PATH, 
  PROXY_BUTTERCMS,
  PROXY_BUTTERCMS_FAQ
} from './../../general/services/api/api-paths';

declare const $: any;
@Component({
  selector: 'app-ts-plus-benefits',
  templateUrl: './ts-plus-benefits.component.html',
  styleUrls: ['./ts-plus-benefits.component.scss'],
})
export class TsPlusBenefitsComponent implements OnInit {
  
  isTravelstartPlus = false;
  public credentials: any;
  public userName: any;
  public faqGroup: any = [];
  slideObject: any = [];
  img_width = 363;
  showPlusIcn = true;
  showMinusIcn = false;
  show_WhatsAppWidget: boolean = false;
  isBrowser: boolean;
  constructor(
    public router: Router,
    public credentialsService: CredentialsService,
    public searchService: SearchService,
    public apiService: ApiService,
    private myacountService: MyAccountServiceService,
    private googleTagManagerServiceService: GoogleTagManagerServiceService,
    private title: Title,
    private metaService: Meta,
    private storage: UniversalStorageService,
    private httpClient: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    this.title.setTitle('Upgrade to a world of travel benefits with Travelstart+');
    this.metaService.updateTag({
      name: 'description',
      content:
        'Experience 24/7 concierge service, instant travel vouchers to your wallet, red carpet upgrades and more with Travelstart+. Upgrade now',
    });
    this.isTravelstartPlus = true;
    this.getCenterlizedData();
    this.storage.removeItem('openedModal');
    this.credentials = JSON.parse(this.storage.getItem('credentials', 'session'))?.data;
    this.getButterCmsRes();
    this.storage.removeItem('tsSubscriptionType');
  }

  signUser() {
    if(!this.isBrowser)return;
    this.credentials = JSON.parse(this.storage.getItem('credentials', 'session'))?.data;
    $('#loginModal').modal('hide');
    if (!this.credentialsService.isAuthenticated()) {
      $('#loginModal').modal('show');
    } else {
      this.getUserData();
      setTimeout(() => {
        if (this.apiService.isTS_PLUSUser()) {
          $('#subscribed_modal').modal('show');
        } else if (!this.apiService.isTS_PLUSUser() && this.credentials?.status !== 'PENDING') {
          this.googleTagManagerServiceService.upGradetoTSplus(this.credentials?.username);
          this.router.navigate(['/ts-plus/ts-plus-payments']);
        }
      }, 2000);
    }
    this.searchService.changeloginModalOutSideClick(true);
  }

  tsPayments() {
    this.router.navigate(['/ts-plus/ts-plus-payments']);
  }

  ngOnDestroy() {
    if(!this.isBrowser) return;
    $('#loginModal').modal('hide');
    $('#account_activate').modal('hide');
    $('#subscribed_modal').modal('hide');
  }
  goToBack() {
    this.router.navigate(['/'], { queryParamsHandling: 'preserve' });
  }
  getUserData() {
    this.myacountService.getUserData(this.credentials?.token).subscribe((res: any) => {
      if (res.data) {
        this.credentials = res?.data;
        this.storage.removeItem('credentials');
        this.storage.setItem('credentials', JSON.stringify(res), 'session');
      }
    });
  }
  getButterCmsRes() {
    this.faqGroup = [];
   const url = `${PROXY_SERVER_PATH}${PROXY_BUTTERCMS_FAQ}`;
    const payload = {
      pageSlug: 'ts-faqs',
      locale: 'en-za'
    };

    this.httpClient.post(url, payload).subscribe({
      next: (res: any) => {
        this.faqGroup = Array.isArray(res?.data) ? res.data : [];
      },
      error: (error) => {
        console.error('Error fetching FAQ data from server:', error);
      }
    });
  }
    /**her to get whatsApp link based on user info */
    getWhatsAppLink() {
      return this.apiService.isTS_PLUSUser() ? 'TsPluswhatsAppLink' : 'whatsAppLink';
    }
    /**To get centerlized Data to display whatsapp based on S3 content we are enable and disable whatsapp */
    getCenterlizedData() {
      const centerlizedInfo: any = JSON.parse(this.storage.getItem('appCentralizedInfo', 'session'));
      if (centerlizedInfo) {
        this.show_WhatsAppWidget = Boolean(
          centerlizedInfo?.whatsAppWidgetDomains?.length > 0 &&
          centerlizedInfo?.whatsAppWidgetDomains?.includes(this.apiService.extractCountryFromDomain())
        );
      } else {
        this.show_WhatsAppWidget = false;
      }
    }
}
