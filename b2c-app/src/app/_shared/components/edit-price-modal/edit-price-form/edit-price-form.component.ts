import { IframeWidgetService } from './../../../../general/services/iframe-widget.service';
import { Component, DoCheck, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { updateFareInfoTravellers } from '@app/booking/utils/traveller.utils';
import { numInputNoChars } from '@app/flights/utils/odo.utils';
import { UniversalStorageService } from '@app/general/services/universal-storage.service';

@Component({
  selector: 'app-edit-price-form',
  templateUrl: './edit-price-form.component.html',
  styleUrls: ['./edit-price-form.component.scss', '../../../../../theme/toggle.scss'],
})
export class EditPriceFormComponent implements OnChanges, DoCheck {
  qty: number;
  markup: number = 0;
  additionalMarkup = new UntypedFormControl(['']);
  taxAmount: number = 0;
  discount = new UntypedFormControl(['']);
  total: number = 0;
  currency: any;
  selectedFlight: any;
  selectedDomesticFlight: any;
  selectedFlightCheckrates: any;
  selectedDomesticCheckrates: any;
  isDiscountPriceGreater: boolean = false;
  adultBaseFare: number = 0;
  adultQuantity: number = 0;
  youngAdultBaseFare: number = 0;
  youngAdultQuantity: number = 0;
  childrenBaseFare: number = 0;
  childrenQuantity: number = 0;
  infantBaseFare: number = 0;
  infantQuantity: number = 0;
  @Input() itinerary: any;
  @Input() updatedPrice: any;
  @Output() updateDiscountEvnt: EventEmitter<any> = new EventEmitter<any>();
  @Output() additionalMarkupEvnt: EventEmitter<any> = new EventEmitter<any>();
  @Output() isShowDiscountOnQuote: EventEmitter<boolean> = new EventEmitter<boolean>();
  displayDiscountOnQuote: boolean = true;
  constructor(
   public iframewidgetService:IframeWidgetService,
   private storage: UniversalStorageService
  ) {}
  ngOnChanges(changes: SimpleChanges): void {
    if (changes?.itinerary?.currentValue) {
      this.discount.reset();
      this.itinerary.fareBreakdown = updateFareInfoTravellers(this.itinerary?.fareBreakdown);
      this.currency = this.itinerary.currencyCode;
      this.qty = this.itinerary.fareBreakdown.adults.qty;
      this.taxAmount = parseFloat(this.itinerary.fareBreakdown.taxAmount.toFixed(2));
      this.adultBaseFare = this.itinerary.fareBreakdown.adults.baseFare;
      this.adultQuantity = this.itinerary.fareBreakdown.adults.qty;
      this.youngAdultBaseFare = this.itinerary?.fareBreakdown?.youngAdults?.baseFare || 0;
      this.youngAdultQuantity = this.itinerary?.fareBreakdown?.youngAdults?.qty || 0;
      this.childrenBaseFare = this.itinerary.fareBreakdown?.children?.baseFare || 0;
      this.childrenQuantity = this.itinerary.fareBreakdown?.children?.qty;
      this.infantBaseFare = this.itinerary.fareBreakdown?.infants?.baseFare || 0;
      this.infantQuantity = this.itinerary.fareBreakdown?.infants?.qty;
      this.markup = this.itinerary?.markupAmount ? this.itinerary?.markupAmount?.toFixed(2) : 0;
      this.total = parseFloat(
        (
          this.adultBaseFare +
          this.youngAdultBaseFare +
          this.infantBaseFare +
          this.childrenBaseFare +
          this.taxAmount -
          this.discount.value
        ).toFixed(2)
      );
      this.additionalMarkup.setValue(this.itinerary.additionalMarkup ? this.itinerary.additionalMarkup.toString() : '');
      this.discount.setValue(this.itinerary.dynamicDiscount ? this.itinerary.dynamicDiscount.toString() : '');
      this.addAdditionalMarkup(this.additionalMarkup.value);
      this.updateDiscount(this.discount.value);
    }
  }

  ngDoCheck(): void {
    this.selectedDomesticFlight = JSON.parse(this.storage.getItem('selectedDomesticFlight', 'session'));
    this.selectedFlight = JSON.parse(this.storage.getItem('selectedFlight', 'session'));
    this.selectedDomesticCheckrates = JSON.parse(this.storage.getItem('selectedDomesticCheckrates', 'session'));
    this.selectedFlightCheckrates = JSON.parse(this.storage.getItem('selectedFlightCheckrates', 'session'));
  }

  updateDiscount(value: any) {
    value = value.replace(/,/g, '');
    const totalPrice = parseFloat(
      (
        this.adultBaseFare +
        this.youngAdultBaseFare +
        this.infantBaseFare +
        this.childrenBaseFare +
        this.taxAmount
      ).toFixed(3)
    );
    this.updateDiscountEvnt.emit(value.split(','));
    this.isDiscountPriceGreater = value >= totalPrice;
  }

  addAdditionalMarkup(value: any) {
    value = value.replace(/,/g, '');
    this.additionalMarkupEvnt.emit(value.split(','));
    this.updateDiscountEvnt.emit(this.discount.value.split(','));
  }
  totalAmount() {
    let amount = parseFloat((this.additionalMarkup.value - this.discount.value).toFixed(2));
    return parseFloat(
      (
        this.adultBaseFare +
        this.youngAdultBaseFare +
        this.infantBaseFare +
        this.childrenBaseFare +
        amount +
        this.taxAmount
      ).toFixed(2)
    );
  }

  // allows users to type only numbers
  onlyNumbersKeysAllowed(event: any) {
    return numInputNoChars(event);
  }
  /**To display discount info or not in quote and emit value to edit-price-modal component*/
  showDiscountOnQuote() {
    this.displayDiscountOnQuote = !this.displayDiscountOnQuote;
    this.isShowDiscountOnQuote.emit(this.displayDiscountOnQuote);
  }
}
