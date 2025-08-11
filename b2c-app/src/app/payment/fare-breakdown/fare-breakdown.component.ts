import { Component, OnInit } from '@angular/core';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { NavigationStart, Router } from '@angular/router';
import { BookingService } from '@app/booking/services/booking.service';
import { PaymentService } from '../service/payment.service';

import { responsiveService } from './../../_core/services/responsive.service';
import { getNegtiveAmount, modifyProduct_Desc } from '../utils/payment-utils';
import { UniversalStorageService } from '@app/general/services/universal-storage.service';

@Component({
  selector: 'app-fare-breakdown',
  templateUrl: './fare-breakdown.component.html',
  styleUrls: ['./fare-breakdown.component.scss', './../../../theme/fare-break-down.scss'],
})
export class FareBreakdownComponent implements OnInit {
  public itineraryData: any;
  public showDownIcon: boolean = true;
  public showUpIcon: boolean = false;
  public selectedAdd_ons: any[] = [];
  public processingFee: number = 0;
  public discAmount: number = 0;

  constructor(
    public responsveService: responsiveService,
    private paymentService: PaymentService,
    private router: Router,
    private _snackBar: MatSnackBar,
    private bookingService: BookingService,
    private storage: UniversalStorageService
  ) {
    router.events.subscribe((event: NavigationStart) => {
      if (event.navigationTrigger === 'popstate') {
        this.processingFee = 0;
        this.getTotalPrice(
          this.itineraryData.currencyCode,
          this.itineraryData.totalAmount,
          this.itineraryData.fareBreakdown.totalOutstanding
        );
      }
    });
  }

  ngOnInit(): void {
    const itineraryData = JSON.parse(this.storage.getItem('paymentDeeplinkData', 'session'));
    this.itineraryData = itineraryData;
    if (this.storage.getItem('products', 'session')) {
      let Prods = JSON.parse(this.storage.getItem('products', 'session'));
      this.selectedAdd_ons = [...Prods];
    } else {
      this.selectedAdd_ons = [...itineraryData.products];
    }
    this.bookingService.currentDeeplinkProductsData.subscribe((data: any) => {
      if (data) {
        this.selectedAdd_ons = data;
      }
    });

    this.paymentService.currentProcessingfee.subscribe((data) => {
      if (data) {
        let processFee = data;
        this.processingFee = processFee?.processingFee;
        this.discAmount = processFee?.discountAmount;
        if (processFee?.showDiscount) {
          this._snackBar.open('Your discount has been successfully applied.', '', {
            duration: 2000,
            panelClass: ['ts-snackbar'],
          });
        }
      }
    });
  }

  showAddons() {
    return true;
  }

  selected_Add_ons(currency: string, amount: number) {
    if ((this.selectedAdd_ons.length && this.selectedAdd_ons.some((x: any) => x.initSelected)) || this.processingFee) {
      this.getTotalPrice(currency, amount, this.itineraryData.fareBreakdown.totalOutstanding);
      return true;
    } else {
      return false;
    }
  }
  getTotalPrice(currency: string, amount: number, outStandingAmount: number) {
    let totalPriceAmt: any = null;
    if (outStandingAmount && outStandingAmount > 0) {
      totalPriceAmt = `${outStandingAmount + this.discAmount + this.getAddOnsPrice(outStandingAmount)}`;
    } else if (amount) {
      totalPriceAmt = `${amount + this.discAmount + this.getAddOnsPrice(amount)}`;
    }
    this.storage.setItem('bookingSummaryAmt', totalPriceAmt, 'session');
    return totalPriceAmt;
  }
  getAddOnsPrice(amount: any) {
    let totalAddOnPrice = 0;
    if (this.selectedAdd_ons && this.selectedAdd_ons.length > 0) {
      for (let i in this.selectedAdd_ons) {
        if (this.selectedAdd_ons[i].initSelected) {
          totalAddOnPrice += this.selectedAdd_ons[i].amount;
        }
      }
    }
    return totalAddOnPrice + this.processingFee;
  }
  getMinusAmt(amount: any) {
    return getNegtiveAmount(amount);
  }
  modifyDescription(productDesc: any) {
    return modifyProduct_Desc(productDesc);
  }
}
