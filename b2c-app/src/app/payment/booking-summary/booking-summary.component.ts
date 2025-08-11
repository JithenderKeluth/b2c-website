import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ChangeDetectorRef,
  SimpleChanges,
  ElementRef,
} from '@angular/core';
import { getTime } from './../../flights/utils/odo.utils';
import { Router } from '@angular/router';
import { BookingService } from '@app/booking/services/booking.service';
import { PaymentService } from '../service/payment.service';
import { responsiveService } from '@app/_core';
import { SeatmapService } from '@app/booking/services/seatmap.service';
import { SessionStorageService } from 'ngx-webstorage';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { ApiService } from '@app/general/services/api/api.service';
import { getBaggageFee, getFeeAmount } from '@app/booking/utils/traveller.utils';
import { IframeWidgetService } from '@app/general/services/iframe-widget.service';
import { getBookRef, getNegtiveAmount } from '../utils/payment-utils';
import { getStorageData } from '@app/general/utils/storage.utils';
import { UniversalStorageService } from '@app/general/services/universal-storage.service';

@Component({
  selector: 'app-booking-summary',
  templateUrl: './booking-summary.component.html',
  styleUrls: ['./booking-summary.component.scss'],
})
export class BookingSummaryComponent implements OnInit {
  public bookingInfo: any;
  public airlinesList: any;
  public cC_processFee: number = 0;
  public baggageAmount: number = 0;
  public discAmount: number = 0;
  mealPreferenceAmount: number = 0;
  public voucherAmount: any = 0;
  public isPriceDeeplink = false;
  public paymentLinkItineraryData: any;
  public paymentProductsData: any = [];
  public bookingRef: string;
  public flightResultsList: any;
  public flightsearchInfo: any;
  @Input() cc_processFee: any;

  @Input()
  isLoading = false;

  @Output('parentFun') parentFun: EventEmitter<any> = new EventEmitter();
  @Output() paymentoptions: EventEmitter<boolean> = new EventEmitter<boolean>();

  viewpriceUpIcon = true;
  viewpriceDownIcon = false;
  seatTotalCost: number = 0;
  totalPrice: any = 0;
  isShowpricebreakdown = true;
  @Input() showIframe = false;
  collapseFare: any;
  country: string;

  constructor(
    private router: Router,
    private paymentService: PaymentService,
    public apiService: ApiService,
    private bookingService: BookingService,
    public responsiveservice: responsiveService,
    private seatmapService: SeatmapService,
    private sessionStorageService: SessionStorageService,
    private cdref: ChangeDetectorRef,
    private _snackBar: MatSnackBar,
    public iframeWidgetService: IframeWidgetService,
    public el: ElementRef,
    private storage: UniversalStorageService
  ) {
    this.country = apiService.extractCountryFromDomain();
  }

  ngOnInit(): void {
    this.paymentService.currentProcessingfee.subscribe((data) => {
      if (data) {
        let processingAmount = data;
        this.cC_processFee = processingAmount?.processingFee ? processingAmount?.processingFee : 0;
        this.discAmount = processingAmount?.discountAmount ? processingAmount?.discountAmount : 0;
        // if (processingAmount?.showDiscount) {
        //   this._snackBar.open('Your discount has been successfully applied.', '', {
        //     duration: 2000,
        //     panelClass: ['ts-snackbar'],
        //   });
        // }
      }
    });
    if (this.storage.getItem('bookingInfo', 'session')) {
      this.bookingInfo = JSON.parse(this.storage.getItem('bookingInfo', 'session'));
      this.isPriceDeeplink = false;
    } else if (this.storage.getItem('paymentDeeplinkData', 'session')) {
      this.isPriceDeeplink = true;
      const itineraryData = JSON.parse(this.storage.getItem('paymentDeeplinkData', 'session'));
      this.paymentLinkItineraryData = itineraryData;
      this.airlinesList = itineraryData.airlineNames;
      this.bookingInfo = {
        itineraryData: itineraryData,
      };
    }
    if (getStorageData('flightResults')) {
      this.flightResultsList = JSON.parse(getStorageData('flightResults'));
      this.airlinesList = JSON.parse(getStorageData('flightResults')).airlineNames;
    }

    if (this.storage.getItem('flightsearchInfo', 'session')) {
      this.flightsearchInfo = JSON.parse(this.storage.getItem('flightsearchInfo', 'session'));
    }
    this.baggageAmount =
      this.storage.getItem('baggageInfo', 'session') && JSON.parse(this.storage.getItem('baggageInfo', 'session'))?.checkInBaggageData
        ? getBaggageFee(JSON.parse(this.storage.getItem('baggageInfo', 'session'))?.checkInBaggageData)
        : 0;
    this.bookingService.currentVoucherAmount.subscribe((currentVoucherAmount: any) => {
      this.voucherAmount = currentVoucherAmount;
    });
    this.seatmapService.currentSeatData.subscribe((x: any) => {
      if (
        this.sessionStorageService.retrieve('seatInfo') &&
        this.sessionStorageService.retrieve('seatInfo').isSeatSelected &&
        this.sessionStorageService.retrieve('seatInfo').totalSeatCost
      ) {
        this.seatTotalCost = this.sessionStorageService.retrieve('seatInfo').totalSeatCost;
      } else {
        this.seatTotalCost = 0;
      }
    });
    this.bookingRef = getBookRef();
  }
  ngAfterContentChecked() {
    this.cdref.detectChanges();
  }
  payndBook() {
    this.parentFun.emit();
  }
  getTravellers() {
    if (this.isPriceDeeplink && this.paymentLinkItineraryData.passengers.adults) {
      return true;
    } else if (!this.isPriceDeeplink && this.bookingInfo.travellerDetails.travellersList.length > 0) {
      return true;
    }
  }
  // public getStops(itineraries: any) {
  //   let numStops = getTotalStops(itineraries);
  //   if (numStops === 0) {
  //     return 'Non Stop';
  //   } else {
  //     return numStops + ' Stops';
  //   }
  // }
  public getStops(segments: any) {
    // const numStops = getTotalStops(itineraries);
    const numStops = parseInt(segments.length) - 1;
    if (numStops === 0) {
      return 'Non Stop';
    } else if (numStops === 1) {
      return numStops + ' Stop';
    } else {
      return numStops + ' Stops';
    }
  }
  // formate time from minutes
  public getTimeInHours(ms: number) {
    return getTime(ms);
  }

  public getTotalPrice(amount: number, products: any, val: number, baggage: number) {
    if (products && products.length > 0) {
      this.totalPrice = ` ${amount + this.getTotalAddOnPrice(products) + val + baggage}`;
    } else {
      this.totalPrice = ` ${amount + val + baggage}`;
    }
    this.totalPrice =
      parseFloat(this.totalPrice) +
      this.seatTotalCost +
      (this.apiService.extractCountryFromDomain() == 'IB' ? this.addFees() : 0);
      this.totalPrice = this.totalPrice > 0 ? this.totalPrice : 0;
    // +this.bookingInfo?.itineraryData?.fareBreakdown?.discountAmount
    this.storage.setItem('bookingSummaryAmt', this.totalPrice, 'session');
    return this.totalPrice;
  }
  addFees() {
    return getFeeAmount();
  }

  getTotalAddOnPrice(products: any) {
    let totalAddOnPrice = 0;
    if (products && products.length > 0) {
      for (let i = 0; i < products.length; i++) {
        if (products[i].initSelected) {
          totalAddOnPrice += products[i].amount;
        }
      }
    }
    return totalAddOnPrice;
  }

  public viewItinerary(): void {
    this.router.navigate(['/booking/flight-details'], { queryParamsHandling: 'preserve' });
  }

  public updatePax(): void {
    this.router.navigate(['/booking/flight-details'], { queryParamsHandling: 'preserve' });
  }
  
  showPriceIcon() {
    this.viewpriceUpIcon = !this.viewpriceUpIcon;
    this.viewpriceDownIcon = !this.viewpriceDownIcon;
  }

  paymentOptions() {
    this.paymentoptions.emit();
  }

  ngOnDestroy() {
    this._snackBar.dismiss();
  }
  isShowAdd_ons() {
    return (
      this.bookingInfo?.productDetails?.length > 0 && this.bookingInfo?.productDetails?.some((x: any) => x.initSelected)
    );
  }
  /**To Display other services like baggage and meals and seats */
  showOtherServices() {
    if (this.baggageAmount || this.seatTotalCost) {
      return true;
    } else {
      return false;
    }
  }
  pricebreakdownsec() {
    this.isShowpricebreakdown = !this.isShowpricebreakdown;
  }
  getMinusAmt(amount: any) {
    return getNegtiveAmount(amount);
  }
  ngOnChanges(changes: SimpleChanges) {
    for (let property in changes) {
      if (property === 'showIframe') {
        this.showIframe = changes[property].currentValue;
      }
    }
  }
  expandFare() {
    this.collapseFare = !this.collapseFare;
  }

  closeFareBreakdown() {
    const modal = this.el.nativeElement.querySelector('#fareBreakdown');
    if (modal) {
      modal.classList.remove('show');
    }
  }
  /**here we are calculating total momentum savings include discount amount & voucher */
  totalMomentumSavings() {
    let discountAmount: number = this.bookingInfo?.itineraryData?.fareBreakdown?.discountAmount || 0;
    return Math.abs(this.voucherAmount) + Math.abs(discountAmount);
  }

  getTaxFees(fareBreakDown: any, taxAmount: number): number {
    let taxAmt = taxAmount || 0;
    const discount = fareBreakDown?.discountAmount || 0;
    if (this.apiService.extractCountryFromDomain() === 'MM') {
      taxAmt += Math.abs(discount);
    }
    return taxAmt;
  }
}
