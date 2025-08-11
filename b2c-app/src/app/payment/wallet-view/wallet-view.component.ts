import { Component, OnInit, ViewChild } from '@angular/core';
import { WalletComponent } from '../wallet/wallet.component';
import { PaymentService } from './../service/payment.service';
import { DomSanitizer } from '@angular/platform-browser';
import { BookingService } from '../../booking/services/booking.service';
import { I18nService } from '@app/i18n/i18n.service';
import { responsiveService } from '@core/services/responsive.service';
import { get } from 'lodash';
import { Location } from '@angular/common';
import { B2bApiService } from '@app/general/services/B2B-api/b2b-api.service';
import { UniversalStorageService } from '@app/general/services/universal-storage.service';

declare let $: any;
@Component({
  selector: 'app-wallet-view',
  templateUrl: './wallet-view.component.html',
  styleUrls: ['./wallet-view.component.scss'],
})
export class WalletViewComponent implements OnInit {
  constructor(
    private paymentService: PaymentService,
    private bookingService: BookingService,
    private _sanitizationService: DomSanitizer,
    private i18Service: I18nService,
    public responsiveService: responsiveService,
    private location: Location,
    public b2bApiService: B2bApiService, // private utilityService: UtilityService,
    private storage: UniversalStorageService
  ) {}

  public bookingInfo: any;
  public isLoading = false;
  public showIframe = false;
  public iframeUrl: any;
  public cc_ProcessingFee: number = 0;
  public voucherData: any;
  public cardNumber: any;
  public voucherInfoToPayment: any;
  public router_path: any;
  public paymentMethods: any;
  public paymentOptionsList: any = [];
  walletHistory: any = [];
  shouldShowWalletHistoryDetails: boolean = true;
  user: any;
  isWalletTransactionLoading: boolean = true;
  paymentDeeplinkData: any = null;
  @ViewChild('paymentCard') public paymentcard: WalletComponent;
  selectedPaymentOption: any;

  ngOnInit(): void {
    this.user = JSON.parse(this.storage.getItem('b2bUser', 'session'));
    this.bookingInfo = this.storage.getItem('bookingInfo', 'session');
    if (this.storage.getItem('paymentDeeplinkData', 'session')) {
      this.paymentDeeplinkData = JSON.parse(this.storage.getItem('paymentDeeplinkData', 'session'));
    }
    const booking_details = JSON.parse(this.storage.getItem('bookingDetails', 'session'));

    if (booking_details?.redirectGatewayParameters) {
      let iframeUrl = this.formIframeUrl(booking_details.redirectGatewayParameters);
      this.iframeUrl = this._sanitizationService.bypassSecurityTrustResourceUrl(iframeUrl);
    }
    if (typeof window !== 'undefined' && window.location.pathname === '/payments') {
      this.showIframe = false;
    } else if (typeof window !== 'undefined' && window.location.pathname === '/payments/eft') {
      this.showIframe = true;
    }
    this.bookingService.currentVoucherAmount.subscribe((voucher: any) => {
      this.voucherData = voucher;
    });
    this.bookingService.currentVoucherInfo.subscribe((data: any) => {
      this.voucherInfoToPayment = data;
    });
    this.loadPaymentMethods();
    this.setDefaultPaymentOption();
  }

  loadPaymentMethods() {
    const storedPaymentMethods = this.storage.getItem('paymentMethods', 'session');
    if (storedPaymentMethods) {
      this.paymentMethods = JSON.parse(storedPaymentMethods);
      this.paymentMethodsData();
    }
  }

  paymentMethodsData() {
    for (const paymentOption of this.paymentMethods.paymentOptions) {
      this.paymentOptionsList.push(paymentOption.paymentOptionGroup);
    } 
  }

  isMethodAvailable(param: string) {
    return this.paymentOptionsList.includes(param);
  }

  get isShowAddmoney(): boolean {
    return false;
  }

  private getCardDetails() {
    const cardDetails = this.paymentcard.card_detailsForm.value;
    return {
      nameOnCard: cardDetails.cardName,
      cardEncryptionKey: (() => {
        if (this.paymentcard.cardDetails?.cardToken) {
          return this.paymentcard.encryptionKey;
        } else {
          return '';
        }
      })(),
      saveUserAccountCard: false,
      cvv: cardDetails.cvv,
      expirationDate: {
        month: cardDetails.cardExpiryMonth,
        year: cardDetails.cardExpiry,
      },
      cardNumber: cardDetails.cardNumber.split(' ').join(''),
    };
  }

  private getBillingDetails(contact: any) {
    return {
      postalCode: '8001',
      addressLine1: 'Cape Town',
      country: this.i18Service.language.split('-')[1],
      contactNo: contact.mobileNo,
      city: 'Cape Town',
      contactCode: '27',
      companyName: this.paymentcard.companyName.value,
      companyVatNo: this.paymentcard.companyVatNo.value,
      vatInvoice: this.paymentcard.requireVat,
    };
  }

  private parseBookRequest() {
    const paymentReqInfo = JSON.parse(this.storage.getItem('paymentReqInfo', 'session'));
    if (this.paymentcard?.paymentMethods && this.paymentcard.selectedPaymentOption === 'CC') {
      return {
        passengers: paymentReqInfo.passengers,
        contact: paymentReqInfo.contact,
        products: paymentReqInfo.products,
        paymentData: this.paymentcard.paymentMethods.data,
        // selectedPaymentMethod: this.getSelectedCardPaymentInfo(),
        cardDetails: this.getCardDetails(),
        ignoreDuplicateBookings: true,
        billingDetails: this.getBillingDetails(paymentReqInfo.contact),
        data: paymentReqInfo.data,
        voucherData: (() => {
          if (this.voucherInfoToPayment) {
            return this.voucherInfoToPayment;
          } else {
            return null;
          }
        })(),
      };
    } else if (this.paymentcard.selectedEftMethod) {
      this.paymentcard.noBankSelected = false;
      return {
        passengers: paymentReqInfo.passengers,
        contact: paymentReqInfo.contact,
        products: paymentReqInfo.products,
        paymentData: this.paymentcard.paymentMethods.data,
        // selectedPaymentMethod: this.getSelectedEFTPaymentInfo(),
        ignoreDuplicateBookings: true,
        billingDetails: this.getBillingDetails(paymentReqInfo.contact),
        data: paymentReqInfo.data,
        voucherData: (() => {
          if (this.voucherData) {
            return this.voucherData;
          } else {
            return null;
          }
        })(),
      };
    } else if (!this.paymentcard.selectedEftMethod) {
      this.paymentcard.noBankSelected = true;
    }
    return;
  }

  processPayment() {}

  moneyAddedtoWallet(_event: any) {}
  /**here we are not using the method .
   * if agent want to know transaction details in booking flow then we can call it within the onInIt,moneyAddedtoWallet methods  */
  getWalletTransactions() {
    this.paymentService.getWalletTransactions().subscribe(
      (res: any) => {
        if (res.success) {
          this.isWalletTransactionLoading = false;
          this.walletHistory = get(res, 'data', []);
        }
      },
      () => (this.isWalletTransactionLoading = false)
    );
  }

  formIframeUrl(obj: any) {
    let newOnj = {};
    for (let i = 0; i < obj.length; i++) {
      if (obj[i].key != 'TARGET_URL') {
        let g = obj[i];
        newOnj[g.key] = g.value;
      }
    }

    let qs = Object.keys(newOnj)
      .map(function (key) {
        return key + '=' + newOnj[key];
      })
      .join('&');

    // print query string
    return `https://pay.ozow.com/?${qs}`;
  }
  ngOnDestroy() {
    $('#payment_failed_Modal').modal('hide');
  }
  showWalletHistory(event: any) {
    this.shouldShowWalletHistoryDetails = !event;
  }

  backToHome() {
    this.location.back();
  }
  /**To default payment method based on API respone  */
  setDefaultPaymentOption() {
    if (this.isMethodAvailable('CC')) {
      this.getSelectedPaymentOption('CC');
    } else if (this.isMethodAvailable('CASH') || this.isMethodAvailable('REFT')) {
      this.getSelectedPaymentOption('Wallet');
    } else if (this.isMethodAvailable('EFT')) {
      this.getSelectedPaymentOption('EFT');
    }
  }
  /**To get user selected payment option */
  getSelectedPaymentOption(param: any) {
    this.selectedPaymentOption = param;
    if(this.paymentcard){
      this.paymentcard.selectedTab = param;
    }
  }
  selectedOptionActive(param: any) {
    return this.selectedPaymentOption === param;
  }
}
