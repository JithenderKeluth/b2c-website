import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-seat-not-selected-modal',
  templateUrl: './seat-not-selected-modal.component.html',
  styleUrls: ['./seat-not-selected-modal.component.scss'],
})
export class SeatNotSelectedModalComponent implements OnInit {
  @Input() modelParent: any;
  @Output() chooseSelectSeats = new EventEmitter<boolean>();
  @Output() continueCloseModal = new EventEmitter<boolean>();
  modelSubDes: string = '';

  ngOnInit(): void {
    this.modelSubDes =
      this.modelParent && this.modelParent == 'seat-map'
        ? 'You haven’t selected seats for certain travellers or parts of your trip.'
        : 'Forgetting something? Secure your seat online to guarantee your spot.';
  }
  chooseSeats() {
    this.chooseSelectSeats.emit(true);
  }
  closeSeatMap() {
    this.continueCloseModal.emit(true);
  }
}
