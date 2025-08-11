import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UniversalStorageService } from '@app/general/services/universal-storage.service';

@Component({
  selector: 'app-payment-error-dialog',
  templateUrl: './payment-error-dialog.component.html',
  styleUrls: [
    './payment-error-dialog.component.scss',
    './../../../theme/booking-view-extras.scss',
    './../booking-view/booking-view.component.scss',
  ],
})
export class PaymentErrorDialogComponent implements OnInit {
  flightsearchInfo: any;
  constructor(private router: Router, private storage: UniversalStorageService) {}

  ngOnInit(): void {
    if (this.storage.getItem('flightsearchInfo', 'session')) {
      this.flightsearchInfo = JSON.parse(this.storage.getItem('flightsearchInfo', 'session'));
    }
  }
  flight_results() {
    this.router.navigate(['/results'], { queryParamsHandling: 'preserve' });
  }
}
