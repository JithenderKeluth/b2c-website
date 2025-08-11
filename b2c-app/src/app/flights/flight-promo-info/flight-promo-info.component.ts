import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-flight-promo-info',
  templateUrl: './flight-promo-info.component.html',
  styleUrls: ['./flight-promo-info.component.scss'],
})
export class FlightPromoInfoComponent {
  @Input() itinarary_data: any;

  constructor() {
  }

  getPromoText(promotext: string) {
    return promotext;
  }
}
