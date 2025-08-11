import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PaymentService } from '../service/payment.service';
import { get } from 'lodash';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { checkPaxValidationErrors } from '@app/flights/utils/search.utils';
import { ApiService } from '@app/general/services/api/api.service';
import { checkPaymentTypeFee } from '../utils/payment-utils';
import { ErrorMappingServiceService } from '@app/_core/services/error-mapping-service.service';
import { B2bApiService } from '@app/general/services/B2B-api/b2b-api.service';
import { PERMISSIONS } from '@app/general/services/B2B-api/role.constants';
import { IframeWidgetService } from '@app/general/services/iframe-widget.service';
import { UniversalStorageService } from '@app/general/services/universal-storage.service';

@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.scss'],
})
export class WalletComponent implements OnInit {
  OFFLINE_DEPOSIT: string = 'offlineDeposit';
  WALLET: string = 'wallet';
  PAYSTACK: string = 'payStack';
  FIRST_INDEX: number = 0;
  public flip_Card = false;
  public card_detailsForm: UntypedFormGroup;
  public paymentMethods: any;
  public eftMethods: any = [];
  public isEfTselected = false;
  public selectedMethod: string;
  public selectedEftMethod: any;
  public paymentOptionsList = <any>[];
  public selectedPaymentOption: string;
  public processingFeeAmount: number = 0;
  public year = new Date().getFullYear();
  public yearsArray: any = [];
  public expiryYear: number;
  @Output() cc_ProcessingFee: EventEmitter<any> = new EventEmitter<any>();
  public submitted: boolean = false;
  public invalid_payment: boolean = false;
  public invalid_card: boolean = false;
  public invalid_payment_process = false;
  public invalid_payment_details: boolean = false;
  public cardExpired = false;
  public bookingFailed: boolean = false;
  public cantProcessBooking: boolean = false;
  public credentials: any;
  public selectedCard: any;
  public cardDetails: any;
  public encryptionKey: any;
  public linksData: any;
  public requireVat: boolean = false;
  public companyName = new UntypedFormControl('');
  public companyVatNo = new UntypedFormControl('');
  public showCompanyVat: boolean = false;
  public noBankSelected: boolean = false;
  public paymentCCmethods: any;
  addmoneyLayout: boolean = false;
  shouldShowWalletBalance: boolean = true;
  user: any;
  wallet: any = null;
  bookingInfo: any = null;
  paymentReqInfo: any = null;
  isWalletPayLoading: boolean = false;
  isReserveLoading: boolean = false;
  paymentDetails: any;
  isWalletBalanceLoading: boolean = true;
  shouldShowPaymentOption: boolean = false;
  paymentGateWay: string;
  bookingSummaryAmt: any = null;
  public isLoading = false;
  paxNamelengthError: boolean = false;
  BookApiError: any = null;
  @Output() moneyAddedtoWallet = new EventEmitter<any>();
  @Output() showWalletHistory = new EventEmitter<any>();
  offlinebanksList: any = [];
  selectedAddmoneyOption: string = '';
  isIframeDisplayed: boolean = false;
  showAddMoneySec: boolean = false;
  selectedPaymentMethod: any = null;
  cashPaymentMethods: any = null;
  addMoneyToWallet_Modal_show = false;
  payment_failed_Modal_show = false;
  success_modal_show = false;
  disableEFT_PayNow: boolean = false;
  reserveEFTMethods: any = null;
  currency_Code: string = 'ZAR';
  selectedTab :any;
  constructor(
    private paymentService: PaymentService,
    private snackBar: MatSnackBar,
    private router: Router,
    public apiService: ApiService,
    private errorMappingServiceService: ErrorMappingServiceService,
    public b2bApiService: B2bApiService,
    private iframewidgetService: IframeWidgetService,
    private storage: UniversalStorageService
  ) {
    this.getPaymentGateways();
  }

  ngOnInit(): void {
    this.paymentMethods = JSON.parse(this.storage.getItem('paymentMethods', 'session'));
    this.user = JSON.parse(this.storage.getItem('b2bUser', 'session'));
    this.currency_Code = this.storage.getItem('currencycode', 'session');
    if (this.hasPermissionForWalletAgent()) this.loadWallet();
    this.paymentReqInfo = this.storage.getItem('paymentReqInfo', 'session');

    if (typeof window !== 'undefined' && (window.location.pathname === '/payments' || window.location.href.includes('wallet'))) {
      this.selectedMethod = this.WALLET;
      this.shouldShowPaymentOption = false;
      this.getSelectedPaymentOption(this.selectedMethod);
    } else if (typeof window !== 'undefined' && window.location.pathname === '/payments-method') {
      this.shouldShowPaymentOption = true;
      this.selectedMethod = this.PAYSTACK;
      this.getSelectedPaymentOption(this.PAYSTACK);
    }
    setTimeout(() => {
      this.bookingSummaryAmt = this.storage.getItem('bookingSummaryAmt', 'session');
    }, 1500);
  }

  loadWallet() {
    this.paymentService.getWalletBalance().subscribe((res: any) => {
      this.isWalletBalanceLoading = false;
      this.wallet = get(res, 'data', null);
    });
  }

  showAddMoneyLayout() {
    this.addmoneyLayout = false;
  }

  public showCompanyDetails(event: Event) {
    this.requireVat = event['checked'];
    if (event['checked']) {
      this.showCompanyVat = true;
      this.companyName.setValue(this.user?.agency_name);
      this.companyName.setValidators(Validators.required);
      this.companyName.updateValueAndValidity();
      this.companyVatNo.setValidators(Validators.required);
      this.companyVatNo.updateValueAndValidity();
    } else if (!event['checked']) {
      this.showCompanyVat = false;
    }
  }

  payAmount() {
    this.selectedPaymentMethod = this.cashPaymentMethods?.paymentMethods[0]; 
    this.proceedPayment();
    this.isWalletPayLoading = true;
  }

  getSelectedPaymentOption(paymentmethod: string, param2?: string) {
    if (param2 === 'closeModal') {
      this.success_modal_show = false;
    }
    this.selectedMethod = paymentmethod;
    this.shouldShowWalletBalance = true;
    this.processingFee(paymentmethod);
    if (paymentmethod == this.PAYSTACK) this.showWalletHistory.emit(true);
    else this.showWalletHistory.emit(false);
  }

  moneyAdded(_event: any) {
    this.moneyAddedtoWallet.emit(true);
    this.getSelectedPaymentOption(this.WALLET);
  }

  showAddMoneyCard() {
    this.shouldShowWalletBalance = false;
  }

  updateWalletAmount(param?: any) {
    if (param) this.loadWallet();
  }

  openAmountAddedConfirmationModal() {
    this.success_modal_show = true;
  }

  ngOnDestroy() {
    this.success_modal_show = false;
    this.snackBar.dismiss();
    this.addMoneyToWallet_Modal_show = false;
    this.payment_failed_Modal_show = false;
  }

  selectPaystackTabHandler(paymentmethod: any) {
    this.showAddMoneySec = true;
    this.addMoneyToWallet_Modal_show = true;
    this.getAddMoneyPaymentOption('PAYSTACK');
  }

  getPaymentGateways() {
    this.paymentService.getPaymentMethods().subscribe((res: any) => {
      this.paymentDetails = res.data.paymentOptions;
      this.paymentOptionsList = res.data.paymentOptions;
      this.paymentGateWay = this.paymentDetails[this.FIRST_INDEX]?.name;
    });
  }

  closeAddMoneySection() {
    this.addMoneyToWallet_Modal_show = false;
    this.showAddMoneySec = false;
  }
  walletUpdated() {
    this.loadWallet();
    this.addMoneyToWallet_Modal_show = false;
    this.closeAddMoneySection();
  }
  hasPermissionForWalletAgent() {
    const user = this.user;
    return user.permission.some((each: number) => each === PERMISSIONS.walletAdmin);
  }

  processingFee(paymentMethod: any) {
    let paymentOption = paymentMethod == 'wallet' ? 'CASH' : null;
    if (this.paymentMethods?.paymentOptions?.length > 0 && paymentOption) {
      this.paymentMethods.paymentOptions.forEach((x: any) => {
        x.paymentMethods.forEach((y: any) => {
          if (y.paymentOptionName == paymentOption) {
            this.checkSelectCardTypeamount(y);
          }
        });
      });
    }
  }
  /*to check selected paymentmethod (Visa,mastercard ..etc) product amount else check all products of payment method */
  checkSelectCardTypeamount(data: any) {
    if (data?.amount) {
      this.emitPaymentTypeFee(data.amount);
    } else if (data?.products) {
      this.checkPaymentProductsData(data.products);
    }
  }
  /**To check selected card type have products with in object for processing fee */
  checkPaymentProductsData(products: any) {
    this.emitPaymentTypeFee(products);
  }
  /**TO send payment processing fee to paymentUtils and get updated values */
  emitPaymentTypeFee(data: any) {
    this.processingFeeAmount = null;
    let proceessFee = checkPaymentTypeFee(data);
    this.cc_ProcessingFee.emit(proceessFee);
    this.paymentService.changeProcessingFee(proceessFee);
  }
  checkPaymentProducts(products: any) {
    let procuctsAmount: number = 0;
    products.forEach((z: any) => {
      procuctsAmount += z.amount;
    });
    this.processingFeeAmount = products;
    this.paymentService.changeProcessingFee(procuctsAmount);
  }
  /**get getAddMoneyPaymentOptions  within the popup */

  getAddMoneyPaymentOption(option: string) {
    this.selectedAddmoneyOption = option;
  }
  // fetech payment options
  isWalletPaymentOptionAvailable(param: string) {
    if (this.paymentOptionsList && this.paymentOptionsList.length > 0) {
      for (let paymentOption in this.paymentOptionsList) {
        if (this.paymentOptionsList[paymentOption].name.toUpperCase() === param) {
          return true;
        }
      }
    }
  }
  IframeisDisplayed(event: boolean) {
    this.isIframeDisplayed = event;
  }
  checkSufficentAmount(): boolean {
    return (
      Boolean(this.bookingSummaryAmt &&
      this.wallet?.amount &&
      this.getWalletDebitedAmount() <= this.wallet?.amount)
    );
  }
  validationResults(bookingDetails: any) {
    if (bookingDetails.validationResults) {
      const paxNameValidation = checkPaxValidationErrors(bookingDetails);
      if (paxNameValidation && paxNameValidation.nameLengthValid == false) {
        this.paxNamelengthError = true;
        this.payment_failed_Modal_show = true;
      } else if (
        bookingDetails.validationResults &&
        bookingDetails.validationResults.paymentDetailsValidationResults.invalidFields.paymentMethodValid == false
      ) {
        this.payment_failed_Modal_show = true;
      }
    }
  }
  flight_results() {
    this.router.navigate(['/flights/results'], {
      queryParamsHandling: 'preserve',
    });
  }
  navigateToTravellerpage() {
    this.router.navigate(['/booking/flight-details'], {
      queryParamsHandling: 'preserve',
    });
  }
  /**To check booking payment methods are available or not */
  isBookingPaymentOptionAvailable(param: any) {
    if (this.paymentMethods?.paymentOptions?.length !== 0) {
      for (let paymentOption in this.paymentMethods?.paymentOptions) {
        if (this.paymentMethods?.paymentOptions[paymentOption].paymentOptionGroup === 'EFT') {
          this.eftMethods = this.paymentMethods?.paymentOptions[paymentOption];
        }
        if (this.paymentMethods?.paymentOptions[paymentOption].paymentOptionGroup === 'REFT') {
          this.reserveEFTMethods = this.paymentMethods?.paymentOptions[paymentOption];
        }
        if (this.paymentMethods?.paymentOptions[paymentOption].paymentOptionGroup === 'CASH') {
          this.cashPaymentMethods = this.paymentMethods?.paymentOptions[paymentOption];
        }
        if (this.paymentMethods?.paymentOptions[paymentOption].paymentOptionGroup === param) {
          return true;
        }
      }
    }
  }
  /**To reseve booking with EFT payment method */
  reserveBooking(idx?: number) {
    this.selectedEftMethod = this.reserveEFTMethods?.paymentMethods[0] || null;
    this.selectedPaymentMethod = this.selectedEftMethod;
    this.proceedPayment();
    this.isReserveLoading = true;
  }
  /**To reseve booking with EFT payment method */
  paywithEFT(idx?: number) {
    this.selectedEftMethod = this.eftMethods?.paymentMethods[idx || 0] || null;
    this.selectedPaymentMethod = this.selectedEftMethod;
    this.proceedPayment();
    this.disableEFT_PayNow = true;
  }
  proceedPayment() {
    let paymentReqObj = JSON.parse(this.storage.getItem('paymentReqInfo', 'session'));
    let bookReqObj = {
      passengers: paymentReqObj.passengers,
      contact: paymentReqObj.contact,
      products: paymentReqObj.products,
      paymentData: this.paymentMethods?.data,
      selectedPaymentMethod: this.selectedPaymentMethod,
      ignoreDuplicateBookings: false,
      data: paymentReqObj.data,
    };
    this.bookFlight(bookReqObj);
  }
  bookFlight(bookReqObj: any) {
    if (bookReqObj) { 
      this.isLoading = true;
      this.storage.setItem('bookAPIRequestData', JSON.stringify(bookReqObj), 'session');
      this.paymentService.bookB2BFlight(bookReqObj).subscribe(
        (res: any) => {
          let bookingDetails = res;
          this.isLoading = false;
          if (res.success) {
            this.loadWallet();
            this.storage.setItem('bookingDetails', JSON.stringify(res), 'session');
            this.router.navigate(['/payments/bookingConfirm'], {
              queryParamsHandling: 'preserve',
            });
            this.storage.removeItem('paymentReqInfo');
          } else {
            this.validationResults(res);
          }
          if (bookingDetails.errors) {
            const { category, action, message } = this.errorMappingServiceService.mapError(bookingDetails.errors);
            const err_Obj = {
              category: category,
              action: action,
              description: message,
            };
            this.BookApiError = err_Obj;
            this.payment_failed_Modal_show = true;
            if (this.BookApiError.category !== 'unknown') {
              return;
            }
          }
          this.isWalletPayLoading = false;
          this.isReserveLoading = false;
          this.disableEFT_PayNow = false;
        },
        (error) => {
          if (error) {
            this.isLoading = false;
            if (error.error) {
              this.payment_failed_Modal_show = true;
              this.isWalletPayLoading = false;
              this.isReserveLoading = false;
              this.disableEFT_PayNow = false;
            }
          }
        }
      );
    }
  }

  openModal() {
    this.payment_failed_Modal_show = true;
  }

  closeModal() {
    this.payment_failed_Modal_show = false;
  }

  public selectEftMethod(param: string) {
    this.isEfTselected = true;
    this.selectedEftMethod = param;
  }
  /**here to check is B2B Clubhub organization or not  */
  isClubHubOrg() {
    return Boolean(this.iframewidgetService.b2bOrganization() == 'TS_CT');
  }
  getWalletDebitedAmount(){
    let walletDebitedAmount : number = 0;
   if (this.storage.getItem('bookingInfo', 'session') && this.bookingSummaryAmt) {
     let bookingInfo = JSON.parse(this.storage.getItem('bookingInfo', 'session'));
     let totalMarkupAmount =
       bookingInfo?.itineraryData?.additionalMarkup +
       bookingInfo?.itineraryData?.markupAmount -
       bookingInfo?.itineraryData?.dynamicDiscount;
       walletDebitedAmount = this.bookingSummaryAmt - totalMarkupAmount;  
   } 
   return walletDebitedAmount;
  }
}
