import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-pricing-failed',
  templateUrl: './pricing-failed.component.html',
  styleUrls: [
    './pricing-failed.component.scss',
    './../../../theme/booking-view-extras.scss',
    './../booking-view/booking-view.component.scss',
  ],
})
export class PricingFailedComponent implements OnInit {
  constructor(private router: Router) {}

  ngOnInit(): void {}
  goToSearchPage() {
    this.router.navigate(['/'], { queryParamsHandling: 'preserve' });
  }
}
