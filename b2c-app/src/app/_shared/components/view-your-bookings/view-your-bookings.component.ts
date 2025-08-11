import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-view-your-bookings',
  templateUrl: './view-your-bookings.component.html',
  styleUrls: ['./view-your-bookings.component.scss'],
})
export class ViewYourBookingsComponent {
  constructor(public router: Router) {

  }

  openProfile() {
    this.router.navigate(['/my-account/dashboard'], { queryParamsHandling: 'preserve' });
  }
}
