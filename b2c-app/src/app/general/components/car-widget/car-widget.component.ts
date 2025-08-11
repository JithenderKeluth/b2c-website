import { Component, OnInit, Input, Inject, PLATFORM_ID } from '@angular/core';
import { meiliTripInfo } from '@app/payment/utils/payment-utils';
import { Base64 } from 'js-base64';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-car-widget',
  templateUrl: './car-widget.component.html',
  styleUrls: ['./car-widget.component.scss'],
})
export class CarWidgetComponent implements OnInit {
  @Input() itinDetails: any;
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit() {
    if(this.isBrowser) {
      // Construct the trip information
      const tripInfo = meiliTripInfo(this.itinDetails);
      // Optional information
      const optionalInfo = {
        numberOfPassengers: 4,
        airlineLoyaltyAccount: '74896X',
        airlineLoyaltyAccountTier: 'Gold',
      };

      // Encode the trip information
      const encodedTripInfo = this.encodeBase64(tripInfo);

      // Set up Meili Connect integration
      const mliRoot = document.getElementById('mli-root');
      mliRoot.setAttribute('data-query', encodedTripInfo);
      // mliRoot.setAttribute('data-path', 'inPath');
      mliRoot.setAttribute('data-ptid', '124.2'); // Replace PTID with your Partner Touchpoint ID

      // Load Meili Connect script
      const script = document.createElement('script');
      script.src = 'https://connect-ux.meili.travel/index.js';
      script.defer = true;
      document.body.appendChild(script);
    };
  }

  // Function to encode JSON object to base64
  encodeBase64(data: any) {
    const dataString = JSON.stringify(data);
    const encodedData = Base64.encode(dataString);
    return encodedData;
  }
}
