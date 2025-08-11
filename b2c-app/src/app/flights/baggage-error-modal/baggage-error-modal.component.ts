import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-baggage-error-modal',
  templateUrl: './baggage-error-modal.component.html',
  styleUrls: ['./baggage-error-modal.component.scss'],
})
export class BaggageErrorModalComponent {
  @Output() public bgError: EventEmitter<boolean> = new EventEmitter<boolean>();
  constructor() {}
  closeBaggageError() {
    this.bgError.emit(true);
  }
}
