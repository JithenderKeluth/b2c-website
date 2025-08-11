import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { PaymentService } from '../service/payment.service';

@Component({
  selector: 'app-discount-promo',
  templateUrl: './discount-promo.component.html',
  styleUrl: './discount-promo.component.scss'
})
export class DiscountPromoComponent implements OnInit{

  @Input() currencyCode?: string;
  @Input() name?: string;
  @Input() totalAmount?: number;
  @Input() discountAmount?: number;
  @Input() discountPercentage?: number;
  @Input() showInfo = false;
  @Input() itinDiscount?: number;
  processingFeeAmount:any;
  @Input() showBookingFee: boolean;

  @Output() info = new EventEmitter<void>();

  constructor(private paymentService: PaymentService){}

  ngOnInit(): void {
    this.paymentService.currentProcessingfee.subscribe((data) => {
      if (data) {
        this.processingFeeAmount = data;
      }
    });
  }

  get discountedAmount() {
    return this.totalAmount - this.discountAmount;
  }

  get percentage() {
    return this.discountPercentage;
  }

  onInfoClicked() {
    //this.info.next();
  }

}
