import {Component, Inject, OnInit} from '@angular/core';
import { FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { MyAccountServiceService } from '@app/my-account/my-account-service.service';
import { PaymentService } from '@app/payment/service/payment.service';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { SearchService } from '@app/flights/service/search.service';
import { getCountriesArray } from '@app/booking/utils/traveller.utils';
import { numInputNoChars } from '@app/flights/utils/odo.utils';
import { MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import { SessionService } from '../../general/services/session.service';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { UniversalStorageService } from '@app/general/services/universal-storage.service';

@Component({
  selector: 'app-add-card',
  templateUrl: './add-card.component.html',
  styleUrls: ['./add-card.component.scss'],
})
export class AddCardComponent implements OnInit {
  get paymentCardForm() {
    return this.addCardForm.controls;
  }

  public addCardForm: FormGroup;
  credentials: any;
  saveLocalStorage = false;
  public submitted = false;
  public isLoading = false;
  public year = new Date().getFullYear();
  public yearsArray: any = [];
  countriesList: any;
  public paymentMethods: any;
  public eftMethods: any = [];
  userAgent: any;
  cardExp: any;
  public selectedCardMethod: string | null;
  errorMsg: '';
  public expiryYear: number;
  tempCardBinData: any = null;
  showAbsaCardMessageForSix = false;
  showAbsaCardMessageForEight = false;
  showCardExpiredMessage = false;
  cpySource: string;

  dialogType: 'fullscreen-dialog' | 'bottom-drawer';

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AddCardComponent>,
    private myAccountService: MyAccountServiceService,
    private paymentService: PaymentService,
    private _snackBar: MatSnackBar,
    private searchService: SearchService,
    private sessionService: SessionService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private storage: UniversalStorageService
  ) {
    this.dialogType = data.dialogType;
    this.dialogRef.addPanelClass(this.dialogType);
  }

  ngOnInit(): void {
    //this.cpySource = new URLSearchParams(window.location.search).get('cpysource') ?? '';
    this.cpySource = 'absatravel';

    if (this.storage.getItem('credentials', 'local')) {
      this.saveLocalStorage = true;
      this.credentials = JSON.parse(this.storage.getItem('credentials', 'local') ?? ''); 
    } else if (this.storage.getItem('credentials', 'session')) {
      this.saveLocalStorage = false;
      this.credentials = JSON.parse(this.storage.getItem('credentials', 'session') ?? '');
    }
    this.countriesList = getCountriesArray();
    for (let i = 0; i <= 30; i++) {
      this.yearsArray.push({ year: this.year + i });
    }
    this.initForm();
    this.searchService.langValue.subscribe((val: any) => {
      this.userAgent = this.myAccountService.countrydata;
    });
  }

  initForm(): void {
    this.addCardForm = this.fb.group({
      cardNumber: ['', [Validators.required, Validators.minLength(12), this.binValidator()]],
      cardName: ['', Validators.required],
      cardExpiry: ['', Validators.required],
      cardExpiryMonth: ['', Validators.required],
    });
  }

  onChangeEvent(e: Event): void {
    this.validateCreditCardNumber(this.addCardForm.value.cardNumber);
  }

  public getExpiryYear() {
    this.clearCardExpirationMessage();
    this.expiryYear = this.addCardForm.value.cardExpiry.toString().slice(-2);
  }

  filterCardName(event: any): void {
    const input = event.target;
    const cleanValue = input.value.replace(/[^a-zA-Z\s]/g, '');

    // Update both the input value and the form control
    input.value = cleanValue;
    this.addCardForm.get('cardName')?.setValue(cleanValue, { emitEvent: false });
  }
  getBinCardNumbers(userCardNum: any) {
    let newCardBinNum: any;
    if (!this.tempCardBinData) {
      this.tempCardBinData = userCardNum.slice(0, 6);
    } else {
      if (userCardNum.length > 7)
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

  binValidator() : ValidatorFn {
    return (control) => {
      if (this.showAbsaCardMessageForSix && this.showAbsaCardMessageForEight) {
        return {
          notAbsaCard: true
        }
      } else {
        return null;
      }
    }
  }

  validateBinNumber(cardNumber: string) {
    const checkingForSix = cardNumber.length === 6;
    const binValidationRun = new Subject<void>();
    let binResponse;
    console.log("--------validate bin number--->>");
    if (checkingForSix) this.paymentService.getBinData(cardNumber, this.cpySource);
    else this.paymentService.getBinDataForEight(cardNumber, this.cpySource);
    
    binResponse = checkingForSix
      ? this.paymentService.currentbinResponse 
      : this.paymentService.currentbinResponseForEight;
    
    binResponse.pipe(filter(x => x !== null), takeUntil(binValidationRun)).subscribe(
      (data) => {
        if (checkingForSix) this.showAbsaCardMessageForSix = !data || data.status !== '200';
        else this.showAbsaCardMessageForEight = !data || data.status !== '200';

        if (data && data.data) {
          const binListResponse = data.data;

          if (checkingForSix) this.showAbsaCardMessageForSix = !binListResponse?.bank?.name?.toLowerCase().includes('absatravel');
          else this.showAbsaCardMessageForEight = !binListResponse?.bank?.name?.toLowerCase().includes('absatravel');

          const cardNumberControl = this.addCardForm.get('cardNumber');
          if (cardNumberControl) {
            cardNumberControl.updateValueAndValidity();
          }
        }

        binValidationRun.next();
      },
      (error) => {
        if (checkingForSix) this.showAbsaCardMessageForSix = true;
        else this.showAbsaCardMessageForEight = true;
      }
    );
  }

  onlyNumbers(event: any) {
    return numInputNoChars(event);
  }

  public onKeyEnterEvent(event: any) {
    const userCardNum = event.target.value.split(' ').join('');
    const isNewCardNumber = this.getBinCardNumbers(userCardNum);
    if (event.target.value) {
      if (userCardNum.length > 5 && isNewCardNumber) {
        this.tempCardBinData = userCardNum.length > 7 
          ? userCardNum.slice(0, 8) 
          : userCardNum.slice(0, 6);
        
        this.validateCreditCardNumber(userCardNum); 
        //Trigger BIN validation for length of 6 and then length of 8, if possible.
        this.validateBinNumber(userCardNum.slice(0, 6));

        if (userCardNum.length > 7) { 
          this.validateBinNumber(userCardNum.slice(0, 8));
        } else if (userCardNum.length <= 7) {
          this.showAbsaCardMessageForEight = true; // Set to true if less than 8 digits to show error message for first six digits
        }

      } else if (userCardNum.length < 5) {
        this.tempCardBinData = null;
        this.selectedCardMethod = null;
      }
    } else {
      this.showAbsaCardMessageForSix = false;
      this.showAbsaCardMessageForEight = false;
      this.tempCardBinData = null;
    }
  }

  onSubmit() {
    this.submitted = true;
    if (this.addCardForm.invalid || (this.showAbsaCardMessageForSix && this.showAbsaCardMessageForEight)) {
      return;
    } else {
      this.isLoading = true;
      
      let month = this.addCardForm.get('cardExpiryMonth')!.value;
      let year = this.addCardForm.value.cardExpiry.toString();
      this.cardExp = month + '/' + year.slice(2);
      
      // If current date is greater than expiry date
      if (new Date() > new Date(year, month, 0)) {
        this.showCardExpiredMessage = true;
        this.isLoading = false;
        return;
      }

      const cardData = {
        paymentCard: {
          cardType: {},
          address: {
            streetNmbr: this.addCardForm.get('address')?.value,
            postalCode: this.addCardForm.get('postalCode')?.value,
            countryName: this.addCardForm.get('country')?.value,
            cityName: this.addCardForm.get('city')?.value,
            bldgRoom: '',
          },
          cardHolderName: this.addCardForm.get('cardName')?.value,
          cardNumber: this.addCardForm.get('cardNumber')?.value,
          expireDate: this.cardExp,
          billingAddressLine1: this.addCardForm.get('address')?.value,
          postalCode: this.addCardForm.get('postalCode')?.value,
          cityName: this.addCardForm.get('city')?.value,
          countryName: this.addCardForm.get('country')?.value,
          cardCode: this.selectedCardMethod,
        },
        token: this.credentials.data.token,
        userAgent: this.userAgent,
      };

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

      this.myAccountService.addpaymentCard(cardData).subscribe((res: any) => {
        if (res.result == 'OK' && res.code == 200) {
          this.credentials = res;
          this.addCardForm.reset();
          this.submitted = false;
          //store data in session storage & local storage
          this.sessionService.setStorageDataInSession(res, this.saveLocalStorage)
          this.dialogRef.close();
          this._snackBar.open('Payment Card Added Successfully', '');
          setTimeout(() => {
            this._snackBar.dismiss();
          }, 3000);
          this.isLoading = false;
        } else {
          this.isLoading = false;
          this.errorMsg = res.result;
        }
      }, 
      (error) => { 
        this.isLoading = false;
      });
    }
  }

  closeDialog() {
    this.dialogRef.close();
  }

  clearCardExpirationMessage() {
    this.showCardExpiredMessage = false;
  }

  private validateCreditCardNumber(input: any) {
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
    // Discover
    const discover_regex = /^(6011|65|64[4-9]|62212[6-9]|6221[3-9]|622[2-8]|6229[01]|62292[0-5])/; // 6011, 622126-622925, 644-649, 65

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
}
