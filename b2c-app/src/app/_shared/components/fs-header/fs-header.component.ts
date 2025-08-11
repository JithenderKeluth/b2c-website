import { Component, EventEmitter, Output } from '@angular/core';

import { Router } from '@angular/router';

@Component({
  selector: 'app-fs-header',
  templateUrl: './fs-header.component.html',
  styleUrls: ['./fs-header.component.scss'],
})
export class FsHeaderComponent {
  @Output() emitLogoClick: EventEmitter<boolean> = new EventEmitter<boolean>();
  constructor(private router: Router) {}

  /**Here we are navigating the user to home page on clicking the logo */
  navigateUserOnClick() {
    this.emitLogoClick.emit(true);
  }

  /**Navigating the user to contact us page */
  contactPage() {
    this.router.navigate(['/contact-us'], { queryParamsHandling: 'preserve' });
  }
}
