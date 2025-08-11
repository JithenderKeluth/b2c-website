import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators, ValidatorFn } from '@angular/forms';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { BookingService } from '@app/booking/services/booking.service';
import { SearchService } from '@app/flights/service/search.service';
import { numInputNoChars } from '@app/flights/utils/odo.utils';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { MyAccountServiceService } from '../my-account-service.service';
import { ApiService } from '@app/general/services/api/api.service';
import { getCountriesArray } from '@app/booking/utils/traveller.utils';
import { UniversalStorageService } from '@app/general/services/universal-storage.service';
import { PaymentService } from '@app/payment/service/payment.service';
import { SessionService } from '../../general/services/session.service';
import { isPlatformBrowser } from '@angular/common';

declare const $: any;

@Component({
  selector: 'app-payments',
  templateUrl: './payments.component.html',
  styleUrls: ['./payments.component.scss'],
})
export class PaymentsComponent implements OnInit {

  get paymentCardForm() {
    return this.card_detailsForm.controls;
  }
  private isBrowser: boolean;
  public flip_Card = false;
  public card_detailsForm: UntypedFormGroup;
  public paymentMethods: any;
  public eftMethods: any = [];
  public isEfTselected = false;
  public selectedCardMethod: string;
  public selectedEftMethod: string;
  public paymentOptionsList = <any>[];
  public selectedPaymentOption: string;
  public processingFeeAmount: number;
  public year = new Date().getFullYear();
  public yearsArray: any = [];
  public expiryYear: number;
  public submitted = false;
  public isLoading = false;
  showAbsaCardMessage = false;
  showStandardBankMessage = false;
  cardExp: any;
  credentials: any;
  countriesList: any;
  modalRef: BsModalRef;
  tempCradBinData: any = null;
  dltCard: any;
  saveLocalStorage = false;
  userAgent: any;
  errorMsg: '';
  public country: string;
  binValidationThreshold: number = 5;
  cpySource: string;

  constructor(
    private fb: UntypedFormBuilder,
    private myacountService: MyAccountServiceService,
    private paymentService: PaymentService,
    private _snackBar: MatSnackBar,
    private searchService: SearchService,
    public apiService: ApiService,
    private storage: UniversalStorageService,
    private sessionService: SessionService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    if (this.storage.getItem('credentials', 'local')) {
      this.saveLocalStorage = true;
      this.credentials = JSON.parse(this.storage.getItem('credentials', 'local'));
    } else if (this.storage.getItem('credentials', 'local')) {
      this.saveLocalStorage = false;
      this.credentials = JSON.parse(this.storage.getItem('credentials', 'session'));
    }
    this.country = this.apiService.extractCountryFromDomain();
    this.binValidationThreshold = this.country === 'ABSA' ? 7 : 5;
    if(this.isBrowser){
      this.cpySource = this.country === 'ABSA' 
      ? 'absatravel' :this.country === 'SB' ? 'standardbank' : new URLSearchParams(window.location.search).get('cpysource') ?? '';
    }
    this.countriesList = getCountriesArray();
    for (let i = 0; i <= 30; i++) {
      this.yearsArray.push({ year: this.year + i });
    }
    this.paymentMethods = JSON.parse(this.storage.getItem('paymentMethods', 'session'));
    this.selectedPaymentOption = 'CC';
    if (this.paymentMethods) {
      for (let paymentOptions in this.paymentMethods.paymentOptions) {
        let paymentOption = this.paymentMethods.paymentOptions[paymentOptions].paymentOptionName;
        this.paymentOptionsList.push(paymentOption);
        if (this.paymentMethods.paymentOptions[paymentOptions].paymentOptionName === 'EFT') {
          this.eftMethods = this.paymentMethods.paymentOptions[paymentOptions];
        }
      }
    }
    this.initForm();
    this.searchService.langValue.subscribe((val: any) => {
      this.userAgent = this.myacountService.countrydata;
    });
  }

  initForm(): void {
    if (this.country === 'ABSA' || this.country === 'SB') {
      this.card_detailsForm = this.fb.group({
        cardNumber: ['', Validators.required, this.binValidator() ],
        cardName: ['', Validators.required],
        cardExpiry: ['', Validators.required],
        cardExpiryMonth: ['', Validators.required],
      });

      return;
    }

    this.card_detailsForm = this.fb.group({
      cardNumber: ['', Validators.required],
      cardName: ['', Validators.required],
      cardExpiry: ['', Validators.required],
      cardExpiryMonth: ['', Validators.required],
      address: ['', [Validators.required]],
      postalCode: ['', [Validators.required]],
      city: ['', [Validators.required]],
      country: ['', [Validators.required]],
    });
  }

  onChangeEvent(e: Event): void {
    this.selectedEftMethod = '';
    this.validateCreditCardNumber(this.card_detailsForm.value.cardNumber);
    if (
      this.card_detailsForm.value.cardNumber &&
      this.card_detailsForm.value.cardName &&
      this.card_detailsForm.value.cardExpiry &&
      this.card_detailsForm.value.cardExpiryMonth
    ) {
      //this.flip_Card = true;
    }
  }

  cardFlip() {
    this.flip_Card = !this.flip_Card;
  }

  // fetech payment options
  isPaymentOptionAvailable(param: string) {
    for (let paymentOption in this.paymentOptionsList) {
      if (this.paymentOptionsList[paymentOption] === param) {
        return true;
      }
    }
  }

  public getExpiryYear() {
    this.expiryYear = this.card_detailsForm.value.cardExpiry.toString().slice(-2);
  }

  public selectEftMethod(param: string) {
    this.selectedCardMethod = '';
    this.isEfTselected = true;
    this.selectedEftMethod = param;
  }

  isActive(item: any) {
    return this.selectedEftMethod === item;
  }

  getBinCardNumbers(userCardNum: any) {
    let newcardBinNum: any;
    if (!this.tempCradBinData) {
      this.tempCradBinData = this.getCardPrefix(userCardNum);
    } else {
      newcardBinNum = this.getCardPrefix(userCardNum);
    }
    if (this.tempCradBinData && newcardBinNum && this.tempCradBinData == newcardBinNum) {
      return false;
    } else if (this.tempCradBinData && newcardBinNum && this.tempCradBinData !== newcardBinNum) {
      this.tempCradBinData = newcardBinNum;
      return true;
    } else {
      return true;
    }
  }

  validateBinNumber(cardNumber: string) {
    this.paymentService.getBinData(cardNumber, this.cpySource);
    this.paymentService.currentbinResponse.subscribe((data) => {
      this.showAbsaCardMessage = this.country === 'ABSA' && (!data || data.status !== '200');
      this.showStandardBankMessage = this.country === 'SB' && (!data || data.status !== '200');

      if (data && JSON.parse(data).data) {
        const binListResponse = JSON.parse(data).data;

        this.showAbsaCardMessage = this.country === 'ABSA' && !binListResponse?.bank?.name.toLowerCase().includes(this.cpySource);
        this.showStandardBankMessage = this.country === 'SB' && binListResponse?.bank?.name.toLowerCase().includes(this.cpySource);
        if (this.showAbsaCardMessage || this.showStandardBankMessage) {
          const cardNumberControl = this.card_detailsForm.get('cardNumber');
          if (cardNumberControl) {
            cardNumberControl.updateValueAndValidity();
          }
        }
      }
    });
  }

  onSubmit() {
    this.submitted = true;
    if (this.card_detailsForm.invalid) {
      return;
    } else {
      this.isLoading = true;
      this.cardExp =
        this.card_detailsForm.get('cardExpiryMonth').value +
        '/' +
        this.card_detailsForm.value.cardExpiry.toString().slice(-2);
      let cardData = {
        paymentCard: {
          cardType: {},
          address: {
            streetNmbr: this.card_detailsForm.get('address')?.value,
            postalCode: this.card_detailsForm.get('postalCode')?.value,
            countryName: this.card_detailsForm.get('country')?.value,
            cityName: this.card_detailsForm.get('city')?.value,
            bldgRoom: '',
          },
          cardHolderName: this.card_detailsForm.get('cardName')?.value,
          cardNumber: this.card_detailsForm.get('cardNumber')?.value,
          expireDate: this.cardExp,
          billingAddressLine1: this.card_detailsForm.get('address')?.value,
          postalCode: this.card_detailsForm.get('postalCode')?.value,
          cityName: this.card_detailsForm.get('city')?.value,
          countryName: this.card_detailsForm.get('country')?.value,
          cardCode: this.selectedCardMethod,
        },
        userAgent: this.userAgent,
      };

      if (this.country === 'ABSA' || this.country === 'SB') {
        cardData.paymentCard.address = {
          streetNmbr: '255',
          postalCode: '8001',
          countryName: 'South Africa',
          cityName: 'Cape Town',
          bldgRoom: 'Darter Studio',
        };

        cardData.paymentCard.billingAddressLine1 = 'Darter Studio, Longkloof, Darters Road';
        cardData.paymentCard.postalCode = '8001';
        cardData.paymentCard.cityName = 'Cape Town';
        cardData.paymentCard.countryName = 'South Africa';
      }


      this.myacountService.addpaymentCard(cardData).subscribe((res: any) => {
        if (res.result == 'OK' && res.code == 200) {
          this.credentials = res;
          this.card_detailsForm.reset();
          this.submitted = false;
          //store data in session storage & local storage
          this.sessionService.setStorageDataInSession(res, this.saveLocalStorage)

          this._snackBar.open('Payment Card Added Successfully', '');
          setTimeout(() => {
            this._snackBar.dismiss();
          }, 3000);
          this.isLoading = false;
        } else {
          this.isLoading = false;
          this.errorMsg = res.result;
        }
      });
    }
  }

  openDialog(data: any) {
    $('#DeleteCard_Modal').modal('show');
    this.dltCard = data;
  }

  deleteCard() {
    let cardNo = this.dltCard.cardToken;
    let tokenData = {
      token: this.credentials.data.token,
      userAgent: this.userAgent,
    };
    this.myacountService.deletepaymentCard(cardNo, tokenData).subscribe((res: any) => {
      if (res.result == 'OK' && res.code == 200) {
        this.credentials = res;
        //store data in session storage & local storage
        this.sessionService.setStorageDataInSession(res, this.saveLocalStorage)
        this._snackBar.open('Payment Card Deleted Successfully', '');
        setTimeout(() => {
          this._snackBar.dismiss();
        }, 3000);
      }

      $('#DeleteCard_Modal').modal('hide');
    });
  }

  ngOnDestroy() {
    $('#DeleteCard_Modal').modal('hide');
  }

  //allows users to type only numbers
  onlyNumbers(event: any) {
    return numInputNoChars(event);
  }

  binValidator() : ValidatorFn {
    return (control) => {
      if (this.showAbsaCardMessage) {
        return {
          notAbsaCard: true
        }
      } else if (this.showStandardBankMessage) {
        return {
          notStandardBankCard: true
        }
      } else {
        return null;
      }
    }
  }

  public onKeyEnterEvent(event: any) {
    const userCardNum = event.target.value.split(' ').join('');
    const isNewCardNumber = this.getBinCardNumbers(userCardNum);
    if (event.target.value) {
      if (userCardNum.length > this.binValidationThreshold && isNewCardNumber && (this.country === 'ABSA' || this.country === 'SB') ) {
        this.tempCradBinData = this.getCardPrefix(userCardNum);
        this.validateBinNumber(this.getCardPrefix(userCardNum));
      } else if (userCardNum.length < this.binValidationThreshold) {
        this.tempCradBinData = null;
        this.selectedCardMethod = null;
      }
    } else {
      this.showAbsaCardMessage = false;
      this.showStandardBankMessage = false;
      this.tempCradBinData = null;
    }
  }

  formatCardNumber(maskedCardNumber: string): string {
    if (this.country !== 'ABSA') return maskedCardNumber;
    // Extract the last 4 digits
    return maskedCardNumber.slice(-4);
  }

  private validateCreditCardNumber(input: any) {
    const visaPattern = /^(?:4[0-9]{12}(?:[0-9]{3})?)$/;
    const mastPattern = /^(?:5[1-5][0-9]{14})$/;
    const amexPattern = /^(?:3[47][0-9]{13})$/;
    const discPattern = /^(?:6(?:011|5[0-9][0-9])[0-9]{12})$/;
    const dinersPattern = /^3(?:0[0-5]|[68][0-9])[0-9]{11}$/;
    const jcbPattern = /^(3(?:088|096|112|158|337|5(?:2[89]|[3-8][0-9]))\d{12})$/;

    this.selectedCardMethod = '';

    const isVisa = visaPattern.test(input) === true;
    const isMast = mastPattern.test(input) === true;
    const isAmex = amexPattern.test(input) === true;
    const isDisc = discPattern.test(input) === true;
    const isDine = dinersPattern.test(input) === true;
    const isJcb = jcbPattern.test(input) === true;

    if (isVisa || isMast || isAmex || isDisc || isDine || isJcb) {
      // at least one regex matches, so the card number is valid.
      if (isVisa) {
        // Visa-specific logic goes here
        this.selectedCardMethod = 'VC';
      } else if (isMast) {
        // Mastercard-specific logic goes here
        this.selectedCardMethod = 'MC';
      } else if (isAmex) {
        // AMEX-specific logic goes here
        this.selectedCardMethod = 'AE';
      } else if (isDisc) {
        // Discover-specific logic goes here
        this.selectedCardMethod = 'Disc';
      } else if (isDine) {
        // Diners club logic goes here
        this.selectedCardMethod = 'DC';
      } else if (isJcb) {
        // JCB logic goes here
        this.selectedCardMethod = 'JCB';
      }
    }
    return this.selectedCardMethod;
  }

  getCardPrefix(userCardNum: any) {
    return this.country === 'ABSA' ? userCardNum.slice(0, 8) : userCardNum.slice(0, 6);
  }
}
