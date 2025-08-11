import { IframeWidgetService } from '@app/general/services/iframe-widget.service';
import { Component, OnInit, OnDestroy, Renderer2, ElementRef, Input, EventEmitter, Output, Inject, PLATFORM_ID } from '@angular/core';
import { MeiliIntegrationService } from '@app/general/services/meili-integration.service';
import { GoogleTagManagerServiceService } from '@core/tracking/services/google-tag-manager-service.service';
import { meiliTripInfo } from '@app/payment/utils/payment-utils';
import { Base64 } from 'js-base64';
import { PTIDService } from '@core/services/ptid.service';
import { ApiService } from '@app/general/services/api/api.service';
import { SessionService } from '../../services/session.service';
import { ActivatedRoute } from '@angular/router';
import { stayDaysCount } from '../../utils/my-account.utils';
import { MEILI_DIRECT_LIVE } from '../../services/api/api-paths';
import { UniversalStorageService } from '@app/general/services/universal-storage.service';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-meili-embed',
  templateUrl: './meili-embed.component.html',
  styleUrls: ['./meili-embed.component.scss'],
})
export class MeiliEmbedComponent implements OnInit, OnDestroy {
  private isBrowser: boolean;
  meiliData: any;
  meili_B2BInfo: any = null;
  @Input() itinInformation: any;
  @Input() B2B_Meili_Info: EventEmitter<any>;
  @Output() triggerRedemptionAPI: EventEmitter<any> = new EventEmitter<any>();
  domainCountry : any = null;
  constructor(
    private meiliService: MeiliIntegrationService,
    private ptidService: PTIDService,
    private renderer: Renderer2,
    private el: ElementRef,
    private googleTagManagerService: GoogleTagManagerServiceService,
    private iframeWidgetService: IframeWidgetService,
    private apiService: ApiService,
    private storage: UniversalStorageService,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    this.meili_B2BInfo = null;
    this.domainCountry = this.apiService.extractCountryFromDomain();
    this.setBrandConditionally();
    if(this.iframeWidgetService.isB2BApp() && this.getB2BOrganization() == 'TS_CT'){
    this.B2B_Meili_Info?.subscribe((data: any) => {
      if (data) {
        this.meili_B2BInfo = data;
        this.initilizeMeiliWidget();
      }
    });
    }else{
      this.initilizeMeiliWidget();
    }
    // this.constructTripInformation();
  }
  initilizeMeiliWidget() {
    this.meiliData = this.meiliService.getMeiliData(this.meili_B2BInfo);
    this.loadMeiliScript();
  }
  setBrandConditionally() {
    if (this.apiService.extractCountryFromDomain() == 'MM') {
      this.ptidService.setBrand('Momentum');
    } else if (
      this.iframeWidgetService.isB2BApp() && this.getB2BOrganization() == 'TS_CT'
    ) {
      this.ptidService.setBrand('ClubHub');
    } else {
      this.ptidService.setBrand('Travelstart'); // Default brand
    }
  }

  loadMeiliScript() {
    if (!this.isBrowser) return;
    let existingScript = document.getElementById('meiliScript');
    if(existingScript != null){
      this.renderer.removeChild(this.el.nativeElement, existingScript);
    }
    const script = this.renderer.createElement('script');
    script.type = 'text/javascript';  
    script.id = 'meiliScript';
      /**here currently fo CH pointing to live once testing is done the we can consider apiservice method only  */
    script.src = this.getB2BOrganization() == 'TS_CT' ? `${MEILI_DIRECT_LIVE}` : this.apiService.getEmbedMeiliUrl() ;
    script.defer = true;
    this.renderer.appendChild(this.el.nativeElement, script);
   

    // Add event listener for Meili events
    window.addEventListener('MEILI_CONNECT_LISTENER', this.handleMeiliEvent, true);
  }

  ngOnDestroy(): void {
    if (!this.isBrowser) return;
    // Cleanup event listener
    window.removeEventListener('MEILI_CONNECT_LISTENER', this.handleMeiliEvent);
  }

  handleMeiliEvent = (event: any): void => { 

    switch (event.detail.type) {
      case 'MEILI_EVENT_BOOKING_SUCCESS':
        this.pushInfoToGTM('meiliBookingSuccess', event);
        this.meiliService.updateSectionVisibility('bookingSuccess', true);
        this.meiliService.updateSectionVisibility('bookingCancelled', false);
        this.triggerRedemptionAPI.emit(event.detail.data);
        break;
      case 'MEILI_EVENT_BOOKING_CANCELLED':
        this.pushInfoToGTM('meiliBookingCancelled', event);
        this.meiliService.updateSectionVisibility('bookingCancelled', true);
        this.meiliService.updateSectionVisibility('bookingSuccess', false);
        break;
      case 'MEILI_EVENT_PAGE_LOADED':
        this.meiliService.updateSectionVisibility('pageLoaded', true);
        break;
      case 'MEILI_EVENT_ERROR':
        this.pushInfoToGTM('meiliBookingError', event);
        this.meiliService.updateSectionVisibility('error', true);
        break;
      default:
        console.warn('Unhandled Meili Event:', event.detail.type);
        break;
    }
  };

  pushInfoToGTM(event_name: string, event: any) {
    this.googleTagManagerService.pushMeiliEmbedBookingData(event_name, event);
  }

  constructTripInformation() {
    // Construct the trip information
    const tripInfo = meiliTripInfo(this.itinInformation);
    // Optional information
    const optionalInfo = {
      numberOfPassengers: 4,
      airlineLoyaltyAccount: '74896X',
      airlineLoyaltyAccountTier: 'Gold',
    };

    // Encode the trip information
    const encodedTripInfo = this.encodeBase64(tripInfo);
    this.meiliData.queryData = encodedTripInfo;
  }

  // Function to encode JSON object to base64
  encodeBase64(data: any) {
    const dataString = JSON.stringify(data);
    const encodedData = Base64.encode(dataString);
    return encodedData;
  }
  getB2BOrganization(){
    if(this.storage.getItem('B2BOrganization', 'session')){
      return this.storage.getItem('B2BOrganization', 'session');
    }else if (this.iframeWidgetService.isB2BApp() && this.iframeWidgetService.b2bOrganization()) {
      this.iframeWidgetService.b2bOrganization();
    }else{
      return null;
    }
  }
}
