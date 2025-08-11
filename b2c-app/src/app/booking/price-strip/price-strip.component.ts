/**we are not using any where need to remove */
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-price-strip',
  templateUrl: './price-strip.component.html',
  styleUrls: ['./price-strip.component.scss'],
})
export class PriceStripComponent implements OnInit {
  public showdetails: boolean = false;
  @Input() priceDataInfo: any;
  @Input() totalprice: number = 0;
  @Input() baggageFee: number = 0;
  @Output() proceedPayment: EventEmitter<any> = new EventEmitter<any>();
  public bookingData: any = null;
  public odoData: any = [];
  public multitripType: any = null;
  public isLoading = false;

  ngOnInit(): void {
    this.bookingData = this.priceDataInfo;
    /**
     * merge odolists to first Itin when itin length is greater than one and check itin is multicity or not
     */
    if (this.bookingData && this.bookingData.itineraries.length > 1) {
      let odoLists: any[] = [];
      odoLists = this.bookingData.itineraries[0].odoList.concat(
        this.bookingData.itineraries[this.bookingData.itineraries.length - 1].odoList
      );
      this.odoData = odoLists;
    } else if (this.bookingData.itineraries[0].odoList.length > 2) {
      this.multitripType = 'multi';
      this.odoData = this.bookingData.itineraries[0].odoList;
    } else {
      this.odoData = this.bookingData.itineraries[0].odoList;
    }
  }
  /**
   * here emit value to booking view component and trigger proceedToPaymet method in booking-view component
   */
  proceedToPayment() {
    this.proceedPayment.emit(false);
  }
}
