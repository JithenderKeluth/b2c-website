import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { UntypedFormControl, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { PaymentService } from '../service/payment.service';
import { Router } from '@angular/router';
import { ErrorMappingServiceService } from '@app/_core/services/error-mapping-service.service';
import { checkPaxValidationErrors } from '@app/flights/utils/search.utils';
import { BookingService } from '@app/booking/services/booking.service';
import { checkPaymentTypeFee, paymentValidations } from '@app/payment/utils/payment-utils';
import { AppSessionService } from '@app/_shared/session/app-session.service';
import { ApiService } from '@app/general/services/api/api.service';
import { numInputNoChars } from '@app/flights/utils/odo.utils';
import { UniversalStorageService } from '@app/general/services/universal-storage.service';
declare const $: any;

@Component({
  selector: 'app-card-payments',
  templateUrl: './card-payments.component.html',
  styleUrls: ['./card-payments.component.scss'],
})
export class CardPaymentsComponent implements OnInit, OnDestroy {
  card_detailsForm: UntypedFormGroup;
  submitted = false;
  flip_Card = false;
  selectedTab: string = 'CC'; // Default tab
  paymentMethods: any;
  paymentErrors: any;
  isMobile: boolean = false; // Set according to your condition
  selectCard: boolean = false;
  invalid_PaymentType = false;
  isCreditCardAvl = true; // Set according to your condition
  paymentCCmethods: any[] = []; // Set according to your condition
  months: { value: string; name: string }[] = [
    { value: '01', name: 'January' },
    { value: '02', name: 'February' },
    { value: '03', name: 'March' },
    { value: '04', name: 'April' },
    { value: '05', name: 'May' },
    { value: '06', name: 'June' },
    { value: '07', name: 'July' },
    { value: '08', name: 'August' },
    { value: '09', name: 'September' },
    { value: '10', name: 'October' },
    { value: '11', name: 'November' },
    { value: '12', name: 'December' },
  ];
  public isConnected = false;
  public selectedPaymentOption: string;
  public expiryYear: number;
  public paymentOptionsList = <any>[];
  selectedCardTypePaymentData: any = null;
  paxNamelengthError: boolean = false;
  public companyName = new UntypedFormControl('');
  public showCompanyVat: boolean = false;
  public companyVatNo = new UntypedFormControl('');
  user: any;
  public requireVat: boolean = false;
  public isLoading = false;
  voucherAmount: number = 0;
  BookApiError: any = null;
  get paymentCardForm() {
    return this.card_detailsForm.controls;
  }
  expiryYears: number[] = [];
  selectedCardMethod: string = '';
  invalidCvv: boolean = false;
  isModalVisible = false;
  @ViewChild('cvv') cvv: ElementRef;
  @ViewChild('errorMsg') errorMsg: ElementRef;
  
  country: string;
  
  constructor(
    private fb: UntypedFormBuilder,
    private paymentService: PaymentService,
    private router: Router,
    private errorMappingServiceService: ErrorMappingServiceService,
    private bookingService: BookingService,
    public appSessionService: AppSessionService,
    private apiService: ApiService,
    public elementRef: ElementRef,
    private storage: UniversalStorageService
  ) {
    this.country = apiService.extractCountryFromDomain();
  }

  ngOnInit(): void {
    this.user = JSON.parse(this.storage.getItem('b2bUser', 'session'));
    this.loadPaymentMethods();
    this.card_detailsForm = this.fb.group({
      cardNumber: ['', [Validators.required, Validators.minLength(16)]],
      cardName: [
        '',
        [Validators.pattern('[a-zA-Z ]*$'), Validators.minLength(3), Validators.maxLength(30), Validators.required],
      ],
      cardExpiryMonth: ['', Validators.required],
      cardExpiry: ['', Validators.required],
      cvv: ['', [Validators.required, Validators.minLength(3)]],
    });

    this.bookingService.currentVoucherAmount.subscribe((voucherdata: any) => {
      this.voucherAmount = voucherdata;
    });

    this.generateYears();
    this.checkNetworkConnection();
  }

  ngOnDestroy() {
    $('#CC_payment_failed_Modal').modal('hide');
  }

  generateYears() {
    const currentYear = new Date().getFullYear();
    for (let i = 0; i < 20; i++) {
      this.expiryYears.push(currentYear + i);
    }
  }

  loadPaymentMethods() {
    const storedPaymentMethods = this.storage.getItem('paymentMethods', 'session');
    if (storedPaymentMethods) {
      this.paymentMethods = JSON.parse(storedPaymentMethods);
      this.paymentMethodsData();
      this.loadPaymentCCmethods();
    }
  }

  paymentMethodsData() {
    for (const paymentOption of this.paymentMethods.paymentOptions) {
      this.paymentOptionsList.push(paymentOption.paymentOptionGroup);
    }
  }

  loadPaymentCCmethods() {
    this.paymentMethods.paymentOptions.forEach((option: any) => {
      const isCreditCard = option.paymentOptionGroup === 'CC' && this.selectedTab === 'CC';
      const isDebitCard = option.paymentOptionGroup === 'DC' && this.selectedTab === 'DC';
      if ((isCreditCard || isDebitCard) && option.paymentMethods && option.paymentMethods.length > 0) {
        this.paymentCCmethods = this.paymentCCmethods.concat(option.paymentMethods);
      }
    });
  }

  isPaymentOptionAvailable(param: string): boolean {
    return this.paymentOptionsList.some((paymentOption: any) => paymentOption === param);
  }

  selectCardMethod() {
    if (!this.paymentMethods.paymentOptions) {
      return {};
    }

    for (const option of this.paymentMethods.paymentOptions) {
      if (option.paymentOptionGroup === 'CC' || option.paymentOptionGroup === 'DC') {
        for (const method of option.paymentMethods) {
          if (method.paymentMethodName === this.selectedCardMethod) {
            return method;
          }
        }
      }
    }

    return {};
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
      this.selectedCardTypePaymentData = this.selectCardMethod();
    }
  }

  cardFlip() {
    this.flip_Card = !this.flip_Card;
  }

  cardFlipInit() {
    this.flip_Card = false;
  }

  onlyNumbers(event: KeyboardEvent) {
    return numInputNoChars(event);
  }
  /**make validations false when user enter another values */
  onKeyEnter(event: any) {
    this.invalidCvv = false;
  }
  onKeyEnterEvent(event: any) {
    let userCardNum = event.target.value.split(' ').join('');
    if (event.target.value) {
      if (userCardNum.length > 5) {
        this.getCardType(userCardNum);
      }
    } else {
      this.selectedCardMethod = null;
    }
  }

  onChangeEvent(event: Event) {}

  getPaymentMethodName(paymentMethodName: string): string {
    return paymentMethodName.toUpperCase().replace(/\s+/g, '');
  }
  addCardDetails(event: Event) {
    this.invalid_PaymentType = false;
    this.submitted = true;
    if (this.card_detailsForm.invalid) {
      return;
    }
    const cardInfo = this.card_detailsForm.value;
    const cardDetails = {
      nameOnCard: cardInfo.cardName,
      cardEncryptionKey: '',
      saveUserAccountCard: false,
      cvv: cardInfo.cvv,
      expirationDate: {
        month: cardInfo.cardExpiryMonth,
        year: cardInfo.cardExpiry.toString(),
      },
      cardNumber: cardInfo.cardNumber,
      cardName: 'CC',
      cardType: this.selectedCardMethod,
    };

    const billingDetails = {
      postalCode: '8001',
      addressLine1: 'Cape Town',
      country: 'IN',
      contactNo: '9912345678',
      city: 'Cape Town',
      contactCode: '91',
      companyName: '',
      companyVatNo: '',
      vatInvoice: false,
    }; 
    this.proceedPayment(cardDetails, billingDetails);
  }

  proceedPayment(cardDetails: any, billingDetails: any) {
    let paymentReqObj = JSON.parse(this.storage.getItem('paymentReqInfo', 'session'));
    let bookReqObj: any = {
      passengers: paymentReqObj.passengers,
      contact: paymentReqObj.contact,
      products: paymentReqObj.products,
      paymentData: this.paymentMethods?.data,
      cardDetails: cardDetails,
      billingDetails: billingDetails,
      selectedPaymentMethod: this.selectedCardTypePaymentData,
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
            this.storage.setItem('bookingDetails', JSON.stringify(res), 'session');
            this.router.navigate(['/payments/bookingConfirm'], { queryParamsHandling: 'preserve' });
            this.storage.removeItem('paymentReqInfo');
          } else {
            this.validationResults(res);
          }
          if (bookingDetails.errors) {
            const { category, action, message } = this.errorMappingServiceService.mapError(
              bookingDetails.errors
            );
            const err_Obj = { category: category, action: action, description: message };
            this.BookApiError = err_Obj;
            this.isModalVisible = true;
          }
        },
        (error) => {
          if (error) {
            this.isLoading = false;
            if (error.error) {
              this.isModalVisible = true;
            }
          }
        }
      );
    }
  }

  openModal() {
    this.isModalVisible = true;
  }

  closeModal() {
    this.isModalVisible = false;
  }

  validationResultss(bookingDetails: any) {
    if (bookingDetails.validationResults) {
      const paxNameValidation = checkPaxValidationErrors(bookingDetails);
      if (paxNameValidation && paxNameValidation.nameLengthValid == false) {
        this.paxNamelengthError = true;
        this.isModalVisible = true;
      } else if (
        bookingDetails.validationResults &&
        bookingDetails.validationResults.paymentDetailsValidationResults.invalidFields.paymentMethodValid == false
      ) {
        return (this.isModalVisible = true);
      }
    }
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

  validationResults(bookingDetails: any) {
    if (bookingDetails.validationResults) {
      const paxNameValidation = checkPaxValidationErrors(bookingDetails);
      if (paxNameValidation && paxNameValidation.nameLengthValid == false) {
        this.paxNamelengthError = true;
        this.isModalVisible = true;
      }
       this.paymentErrors = null;
       this.paymentErrors = paymentValidations(bookingDetails, this.appSessionService);
      if (this.paymentErrors) {
        this.invalidCvv = false;
        this.scrollToError();
        return this.paymentErrors;
      } else if (
        bookingDetails.validationResults &&
        bookingDetails.validationResults.paymentDetailsValidationResults.invalidFields.cvvValid == false
      ) {
        this.cvv.nativeElement.focus();
        this.paymentErrors = null;
        return (this.invalidCvv = true);
      }
    }
  }

  flight_results() {
    this.isModalVisible = false;
    this.router.navigate(['/flights/results'], { queryParamsHandling: 'preserve' });
  }
  navigateToTravellerpage() {
    this.isModalVisible = false;
    this.router.navigate(['/booking/flight-details'], { queryParamsHandling: 'preserve' });
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
      this.invalid_PaymentType = false;
    }
    return this.submitted && !this.isConnected;
  }
  scrollToError() {
     const el = this.elementRef?.nativeElement?.querySelector('#errorMsg');
     el?.scrollIntoView({ behavior: 'auto', block: 'start' });
  }
}
