import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { MeiliIntegrationService } from './../../../general/services/meili-integration.service';

@Component({
  selector: 'app-hotels-widget',
  templateUrl: './hotels-widget.component.html',
  styleUrls: ['./hotels-widget.component.scss'],
})
export class HotelsWidgetComponent implements OnInit {
  hotelIframeUrl: SafeResourceUrl;
  hotelUrl: string = 'https://hotels-momentum.travelstart.co.za/';

  constructor(
    private sanitizer: DomSanitizer,
    private activatedRoute: ActivatedRoute,
    private meiliService: MeiliIntegrationService
  ) {}

  ngOnInit(): void {
    this.hotelIframeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.extractParameters());
  }

  extractParameters() {
    // Extract query parameters from the current URL
    const queryParams = this.activatedRoute.snapshot.queryParams;
    // Get the `session_id` and `affid` from the query parameters
    const sessionId = queryParams['session_id'] || '';
    const affid = queryParams['affid'] || '';
    const iframeUrlParams = this.buildIframeUrl(sessionId, affid);
    return iframeUrlParams;
  }

  private buildIframeUrl(sessionId: string, affid: string): string {
    let url = this.hotelUrl;
    const params = new URLSearchParams();
    if (sessionId) {
      params.set('session_id', sessionId);
    }
    params.set('affid', this.checkingHotelSpendLimit(this.meiliService.getTierInfo()?.activeCode));

    params.set('py', 'momentum');
    return `${url}?${params.toString()}`;
  }

  checkingHotelSpendLimit(code: string): string {
    const primaryTraveler = this.meiliService.getPrimaryUser();

    if (!primaryTraveler) {
      return code;
    }

    // Check if hotel days remaining is 0 and modify the code accordingly
    const hotelDaysRemaining = this.meiliService.getTravelLimitsStatus()?.accommodationLimits;
    return !hotelDaysRemaining ? `${code}0` : code;
  }
}
