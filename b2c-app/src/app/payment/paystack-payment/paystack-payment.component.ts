import { Component, Input, Output, EventEmitter, Inject, PLATFORM_ID } from '@angular/core';
import { PaymentService } from '../service/payment.service';
import { UntypedFormControl } from '@angular/forms';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { numInputNoChars } from '@app/flights/utils/odo.utils';
import { DomSanitizer } from '@angular/platform-browser';
import { IframeWidgetService } from '@app/general/services/iframe-widget.service';
import { UniversalStorageService } from '@app/general/services/universal-storage.service';
import { isPlatformBrowser } from '@angular/common';

declare let $: any;
const CURRENCY = 'currency';
const FAILED = 'failed';

@Component({
  selector: 'app-paystack-payment',
  templateUrl: './paystack-payment.component.html',
  styleUrls: ['./paystack-payment.component.scss'],
})
export class PaystackPaymentComponent {
  private isBrowser: boolean;
  currency_code: string;
  paymentGatewayForm = new UntypedFormControl('');
  isLoading: boolean = false;
  isSubmitted: boolean = false;
  isAddMoneyViaPaystackInProgress: boolean = false;
  processingDetails: any;
  canProceedToInitiatePayment: boolean = true;
  showPaymentGatewayIframe: boolean = false;
  paystackTargetIFrameUrl: any = null;
  three3DIFrame: boolean = false;
  isPaystackCallbackUrlLoading: boolean = false;
  paymentVerificationDetails: any;
  intervalID: any;
  isPaymentProcessing: boolean = false;
  isVaildAmount: boolean = false;
  proceedToAddMoney: boolean = false;
  @Input() paymentDetails: any;
  @Output() closeAddMoneySection = new EventEmitter<any>();
  @Output() IframeDisplayed: EventEmitter<any> = new EventEmitter<boolean>();
  ZA_default_Amount: any = [2000, 5000, 10000];
  NG_default_Amount: any = [2000000, 500000, 1000000];
  constructor(
    private paymentService: PaymentService,
    private _snackbar: MatSnackBar,
    private _sanitizationService: DomSanitizer,
    private iframewidgetService: IframeWidgetService,
    private storage: UniversalStorageService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.currency_code = this.storage.getItem('currencycode', 'session');
  }

  selectAmountToBeAdded(data: any) {
    this.paymentGatewayForm.setValue(data);
    this.isVaildAmount = false;
  }

  askConsentToProceedPaymentHandler(event: Event) { 
    this.isVaildAmount = event['checked'];
  }

  paymentGatewayHandler() {
    this.isSubmitted = true;
    if (this.paymentGatewayForm.invalid || !this.isVaildAmount) return;
    else {
      this.isLoading = true;
      const reqObj = {
        id: this.paymentDetails[0].id,
        amount: this.paymentGatewayForm.value,
        currency: this.currency_code,
      };
      this.paymentService.getProcessingFee(reqObj).subscribe(
        (res: any) => {
          this._snackbar.dismiss();
          if (res.success) {
            this.processingDetails = res.data;
            this.isAddMoneyViaPaystackInProgress = true;
            this.paymentGatewayInitialization();
          } else {
            this.isError();
          }
        },
        (error) => {
          this.isSubmitted = false;
          this.isLoading = false;
          this.isError();
        }
      );
    }
  }
  isError() {
    this._snackbar.open('Something went wrong please try again.', '');
    setTimeout(() => {
      this._snackbar.dismiss();
    }, 3000);
  }
  paymentGatewayInitialization() {
    this.proceedToAddMoney = true;
    if (this.paymentGatewayForm.invalid || !this.isVaildAmount) return;
    else {
      this.isLoading = true;
      this.proceedToAddMoney = false;
      const reqObj = {
        id: this.processingDetails.id,
        refrence: this.processingDetails.refrence,
      };
      this.paymentService.initiatePaymentTransaction(reqObj).subscribe(
        (res: any) => {
          this.isLoading = false;
          this.showPaymentGatewayIframe = true;
          this.isPaystackCallbackUrlLoading = true;
          this.paystackTargetIFrameUrl = this._sanitizationService.bypassSecurityTrustResourceUrl(res.data.url);
          this.three3DIFrame = true;
          this.IframeDisplayed.emit(this.showPaymentGatewayIframe);
          setTimeout(() => {
            this.isPaystackCallbackUrlLoading = false;
          }, 2000);
          this.intervalID = setInterval(() => this.paymentVerification(), 10000);
        },
        () => (this.isLoading = false)
      );
    }
  }
  paymentVerification() {
    const reqObj = {
      reference: this.processingDetails.refrence,
    };
    this.paymentService.paymentVerifyCall(reqObj).subscribe((res: any) => {
      this.paymentVerificationDetails = res;
      if (this.paymentVerificationDetails.success) {
        clearInterval(this.intervalID);
        this.isPaymentProcessing = true;
        $('#iframeContainer').css({ display: 'none' });
      } else if (
        !this.paymentVerificationDetails.success &&
        (this.paymentVerificationDetails?.message == FAILED || this.paymentVerificationDetails?.message == 'abandoned')
      ) {
        clearInterval(this.intervalID);
        $('#iframeContainer').css({ display: 'none' });
        this.isPaymentProcessing = true;
        this.showPaymentGatewayIframe = true;
      }
    });
  }

  closeAddMoneySectionModal() {
    this.closeAddMoneySection.emit();
    this.showPaymentGatewayIframe = false;
    this.isAddMoneyViaPaystackInProgress = false;
    this.paymentGatewayForm.setValue(0);
    if (this.isBrowser && window?.parent?.document.getElementById('addMoneyToWallet_Modal')) {
      window.parent.document.getElementById('addMoneyToWallet_Modal').click();
    }
  }

  ngOnDestroy() {
    if(!this.isBrowser) return;
    $('#payment_success_modal').modal('hide');
    $('#payment_failed_Modal').modal('hide');
    $('#addMoneyToWallet_Modal').modal('hide');
    clearInterval(this.intervalID);
  }

  onSubmit(event: any) {
    event.target.submit();
    this.isPaystackCallbackUrlLoading = false;
  }

  //allows users to type only numbers
  onlyNumbers(event: any) {
    return numInputNoChars(event);
  }
  /**here to check is B2B flightsite organization or not  */
  isFlightSiteOrg() {
    return Boolean(this.iframewidgetService.b2bOrganization() == 'TS_FS');
  }
}
