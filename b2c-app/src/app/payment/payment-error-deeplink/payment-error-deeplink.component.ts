import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { IframeWidgetService } from '@app/general/services/iframe-widget.service';
import { navigateToB2B_BackPage } from '@app/general/utils/widget.utils';

@Component({
  selector: 'app-payment-error-deeplink',
  templateUrl: './payment-error-deeplink.component.html',
  styleUrls: ['./payment-error-deeplink.component.scss'],
})
export class PaymentErrorDeeplinkComponent {
  constructor(private iframewidgetService: IframeWidgetService, private location: Location) {}

  closeModal() {
    if (this.iframewidgetService.isB2BApp()) {
      navigateToB2B_BackPage();
    }
  }
}
