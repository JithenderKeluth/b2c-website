
import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
  ElementRef,
  ChangeDetectorRef,
  Input,
  Inject, PLATFORM_ID
} from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators, ValidatorFn } from '@angular/forms';
import { Router } from '@angular/router';
import { PaymentService } from '../service/payment.service';
import { ApiService } from '@app/general/services/api/api.service';
import { keyboardAllowCharsOnly, numInputNoChars } from '@app/flights/utils/odo.utils';
import { responsiveService } from '@app/_core';
import { languageArray } from '@app/i18n/language-selection';
import { IframeWidgetService } from '@app/general/services/iframe-widget.service';
import { AppSessionService } from '@shared/session/app-session.service';
import { getBaggageFee } from '@app/booking/utils/traveller.utils';
import { BinListResponse, checkPaymentTypeFee } from '../utils/payment-utils';
import { SessionStorageService } from 'ngx-webstorage';
import { BookingService } from '@app/booking/services/booking.service';
import { SessionService } from '../../general/services/session.service';
import { UniversalStorageService } from '@app/general/services/universal-storage.service';
import { MatDialog } from '@angular/material/dialog';
import { QueryStringAffid } from '@app/general/utils/querystringAffid-utils';
import {AddCardComponent} from "@app/my-account/add-card/add-card.component";
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { DiscountDisplayModel, DiscountsDisplayModel } from '@app/flights/utils/discount.utils';
declare const $: any;
@Component({
  selector: 'app-payment-cards',
  templateUrl: './payment-cards.component.html',
  styleUrls: ['./payment-cards.component.scss', './../../../theme/country_selection.scss'],
})
export class PaymentCardsComponent implements OnInit {
  public flip_Card = false;
  public card_detailsForm: UntypedFormGroup;
  public paymentMethods: any;
  public eftMethods: any = [];
  public selectedCardMethod: any;
  public selectedEftMethod: string;
  public paymentOptionsList = <any>[];
  public selectedPaymentOption: string;
  public processingFeeAmount: any = null;
  public year = new Date().getFullYear();
  public yearsArray: any = [];
  public expiryYear: number;
  @Output() cc_ProcessingFee: EventEmitter<any> = new EventEmitter<any>();
  public submitted: boolean = false;
  public invalid_card: boolean = false;
  public invalid_payment_process = false;
  public invalid_payment_details: boolean = false;
  public invalidVoucher: boolean = false;
  public credentials: any;
  public selectedCard: any;
  public cardDetails: any;
  public encryptionKey: any;
  public requireVat: boolean = false;
  public companyName = new UntypedFormControl('');
  public companyVatNo = new UntypedFormControl('');
  public selectRedirectCard = new UntypedFormControl('');
  public showCompanyVat: boolean = false;
  public paymentCCmethods: any = null;
  public invalidCvv: boolean = false;
  public noFlightAvailable: boolean = false;
  public reDirect_enable: boolean = false;
  public redirect_PaymentMethods: any = [];
  public selectCard: boolean = false;
  public rewardPoints = new UntypedFormControl('');
  public travelRegulations = new UntypedFormControl('');
  public airlineRules = new UntypedFormControl('');
  public paymentErrors: any;
  public isPaymentErrorDismissed = false;
  public isConnected = false;
  @ViewChild('card_number') card_number: ElementRef;
  @ViewChild('cc_name') cc_name: ElementRef;
  @ViewChild('card_expiry') card_expiry: ElementRef;
  @ViewChild('cardExpiryYear') cardExpiryYear: ElementRef;
  @ViewChild('cvv') cvv: ElementRef;
  @ViewChild('savedcardCvv') savedcardCvv: ElementRef;

  selectedRedirectPaymentcardType: any = null;
  bookingAmountVal: any = 0;
  bookingInfo: any;
  budgetCCmethods: any = null;
  selectedTab: any = null;
  installments: any = [];
  selectedbudgetCardData: any = {};
  tempCardBinData: any = null;
  get paymentCardForm() {
    return this.card_detailsForm.controls;
  }
  @Input() set bookingAmount(val: number) {
    this.bookingAmountVal = 0;
    if (val) {
      this.bookingAmountVal = val;
    }
  }
  @Input() discounts?: DiscountsDisplayModel;
  @Input() selectedDiscount?: DiscountDisplayModel;
  @Input() totalPrice?: number;
  isMobile: boolean = false;
  savedCardCvv = new UntypedFormControl('');
  countryValue: string;
  isCreditCardAvl: boolean = false;
  public BookApiError: any = null;
  binListResponse: BinListResponse | null = null;
  invalid_debitCard: boolean = false;
  showAbsaCardMessageForSix = false;
  showStandardBankCardMessageForSix = false;
  showAbsaCardMessageForEight = false;
  invalid_PaymentType: boolean = false;
  languagesArray: any = languageArray;
  paxNamelengthError: boolean = false;
  public rewardPointsArray: any[] = [];
  selectedreward: any;
  public countryDialCode: string;
  public countrydata: any;
  public countryName: any;
  public countryCode: string;
  public currencyVal: string;
  public inputCleared = false;
  disableEFT_PayNow: boolean = false;
  budgetCCmethods_PaymentOption: any = null;
  selectedCardTypePaymentData: any = null;
  paymentDeeplinkData: any = null;
  voucherAmount: number = 0;

  isSaveCardChecked: boolean = false;
  cpySource: string;
  @Output('setSaveCardDetails') setSaveCardDetails = new EventEmitter<boolean>();
  private isBrowser: boolean;
  @Output() binListResponseChanged = new EventEmitter<BinListResponse | null>();
  @Output() discountInfo = new EventEmitter<void>();

  constructor(
    private fb: UntypedFormBuilder,
    private router: Router,
    private paymentService: PaymentService,
    public elementRef: ElementRef,
    private cdRef: ChangeDetectorRef,
    public apiService: ApiService,
    public responsiveservice: responsiveService,
    public iframewidgetSevice: IframeWidgetService,
    public appSessionService: AppSessionService,
    private sessionStorageService: SessionStorageService,
    private bookingService: BookingService,
    private sessionService: SessionService,
    private dialogService: MatDialog,
    private storage: UniversalStorageService,
    private queryStringAffid : QueryStringAffid,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }
  ngOnInit(): void {
    this.selectedTab = 'CC';
    this.countryValue = this.apiService.extractCountryFromDomain();
    if(this.isBrowser){
      this.cpySource = this.countryValue === 'ABSA'
      ? 'absatravel'
      : this.countryValue === 'SB' ? 'standardbank' : new URLSearchParams(window.location.search).get('cpysource') ?? '';
    }

    for (let i = 0; i <= 30; i++) {
      this.yearsArray.push({ year: this.year + i });
    }
    this.getPaymentMethods();
    this.getTBIRedeemPointsArray();
    this.initForm();
    this.getCredentialData();
    if (this.storage.getItem('bookingInfo', 'session')) {
      this.bookingInfo = JSON.parse(this.storage.getItem('bookingInfo', 'session'));
    }
    if (this.storage.getItem('paymentDeeplinkData', 'session')) {
      this.paymentDeeplinkData = JSON.parse(this.storage.getItem('paymentDeeplinkData', 'session'));
    }
    this.isRedirectenable();
    this.onResize();
    this.getSelectedPaymentOption(this.selectedTab);
    if (this.storage.getItem('selectedPayment', 'session')) {
      let selectedMethod = this.storage.getItem('selectedPayment', 'session');
      this.getSelectedPaymentOption(selectedMethod);
    }
    if ((this.countryValue === 'NG' || this.countryValue === 'GI') && this.isPaymentOptionAvailable('PAYSTACK')) {
      this.getSelectedPaymentOption('PAYSTACK');
    }
    let countryVal = this.languagesArray.find((x: any) => x.domain == this.apiService.extractCountryFromDomain());
    const currency = countryVal.currency;
    this.installments = [
      { months: 3, amount: 0, currencyCode: currency },
      { months: 6, amount: 0, currencyCode: currency },
      { months: 12, amount: 0, currencyCode: currency },
    ];
    this.currencyVal = currency;
    if (this.rewardPointsArray.length > 0) {
      this.selectedRewards('', 0);
    }
    this.processingFee(this.selectedTab, this.selectedCardMethod);
    this.bookingService.currentVoucherAmount.subscribe((voucherdata: any) => {
      this.voucherAmount = voucherdata;
    });
    this.checkNetworkConnection();
    this.sessionService.userLoggedInfo.subscribe((data: any) => {
      this.getCredentialData();
    })
  }
  /* check the screen width for its mobile or desktop */
  onResize() {
    if (this.responsiveservice.screenWidth == 'sm' || this.responsiveservice.screenWidth == 'md') {
      this.isMobile = true;
    }
  }
  getCredentialData() {
    this.credentials = null;
    this.credentials = this.sessionService.getUserCredentials();
    if (!this.credentials && this.selectCard) {
      this.selectCardDetails(false,null)
    }
  }
  initForm(): void {
    this.card_detailsForm = this.fb.group({
      cardNumber: ['', [Validators.required, Validators.minLength(12), this.binValidator()]],
      cardName: [
        '',
        [Validators.pattern('[a-zA-Z ]*$'), Validators.minLength(3), Validators.maxLength(30), Validators.required],
      ],
      cardExpiry: ['', Validators.required],
      cardExpiryMonth: ['', Validators.required],
      cvv: ['', Validators.required],
    });
  }

  ngAfterContentChecked() {
    this.cdRef.detectChanges();
  }
  getPaymentMethodName(paymentMethodName: any) {
    return paymentMethodName.trim();
  }

  toggleSaveCardDetailsCheck() {
    this.isSaveCardChecked = !this.isSaveCardChecked;
    this.setSaveCardDetails.emit(this.isSaveCardChecked);
  }

  onChangeEvent(e: Event): void {
    this.selectedEftMethod = '';
    this.encryptionKey = '';
    if (
      this.card_detailsForm.value.cardNumber &&
      this.card_detailsForm.value.cardName &&
      this.card_detailsForm.value.cardExpiry &&
      this.card_detailsForm.value.cardExpiryMonth &&
      !this.card_detailsForm.value.cvv
    ) {
      //this.flip_Card = true;
    }
  }

  binValidator() : ValidatorFn {
    return (control) => {
      if (this.showAbsaCardMessageForSix && this.showAbsaCardMessageForEight) {
        return {
          notAbsaCard: true
        }
      } else if (this.showStandardBankCardMessageForSix) {
        return {
          notStandardBankCard: true
        }
      } else {
        return null;
      }
    }
  }

  public onKeyEnterEvent(event: any) {
    let userCardNum = event.target.value.split(' ').join('');
    this.invalidCvv = false;
    this.paymentErrors = null;
    this.isPaymentErrorDismissed = false;
    this.selectedCard = '';
    let isNewCardNumber = this.getBinCardNumbers(userCardNum);
    if (event.target.value) {
      if (userCardNum.length > 5 && isNewCardNumber) {
        this.invalid_card = false;
        this.invalid_PaymentType = false;
        this.card_detailsForm.get('cvv')!.setValue('');

        this.tempCardBinData = (this.countryValue === 'ABSA') && userCardNum.length > 7
          ? userCardNum.slice(0, 8)
          : userCardNum.slice(0, 6);

        this.validateCreditCardNumber(userCardNum.slice(0, 6));
        //For ABSA, trigger BIN validation for length of 6 and then length of 8, if possible.
        if (this.countryValue === 'ABSA' && userCardNum.length > 7) {
          this.validateCreditCardNumber(userCardNum.slice(0, 8));
        } else if (this.countryValue === 'ABSA' && userCardNum.length <= 7) {
          this.showAbsaCardMessageForEight = true; // For ABSA, set to true if less than 8 digits to show error message for first six digits
        } else if (this.countryValue === 'SB' && userCardNum.length <= 7) {
          this.showStandardBankCardMessageForSix = true; // For Standard Bank, set to true if less than 8 digits to show error message for first six digits
        }

      } else if (userCardNum.length < 5) {
        this.tempCardBinData = null;
        this.invalid_PaymentType = false;
        this.invalid_card = false;
        this.selectedCardMethod = null;
        this.setBinListResponse(null);
      }
      if (userCardNum.length > 5 && (!this.selectedCardMethod || isNewCardNumber)) {
        this.getCardType(userCardNum);
      }
      // this.invalid_payment_details = false;
      this.paymentErrors = null;
      this.isPaymentErrorDismissed = false;
      this.encryptionKey = '';
    } else {
      this.selectedCardMethod = null;
      this.invalid_card = false;
      this.invalid_debitCard = false;
      this.invalid_PaymentType = false;
      // this.invalid_payment_details = false;
      this.paymentErrors = null;
      this.isPaymentErrorDismissed = false;
      this.encryptionKey = '';
      this.validateCreditCardNumber(null);
    }
  }
  getBinCardNumbers(userCardNum: any) {
    let newCardBinNum: any;
    if (!this.tempCardBinData) {
      this.tempCardBinData = userCardNum.slice(0, 6);
    } else {
      if (this.countryValue === 'ABSA' && userCardNum.length > 7)
        newCardBinNum = userCardNum.slice(0, 8);
      else
        newCardBinNum = userCardNum.slice(0, 6);
    }
    if (this.tempCardBinData && newCardBinNum && this.tempCardBinData == newCardBinNum) {
      return false;
    } else if (this.tempCardBinData && newCardBinNum && this.tempCardBinData !== newCardBinNum) {
      this.tempCardBinData = newCardBinNum;
      return true;
    } else {
      return true;
    }
  }
  selectCardDetails(cardChecked: any, cardDetails: any) {
    this.invalid_card = false;
    this.paymentErrors = null;
    this.isPaymentErrorDismissed = false;
    this.invalid_PaymentType = false;
    this.card_detailsForm.get('cvv').setValue('');
    this.savedCardCvv.setValue('');
    if (cardChecked) {
      this.selectCard = cardChecked;
      this.encryptionKey = cardDetails?.cardToken;
      this.validateCreditCardNumber(cardDetails?.cardBin);
      this.getCardType(cardDetails?.cardBin);
      if (this.isMobile || this.countryValue === 'ABSA' || this.countryValue === 'SB') {
        this.savedCardCvv.setValidators(Validators.required);
        this.card_detailsForm.get('cvv').setValidators(null);
        this.card_detailsForm.get('cvv').updateValueAndValidity();
      }
    } else if (!cardChecked) {
      this.selectCard = false;
      this.processingFeeAmount = null;
      this.encryptionKey = '';
      this.validateCreditCardNumber(null);
      this.selectedCardMethod = null;
      this.invalid_card = false;
      this.savedCardCvv.setValidators(null);
      this.savedCardCvv.updateValueAndValidity();
      this.card_detailsForm.get('cvv').setValidators(Validators.required);
      this.card_detailsForm.get('cvv').updateValueAndValidity();
    }

    this.cardDetails = cardDetails;
    if (this.selectedCard == cardDetails?.cardToken) {
      this.selectedCard = '';
      this.card_detailsForm.reset();
    } else {
      this.selectedCard = cardDetails?.cardToken;
      this.expiryYear = cardDetails?.expireDate?.slice(3, 5);
      let formmatedYear = new Date().getFullYear().toString().slice(0, 2) + cardDetails?.expireDate?.slice(3, 5);
      this.card_detailsForm.get('cardNumber').setValue(cardDetails?.cardNumber);
      this.card_detailsForm.get('cardName').setValue(cardDetails?.cardHolderName);
      this.card_detailsForm.get('cardExpiry').setValue(formmatedYear);
      this.card_detailsForm.get('cardExpiryMonth').setValue(cardDetails?.expireDate?.slice(0, 2));
    }
  }

  cardFlip() {
    this.flip_Card = !this.flip_Card;
  }
  cardFlipInit() {
    this.flip_Card = false;
  }

  // fetech payment options
  isPaymentOptionAvailable(param: string) {
    if (this.paymentOptionsList && this.paymentOptionsList.length) {
      for (let paymentOption in this.paymentOptionsList) {
        if (this.paymentOptionsList[paymentOption] === param) {
          return true;
        }
      }
    }
  }

  // payment option selected
  getSelectedPaymentOption(param: string) {
    this.selectedPaymentOption = param;
    this.invalid_debitCard = false;
    this.invalid_card = false;
    this.paymentErrors = null;
    this.isPaymentErrorDismissed = false;
    // this.invalid_card_fromAPI = false;
    this.invalid_PaymentType = false;
    if(this.isBrowser){
      let tabInfo = document.getElementById(param + '_Tab');
      if (tabInfo) {
        tabInfo.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'start' });
      }
    }
    
    this.selectedCardTypePaymentData = null;
    if (this.selectedPaymentOption === 'CC' || this.selectedPaymentOption === 'DC') {
      this.selectedEftMethod = null;
      this.selectedCardMethod = null;
      this.processingFeeAmount = null;
      this.selectedTab = param;
      this.selectedCard = null;
      this.processingFee(this.selectedPaymentOption, this.selectedCardMethod);
      this.initForm();
      this.submitted = false;
      this.card_detailsForm.removeControl('selectBank');
      this.card_detailsForm.removeControl('budget_period');
      this.getPaymentMethods();
    } else if (this.selectedPaymentOption === 'EFT') {
      this.selectedCardMethod = null;
      this.selectedCard = null;
      this.changePaymentTab();
      this.selectedTab = 'EFT';
      this.selectedEftMethod = this.eftMethods.paymentMethods[0].name;
      this.processingFee(this.selectedPaymentOption, this.selectedEftMethod);
      this.selectedTab = 'EFT';
    } else if (this.selectedPaymentOption === 'CC_3D_INS' || this.selectedPaymentOption === 'CC_INS') {
      this.selectedTab = this.selectedPaymentOption;
      this.selectedEftMethod = null;
      this.selectedCardMethod = null;
      this.selectedCard = null;
      this.selectCard = false;
      this.changePaymentTab();
      this.card_detailsForm.addControl('selectBank', new UntypedFormControl('', [Validators.required]));
      this.card_detailsForm.addControl('budget_period', new UntypedFormControl([], [Validators.required]));
    } else if (this.selectedPaymentOption === 'IPAY') {
      this.selectedTab = 'IPAY';
      this.selectedCardMethod = null;
      this.selectedEftMethod = null;
      this.selectedCard = null;
      this.changePaymentTab();
      this.processingFee(this.selectedPaymentOption, this.selectedEftMethod);
    } else if (this.selectedPaymentOption === 'MOBICRED') {
      this.selectedTab = 'MOBICRED';
      this.selectedCardMethod = null;
      this.selectedEftMethod = null;
      this.selectedCard = null;
      this.processingFeeAmount = null;
      this.changePaymentTab();
      this.processingFee(this.selectedPaymentOption, this.selectedEftMethod);
    } else if (this.selectedPaymentOption === 'MPESA') {
      this.selectedTab = 'MPESA';
      this.selectedCardMethod = null;
      this.selectedEftMethod = null;
      this.selectedCard = null;
      this.changePaymentTab();
    } else if (this.selectedPaymentOption === 'PAYSTACK') {
      this.selectedTab = 'PAYSTACK';
      this.selectedCardMethod = null;
      this.selectedEftMethod = null;
      this.selectedCard = null;
      this.processingFeeAmount = null;
      this.changePaymentTab();
    } else if (this.selectedPaymentOption === 'PAYFLEX') {
      this.selectedTab = 'PAYFLEX';
      this.selectedCardMethod = null;
      this.selectedEftMethod = null;
      this.selectedCard = null;
      this.processingFeeAmount = null;
      this.changePaymentTab();
      this.processingFee(this.selectedPaymentOption, this.selectedEftMethod);
    }
  }
  // Card payment
  public getSelectedCardInfo() {
    if (!this.reDirect_enable) {
      this.selectedCardTypePaymentData = this.selectCardMethod();
      return this.selectCardMethod();
    } else {
      return this.selectedRedirectPaymentcardType;
    }
  }
  selectCardMethod() {
    let paymentMethodSelected = <any>{};
    if (this.paymentMethods.paymentOptions) {
      for (let i = 0; i < this.paymentMethods.paymentOptions.length; i++) {
        if (
          (this.paymentMethods.paymentOptions[i].paymentOptionGroup === 'CC' && this.selectedTab === 'CC') ||
          (this.paymentMethods.paymentOptions[i].paymentOptionGroup === 'DC' && this.selectedTab === 'DC')
        ) {
          for (let j = 0; j < this.paymentMethods.paymentOptions[i].paymentMethods.length; j++) {
            if (this.paymentMethods.paymentOptions[i].paymentMethods[j].paymentMethodName === this.selectedCardMethod) {
              paymentMethodSelected = this.paymentMethods.paymentOptions[i].paymentMethods[j];
            }
          }
        } else if (
          this.paymentMethods.paymentOptions[i].paymentOptionGroup === 'CC' &&
          (this.selectedTab === 'CC_3D_INS' || this.selectedTab === 'CC_INS')
        ) {
          paymentMethodSelected = this.selectedbudgetCardData;
        }
      }
    }
    if (Object.keys(paymentMethodSelected).length == 0 && (this.countryValue !== 'ABSA' && this.countryValue !== 'SB')) {
      this.invalid_PaymentType = true;
      this.invalid_card = false;
    } else {
      this.invalid_PaymentType = false;
    }
    return paymentMethodSelected;
  }
  public showCompanyDetails(event: any) {
    this.requireVat = event['checked'];
    if (event['checked']) {
      this.showCompanyVat = true;
      this.companyName.setValidators(Validators.required);
      this.companyName.updateValueAndValidity();
      this.companyVatNo.setValidators(Validators.required);
      this.companyVatNo.updateValueAndValidity();
    } else if (!event['checked']) {
      this.showCompanyVat = false;
      this.companyName.reset();
      this.companyVatNo.reset();
    }
  }

  public validateCreditCardNumber(cardNumber: string | null) {
    if (cardNumber) {
      this.getPaymentCardType(cardNumber);
    } else {
      this.invalid_card = true;
      this.selectedCardMethod = null;
      this.tempCardBinData = null;
      this.processingFee(this.selectedTab, this.selectedCardMethod);
      this.selectedCardTypePaymentData = null;
      this.showAbsaCardMessageForSix = false;
      this.showAbsaCardMessageForEight = false;
      this.showStandardBankCardMessageForSix = false;
    }
  }

  public dismissPaymentError(): void {
  this.isPaymentErrorDismissed = true;
  }
  /**
   * getpayment card type based on binlist API response
   */
  getSelectedPaymentmethod() {
    if (this.binListResponse) {
      let cardInfo: any = this.binListResponse;
      if (this.selectedPaymentOption !== 'CC_3D_INS' && this.selectedPaymentOption !== 'CC_INS') {
        if (
          (cardInfo.type == 'credit' && this.isPaymentOptionAvailable('CC')) ||
          (cardInfo.type == 'debit' && !this.isPaymentOptionAvailable('DC'))
        ) {
          this.selectedPaymentOption = 'CC';
          this.selectedTab = 'CC';
          this.selectedActive('CC');
          this.invalid_debitCard = false;
        } else if (cardInfo.type == 'debit' && this.isPaymentOptionAvailable('DC')) {
          this.selectedPaymentOption = 'DC';
          this.selectedTab = 'DC';
          this.selectedActive('DC');
          this.invalid_debitCard = false;
        }
      }
      if (this.selectedPaymentOption && this.selectedCardMethod && !this.invalid_debitCard) {
        this.getSelectedCardInfo();
      } else {
        this.emitPaymentTypeFee(0);
      }
    }
  }
  /**
   * get selectedCardMethod value based on bin API response and set selectcardmethod
   * selectCardTypemethod(cardInfo: any) {
    if (cardInfo.scheme == 'mastercard') {
      this.selectedCardMethod = 'MC';
    } else if (cardInfo.scheme == 'visa') {
      this.selectedCardMethod = 'VC';
    } else if (cardInfo.scheme == 'amex') {
      this.selectedCardMethod = 'AE';
    } else if (cardInfo.scheme == 'discover') {
      this.selectedCardMethod = 'DC';
    } else if (cardInfo.scheme == 'jcb') {
      this.selectedCardMethod = 'JCB';
    } else if (cardInfo.scheme == 'diners') {
      this.selectedCardMethod = 'DC';
    } else {
      this.selectCardMethod = null;
    }
    if (this.selectedPaymentOption && this.selectedCardMethod && !this.invalid_debitCard) {
      this.processingFee(this.selectedPaymentOption, this.selectedCardMethod);
      this.getSelectedCardInfo();
    } else {
      this.processingFeeAmount = 0;
      this.paymentService.changeProcessingFee(this.processingFeeAmount);
    }
  }
   */

  // eft payment
  public getSelectedEFTInfo() {
    let paymentEFTSelected = <any>{};
    for (let i = 0; i < this.paymentMethods.paymentOptions.length; i++) {
      if (this.paymentMethods.paymentOptions[i].paymentOptionGroup === 'EFT') {
        for (let j = 0; j < this.paymentMethods.paymentOptions[i].paymentMethods.length; j++) {
          if (this.paymentMethods.paymentOptions[i].paymentMethods[j].name === this.selectedEftMethod) {
            paymentEFTSelected = this.paymentMethods.paymentOptions[i].paymentMethods[j];
          }
        }
      }
    }
    return paymentEFTSelected;
  }
  public getExpiryYear() {
    this.expiryYear = this.card_detailsForm.value.cardExpiry.toString().slice(-2);
  }
  public selectEftMethod(param: string) {
    this.selectedCardMethod = '';
    this.selectedEftMethod = param;
    this.processingFee(this.selectedPaymentOption, this.selectedEftMethod);
  }

  // instant eft method
  getInstantMethods() {
    let selectedPaymentMethod: any = null;
    for (let i = 0; i < this.paymentMethods.paymentOptions.length; i++) {
      if (
        ((this.paymentMethods.paymentOptions[i].paymentOptionGroup === 'IPAY' &&
          this.selectedPaymentOption == 'IPAY') ||
          (this.paymentMethods.paymentOptions[i].paymentOptionGroup === 'MOBICRED' &&
            this.selectedPaymentOption == 'MOBICRED') ||
          (this.paymentMethods.paymentOptions[i].paymentOptionGroup === 'MOBICRED' &&
            this.selectedPaymentOption == 'MOBICRED') ||
          (this.paymentMethods.paymentOptions[i].paymentOptionGroup === 'MPESA' &&
            this.selectedPaymentOption == 'MPESA') ||
          (this.paymentMethods.paymentOptions[i].paymentOptionGroup === 'PAYSTACK' &&
            this.selectedPaymentOption == 'PAYSTACK') ||
          (this.paymentMethods.paymentOptions[i].paymentOptionGroup === 'PAYFLEX' &&
            this.selectedPaymentOption == 'PAYFLEX')) &&
        this.paymentMethods?.paymentOptions[i]?.paymentMethods.length > 0
      ) {
        selectedPaymentMethod = this.paymentMethods?.paymentOptions[i]?.paymentMethods[0];
      }
    }
    return selectedPaymentMethod;
  }

  isActive(item: any) {
    return this.selectedEftMethod === item;
  }
  public processingFee(paymentOption: any, Paymentmethod: any) {
    if (
      (this.paymentMethods?.paymentOptions?.length && paymentOption === 'CC') ||
      this.selectedTab === 'CC' ||
      this.selectedTab === 'DC' ||
      this.selectedTab === 'CC_3D' ||
      this.selectedTab === 'DC_3D'
    ) {
      this.paymentMethods?.paymentOptions?.forEach((x: any) => {
        if (x.paymentOptionGroup && x.paymentOptionGroup === paymentOption && x.paymentOptionName != 'CC_INS') {
          if (Paymentmethod) {
            x.paymentMethods.forEach((y: any) => {
              if (
                y.paymentMethodName == Paymentmethod ||
                (y.paymentMethodIdentifier && y.paymentMethodIdentifier.split(':')[1] == Paymentmethod)
              ) {
                this.checkSelectCardTypeamount(y);
              }
            });
          } else {
            this.checkSelectCardTypeamount(x.paymentMethods[0]);
          }
        }
      });
    } else if (this.paymentMethods && paymentOption === 'EFT' && Paymentmethod) {
      this.eftProcessingFee(Paymentmethod);
    } else if (
      this.paymentMethods?.paymentOptions?.length &&
      ((paymentOption === 'CC_3D_INS' && this.selectedTab === 'CC_3D_INS') ||
        (paymentOption === 'CC_INS' && this.selectedTab === 'CC_INS')) &&
      Paymentmethod &&
      this.card_detailsForm.get('selectBank').value
    ) {
      this.budgetCardProcessFee(Paymentmethod, this.card_detailsForm.get('selectBank').value);
    } else if (
      this.paymentMethods &&
      (paymentOption === 'IPAY' ||
        paymentOption === 'MOBICRED' ||
        paymentOption === 'MPESA' ||
        paymentOption === 'PAYSTACK' ||
        paymentOption === 'PAYFLEX')
    ) {
      this.instantProcessingFee(paymentOption);
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
    let proceessFee = checkPaymentTypeFee(data, this.tempCardBinData);
    this.processingFeeAmount = proceessFee;
    this.cc_ProcessingFee.emit(proceessFee);
    this.paymentService.changeProcessingFee(proceessFee);
  }
  flipTheCard() {
    if (this.card_detailsForm.value.cvv) {
      this.flip_Card = !this.flip_Card;
    }
  }
  flight_results() {
    this.queryStringAffid.reIntiateNewSearch();
  }
  isRedirectenable() {
    if (this.paymentMethods && this.paymentMethods.paymentOptions) {
      for (let i = 0; i < this.paymentMethods.paymentOptions.length; i++) {
        if (this.paymentMethods.paymentOptions[i].paymentOptionGroup === 'CC') {
          this.reDirect_enable = this.paymentMethods.paymentOptions[i].isRedirectGateway;
          if (
            this.paymentMethods.paymentOptions[i].paymentOptionName == 'CC' ||
            this.paymentMethods.paymentOptions[i].paymentOptionName == 'CC_3D'
          ) {
            this.isCreditCardAvl = true;
          }
        }
      }
    }
  }
  selectRedirectPaymentCard(id: any) {
    this.selectedRedirectPaymentcardType = this.redirect_PaymentMethods.find((item: any) => item.id === id);
    this.selectedCardMethod = this.selectedRedirectPaymentcardType.paymentMethodIdentifier.split(':')[1];
    this.processingFee(this.selectedPaymentOption, this.selectedCardMethod);
  }
  getPaymentMethods() {
    this.paymentMethods = JSON.parse(this.storage.getItem('paymentMethods', 'session'));
    if (this.paymentMethods) {
      this.paymentMethodsData();
    }
    this.paymentCCmethods = [];
    if (
      this.paymentMethods?.paymentOptions &&
      this.responsiveservice.screenWidth != 'sm' &&
      this.responsiveservice.screenWidth != 'md'
    ) {
      this.paymentMethods.paymentOptions.forEach((x: any) => {
        if (
          ((x.paymentOptionGroup === 'CC' && this.selectedTab == 'CC') ||
            (x.paymentOptionGroup === 'DC' && this.selectedTab == 'DC')) &&
          x.paymentMethods &&
          x.paymentMethods.length > 0
        ) {
          this.paymentCCmethods = this.paymentCCmethods.concat(x.paymentMethods);
          this.selectedPaymentOption = this.selectedTab;
          return;
        } else if (x.paymentOptionGroup === 'CC' && (this.selectedTab == 'CC_3D_INS' || this.selectedTab == 'CC_INS')) {
          if (x.installmentIssuers && x.installmentIssuers.length > 0) {
            this.paymentCCmethods = [];
            this.paymentCCmethods = x.installmentIssuers[0].paymentMethods;
            this.selectedPaymentOption = this.selectedTab;
            return;
          }
        } else if (this.isPaymentOptionAvailable('CC') || this.isPaymentOptionAvailable('DC')) {
          this.selectedTab = 'CC';
        } else if (
          this.apiService.extractCountryFromDomain() !== 'NG' &&
          this.apiService.extractCountryFromDomain() !== 'GI' &&
          !this.isPaymentOptionAvailable('CC') &&
          !this.isPaymentOptionAvailable('DC')
        ) {
          this.selectedTab = this.paymentMethods.paymentOptions[0].paymentOptionGroup;
        }
      });
    }

    if (this.paymentCCmethods.length > 0) {
      const paymentCCmethodsList = Array.from(
        this.paymentCCmethods.reduce((m: any, t: any) => m.set(t.paymentMethodName, t), new Map()).values()
      );
      this.paymentCCmethods = paymentCCmethodsList;
    }
  }
  paymentMethodsData() {
    for (let paymentOptions in this.paymentMethods.paymentOptions) {
      let paymentOption = this.paymentMethods.paymentOptions[paymentOptions].paymentOptionGroup;
      this.paymentOptionsList.push(paymentOption);
      if (this.paymentMethods.paymentOptions[paymentOptions].paymentOptionGroup === 'CC') {
        this.redirect_PaymentMethods = this.paymentMethods.paymentOptions[paymentOptions].paymentMethods;
      }
      if (
        this.paymentMethods.paymentOptions[paymentOptions].paymentOptionGroup === 'EFT' &&
        this.paymentMethods.paymentOptions[paymentOptions].paymentMethods?.length > 0
      ) {
        this.eftMethods = this.paymentMethods.paymentOptions[paymentOptions];
        this.setEFT_Methods();
      }
      if (
        this.paymentMethods.paymentOptions[paymentOptions].paymentOptionGroup === 'CC' &&
        (this.paymentMethods.paymentOptions[paymentOptions].paymentOptionName === 'CC_3D_INS' ||
          this.paymentMethods.paymentOptions[paymentOptions].paymentOptionName === 'CC_INS')
      ) {
        this.budgetCCmethods = this.paymentMethods.paymentOptions[paymentOptions];
        this.budgetCCmethods_PaymentOption = this.paymentMethods.paymentOptions[paymentOptions].paymentOptionName;
      }
    }
  }
  setEFT_Methods() {
    if (this.apiService.extractCountryFromDomain() === 'NG' || this.apiService.extractCountryFromDomain() === 'GI') {
      if (this.iframewidgetSevice.isZenithbank_Iframe()) {
        this.eftMethods.paymentMethods = this.eftMethods.paymentMethods.filter((x: any) => x.bankId == 'zenith');
      }
    }
  }
  eftProcessingFee(Paymentmethod: any) {
    this.paymentMethods.paymentOptions.forEach((x: any) => {
      x.paymentMethods.forEach((y: any) => {
        if (y.name == Paymentmethod) {
          if (y.amount) {
            this.emitPaymentTypeFee(y.amount);
          } else if (y.products) {
            this.checkPaymentProductsData(y.products);
          }
        }
      });
    });
  }
  budgetCardProcessFee(paymentcardType: any, selectedbank: any) {
    this.paymentMethods.paymentOptions.forEach((x: any) => {
      if (x.paymentOptionName == 'CC_3D_INS' || x.paymentOptionName == 'CC_INS') {
        x.installmentIssuers.forEach((data: any) => {
          if (data.issuer == selectedbank) {
            data.paymentMethods.forEach((y: any) => {
              if (y.paymentMethodName == paymentcardType) {
                this.selectedbudgetCardData = y;
                /** display installment option based on payment card
                 *  this.installments=y.installmentMonths;
                 */

                if (y.amount) {
                  this.emitPaymentTypeFee(y.amount);
                } else if (y.products) {
                  this.checkPaymentProductsData(y.products);
                }
              }
            });
          }
        });
      }
    });
  }

  instantProcessingFee(paymentOption: any) {
    this.paymentMethods.paymentOptions.forEach((x: any) => {
      if (x.paymentOptionName === paymentOption) {
        if (x.paymentMethods[0].amount) {
          this.emitPaymentTypeFee(x.paymentMethods[0].amount);
        } else if (x.paymentMethods[0].products) {
          this.checkPaymentProductsData(x.paymentMethods[0].products);
        } else {
          let proceessFee = checkPaymentTypeFee(0, null);
          this.processingFeeAmount = proceessFee;
          this.cc_ProcessingFee.emit(proceessFee);
          this.paymentService.changeProcessingFee(proceessFee);
        }
      }
    });
  }
  changePaymentTab() {
    this.submitted = false;
    this.selectedRedirectPaymentcardType = null;
    this.initForm();
    this.selectRedirectCard.reset();
  }
  selectedActive(item: any) {
    return this.selectedTab === item;
  }
  //allows users to type only numbers
  onlyNumbers(event: any) {
    return numInputNoChars(event);
  }
  /**
   * detect card information using binlist API
   */
  getPaymentCardType(cardNumber: string) {
    //Check BIN number for six digits by default if not Absa
    const checkingForSix = (this.countryValue !== 'ABSA') || cardNumber.length === 6;
    const binValidationRun = new Subject<void>();
    let binResponse;

    if (checkingForSix) this.paymentService.getBinData(cardNumber, this.cpySource);
    else this.paymentService.getBinDataForEight(cardNumber, this.cpySource);

    binResponse = checkingForSix
      ? this.paymentService.currentbinResponse
      : this.paymentService.currentbinResponseForEight;

    //Filter null to ignore initial null responses and takeUntil to ensure function triggers only once
    binResponse
      .pipe(
        filter((x) => x !== null),
        takeUntil(binValidationRun)
      )
      .subscribe(
        (x: any) => {
          let parsed: any;
          try {
            parsed = typeof x === 'string' ? JSON.parse(x) : x;
          } catch (e) {
            this.setCardMessage(true, checkingForSix); // fallback on parse error
            this.invalid_card = true;
            binValidationRun.next();
            return;
          }

          // Initial fallback check using status
          const isValid = parsed?.status === '200';
          this.setCardMessage(!isValid, checkingForSix);

          const binList = parsed?.data;
          if (binList) {
            this.setBinListResponse(binList);

            const bankName = binList?.bank?.name?.toLowerCase() || '';
            if (this.countryValue === 'ABSA') {
              this.setCardMessage(!bankName.includes('absatravel'), checkingForSix);
            } else if (this.countryValue === 'SB') {
              this.setCardMessage(!bankName.includes('standardbank'), checkingForSix);
            }

            const cardNumberControl = this.card_detailsForm.get('cardNumber');
            cardNumberControl?.updateValueAndValidity();

            this.invalid_debitCard = false;
            this.invalid_card = false;
            this.getSelectedPaymentmethod();
          } else {
            this.invalid_card = true;
          }

          binValidationRun.next();
        },
        (error) => {
          this.setCardMessage(true, checkingForSix);
        }
      );
  }

  // ✅ Helper method to avoid repeated logic
    private setCardMessage(showError: boolean, checkingForSix: boolean): void {
      if (this.countryValue === 'ABSA') {
        if (checkingForSix) {
          this.showAbsaCardMessageForSix = showError;
        } else {
          this.showAbsaCardMessageForEight = showError;
        }
      } else if (this.countryValue === 'SB') {
          this.showStandardBankCardMessageForSix = showError;
      }
    }

  selectedRewards(event: any, index: number) {
    this.rewardPointsArray.forEach((x: any) => (x.initSelected = false));
    this.rewardPointsArray[index].initSelected = true;
    this.selectedreward = this.rewardPointsArray[index].id;
  }

  /**get investec redeem points list array */
  getTBIRedeemPointsArray() {
    if (
      this.apiService.extractCountryFromDomain() == 'IB' &&
      this.paymentMethods &&
      this.paymentMethods.paymentOptions &&
      this.paymentMethods.paymentOptions.length > 0
    ) {
      this.paymentMethods.paymentOptions.forEach((x: any) => {
        this.setRedeemPoints(x);
      });
    }
  }
  setRedeemPoints(paymentOptions: any) {
    if (paymentOptions.paymentMethods[0].products && paymentOptions.paymentMethods[0].products.length !== 0) {
      paymentOptions.paymentMethods[0].products.forEach((y: any) => {
        if (y.id.includes('Redemption_Investec')) {
          this.rewardPointsArray.push(y);
          if (y.initSelected) {
            this.selectedreward = y.id;
          }
        }
      });
    }
  }
  getCardType(card_Val: any) {
    if (card_Val != null && card_Val != undefined && card_Val != '') {
      // JCB
      const jcb_regex = /^(?:2131|1800|35)/; // 2131, 1800, 35 (3528-3589)
      // American Express
      const amex_regex = /^3[47]/; // 34, 37
      // Diners Club
      // const diners_regex = /^3(?:0[0-59]| [689])/; // 300-305, 309, 36, 38-39
      const diners_regex = /^3(?:0[0-5]|[68][0-9])[0-9]{11}$/;
      // Visa
      const visa_regex = /^4/; // 4
      // MasterCard
      const mastercard_regex = /^(5[1-5]|222[1-9]|22[3-9]|2[3-6]|27[01]|2720)/; // 2221-2720, 51-55
      // Maestro
      const maestro_regex = /^(5[06789]|6)/; // always growing in the range: 60-69, started with / not something else, but starting 5 must be encoded as mastercard anyway
      // Discover
      const discover_regex = /^(6011|65|64[4-9]|62212[6-9]|6221[3-9]|622[2-8]|6229[01]|62292[0-5])/; // 6011, 622126-622925, 644-649, 65

      // get rid of anything but numbers
      card_Val = card_Val.replace(/\D/g, '');

      // Check for matches
      if (card_Val.match(jcb_regex)) {
        this.selectedCardMethod = 'JCB';
      } else if (card_Val.match(amex_regex)) {
        this.selectedCardMethod = 'AE';
      } else if (card_Val.match(diners_regex)) {
        this.selectedCardMethod = 'DC';
      } else if (card_Val.match(visa_regex)) {
        this.selectedCardMethod = 'VC';
      } else if (card_Val.match(mastercard_regex)) {
        this.selectedCardMethod = 'MC';
      } else if (card_Val.match(discover_regex)) {
        this.selectedCardMethod = 'DC';
      }
      // Additional actions
      this.processingFee(this.selectedPaymentOption, this.selectedCardMethod);
      this.getSelectedCardInfo();
    }
  }

  /**navigate to traveller page when payment failed  */
  navigateToPaymentpage() {
    if (!this.storage.getItem('paymentDeeplinkData', 'session')) {
      this.router.navigate(['/payments'], { queryParamsHandling: 'preserve' });
    }
  }

  navigateToTravelerPage() {
    this.router.navigate(['/booking/flight-details'], { queryParamsHandling: 'preserve' });
  }

  allowCharOnly(event: any) {
    return keyboardAllowCharsOnly(event);
  }
  /**To calculate airline charges only for split payment */
  getAirlineFees(): number {
    let airlineFees: number = 0;
    if (this.paymentDeeplinkData) {
      airlineFees = this.paymentLinkFees().airlineFee;
    } else if (this.bookingInfo?.itineraryData.fareBreakdown?.adults) {
      let farebreakdown = this.bookingInfo?.itineraryData.fareBreakdown;
      let paxFee =
        this.getpaxAmount(farebreakdown?.adults?.baseFare, farebreakdown?.adults?.qty) * farebreakdown?.adults?.qty;
      paxFee += farebreakdown?.youngAdults
        ? this.getpaxAmount(farebreakdown?.youngAdults?.baseFare, farebreakdown?.youngAdults?.qty) *
        farebreakdown?.youngAdults.qty
        : 0;
      paxFee += farebreakdown?.children
        ? this.getpaxAmount(farebreakdown?.children?.baseFare, farebreakdown?.children?.qty) *
        farebreakdown?.children.qty
        : 0;
      paxFee += farebreakdown?.infants
        ? this.getpaxAmount(farebreakdown?.infants?.baseFare, farebreakdown?.infants?.qty) * farebreakdown?.infants.qty
        : 0;
      let taxFee = farebreakdown?.taxAmount;
      let markupAmount = farebreakdown?.markupAmount || 0;
      taxFee = markupAmount ? taxFee - markupAmount : taxFee;
      let baggageFee =
        this.storage.getItem('baggageInfo', 'session') && JSON.parse(this.storage.getItem('baggageInfo', 'session'))?.checkInBaggageData
          ? getBaggageFee(JSON.parse(this.storage.getItem('baggageInfo', 'session'))?.checkInBaggageData)
          : 0;
      let seatsFee = this.getseatsCost()?.airlineSeatCost ? this.getseatsCost()?.airlineSeatCost : 0;
      airlineFees = paxFee + taxFee + baggageFee + seatsFee;
    }
    return airlineFees;
  }
  /**To calculate travelstart charges only for split payment */
  getTravelstart_Fees(): number {
    let ts_Fees: number = 0;
    let productPrice = this.getTotalAddOnPrice();
    let seatsFee = this.getseatsCost()?.ts_SeatCost ? this.getseatsCost()?.ts_SeatCost : 0;
    let processingFee = this.processingFeeAmount?.processingFee || 0;
    let discountAmount = this.processingFeeAmount?.discountAmount || 0;
    let processingAmount = processingFee + discountAmount;
    let markupFee = this.bookingInfo?.itineraryData.fareBreakdown?.markupAmount || 0;
    ts_Fees = productPrice + seatsFee + processingAmount + markupFee;
    ts_Fees = this.voucherAmount < 0 ? ts_Fees + this.voucherAmount : ts_Fees - this.voucherAmount;
    if (this.paymentDeeplinkData) {
      ts_Fees += this.paymentLinkFees().ts_Fee;
    }
    return ts_Fees;
  }
  /**To calculate travelstart markup and airline seatcost charges */
  getseatsCost() {
    const seatData = this.sessionStorageService.retrieve('seatInfo')?.seats_Info;
    const seatCost: { airlineSeatCost: number; ts_SeatCost: number } = {
      airlineSeatCost: 0,
      ts_SeatCost: 0,
    };

    if (seatData && seatData.length > 0) {
      seatData.forEach((traveler: any) => {
        if (traveler?.specialRequests?.seatDetails?.length > 0) {
          traveler?.specialRequests?.seatDetails.forEach((seat: any) => {
            seatCost.airlineSeatCost += seat.basePrice ? parseFloat(seat.basePrice) : 0;
            seatCost.ts_SeatCost += seat.price - (seat.basePrice ? parseFloat(seat.basePrice) : 0);
            })
        }
      });
    }
    return seatCost;
  }

  /**To calculate  user selected addons cost  for adding in travelstart charges*/
  getTotalAddOnPrice() {
    let products: any = [];
    let totalAddOnPrice = 0;
    if (this.storage.getItem('products', 'session')) {
      products = JSON.parse(this.storage.getItem('products', 'session'));
    }
    if (products && products.length > 0) {
      for (let i = 0; i < products.length; i++) {
        if (products[i].initSelected) {
          totalAddOnPrice += products[i].amount;
        }
      }
    }
    return totalAddOnPrice;
  }
  /**To get paymentLink Fees */
  paymentLinkFees() {
    let fareBreakdown = this.paymentDeeplinkData?.fareBreakdown;
    let paymentLinkFees: any = {
      airlineFee: 0,
      ts_Fee: 0,
    };
    if (fareBreakdown?.invoiceLines?.length > 0) {
      fareBreakdown?.invoiceLines.forEach((x: any) => {
        if (x?.type == 'Base Fare' || x?.type == 'Taxes' || x?.type == 'Seats' || x?.type == 'Baggage Allowance') {
          paymentLinkFees.airlineFee += x.amount;
        } else {
          paymentLinkFees.ts_Fee += x.amount;
        }
      });
    }
    let deeplinkMarkupAmount = this.paymentDeeplinkData?.fareBreakdown?.markupAmount || 0;
    paymentLinkFees.airlineFee = deeplinkMarkupAmount
      ? paymentLinkFees.airlineFee - deeplinkMarkupAmount
      : paymentLinkFees.airlineFee;
    paymentLinkFees.ts_Fee = this.paymentDeeplinkData?.fareBreakdown?.markupAmount
      ? paymentLinkFees.ts_Fee + this.paymentDeeplinkData?.fareBreakdown?.markupAmount
      : paymentLinkFees.ts_Fee;
    return paymentLinkFees;
  }
  getpaxAmount(paxAmount: any, paxQty: any) {
    return paxAmount / paxQty;
  }
  /**checking the user internet */
  checkNetworkConnection() {
    this.apiService.checkInternetConnection().subscribe((isConnected: boolean) => {
      this.isConnected = isConnected;
    });
  }
  /**showing error when network gets turned off */
  getNetWorkStatus() {
    if (!this.isConnected && this.submitted) {
      this.paymentErrors = null;
      this.isPaymentErrorDismissed = false;
      this.invalid_PaymentType = false;
      this.invalidVoucher = false;
      this.invalid_card = false;
    }
    return this.submitted && !this.isConnected;
  }
  ngAfterViewChecked(): void {
    this.cdRef.detectChanges();
  }

  addCard() {
    const dialog = this.dialogService.open(AddCardComponent, {data: {dialogType: 'bottom-drawer'} });
    const $subscription = dialog.beforeClosed().subscribe((x) => {
      this.getCredentialData();
      $subscription.unsubscribe();
    });
  }

  setBinListResponse(binListResponse: BinListResponse | null) {
    this.binListResponse = binListResponse;
    this.binListResponseChanged.next(this.binListResponse);
  }

  clearCardInput() {
    const cardNumberFormControl = this.card_detailsForm.controls['cardNumber'];
    if (cardNumberFormControl) {
      cardNumberFormControl.setValue('');
      cardNumberFormControl.updateValueAndValidity();

      // Set focus after clearing
      setTimeout(() => {
        if(this.isBrowser){
          const inputElement = document.getElementById('cardNumberInput') as HTMLInputElement;
          if (inputElement) {
            inputElement.focus();
          }
        }
      });
    }
  }

  onDiscountInfoClicked() {
    this.discountInfo.next();
  }

  closeInvalidPayment() {
    this.invalid_PaymentType = false;
  }
}
