import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IframeWidgetService } from '@app/general/services/iframe-widget.service';
import { navigateToB2B_BackPage } from '@app/general/utils/widget.utils';

@Component({
  selector: 'app-view-itinerary-error',
  templateUrl: './view-itinerary-error.component.html',
  styleUrls: ['./view-itinerary-error.component.scss'],
})
export class ViewItineraryErrorComponent implements OnInit {
  constructor(private router: Router, private iframeWidgetservice: IframeWidgetService, private location: Location) {}

  ngOnInit(): void {
    console.log('itin-error');
  }
  goToSearchPage() {
    if (this.iframeWidgetservice.isB2BApp()) {
      navigateToB2B_BackPage();
    } else {
      this.router.navigate([''], { queryParamsHandling: 'preserve' });
    }
  }
}
