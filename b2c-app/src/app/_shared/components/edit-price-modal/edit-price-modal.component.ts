import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  OnChanges,
  SimpleChanges,
  ChangeDetectorRef,
  ViewChild,
} from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { BookingService } from '@app/booking/services/booking.service';
import { getTripTypeEnums } from '../../../flights/models/trip-types';
import { get } from 'lodash';
import { SharedFlightService } from '@app/flights/service/sharedFlight.service';
import { getFlightResults } from '@app/flights/utils/results.utils';
import { getStorageData } from '@app/general/utils/storage.utils';
import { EditPriceFormComponent } from './edit-price-form/edit-price-form.component';
import { UniversalStorageService } from '@app/general/services/universal-storage.service';

@Component({
  selector: 'app-edit-price-modal',
  templateUrl: './edit-price-modal.component.html',
  styleUrls: ['./edit-price-modal.component.scss'],
})
export class EditPriceModalComponent implements OnInit, OnChanges {
  qty: number;
  baseFare: number = 0;
  markup: number = 0;
  taxAmount: number = 0;
  discount: number = 0;
  emailAddress: string = '';
  isSubmitted: boolean = false;
  flights: any = [];
  RETURN: string = 'return';
  MULTI: string = 'multi';
  MULTI_CITY: string = 'multicity';
  ONE_WAY: string = 'oneway';
  ARRAY_ZERO_INDEX = 0;
  ARRAY_FIRST_INDEX = 1;
  user: any;
  editModalValidate: UntypedFormGroup;
  isSendingQuote: boolean = false;
  selectedFlight: any;
  selectedDomesticFlight: any;
  selectedFlightCheckrates: any;
  selectedDomesticCheckrates: any;
  viewBookingPriceQuote: boolean = false;
  isDownloadingQuoteBtnDisabled: boolean = true;
  isRemovingDiscount: boolean = false;
  isDownloadingQuote: boolean = false;
  formSubmitEvntObj: any;
  isDiscountApplied: boolean = false;
  quoteNumber: string;
  isUpdateButtonDisabled: boolean = false;
  additionalMarkupPrice: number = 0;
  itinerary: any = null;
  tripType: string = '';
  @Output() formSubmitEvent: EventEmitter<any> = new EventEmitter<any>();
  @Output() closeEvent: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild('#editPriceForm') public editPriceForm: EditPriceFormComponent;
  displayDiscountonQuote: boolean = true;
  constructor(
    // public utilityService: UtilityService,
    public fb: UntypedFormBuilder,
    public bookingService: BookingService,
    public _snackBar: MatSnackBar,
    private sharedFlightService: SharedFlightService,
    private cdRef: ChangeDetectorRef,
    private storage: UniversalStorageService
  ) {
    this.user = JSON.parse(this.storage.getItem('b2bUser', 'session'));
    this.editModalValidate = fb.group({
      email: [
        '',
        Validators.compose([
          Validators.required,
          Validators.pattern('[a-zA-Z0-9.+-_]{1,}@[a-zA-Z0-9.-]{2,}[.]{1}[a-zA-Z]{2,}'),
        ]),
      ],
    });
    this.selectedDomesticFlight = JSON.parse(this.storage.getItem('selectedDomesticFlight', 'session'));
    this.selectedFlight = JSON.parse(this.storage.getItem('selectedFlight', 'session'));
    this.selectedDomesticCheckrates = JSON.parse(this.storage.getItem('selectedDomesticCheckrates', 'session'));
    this.selectedFlightCheckrates = JSON.parse(this.storage.getItem('selectedFlightCheckrates', 'session'));
  }

  ngOnInit(): void {
    if (getStorageData('flightResults')) {
      this.flights = JSON.parse(getStorageData('flightResults'));
    }
    if (this.storage.getItem('flightsearchInfo', 'session')) {
      this.tripType = JSON.parse(this.storage.getItem('flightsearchInfo', 'session')).tripType;
    }

    this.sharedFlightService.editpriceModalData$.subscribe((data: any) => {
      if (data) {
        this.itinerary = data;
        this.itinararyData();
        this.updatedPrice();
        this.editModalValidate.reset();
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes?.itinerary?.currentValue) {
      this.itinararyData();
      this.updatedPrice();
    }
  }
  itinararyData() {
    this.qty = this.itinerary.fareBreakdown.adults.qty;
    this.taxAmount = this.itinerary.fareBreakdown.taxAmount;
    this.baseFare = this.itinerary.fareBreakdown.adults.baseFare;
    this.additionalMarkupPrice = this.itinerary?.additionalMarkup;
    this.discount =
      parseFloat(this.selectedFlight?.fareBreakdown.dynamicDiscount) ||
      parseFloat(this.selectedDomesticFlight?.dynamicDiscount) ||
      parseFloat(this.selectedDomesticCheckrates?.discount) ||
      parseFloat(this.selectedFlightCheckrates?.fareBreakdown.discount) ||
      0;
    if (this.itinerary.fareBreakdown?.children) {
      this.baseFare += this.itinerary.fareBreakdown?.children.baseFare;
    }
    if (this.itinerary.fareBreakdown?.infants) {
      this.baseFare += this.itinerary.fareBreakdown?.infants?.baseFare;
    }
    if (this.itinerary.fareBreakdown?.youngAdults) {
      this.baseFare += this.itinerary.fareBreakdown?.youngAdults?.baseFare;
    }
  }
  onSubmit() {
    this.isSubmitted = true;
    this.isSendingQuote = true;
    const outboundAndInboundKeys: any = {
      outboundkey: this.itinerary.id,
      inboundkey: null,
    };

    if (!this.flights.isBundled) {
      outboundAndInboundKeys.outboundkey = this.itinerary.outboundkey;
      outboundAndInboundKeys.inboundkey = this.itinerary.inboundkey;
    }
    const requestBody: any = {
      /** we can enable if we want email in edit price
       * customer_email: this.editModalValidate.get('email').value, */
      final_amout: this.updatedPrice(),
      original_amount: parseFloat(this.itinerary.amount.toFixed(2)),
      dicount_amount: parseInt(this.discount.toString()),
      trip_type: getTripTypeEnums(this.tripType),
      uuid: this.flights.uuid,
      bundle: this.flights?.isBundled,
      additional_markup: this.additionalMarkupPrice || 0,
      ...outboundAndInboundKeys,
    };

    if (requestBody.dicount_amount > requestBody.additional_markup + parseInt(this.itinerary.markupAmount)) {
      this._snackBar.open('Markup & Additional Markup should not be less than the discount', 'X');
      this.isSendingQuote = false;
      return false;
    }

    this.bookingService.editPrice(requestBody).subscribe(
      (res: any) => {
        if (res.success) {
          this._snackBar.open('Price updated successfully', 'X');
          this.quoteNumber = get(res, 'data.quote_refrences', '');
          this.isDownloadingQuoteBtnDisabled = false;
          if (this.selectedDomesticFlight) {
            this.storage.setItem('selectedDomesticFlight', JSON.stringify(this.selectedDomesticFlight), 'session');
          }
          if (this.selectedFlight) {
            this.selectedFlight.dynamicDiscount = this.discount;
            this.storage.setItem('selectedFlight', JSON.stringify(this.selectedFlight), 'session');
          }
          if (this.selectedDomesticCheckrates) {
            this.selectedDomesticCheckrates.discount = this.discount;
            this.storage.setItem('selectedDomesticCheckrates', JSON.stringify(this.selectedDomesticCheckrates), 'session');
          }
          if (this.selectedFlightCheckrates) {
            this.selectedFlightCheckrates.fareBreakdown.discount = this.discount;
            this.storage.setItem('selectedFlightCheckrates', JSON.stringify(this.selectedFlightCheckrates), 'session');
          }
        } else this._snackBar.open('Unable to update price of flight, Please try again.', 'X');
        this.isSubmitted = false;
        this.isSendingQuote = false;
        this.isDiscountApplied = true;
      },
      () => (this.isSendingQuote = false)
    );
  }

  handleClose() {
    this.closeSnackbar();
    this.closeEvent.emit();
    this.additionalMarkupPrice = 0;
    this.isDownloadingQuote = false;
    this.viewBookingPriceQuote = false;
  }

  updateDiscount(value: any) {
    this.discount = parseInt(value[0]) || 0;
    this.storage.setItem('dynamicDiscount', this.discount.toString(), 'session');
    const totalPrice = parseFloat((this.baseFare + this.taxAmount).toFixed(2));
    this.isUpdateButtonDisabled = this.discount >= totalPrice;
    this.isDiscountApplied = false;
    this.isDownloadingQuoteBtnDisabled = true;
  }

  additionalMarkup(value: any) {
    this.additionalMarkupPrice = parseInt(value[0]) || 0;
    this.storage.setItem('additionalMarkup', this.additionalMarkupPrice.toString(), 'session');
  }

  public updatedPrice() {
    return parseFloat((this.additionalMarkupPrice + this.baseFare + this.taxAmount - this.discount).toFixed(2));
  }
  fareQuotePriceDetails() {
    return {
      original_amount: this.itinAmount(),
      markupAmount: this.additionalMarkupPrice,
      discountAmount: this.discount,
      totalAmount: this.updatedPrice(),
    };
  }
  itinAmount() {
    let farebreakdown = this.itinerary?.fareBreakdown;
    let paxFee = farebreakdown?.adults?.baseFare || 0;
    paxFee += farebreakdown?.youngAdults?.baseFare || 0;
    paxFee += farebreakdown?.children?.baseFare || 0;
    paxFee += farebreakdown?.infants?.baseFare || 0;
    let taxFee = farebreakdown?.taxAmount;
    return parseFloat(paxFee + taxFee);
  }
  generateBookingPriceQuote() {
    this.isDownloadingQuote = true;
    this.viewBookingPriceQuote = true;
  }
  continueWithSameFareHandler() {
    this.formSubmitEvntObj = {
      dynamicDiscount: 0,
      additionalMarkup: 0,
      updatedTotalAmount: this.baseFare + this.taxAmount,
      itinerary: this.itinerary,
    };
    this.formSubmitEvent.emit(this.formSubmitEvntObj);
    this.handleClose();
    this.closeSnackbar();
  }

  updateDownloadQuote() {
    this.isDownloadingQuote = false;
    this.viewBookingPriceQuote = false;
  }

  continueWithDiscountedFareHandler() {
    this.formSubmitEvntObj = {
      dynamicDiscount: this.discount,
      additionalMarkup: this.additionalMarkupPrice,
      updatedTotalAmount: this.updatedPrice(),
      itinerary: this.itinerary,
    };
    this.formSubmitEvent.emit(this.formSubmitEvntObj);
    this.handleClose();
  }
  closeSnackbar() {
    this._snackBar.dismiss();
  }
  ngAfterViewInit() {
    this.cdRef.detectChanges();
  }
  /**To get flightresults from session */
  flightResults() {
    this.flights = getFlightResults();
  }
  /**here we are reciving display discount on quote value from edit-price-form component
   *  based on this value we are restricted discount key with the downloaded quote */
  isShowDiscountOnQuote(param: any) {
    this.displayDiscountonQuote = param;
  }
}
