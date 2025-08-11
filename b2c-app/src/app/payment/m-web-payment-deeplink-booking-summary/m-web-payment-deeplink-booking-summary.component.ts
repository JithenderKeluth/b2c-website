import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChange, SimpleChanges } from '@angular/core';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { BookingService } from '@app/booking/services/booking.service';
import { responsiveService } from '@app/_core/services/responsive.service';
import { PaymentService } from '../service/payment.service';
import { getNegtiveAmount } from '../utils/payment-utils';
import { UniversalStorageService } from '@app/general/services/universal-storage.service';
@Component({
  selector: 'app-m-web-payment-deeplink-booking-summary',
  templateUrl: './m-web-payment-deeplink-booking-summary.component.html',
  styleUrls: ['./m-web-payment-deeplink-booking-summary.component.scss'],
})
export class MWebPaymentDeeplinkBookingSummaryComponent implements OnInit, OnChanges {
  public itineraryData: any;
  public bookingInfo: any;
  viewpriceUpIcon = true;
  viewpriceDownIcon = false;
  addOnsSelected: any[] = [];
  public locationName: any;
  public discAmount: number = 0;
  processingFee: number = 0;
  @Output() continuePay: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() proceedPayNow: EventEmitter<boolean> = new EventEmitter<boolean>();
  paymentMethods: any = null;
  @Input() isLoading = false;
  constructor(
    public responsiveservice: responsiveService,
    private bookingService: BookingService,
    private _snackBar: MatSnackBar,
    private paymentService: PaymentService,
    private storage: UniversalStorageService
  ) {
    this.locationName = location.pathname;
  }
  ngOnInit(): void {
    if (this.storage.getItem('paymentMethods', 'session')) {
      this.paymentMethods = JSON.parse(this.storage.getItem('paymentMethods', 'session'));
    }
    const itineraryData = JSON.parse(this.storage.getItem('paymentDeeplinkData', 'session'));
    this.itineraryData = itineraryData;
    if (this.storage.getItem('products', 'session')) {
      this.addOnsSelected = JSON.parse(this.storage.getItem('products', 'session'));
    } else {
      this.addOnsSelected = [...itineraryData.products];
    }
    this.paymentService.currentProcessingfee.subscribe((data) => {
      if (data) {
        let processingAmount = data;
        this.processingFee = processingAmount.processingFee;
        this.discAmount = processingAmount.discountAmount;
        if (processingAmount.showDiscount) {
          this._snackBar.open('Your discount has been successfully applied.', '', {
            duration: 2000,
            panelClass: ['ts-snackbar'],
          });
        }
      }
    });
    this.bookingService.currentDeeplinkProductsData.subscribe((data: any) => {
      if (data) {
        this.addOnsSelected = data;
      }
    });
  }
  showPriceIcon() {
    this.viewpriceUpIcon = !this.viewpriceUpIcon;
    this.viewpriceDownIcon = !this.viewpriceDownIcon;
  }
  showSelectedAddOns() {
    if ((this.addOnsSelected.length && this.addOnsSelected.some((x: any) => x.initSelected)) || this.processingFee) {
      return true;
    } else {
      return false;
    }
  }
  getTotalAmount(amount: number, outStandingAmount: number) {
    if (outStandingAmount && outStandingAmount > 0) {
      return `${outStandingAmount + this.discAmount + this.getAddOnsAmount()}`;
    } else if (amount) {
      return `${amount + this.discAmount + this.getAddOnsAmount()}`;
    }
  }
  getAddOnsAmount() {
    let totalAddOnPrice = 0;
    if (this.addOnsSelected && this.addOnsSelected.length > 0) {
      for (let i in this.addOnsSelected) {
        if (this.addOnsSelected[i].initSelected) {
          totalAddOnPrice += this.addOnsSelected[i].amount;
        }
      }
    }
    return totalAddOnPrice + this.processingFee;
  }
  continuePayment() {
    this.continuePay.emit(true);
  }
  payNow() {
    this.proceedPayNow.emit(true);
  }
  getMinusAmt(amount: any) {
    return getNegtiveAmount(amount);
  }
  ngOnChanges(changes: SimpleChanges) {
    let change: SimpleChange = changes['isLoading'];
    this.isLoading = change.currentValue;
  }
}
