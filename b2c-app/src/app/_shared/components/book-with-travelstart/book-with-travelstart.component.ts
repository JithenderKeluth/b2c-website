import { Component } from '@angular/core';
import { IframeWidgetService } from '@app/general/services/iframe-widget.service';

@Component({
  selector: 'app-book-with-travelstart',
  templateUrl: './book-with-travelstart.component.html',
  styleUrls: ['./book-with-travelstart.component.scss'],
})
export class BookWithTravelstartComponent {
  constructor(public iframewidgetService :IframeWidgetService){

  }
  
  
  /**here to check is B2B flightsite organization or not  */
  isFlightSiteOrg(){
    return Boolean(this.iframewidgetService.b2bOrganization() == 'TS_FS');
  }
}
