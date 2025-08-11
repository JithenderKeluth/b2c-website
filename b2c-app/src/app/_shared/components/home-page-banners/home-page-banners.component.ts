import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CredentialsService } from '@app/auth/credentials.service';
import { ApiService } from '@app/general/services/api/api.service';
import { IframeWidgetService } from '@app/general/services/iframe-widget.service';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { Subscription } from 'rxjs';
import { UniversalStorageService } from '@app/general/services/universal-storage.service'; 
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {
  PROXY_SERVER_PATH, 
  PROXY_BUTTERCMS
} from './../../../general/services/api/api-paths';

@Component({
  selector: 'app-home-page-banners',
  templateUrl: './home-page-banners.component.html',
  styleUrls: ['./home-page-banners.component.scss'],
})
export class HomePageBannersComponent implements OnInit, OnDestroy {

  butterParams: any;
  slideObject: any[] = [];
  butterCollectionName: any = null;
  subscriptions: Subscription = new Subscription();
  img_width = 363;

  owlOptions: OwlOptions = {
    animateOut: 'slideOutDown',
    animateIn: 'flipInX',
    smartSpeed: 1150,
    autoWidth: true,
    lazyLoad: true,
    loop: true,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: false,
    autoplay: true,
    dots: false,
    navSpeed: 300,
    navText: ["<div class='nav-btn prev-slide'></div>", "<div class='nav-btn next-slide'></div>"],
    responsive: {
      0: { items: 1 },
      400: { items: 1 },
      577: { items: 2 },
      767: { items: 2 },
      1024: { items: 3 },
    },
    nav: true,
  };
  domainCountry: any = null;
  centralizedDataInfo :any = null;
  showCarosualHeader : boolean = true;
  showCarosualDescription : boolean = true;
  showCarosualCTA : boolean = true;
  constructor(
    public credentialsService: CredentialsService,
    public iframeWidgetService: IframeWidgetService,
    private apiService: ApiService,
    private storage: UniversalStorageService,
    private httpClient: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.domainCountry = this.apiService.extractCountryFromDomain();
    this.centralizedDataInfo = JSON.parse(this.storage.getItem('appCentralizedInfo', 'session'));
    if(this.centralizedDataInfo && this.centralizedDataInfo?.homepageCarousualBanners[this.domainCountry]){
      this.showCarosualHeader = this.centralizedDataInfo?.homepageCarousualBanners[this.domainCountry]?.showHeading;
      this.showCarosualDescription = this.centralizedDataInfo?.homepageCarousualBanners[this.domainCountry]?.showDescription;
      this.showCarosualCTA = this.centralizedDataInfo?.homepageCarousualBanners[this.domainCountry]?.ShowCTA;
    }
    this.butterCollectionName = this.domainCountry === 'MM' ? 'multiply_homepage' : 'home_page_carousel';
    this.initializeButterParams();
    this.loadSlideObject();
    setTimeout(() => {
      if(isPlatformBrowser(this.platformId)){
        window.dispatchEvent(new Event('resize'));
      }
    }, 500);
    
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private initializeButterParams(): void {
    const countryRegion = this.apiService.extractCountryFromDomain();
    const tsCountry = `en-${countryRegion === 'MM' ? 'ZA' : countryRegion}`.toLocaleLowerCase();
    this.butterParams = {
      // 'fields.locale': tsCountry,
      locale: tsCountry,
    };
  }

  private loadSlideObject(): void {
    const url = `${PROXY_SERVER_PATH}${PROXY_BUTTERCMS}`;
     const payload = {
      collection: this.butterCollectionName,
      locale: this.butterParams?.locale,
    };
    this.subscriptions.add(
      this.httpClient.post(url, payload).subscribe({
      next: (res: any) => {
        this.slideObject = Array.isArray(res?.data) ? res.data : [];
      },
      error: (error) => {
        console.error('Error loading slide object from proxy API:', error);
        this.slideObject = [];
      }
    })
    );
  }
  redirectTo(url: string) {
    if (isPlatformBrowser(this.platformId) && url) {
      window.open(url, '_blank', 'noopener');
    }
  }
  
}
