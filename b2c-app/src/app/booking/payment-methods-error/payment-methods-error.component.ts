import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-payment-methods-error',
  templateUrl: './payment-methods-error.component.html',
  styleUrls: [
    './payment-methods-error.component.scss',
    './../../../theme/booking-view-extras.scss',
    './../booking-view/booking-view.component.scss',
  ],
})
export class PaymentMethodsErrorComponent {
  constructor(private router: Router) {}

  flight_results() {
    this.router.navigate(['/results'], { queryParamsHandling: 'preserve' });
  }
}
