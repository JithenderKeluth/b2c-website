import {
  Component,
} from '@angular/core';

import { FlightCardBase } from './flight-card-base';
import { ApiService } from '@app/general/services/api/api.service';
import { IframeWidgetService } from '@app/general/services/iframe-widget.service';
import { B2bApiService } from '../../general/services/B2B-api/b2b-api.service';
import { SharedFlightService } from '../service/sharedFlight.service';
import { responsiveService } from '@core/services/responsive.service';

@Component({
  selector: 'app-flight-card',
  templateUrl: './flight-card.component.html',
  styleUrls: ['./flight-card.component.scss', './../../../theme/stops-line.scss'],
})
export class FlightCardComponent extends FlightCardBase {

  showAirportName = false;

  constructor(
    sharedFlightService: SharedFlightService,
    responsiveService: responsiveService,
    apiService: ApiService,
    Iframewidgetservice: IframeWidgetService,
    b2bApiService: B2bApiService
  ) {
    super(
      sharedFlightService,
      responsiveService,
      apiService,
      Iframewidgetservice,
      b2bApiService
    );
  }

  override ngOnInit(): void {
    super.ngOnInit();

    this.showAirportName = (this.isUnBundleFlight() || this.isBundleFlight()) && !(this.isUnBundleFlight() && this.isMobile()); // Original template logic
    this.showAirportName = this.showAirportName
      || this.region === 'ABSA' // Activate airport name indicator for Absa whitelabel
      || this.region === 'SB'; // Activate airport name indicator for Std Bank whitelabel
  }

}
