import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-vocherproduct',
  templateUrl: './vocherproduct.component.html',
  styleUrls: ['./vocherproduct.component.scss'],
})
export class VocherproductComponent implements OnInit {
  vocherProductData: any = null;
  bookingamount: number = 0;
  amount: number = 0;
  @Input() set vocherData(val: any) {
    if (val) {
      this.vocherProductData = val;
      this.amount = this.vocherProductData.voucherPrice;
    }
  }
  @Input() bookingAmount: any;
  totalAmt: any;
  @Output() productVocher: EventEmitter<any> = new EventEmitter<any>();

  ngOnInit(): void {
    if (this.vocherProductData && this.bookingAmount) {
      this.totalAmt = this.amount + parseInt(this.bookingAmount);
    }
  }
  withoutVocher() {
    this.vocherProductData.selected = false;
    this.productVocher.emit(this.vocherProductData);
  }
  purchaseVocher() {
    this.vocherProductData.selected = true;
    this.productVocher.emit(this.vocherProductData);
  }
}
