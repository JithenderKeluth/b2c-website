import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { SubmissionSuccessModalComponent } from './submission-success-modal.component';
import { SubscriptionSlotsMissedModalComponent } from './subscription-slots-missed-modal.component';
import { PaymentService } from '../../payment/service/payment.service';
import { filter, takeUntil } from 'rxjs/operators';
import { numInputNoChars } from '@app/flights/utils/odo.utils';
import { Subject } from 'rxjs';
import { PeachPaymentsService } from '../../travelstart-plus/service/peach-payments.service';
import { SessionUtils } from '../../general/utils/session-utils';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { MyAccountServiceService } from '../../my-account/my-account-service.service';


@Component({
  selector: 'app-mastercard-registration',
  templateUrl: './mastercard-registration.component.html',
  styleUrls: ['./mastercard-registration.component.scss']
})
export class MastercardRegistrationComponent implements OnInit {
  get paymentCardForm() {
    return this.registrationForm.controls;
  }
  registrationForm: FormGroup;
  showMasterCardMessageForSix = false;
  showMasterCardMessageForEight = false;
  tempCardBinData: any = null;
  cpySource: string; 
  public submitted = false;
   private credentials: any;
  isLoading : boolean = false;
  constructor(
    private dialog: MatDialog,
    private fb: FormBuilder,
    private route: ActivatedRoute,
     private paymentService: PaymentService,
     private peachPaymentService: PeachPaymentsService,
     private sessionUtils: SessionUtils,
     private _snackBar: MatSnackBar,
     private myAccountService: MyAccountServiceService,
     private router : Router
  ) {
  }

  ngOnInit() {
    this.cpySource = 'mastercardtravel';
    this.initForm();
    this.route.queryParamMap.subscribe(params => {
      const showLimit = params.get('subscription-limit') === 'true';
        const credentialsData = sessionStorage.getItem('credentials');
          this.credentials = credentialsData ? JSON.parse(credentialsData)?.data : null;
      if (showLimit) {
        this.dialog.open(SubscriptionSlotsMissedModalComponent, {
          disableClose: true,
          width: '350px',
          panelClass: 'custom-slots-missed-modal'
        });
      }
    });
    
  }

  initForm(): void {
    this.registrationForm = this.fb.group({
      mobileNumber: ['', [
        Validators.required,
        Validators.pattern('^[0-9]*$'),
        Validators.minLength(8),
        Validators.maxLength(11) // Adjust as per country: here it's 10 digits only
      ]],
      cardNumber: ['', [Validators.required, Validators.minLength(12), this.binValidator()]],
    });
  }

   onChangeEvent(e: Event): void {
    this.validateCreditCardNumber(this.registrationForm.value.cardNumber);
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
        if (this.showMasterCardMessageForSix && this.showMasterCardMessageForEight) {
          return {
            notMasterCard: true
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
      if (checkingForSix) this.paymentService.getBinData(cardNumber, this.cpySource);
      else this.paymentService.getBinDataForEight(cardNumber, this.cpySource);
      
      binResponse = checkingForSix
        ? this.paymentService.currentbinResponse 
        : this.paymentService.currentbinResponseForEight;
      
      binResponse.pipe(filter(x => x !== null), takeUntil(binValidationRun)).subscribe(
        (data) => {
          if (data && data?.data) {
            const binListResponse = data.data;
            if (checkingForSix) this.showMasterCardMessageForSix = !binListResponse?.bank?.name?.toLowerCase().includes('mastercardtravel');
            else this.showMasterCardMessageForEight = !binListResponse?.bank?.name?.toLowerCase().includes('mastercardtravel');
          }else{
            if (checkingForSix) this.showMasterCardMessageForSix = true;
            else this.showMasterCardMessageForEight = true;
          }
          const cardNumberControl = this.registrationForm.get('cardNumber');
            if (cardNumberControl) {
              cardNumberControl.updateValueAndValidity();
            }
          binValidationRun.next();
        },
        (error) => {
          if (checkingForSix) this.showMasterCardMessageForSix = true;
          else this.showMasterCardMessageForEight = true;
        }
      );
           const cardNumberControl = this.registrationForm.get('cardNumber');
            if (cardNumberControl) {
              cardNumberControl.updateValueAndValidity();
            }
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
           //const eightBinRes =  this.validateBinNumber(userCardNum.slice(0, 8)); 
           setTimeout(() => { 
              if (userCardNum.length >= 7) { 
                  this.validateBinNumber(userCardNum.slice(0, 8));
              } else if (userCardNum.length <= 7) {
                this.showMasterCardMessageForEight = true; // Set to true if less than 8 digits to show error message for first six digits
              } 
            },200);
            
        } else if (userCardNum.length < 5) {
          this.tempCardBinData = null; 
          this.showMasterCardMessageForSix = false;
        this.showMasterCardMessageForEight = false;
        }
      } else {
        this.showMasterCardMessageForSix = false;
        this.showMasterCardMessageForEight = false;
        this.tempCardBinData = null;
      }
    }

  onSubmit() {
     this.submitted = true;
    if (this.registrationForm.valid) {
      // console.log('Form submitted:', this.registrationForm.value);
      this.updateSubscription(this.registrationForm.value.cardNumber);
      

    }
  }

  private updateSubscription(cardNumber: any) {
  
    const params = {
      cardPAN: cardNumber.replaceAll(" ", ""), 
      correlationId: this.sessionUtils.getCorrelationId(),
      userAgent: {
        deviceId: 'browser',
        application: 'Web-Chrome',
        version: 'v1',
        country: 'ZA',
        market: 'ZA',
        language: 'en',
      },
    };
    this.isLoading = true;
    
    this.peachPaymentService.updateMasterCardSubscriptionStatus(params).subscribe(
      (res: any) => {
        if (res?.data !== null || res?.data?.subscriptionStatus === 'ACTIVE') {
          this.isLoading = false;
           this.getUserData();
           this.router.navigate(['/mastercard/subscriptionSuccess'], { queryParamsHandling: 'preserve' });
          // this.dialog.open(SubmissionSuccessModalComponent, {
          //   disableClose: true,
          //   width: '350px',
          //   panelClass: 'custom-success-modal'
          // });
        } else {
          this.isLoading = false;
          const errMsg = 'Unexpected response. Please try again later.';
          this.handleApiError(errMsg);
        }
      },
      (error) => {
        this.isLoading = false;
        const statusCode = error?.status || error?.error?.code;
          let errMsg = '';

          //  Corrected: Check root-level error.error.data.message
          console.log(error?.error?.data?.message)
          if (error?.error?.data?.message) {
            errMsg = error.error.data.message;
          } else if (error?.error?.message) {
            // fallback if message is directly in error
            errMsg = error.error.message;
          } else {
            // 🔁 Fallback to known error codes
            switch (statusCode) {
              case 400:
                errMsg = 'Invalid request. Please check your input.';
                break;
              case 401:
                errMsg = 'Unauthorized. Please login again.';
                break;
              case 498:
                errMsg = 'Session expired. Please re-authenticate.';
                break;
              case 1611:
                errMsg = 'Your account is pending approval.';
                break;
              default:
                errMsg = 'An unexpected error occurred. Please try again.';
            }
          }

        this.handleApiError(errMsg);
      }
    );
  }
  handleApiError(errorMessage: string, code?: string): any {
     
    this._snackBar.open(errorMessage,'X');
  }
  
  getUserData(): Promise<void> {
    return new Promise((resolve) => {
      if (this.credentials?.token) {
        this.myAccountService.getUserData(this.credentials.token).subscribe((res: any) => {
          if (res.data) { 
            this.credentials = res?.data;
            // Update both localStorage and sessionStorage
            sessionStorage.removeItem('credentials');
            sessionStorage.setItem('credentials', JSON.stringify(res));
            localStorage.removeItem('credentials');
            localStorage.setItem('credentials', JSON.stringify(res));
          }
          resolve();
        });
      } else {
        resolve();
      }
    });
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
  }
  
} 