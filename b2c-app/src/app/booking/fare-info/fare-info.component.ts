import { Component, OnInit, Input, EventEmitter, Output, Inject, PLATFORM_ID } from '@angular/core';

import { Subscription } from 'rxjs';
import { BookingService } from './../services/booking.service';
import { responsiveService } from './../../_core/services/responsive.service';
import { ApiService } from '@app/general/services/api/api.service';
import { getFeeAmount, getTravellerType } from '../utils/traveller.utils';
import { Router } from '@angular/router';
import { IframeWidgetService } from '@app/general/services/iframe-widget.service';
import { B2bApiService } from '@app/general/services/B2B-api/b2b-api.service';
import { getStorageData } from '@app/general/utils/storage.utils';
import { AffiliateService } from '@app/general/services/affiliate.service';
import { getLoyaltyVouchersByRegionality } from '@app/flights/utils/search-results-itinerary.utils';
import { UniversalStorageService } from '@app/general/services/universal-storage.service';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-fare-info',
  templateUrl: './fare-info.component.html',
  styleUrls: ['./fare-info.component.scss', './../../../theme/fare-break-down.scss'],
})
export class FareInfoComponent implements OnInit {
  private isBrowser: boolean;
  public flightsearchInfo: any;
  @Input() pricedResult_data: any;
  @Input() totalSeatCost: number = 0;
  public totalPriceToBook: any;
  public isStandard: boolean;
  public standardPrice: string;
  public recommendedPrice: string;
  public voucherAmount: number = 0;
  public voucherCurrencyCode: any;
  public showDownIcon = true;
  public showUpIcon = false;
  public couponCode: any;
  public productsArray: any = [];
  public addOnsShow = false;
  public flightResultsList: any;
  isShow: boolean = false;
  products: any = [];
  subscription: Subscription;
  public baggageFee: number = 0;
  public mealPreferAmount: number = 0;
  seatTotalCost: number = 0;
  displayAddons_param: string = null;
  @Input() set baggagefee(value: number) {
    if (value) {
      this.baggageFee = value;
    } else {
      this.baggageFee = 0;
    }
  }
  @Input() set seatCost(value: number) {
    if (value) {
      this.seatTotalCost = value;
    } else {
      this.seatTotalCost = 0;
    }
  }
  @Input() set showAddons_param(val: any) {
    this.displayAddons_param = val;
    this.updateFareProducts(this.displayAddons_param);
  }
  @Output() totalAmount: EventEmitter<any> = new EventEmitter<any>();
  @Output() editPriceModalHandler: EventEmitter<any> = new EventEmitter<any>();
  isShowTotalAmt: boolean = false;
  productsData: any = [];
  region: string;
  constructor(
    private bookingService: BookingService,
    public responseService: responsiveService,
    public router: Router,
    public apiService: ApiService,
    public iframewidgetservice: IframeWidgetService,
    private b2bApiService: B2bApiService,
    private affiliateService: AffiliateService,
    private storage: UniversalStorageService,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    this.region = this.apiService.extractCountryFromDomain();
    this.flightsearchInfo = JSON.parse(this.storage.getItem('flightsearchInfo', 'session'));
    this.flightResultsList = JSON.parse(getStorageData('flightResults'));
    if (this.storage.getItem('products', 'session')) {
      this.productsData = JSON.parse(this.storage.getItem('products', 'session'));
      this.updateFareProducts(this.displayAddons_param);
    } else {
      this.productsData = this.pricedResult_data.products;
    }
    this.bookingService.currentProducts.subscribe((products) => {
      this.productsData = JSON.parse(this.storage.getItem('products', 'session'));
      this.updateFareProducts(this.displayAddons_param);
    });

    if (this.pricedResult_data) {
      this.getTotalPrice(
        this.pricedResult_data.currencyCode,
        this.pricedResult_data.totalAmount,
        this.products,
        this.baggageFee,
        false
      );
    }
    this.bookingService.currentMealPreference.subscribe((x: any) => {
      if (typeof x !== 'object') {
        this.mealPreferAmount = x;
      } else {
        this.mealPreferAmount = 0;
      }
    });

    /** if we get seatcost from sesion
     *  this.seatmapService.currentSeatData.subscribe((x: any) => {
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
     */

    if(this.isBrowser){
      this.isShowTotalAmt = window.location.pathname === '/booking/flight-details' || this.region === 'IB' ? true : false;
    }
  }

  getPassengersType(travellers: number, param: string) {
    return getTravellerType(travellers, param);
  }

  showAddons() {
    if (this.products?.length > 0 && this.products.some((x: any) => x.initSelected == true)) {
      this.isShow = true;
    } else {
      this.isShow = false;
    }
    return this.isShow;
  }

  productInitSelect(product: any, initSelection: boolean) {
    /**for display based on condion
     *  if (!this.addOnsShow && product.initSelected && (product.id == 'SMS')) {
      return true;
    }
    if (this.addOnsShow && product.initSelected) {
      return true;
    }
    */

    return product.initSelected;
  }
  showAngleIcon(param: string) {
    if (param === 'downIcon') {
      this.showUpIcon = true;
      this.showDownIcon = false;
    }
    if (param === 'upIcon') {
      this.showUpIcon = false;
      this.showDownIcon = true;
    }
    if (param === 'viewPricelink' && this.showDownIcon == true) {
      this.showUpIcon = true;
      this.showDownIcon = false;
      return;
    }
    if (param === 'viewPricelink' && this.showUpIcon == true) {
      this.showDownIcon = true;
      this.showUpIcon = false;
      return;
    }
  }

  getTotalPrice(currency: string, amount: number, products: any, baggage: number, isStandard?: boolean) {
    this.isStandard = isStandard;
    this.standardPrice = ` ${amount}`;
    this.recommendedPrice = (() => {
      if (products && products.length > 0) {
        return ` ${amount + this.getTotalAddOnPrice(products) + baggage}`;
      } else {
        return ` ${amount + baggage}`;
      }
    })();
    this.getTotalPriceToBook(currency, amount, products, baggage, isStandard);
    let preApplyvoucherAmount = this.voucherDiscount() ? Math.abs(this.voucherDiscount()) : 0;
    this.totalPriceToBook =
      parseFloat(this.totalPriceToBook) +
      this.voucherAmount +
      this.seatTotalCost +
      this.addFees() -
      preApplyvoucherAmount;
    this.totalAmount.emit(this.totalPriceToBook);
    this.bookingService.changeTotalAmountToBook(this.totalPriceToBook);
    return this.totalPriceToBook;
  }

  getTotalPriceToBook(currency: string, amount: number, products: any, baggage: number, isStandard?: boolean) {
    let baggageAmount =
      this.displayAddons_param === 'traveller_Addons' || this.displayAddons_param === 'all_Addons' ? baggage : 0;
    this.totalPriceToBook = (() => {
      if (products && products.length > 0) {
        return ` ${amount + this.getTotalAddOnPrice(products) + baggageAmount}`;
      } else {
        return ` ${amount + baggageAmount}`;
      }
    })();
  }

  addFees(): number {
    if (this.region === 'IB') {
      return getFeeAmount();
    } else {
      return 0;
    }
  }

  getTotalAddOnPrice(products: any) {
    let totalAddOnPrice = 0;
    if (products && products.length > 0) {
      for (var i = 0; i < products.length; i++) {
        if (products[i].initSelected) {
          totalAddOnPrice += products[i].amount;
        }
      }
    }
    return totalAddOnPrice;
  }

  getTotalFlightPrice(fareBreakDown: any) {
    let preApplyvoucherAmount = this.voucherDiscount() ? Math.abs(this.voucherDiscount()) : 0;
    let totalFlightFare =
      fareBreakDown.taxAmount +
      fareBreakDown.adults.baseFare +
      (fareBreakDown.youngAdults ? fareBreakDown.youngAdults.baseFare : 0) +
      (fareBreakDown.children ? fareBreakDown.children.baseFare : 0) +
      (fareBreakDown.infants ? fareBreakDown.infants.baseFare : 0) -
      preApplyvoucherAmount;
    return totalFlightFare;
  }

  getTaxFees(fareBreakDown: any, taxAmount: number): number {
    let taxAmt = taxAmount || 0;
    const discount = fareBreakDown?.discountAmount || 0;
    if (this.region === 'MM') {
      taxAmt += Math.abs(discount);
    }
    return taxAmt;
  }

  /*
   *  B2B edit price model section to check permission
   */
  hasPermissionToEditFlightPrice() {
    return this.iframewidgetservice.isB2BApp() && this.b2bApiService.hasEditPricePermission();
  }
  /**To Open B2B editprice modal in booking-view component */
  editPriceHandler() {
    this.editPriceModalHandler.emit();
  }

  updateFareProducts(param: any) {
    if (param == 'traveller_Addons') {
      if (param == 'traveller_Addons') {
        this.products = this.productsData;
      } else {
        this.products = this.productsData;
        this.products =
          this.products && this.products.length > 0
            ? this.products.filter(
                (x: any) =>
                  x.id === 'SMS' ||
                  x.id === 'WHATSAPP' ||
                  x.id == 'MEALS' ||
                  (x.id == 'CNG_AST' &&
                    !this.iframewidgetservice.isB2BApp() &&
                    this.affiliateService.performMetaCpySourceCheck())
              )
            : this.products;
      }
    } else if ((param === 'all_Addons')) {
      this.products = this.productsData;
    } else {
      this.products = [];
    }
  }
  /**To Display other services like baggage and meals and seats */
  showOtherServices() {
    if (
      (this.voucherAmount || this.baggageFee || this.seatTotalCost) &&
      (this.displayAddons_param === 'traveller_Addons' || this.displayAddons_param === 'all_Addons')
    ) {
      return true;
    } else {
      return false;
    }
  }

  getMinusVal(amount: any) {
    return this.region === 'MM' ? Math.abs(amount - this.voucherDiscount()) : Math.abs(amount) || 0;
  }

  voucherDiscount() {
    let voucherAmt: number = 0;
    if (this.region === 'MM') {
      const voucherLists = getLoyaltyVouchersByRegionality(
        JSON.parse(this.storage.getItem('credentials', 'session'))?.data?.subscriptionResponse?.wallet
      );
      voucherAmt = this.flightResultsList?.isIntl
        ? voucherLists?.internationalVouchers[0]?.amount
        : voucherLists?.domesticVouchers[0]?.amount || 0;
    }
    return voucherAmt || 0;
  }
}
