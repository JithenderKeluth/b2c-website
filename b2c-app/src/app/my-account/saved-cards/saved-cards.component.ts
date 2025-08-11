import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { MyAccountServiceService } from '@app/my-account/my-account-service.service';
import { SearchService } from '@app/flights/service/search.service';
import { DeleteModalComponent } from '@app/my-account/delete-modal/delete-modal.component';
import { AddCardComponent } from '@app/my-account/add-card/add-card.component';
import { UniversalStorageService } from '@app/general/services/universal-storage.service';
import { FormBuilder, FormGroup, Validators, ValidatorFn } from '@angular/forms';
import { ApiService } from '../../general/services/api/api.service';
import { SessionService } from '../../general/services/session.service';
import { numInputNoChars } from '@app/flights/utils/odo.utils';
import { getCountriesArray } from '@app/booking/utils/traveller.utils';
import { Subject } from 'rxjs';
import { PaymentService } from '../../payment/service/payment.service';
import { filter, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-saved-cards',
  templateUrl: './saved-cards.component.html',
  styleUrls: ['./saved-cards.component.scss'],
})
export class SavedCardsComponent implements OnInit {
  credentials: any;
  saveLocalStorage: boolean;
  cards: any;
  userAgent: any;

  isSB: boolean = false;
  sbCardForm: FormGroup;
  submitted: boolean = false;
  isLoading: boolean = false;
  showCardExpiredMessage: boolean = false;
  selectedCardMethod: string | null = null;
  showStandardBankCardMessageForSix = false;
  cardExp: any;
  year = new Date().getFullYear();
  yearsArray: any = [];
  countriesList: any;
  tempCardBinData: any = null;
  cpySource: string;

  get sbCardFormControls() {
    return this.sbCardForm.controls;
  }

  constructor(
    public dialog: MatDialog,
    private fb: FormBuilder,
    private myAccountService: MyAccountServiceService,
    private searchService: SearchService,
    private storage: UniversalStorageService,
    private _snackBar: MatSnackBar,
    private sessionService: SessionService,
    private apiService: ApiService,
    private paymentService: PaymentService,
  ) {}
  // this.clientTheme = this.getClientTheme();

  ngOnInit(): void {
    if (this.apiService.extractCountryFromDomain() == 'SB') {
      this.isSB = true;
    } else {
      this.isSB = false;
    }
    this.setCredentialData();
    this.initSBForm();
    this.setupYearsArray();
    this.countriesList = getCountriesArray();
    if (this.apiService.extractCountryFromDomain() == 'ABSA') {
      this.cpySource = 'absatravel';
    } else if (this.apiService.extractCountryFromDomain() == 'SB') {
      this.cpySource = 'standardbank';
    } else {
      this.cpySource = 'Travelstart';
    }

    this.searchService.langValue.subscribe((val: any) => {
      this.userAgent = this.myAccountService.countrydata;
    });
  }

  setupYearsArray(): void {
    for (let i = 0; i <= 30; i++) {
      this.yearsArray.push({ year: this.year + i });
    }
  }

  initSBForm(): void {
    this.sbCardForm = this.fb.group({
      cardNumber: ['', [Validators.required, Validators.minLength(12)]],
      cardName: ['', Validators.required],
      cardExpiry: ['', Validators.required],
      cardExpiryMonth: ['', Validators.required],
      cvv: ['', [Validators.required, Validators.minLength(3)]],
      postalCode: ['', Validators.required],
      address: ['', Validators.required],
      city: ['', Validators.required],
      country: ['', Validators.required],
    });
  }

  setCredentialData() {
    if (this.storage.getItem('credentials', 'local')) {
      this.saveLocalStorage = true;
      this.credentials = JSON.parse(this.storage.getItem('credentials', 'local'));
    } else if (this.storage.getItem('credentials', 'session')) {
      this.saveLocalStorage = false;
      this.credentials = JSON.parse(this.storage.getItem('credentials', 'session'));
    }

    this.cards = this.credentials.data.paymentCardList;
  }

  formatCardNumber(maskedCardNumber: string): string {
    // Extract the last 4 digits
    return maskedCardNumber.slice(-4);
  }

  deleteCard(card: any) {
    const dialog = this.dialog.open(DeleteModalComponent, {
      data: {
        dataId: card.cardToken,
        type: 'card',
        title: 'Delete Card',
        content: 'Do you permanently want to remove this card from your saved card list?',
      },
      panelClass: 'custom-modal-delete-radius'
    });
    const $subscription = dialog.beforeClosed().subscribe((x) => {
      this.setCredentialData();
      $subscription.unsubscribe();
    });
  }

  addCard() {
    const dialog = this.dialog.open(AddCardComponent, { data: { dialogType: 'fullscreen-dialog' } });
    const $subscription = dialog.beforeClosed().subscribe((x) => {
      this.setCredentialData();
      $subscription.unsubscribe();
    });
  }

  resetSBForm() {
    this.sbCardForm.reset();
    this.submitted = false;
    this.showCardExpiredMessage = false;
    this.selectedCardMethod = null;
  }

  onlyNumbers(event: any) {
    return numInputNoChars(event);
  }

  onSBCardNumberInput(event: any): void {
    const userCardNum = event.target.value.split(' ').join('');
    if (userCardNum.length >= 6) {
      this.validateCreditCardNumber(userCardNum);
    }
  }


  getBinCardNumbers(userCardNum: any) {
      let newCardBinNum: any;
      if (!this.tempCardBinData) {
        this.tempCardBinData = userCardNum.slice(0, 6);
      } else {
        if (userCardNum.length > 7) newCardBinNum = userCardNum.slice(0, 8);
        else newCardBinNum = userCardNum.slice(0, 6);
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
  
    binValidator(): ValidatorFn {
      return (control) => {
       
        if (this.showStandardBankCardMessageForSix) {
          return {
            notStandardBankCard: true,
          };
        } else {
          return null;
        }
      };
    }
  
    validateBinNumber(cardNumber: string) {
      const checkingForSix = cardNumber.length === 6;
      const binValidationRun = new Subject<void>();
      let binResponse;
  
      if (checkingForSix) this.paymentService.getBinData(cardNumber, this.cpySource);
     
  
      binResponse = checkingForSix
        ? this.paymentService.currentbinResponse
        : this.paymentService.currentbinResponseForEight;
  
      binResponse
        .pipe(
          filter((x) => x !== null),
          takeUntil(binValidationRun),
        )
        .subscribe(
          (data) => {
            let binData: any;
  
              try {
                binData = typeof data === 'string' ? JSON.parse(data) : data;
              } catch (err) {
                // In case parsing fails
                this.showStandardBankCardMessageForSix = true;
                binValidationRun.next();
                return;
              }
  
              const isValid = binData?.status === '200';
              this.showStandardBankCardMessageForSix = !isValid;
  
              const bankName = binData?.data?.bank?.name?.toLowerCase() || '';
              const isAbsa = bankName.includes('absatravel');
              const isStandardBank = bankName.includes('standardbank');
              this.showStandardBankCardMessageForSix = !isStandardBank;
  
              const cardNumberControl = this.sbCardForm.get('cardNumber');
              if (cardNumberControl) {
                cardNumberControl.updateValueAndValidity();
              }
  
            binValidationRun.next();
          },
          (error) => { 
            this.showStandardBankCardMessageForSix = true;  
          },
        );
    }
  
    
    

  public onKeyEnterEvent(event: any) {
    const userCardNum = event.target.value.split(' ').join('');
    const isNewCardNumber = this.getBinCardNumbers(userCardNum);
    if (event.target.value) {
      if (userCardNum.length > 5 && isNewCardNumber) {
        this.tempCardBinData = userCardNum.length > 7 ? userCardNum.slice(0, 8) : userCardNum.slice(0, 6);

        this.validateCreditCardNumber(userCardNum);
        console.log('------------------------------Checking for 6..?-------------------------------');
        //Trigger BIN validation for length of 6 and then length of 8, if possible.
        this.validateBinNumber(userCardNum.slice(0, 6));

        if (userCardNum.length > 7) {
          console.log(
            '---------------------------------Checking for 8..?--------------------------------------------------------',
          );
          this.validateBinNumber(userCardNum.slice(0, 8));
        } else if (userCardNum.length <= 7) {
            this.showStandardBankCardMessageForSix = true; // Set to true if less than 8 digits to show error message for first six digits
        }
      } else if (userCardNum.length < 5) {
        this.tempCardBinData = null;
        this.selectedCardMethod = null;
      }
    } else {
      this.showStandardBankCardMessageForSix = false;
      this.tempCardBinData = null;
    }
  }

  filterCardName(event: any): void {
    const input = event.target;
    const cleanValue = input.value.replace(/[^a-zA-Z\s]/g, '');

    // Update both the input value and the form control
    input.value = cleanValue;
    this.sbCardForm.get('cardName')?.setValue(cleanValue, { emitEvent: false });
  }

  getExpiryYear() {
    this.clearCardExpirationMessage();
    this.cardExp = this.sbCardForm.value.cardExpiry.toString().slice(-2);
  }

  clearCardExpirationMessage() {
    this.showCardExpiredMessage = false;
  }

  validateCreditCardNumber(input: any) {
    // JCB
    const jcb_regex = /^(?:2131|1800|35)/;
    // American Express
    const amex_regex = /^3[47]/;
    // Diners Club
    const diners_regex = /^3(?:0[0-5]|[68][0-9])[0-9]{11}$/;
    // Visa
    const visa_regex = /^4/;
    // MasterCard
    const mastercard_regex = /^(5[1-5]|222[1-9]|22[3-9]|2[3-6]|27[01]|2720)/;
    // Discover
    const discover_regex = /^(6011|65|64[4-9]|62212[6-9]|6221[3-9]|622[2-8]|6229[01]|62292[0-5])/;

    // get rid of anything but numbers
    input = input.replace(/\D/g, '');

    // Check for matches
    if (input.match(jcb_regex)) {
      this.selectedCardMethod = 'JCB';
    } else if (input.match(amex_regex)) {
      this.selectedCardMethod = 'AE';
    } else if (input.match(diners_regex)) {
      this.selectedCardMethod = 'DC';
    } else if (input.match(visa_regex)) {
      this.selectedCardMethod = 'VC';
    } else if (input.match(mastercard_regex)) {
      this.selectedCardMethod = 'MC';
    } else if (input.match(discover_regex)) {
      this.selectedCardMethod = 'DC';
    }
  }

  onSubmitSB() {
    this.submitted = true;
    if (this.sbCardForm.invalid) {
      return;
    } else {
      this.isLoading = true;

      let month = this.sbCardForm.get('cardExpiryMonth')!.value;
      let year = this.sbCardForm.value.cardExpiry.toString();
      this.cardExp = month + '/' + year.slice(2);

      // If current date is greater than expiry date
      if (new Date() > new Date(year, month, 0)) {
        this.showCardExpiredMessage = true;
        this.isLoading = false;
        return;
      }

      // Validate card number and set card type
      this.validateCreditCardNumber(this.sbCardForm.get('cardNumber')?.value);

      const cardData = {
        paymentCard: {
          cardType: {},
          address: {
            streetNmbr: this.sbCardForm.get('address')?.value,
            postalCode: this.sbCardForm.get('postalCode')?.value,
            countryName: this.sbCardForm.get('country')?.value,
            cityName: this.sbCardForm.get('city')?.value,
            bldgRoom: '',
          },
          cardHolderName: this.sbCardForm.get('cardName')?.value,
          cardNumber: this.sbCardForm.get('cardNumber')?.value,
          expireDate: this.cardExp,
          billingAddressLine1: this.sbCardForm.get('address')?.value,
          postalCode: this.sbCardForm.get('postalCode')?.value,
          cityName: this.sbCardForm.get('city')?.value,
          countryName: this.sbCardForm.get('country')?.value,
          cardCode: this.selectedCardMethod,
          cvv: this.sbCardForm.get('cvv')?.value,
        },
        token: this.credentials.data.token,
        userAgent: this.userAgent,
      };

      this.myAccountService.addpaymentCard(cardData).subscribe(
        (res: any) => {
          if (res.result == 'OK' && res.code == 200) {
            this.credentials = res;
            this.resetSBForm(); // Just reset the form, don't hide it
            //store data in session storage & local storage
            this.sessionService.setStorageDataInSession(res, this.saveLocalStorage);
            this.setCredentialData(); // Refresh the cards list
            this._snackBar.open('Payment Card Added Successfully', '', {
              duration: 3000,
              panelClass: ['success-snackbar', 'snackbar-with-button'],
              horizontalPosition: 'center',
              verticalPosition: 'top',
            });
            this.isLoading = false;
          } else {
            this.isLoading = false;
            this._snackBar.open(res.result || 'Error adding card', '', {
              duration: 3000,
              panelClass: ['error-snackbar', 'snackbar-with-button'],
              horizontalPosition: 'center',
              verticalPosition: 'top',
            });
          }
        },
        (error) => {
          this.isLoading = false;
          this._snackBar.open('Error adding card', '');
          setTimeout(() => {
            this._snackBar.dismiss();
          }, 3000);
        },
      );
    }
  }
}
