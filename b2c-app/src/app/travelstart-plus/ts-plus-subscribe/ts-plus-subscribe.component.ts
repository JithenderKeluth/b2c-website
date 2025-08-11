import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-ts-plus-subscribe',
  templateUrl: './ts-plus-subscribe.component.html',
  styleUrls: ['./ts-plus-subscribe.component.scss'],
})
export class TsPlusSubscribeComponent {
  constructor(private router: Router) {}
  /**Taking back to the user to the home page*/
  goToHome() {
    this.router.navigate(['/'], { queryParamsHandling: 'preserve' });
  }
}
