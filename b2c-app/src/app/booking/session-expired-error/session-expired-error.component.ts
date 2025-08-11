import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-session-expired-error',
  templateUrl: './session-expired-error.component.html',
  styleUrls: [
    './session-expired-error.component.scss',
    './../../../theme/booking-view-extras.scss',
    './../booking-view/booking-view.component.scss',
  ],
})
export class SessionExpiredErrorComponent {
  constructor(private router: Router) {}

  goToSearchPage() {
    this.router.navigate(['/']);
  }
}
