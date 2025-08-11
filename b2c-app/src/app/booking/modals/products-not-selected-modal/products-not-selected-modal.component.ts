import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-products-not-selected-modal',
  templateUrl: './products-not-selected-modal.component.html',
  styleUrls: ['./products-not-selected-modal.component.scss'],
})
export class ProductsNotSelectedModalComponent {
  @Output() continuePayment = new EventEmitter<boolean>();
  constructor() {}

  continue() {
    this.continuePayment.emit(true);
  }
}
