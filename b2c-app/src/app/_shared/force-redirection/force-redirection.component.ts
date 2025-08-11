import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-force-redirection',
  templateUrl: './force-redirection.component.html',
  styleUrls: ['./force-redirection.component.scss'],
})
export class ForceRedirectionComponent {
  @Output() closeRedirectPopup: EventEmitter<void> = new EventEmitter<void>();
  @Output() forceRedirect: EventEmitter<void> = new EventEmitter<void>();

  constructor() {}

  onCloseClick(): void {
    this.closeRedirectPopup.emit();
  }

  enableForceRedirect() {
    this.forceRedirect.emit();
  }
}
