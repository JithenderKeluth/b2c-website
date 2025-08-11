import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-ekh-class-modal',
  templateUrl: './ekh-class-modal.component.html',
  styleUrls: ['./ekh-class-modal.component.scss'],
})
export class EKHClassModalComponent {
  @Output() continueEkFlight: EventEmitter<any> = new EventEmitter<any>();

  constructor() {}
  continueFlight() {
    this.continueEkFlight.emit(true);
  }
}
