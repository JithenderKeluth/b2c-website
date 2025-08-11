import { ChangeDetectorRef, Component, ElementRef, HostListener, OnInit, ViewChild, Inject, PLATFORM_ID } from '@angular/core';
import { PaymentCardsComponent } from '../payment-cards/payment-cards.component';
import { PaymentService } from './../service/payment.service';
import { ActivatedRoute, Router } from '@angular/router';
import { BookingService } from '@app/booking/services/booking.service';
import { GoogleTagManagerServiceService } from './../../_core/tracking/services/google-tag-manager-service.service';
import { I18nService } from '@app/i18n';
import { responsiveService } from '@app/_core/services/responsive.service';
import { BookingSummaryComponent } from '../booking-summary/booking-summary.component';
import { IframeWidgetService } from '@app/general/services/iframe-widget.service';
import { checkPaxValidationErrors } from '@app/flights/utils/search.utils';
import { ApiService } from '@app/general/services/api/api.service';
import { checkPaymentTypeFee, paymentValidations } from '@app/payment/utils/payment-utils';
import { AppSessionService } from '@app/_shared/session/app-session.service';
import { Subscription, timer } from 'rxjs';
import { ErrorMappingServiceService } from '@core/services/error-mapping-service.service';
import { DomSanitizer } from '@angular/platform-browser';
import { MomentumApiService } from '../../general/services/momentum-api.service';
import { SessionService } from '../../general/services/session.service';
import { MeiliIntegrationService } from '../../general/services/meili-integration.service';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { ErrorPopupComponent, ErrorPopupData } from '../../_shared/components/error-popup/error-popup.component';
import { MyAccountServiceService } from '../../my-account/my-account-service.service';
import { UniversalStorageService } from '../../general/services/universal-storage.service';
import { getEventsSharedData } from '../utils/payment-utils';
import { QueryStringAffid } from '@app/general/utils/querystringAffid-utils';
import { isPlatformBrowser } from '@angular/common';

declare const $: any;
@Component({
  selector: 'app-payment-view',
  templateUrl: './payment-view.component.html',
  styleUrls: ['./payment-view.component.scss'],
})
export class PaymentViewComponent implements OnInit {
  country: string;
  private isBrowser: boolean;

  constructor(
    private paymentService: PaymentService,
    private router: Router,
    private bookingService: BookingService,
    private googleTagManagerServiceService: GoogleTagManagerServiceService,
    private i18Service: I18nService,
    public responsiveService: responsiveService,
    private iframeWidgetService: IframeWidgetService,
    public apiService: ApiService,
    public appSessionService: AppSessionService,
    private cdRef: ChangeDetectorRef,
    private errorMappingServiceService: ErrorMappingServiceService,
    public el: ElementRef,
    private _sanitizationService: DomSanitizer,
    private momentumApiService: MomentumApiService,
    private sessionService: SessionService,
    private activatedRoute: ActivatedRoute,
    private meiliIntegrationService: MeiliIntegrationService,
    private dialog: MatDialog,
    private myaccountService : MyAccountServiceService,
    private storage: UniversalStorageService,
    private queryStringAffid : QueryStringAffid,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.country = apiService.extractCountryFromDomain();
  }

  public bookingInfo: any;
  public isLoading = false;
  public showIframe = false;
  public iframeUrl: any;
  public cc_ProcessingFee: any = null;
  public voucherData: any;
  public cardNumber: any;
  public voucherInfoToPayment: any;
  public router_path: any;
  public paymentErrors: any;

  processingFeeAmount: number = 0;
  targetUrlResponse: any;
  three3DIframe: boolean = false;
  redirectIframe: boolean = false;
  three3DLoad: boolean = false;
  vocherProductData: any = null;
  @ViewChild('paymentCard') public paymentcard: PaymentCardsComponent;
  bookingAmountVal: any;
  parsePaymentObj: any;
  paymentMethods: any;
  reDirect_enable: boolean = false;
  @ViewChild('bookingSummary') public bookingSummary: BookingSummaryComponent;
  targetUrl: any = null;
  threeDparams: any;
  bookingResp: any = null;
  counter: number = 0;
  countDown: Subscription;
  selected_Payment_option: any = null;
  paymentDeeplinkData: any = null;
  gatewayAuthLoading: boolean = false;
  selectedCardTypePayment: any = null;
  showPeachCheckoutForm: boolean = false;
  peachCheckoutData: any = null;
  showPeachCheckoutLoader: boolean = false;
  BookApiError: any = null;
  paxNamelengthError: boolean = false;

  isSaveCardDetailsChecked: boolean = false;
  voucherCode: any = null;
  paymentGatewayObj : any = null;
  ngOnInit(): void {
    this.googleTagManagerServiceService.pushPageLoadEvent('/payments', 'Search and Book Cheap Flights | Travelstart');
    this.storage.removeItem('redirectGatewayLoaded');
    this.processingFeeAmount = 0;
    let processFee = checkPaymentTypeFee(this.processingFeeAmount);
    this.paymentService.changeProcessingFee(processFee);
    this.bookingInfo = this.storage.getItem('bookingInfo', 'session');
    const booking_details = JSON.parse(this.storage.getItem('bookingDetails','session'));
    if (booking_details?.redirectGatewayParameters) {
      let iframeUrl = this.formIframeUrl(booking_details.redirectGatewayParameters);
    }
    if (this.storage.getItem('paymentDeeplinkData', 'session')) {
      this.paymentDeeplinkData = JSON.parse(this.storage.getItem('paymentDeeplinkData', 'session'));
    }
    if(this.isBrowser){
      if (window.location.pathname === '/payments') {
        this.showIframe = false;
      } else if (window.location.pathname === '/payments/eft') {
        this.showIframe = true;
      }
    }
    this.bookingService.currentVoucherAmount.subscribe((voucher) => {
      this.voucherData = voucher;
    });
    this.bookingService.currentVoucherInfo.subscribe((data: any) => {
      this.voucherInfoToPayment = data;
    });
    this.paymentService.currentProcessingfee.subscribe((data) => {
      this.bookingAmountVal = 0;
      if (this.bookingSummary && this.bookingSummary.totalPrice) {
        setTimeout(() => {
          this.bookingAmountVal = this.bookingSummary.totalPrice;
        }, 1000);
      }
    });
    /**
     * redirect to confirmation page if we have booking information
     * if (sessionStorage.getItem('bookingDetails') && JSON.parse(sessionStorage.getItem('bookingDetails')).bookingInformation) {
      this.router.navigate(['/payments/bookingConfirm'],{queryParamsHandling : 'preserve'});
    }
     */
    this.isRedirectenable();
    this.bookingService.seatToBeExpanded(false);

    let momentumAffId = this.momentumApiService?.affIdAsPerSpendLimits(
      this.meiliIntegrationService?.getTierInfo()?.activeCode
    );
    /**here we are trigger family API if domain is momentum and user have spent limits(based on spent limits we are consider affid)  */
    if (this.apiService.extractCountryFromDomain() == 'MM' && !momentumAffId?.includes('0')) {
      this.trigger_MM_FamilyAPI();
    }

    if (this.isBrowser) {
      window.addEventListener('message', this.handleIframeMessage);
    }

  }

  handleIframeMessage = (event: MessageEvent) => {
    if (!event?.data?.type) return;

    switch (event.data.type) {
      case 'REDIRECT_PARENT': {
        const path = event.data.path || '/payments';
        this.router.routeReuseStrategy.shouldReuseRoute = () => false;
        this.router.navigate([path], { queryParamsHandling: 'preserve' });
        break;
      }
      case 'CLOSE_TIMEOUT_MODAL': {
        const modal = document.getElementById('iframeTimeout_Modal');
        const closeBtn = document.getElementById('timeout_Modal_Close_CTA');
        if (modal && closeBtn) {
          (closeBtn as HTMLElement).click();
        }
        break;
      }
    }
  };

  parentFun() {
    alert('parent component function.');
  }

  private getSelectedCardPaymentInfo() {
    const paymentCardInfo = this.paymentcard.getSelectedCardInfo();
    return paymentCardInfo;
  }

  private getSelectedEFTPaymentInfo() {
    const paymentEFTInfo = this.paymentcard.getSelectedEFTInfo();
    return {
      holder: paymentEFTInfo.paymentEFTInfo,
      paymentMethodName: '',
      bankId: paymentEFTInfo.bankId,
      id: paymentEFTInfo.id,
      site: paymentEFTInfo.site,
      paymentOptionName: paymentEFTInfo.paymentOptionName,
      products: paymentEFTInfo.products,
      accountNo: paymentEFTInfo.accountNo,
      branchNo: paymentEFTInfo.branchNo,
      name: paymentEFTInfo.name,
    };
  }

  private getCardDetails() {
    const cardDetails = this.paymentcard.card_detailsForm.value;
    if (this.paymentcard.savedCardCvv && this.paymentcard.savedCardCvv.value) {
      cardDetails.cvv = this.paymentcard.savedCardCvv.value;
    }
    const paymentCardInfo = this.paymentcard.getSelectedCardInfo();
    this.selectedCardTypePayment = this.paymentcard?.selectedCardTypePaymentData;
    if (!this.paymentcard.reDirect_enable) {
      return {
        nameOnCard: cardDetails.cardName,
        cardEncryptionKey: (() => {
          if (this.paymentcard.cardDetails && this.paymentcard.cardDetails.cardToken) {
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
        cardName: 'CC',
        cardType: paymentCardInfo.paymentMethodName,
      };
    } else {
      let val: any = null;
      return {
        cardtype: val,
        cardName: val,
      };
    }
  }

  private getBillingDetails(contact: any) {
    const paymentReqInfo = JSON.parse(this.storage.getItem('paymentReqInfo', 'session'));
    return {
      postalCode: '8001',
      addressLine1: 'Cape Town',
      country: (() => {
        if (this.i18Service.userCountry) {
          return this.i18Service.userCountry?.split('-')[1];
        } else {
          return 'ZA';
        }
      })(),
      contactNo: contact.mobileNo,
      city: 'Cape Town',
      contactCode: paymentReqInfo.contact.mobileCode,
      companyName: this.paymentcard.companyName.value,
      companyVatNo: this.paymentcard.companyVatNo.value,
      vatInvoice: this.paymentcard.requireVat,
    };
  }
  private parseBookRequest() {
    const paymentReqInfo = JSON.parse(this.storage.getItem('paymentReqInfo', 'session'));
    if (
      this.paymentcard &&
      this.paymentcard.paymentMethods &&
      (this.paymentcard.selectedPaymentOption === 'CC' ||
        this.paymentcard.selectedPaymentOption === 'DC' ||
        this.paymentcard.selectedPaymentOption === 'CC_3D_INS' ||
        this.paymentcard.selectedPaymentOption === 'CC_INS')
    ) {
      return {
        passengers: paymentReqInfo.passengers,
        contact: paymentReqInfo.contact,
        products: paymentReqInfo.products,
        paymentData: this.paymentcard.paymentMethods.data,
        selectedPaymentMethod: this.getSelectedCardPaymentInfo(),
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
    } else if (this.paymentcard?.selectedEftMethod) {
      return {
        passengers: paymentReqInfo.passengers,
        contact: paymentReqInfo.contact,
        products: paymentReqInfo.products,
        paymentData: this.paymentcard.paymentMethods.data,
        selectedPaymentMethod: this.getSelectedEFTPaymentInfo(),
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
      //TO DO for Instant EFT Payments
    } else if (
      this.paymentcard.selectedPaymentOption === 'IPAY' ||
      this.paymentcard.selectedPaymentOption === 'EFT' ||
      this.paymentcard.selectedPaymentOption === 'MOBICRED' ||
      this.paymentcard.selectedPaymentOption === 'MPESA' ||
      this.paymentcard.selectedPaymentOption === 'PAYSTACK' ||
      this.paymentcard.selectedPaymentOption === 'PAYFLEX'
    ) {
      return {
        passengers: paymentReqInfo.passengers,
        contact: paymentReqInfo.contact,
        products: paymentReqInfo.products,
        paymentData: this.paymentcard.paymentMethods.data,
        selectedPaymentMethod: this.paymentcard.getInstantMethods(),
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
    }
  }

  get_cc_ProcessingFee(data: any) {
    this.cc_ProcessingFee = data;
  }

  processPayment() {
    this.storage.removeItem('bookingDetails');
    this.storage.removeItem('redirectGatewayLoaded');
    if (this.paymentcard.selectedPaymentOption) {
      this.selected_Payment_option = this.paymentcard.selectedPaymentOption;
      if (
        this.paymentcard.selectedPaymentOption === 'CC' ||
        this.paymentcard.selectedPaymentOption === 'DC' ||
        this.paymentcard.selectedPaymentOption === 'CC_3D_INS' ||
        this.paymentcard.selectedPaymentOption === 'CC_INS'
      ) {
        this.paymentcard.submitted = true;
        if (!this.paymentcard.reDirect_enable) { 
          if (this.country == 'ABSA') {
            if (this.getCredentials()?.data?.paymentCardList?.length > 0 && !this.paymentcard.selectCard) {
              $('#paymentOptionsNotSelected_Modal').modal('show');
            }
          }

          if (this.paymentcard.card_detailsForm.invalid || this.paymentcard.savedCardCvv.invalid) {
            if (this.paymentcard?.card_detailsForm?.get('cardNumber')?.invalid) {
              this.paymentcard.card_number?.nativeElement?.focus();
              return;
            } else if (this.paymentcard?.card_detailsForm?.get('cardName')?.invalid) {
              this.paymentcard.cc_name.nativeElement?.focus();
              return;
            } else if (this.paymentcard?.card_detailsForm?.get('cardExpiryMonth')?.invalid) {
              this.paymentcard?.card_expiry.nativeElement?.focus();
              return;
            } else if (this.paymentcard?.card_detailsForm?.get('cardExpiry')?.invalid) {
              this.paymentcard.cardExpiryYear.nativeElement?.focus();
              return;
            } else if (this.paymentcard.card_detailsForm?.get('cvv')?.invalid) {
              this.paymentcard.cvv?.nativeElement?.focus();
              return;
            } else if (this.paymentcard?.savedCardCvv?.invalid) {
              this.paymentcard.savedcardCvv?.nativeElement?.focus();
              return;
            }
            return;
          }
        } else if (this.paymentcard.reDirect_enable && this.paymentcard.selectedRedirectPaymentcardType == null) {
          if ((this.country === 'ABSA' || this.country === 'mastercardtravel') && this.isSaveCardDetailsChecked) {
            this.saveCardDetails();
          }
          return;
        }

        if (this.paymentcard.requireVat) {
          if (this.isBrowser && this.paymentcard.companyName.invalid) {
            document.getElementById('vatcompanyName').focus();
            return;
          }
          if (this.isBrowser && this.paymentcard.companyVatNo.invalid) {
            document.getElementById('companyVat').focus();
            return;
          }
        }
      }

      if ((this.country === 'ABSA' || this.country === 'mastercardtravel') && this.isSaveCardDetailsChecked) {
        this.saveCardDetails();
      }

      if (
        this.paymentcard.selectedPaymentOption === 'CC' ||
        this.paymentcard.selectedPaymentOption === 'DC' ||
        this.paymentcard.selectedPaymentOption === 'EFT' ||
        this.paymentcard.selectedPaymentOption === 'CC_3D_INS' ||
        this.paymentcard.selectedPaymentOption === 'CC_INS' ||
        this.paymentcard.selectedPaymentOption === 'IPAY' ||
        this.paymentcard.selectedPaymentOption === 'MOBICRED' ||
        this.paymentcard.selectedPaymentOption === 'MPESA' ||
        this.paymentcard.selectedPaymentOption === 'PAYSTACK' ||
        this.paymentcard.selectedPaymentOption === 'PAYFLEX'
      ) {
        this.paymentcard.submitted = true;
        const parsedPaymentObject: any = this.parseBookRequest();
        if (parsedPaymentObject && parsedPaymentObject.cardDetails && parsedPaymentObject.cardDetails.cardNumber) {
          this.cardNumber = parsedPaymentObject.cardDetails.cardNumber;
        }

        //To Do cart payment event

        if (
          parsedPaymentObject &&
          this.cardNumber &&
          parsedPaymentObject.selectedPaymentMethod &&
          parsedPaymentObject.cardDetails
        ) {
        }
        this.paymentGatewayObj = {
          paymentOptionName: parsedPaymentObject.selectedPaymentMethod.paymentOptionName,
          cardType: this.paymentcard.selectedCardMethod,
          coupon: this.voucherCode,
          paymentName: parsedPaymentObject.selectedPaymentMethod.name,
          paymentMethodName: parsedPaymentObject.selectedPaymentMethod.paymentMethodName,
          cartPaymentProducts: parsedPaymentObject.selectedPaymentMethod['products'],
        };
        this.googleTagManagerServiceService.pushFlightPaymentgatewayEvent(this.paymentGatewayObj);
        this.googleTagManagerServiceService.pushCartPaymentData(this.paymentGatewayObj);
        // if payment method 3D secure
        if (
          (parsedPaymentObject &&
            (parsedPaymentObject.selectedPaymentMethod.paymentOptionName === 'CC_3D' ||
              parsedPaymentObject.selectedPaymentMethod.paymentOptionName === 'DC_3D' ||
              parsedPaymentObject.selectedPaymentMethod.paymentOptionName === 'CC_INS' ||
              parsedPaymentObject.selectedPaymentMethod.paymentOptionName === 'CC_3D_INS')) ||
          (this.reDirect_enable && this.paymentcard.selectedRedirectPaymentcardType != null) ||
          parsedPaymentObject.selectedPaymentMethod.paymentOptionName === 'MOBICRED' ||
          parsedPaymentObject.selectedPaymentMethod.paymentOptionName === 'PAYSTACK' ||
          parsedPaymentObject.selectedPaymentMethod.paymentOptionNamen === 'PAYFLEX'
        ) {
          if(this.isBrowser){
            const Url = window.location.origin;
            parsedPaymentObject['paymentReturnURL'] = `${Url}/website-services/api/redirect-callback/redirect-gateway`; 
          }
        } else if (
          parsedPaymentObject &&
          parsedPaymentObject.selectedPaymentMethod.paymentOptionName !== 'CC_3D' &&
          parsedPaymentObject.selectedPaymentMethod.paymentOptionName !== 'DC_3D' &&
          parsedPaymentObject.selectedPaymentMethod.paymentOptionName !== 'CC_3D_INS' &&
          parsedPaymentObject.selectedPaymentMethod.paymentOptionName !== 'CC_INS' &&
          !this.reDirect_enable
        ) {
          delete parsedPaymentObject['paymentReturnURL'];
        }
        if (
          this.paymentcard.selectedPaymentOption === 'CC_3D_INS' ||
          this.paymentcard.selectedPaymentOption === 'CC_INS'
        ) {
          parsedPaymentObject['selectedInstallmentMonth'] = this.paymentcard.card_detailsForm.value.budget_period;
        }
        this.storage.removeItem('bookAPIRequestData');
        if (
          this.apiService.extractCountryFromDomain() == 'IB' &&
          this.paymentcard.rewardPointsArray.length > 0 &&
          Object.keys(parsedPaymentObject.selectedPaymentMethod).length > 0
        ) {
          parsedPaymentObject.selectedPaymentMethod.products = this.paymentcard.rewardPointsArray.filter(
            (x: any) => x.initSelected
          );
        }
        // parsedPaymentObject['loggedonToken'] = this.getCredentials() ? this.getCredentials()?.data?.token : null;
        parsedPaymentObject['userId'] = this.getCredentials()?.data?.userID  ? this.getCredentials()?.data?.userID  : null;
        this.storage.setItem('bookAPIRequestData', JSON.stringify(parsedPaymentObject), 'session');
        this.parsePaymentObj = parsedPaymentObject;
        if (
          ((this.paymentcard.requireVat && this.paymentcard.companyName.valid && this.paymentcard.companyVatNo.valid) ||
            !this.paymentcard.requireVat) &&
          this.checkTBITerms()
        ) {
          this.bookFlight(parsedPaymentObject);
        }
      }
    } else {
      $('#paymentOptionsNotSelected_Modal').modal('show');
    }
  }

  setSaveCardDetails(isSaveCardDetailsChecked: boolean) {
    this.isSaveCardDetailsChecked = isSaveCardDetailsChecked;
  }

  saveCardDetails(): void {
    let cardExp =
      this.paymentcard.card_detailsForm.get('cardExpiryMonth')!.value +
      '/' +
      this.paymentcard.card_detailsForm.value.cardExpiry.toString().slice(-2);
    let cardData = {
      paymentCard: {
        cardType: {},
        address: {
          streetNmbr: '255',
          postalCode: '8001',
          countryName: 'South Africa',
          cityName: 'Cape Town',
          bldgRoom: 'Darter Studio',
        },
        cardHolderName: this.paymentcard.card_detailsForm.get('cardName')!.value,
        cardNumber: this.paymentcard.card_detailsForm.get('cardNumber')!.value,
        expireDate: cardExp,
        billingAddressLine1: 'Darter Studio, Longkloof, Darters Road',
        postalCode: '8001',
        cityName: 'Cape Town',
        countryName: 'South Africa',
        cardCode: this.paymentcard.selectedCardMethod,
      },
      token: this.getCredentials().data.token,
      userAgent: this.myaccountService.countrydata,
    };

    this.myaccountService.addpaymentCard(cardData).subscribe((data: any) => {});
  }

  paymentTypeCheck() {
    if (
      !this.paymentcard.invalid_debitCard &&
      !this.paymentcard.invalid_card &&
      !this.paymentcard.invalid_PaymentType
    ) {
      return true;
    } else {
      return false;
    }
  }
  checkTBITerms() {
    if (
      this.apiService.extractCountryFromDomain() == 'IB' &&
      (!this.paymentcard.travelRegulations.value || !this.paymentcard.airlineRules.value)
    ) {
      const el = this.paymentcard.elementRef.nativeElement.querySelector('#TBI_TERMS');
      el?.scrollIntoView({ behavior: 'auto', block: 'start' });
      return false;
    } else {
      return true;
    }
  }
  bookFlight(parsedPaymentObject: any) {
    this.paymentcard.paymentErrors = null;
    this.storage.removeItem('selectedPayment');
    this.storage.setItem('selectedPayment', this.paymentcard.selectedPaymentOption);
    this.isLoading = true;
    this.googleTagManagerServiceService.pushBookRequestEvent();
    this.googleTagManagerServiceService.pushBookValidationRequestEvent();
    if (this.paymentcard.isConnected) {
      this.paymentService.bookFlight(parsedPaymentObject).subscribe(
        (res: any) => {
          let bookingDetails = res;
          this.bookingResp = bookingDetails;
           this.googleTagManagerServiceService.pushBookResponseEvent();
          if (!bookingDetails.bookingInformation) {
            this.paymentcard.invalid_card = false;
            this.isLoading = false;
            this.googleTagManagerServiceService.pushCartPaymentFailedEvent();
            this.storage.removeItem('bookingDetails');
          }
          if (bookingDetails.threeDSecureParameters && bookingDetails.threeDSecureParameters.length > 0) {
            this.get3dTargetURL(bookingDetails.threeDSecureParameters, '3D_enable');
            return;
          }
          if (bookingDetails.voucherProductResponse) {
            this.bookingAmountVal = this.bookingSummary.totalPrice;
            this.vocherProductData = bookingDetails.voucherProductResponse;
            $('#vocher_product').modal('show');
            return;
          }
          if (bookingDetails.bookingInformation) {
            if (
              this.paymentcard.selectedPaymentOption === 'EFT' ||
              this.paymentcard.selectedPaymentOption === 'IPAY' ||
              this.paymentcard.selectedPaymentOption === 'MOBICRED' ||
              this.paymentcard.selectedPaymentOption === 'MPESA' ||
              this.paymentcard.selectedPaymentOption === 'PAYSTACK'
            ) {
              this.isLoading = true;
              if (bookingDetails.errors && bookingDetails.bookingInformation == null) {
                 this.googleTagManagerServiceService.pushCartPaymentFailedEvent();
                $('#payment_failed_Modal').modal('show');
                this.isLoading = false;
                this.paymentcard.selectedCard = null;
               this.triggerIterableEvents('bookingFailed');
               this.triggerIterableEvents('paymentfailures');
                return;
              } else {
                this.storage.setItem('bookingDetails', JSON.stringify(bookingDetails), 'session');
                this.isLoading = false;
                if (
                  this.paymentcard.selectedPaymentOption === 'EFT' ||
                  this.paymentcard.selectedPaymentOption === 'MPESA'
                ) {
                  // this.googleTagManagerServiceService.pushTransactionSuccessData(bookingDetails);
                  this.router.navigate(['/payments/bookingConfirm'], { queryParamsHandling: 'preserve' });
                  this.resetVoucherInfo();
                  return;
                } else {
                  this.get3dTargetURL(bookingDetails.redirectGatewayParameters, this.paymentcard.selectedPaymentOption);
                  return;
                }
              }
            }
            if (
              (this.paymentcard.selectedPaymentOption === 'CC' ||
                this.paymentcard.selectedPaymentOption === 'DC' ||
                this.paymentcard.selectedPaymentOption === 'CC_3D_INS' ||
                this.paymentcard.selectedPaymentOption === 'CC_INS') &&
              ((!bookingDetails.errors &&
                !bookingDetails.validationResults &&
                !bookingDetails.redirectGatewayBookingResponse &&
                !bookingDetails.threeDSecureParameters) ||
                bookingDetails.bookingInformation)
            ) {
              this.isLoading = true;
              this.storage.setItem('bookingDetails', JSON.stringify(bookingDetails), 'session');
              this.isLoading = false;
              this.paymentcard.selectedCard = null;
              // this.googleTagManagerServiceService.pushTransactionSuccessData(bookingDetails);
              this.router.navigate(['/payments/bookingConfirm'], { queryParamsHandling: 'preserve' });
              this.resetVoucherInfo();
              return;
            }
            if (
              this.paymentcard.selectedPaymentOption === 'CC' ||
              this.paymentcard.selectedPaymentOption === 'DC' ||
              this.paymentcard.selectedPaymentOption === 'CC_3D_INS' ||
              this.paymentcard.selectedPaymentOption === 'CC_INS'
            ) {
              this.validationResults(bookingDetails);
              if (bookingDetails.redirectGatewayParameters && bookingDetails.redirectGatewayParameters.length > 0) {
                this.storage.setItem('bookingDetails', JSON.stringify(bookingDetails), 'local');
                this.get3dTargetURL(bookingDetails.redirectGatewayParameters, 'redirect_enable');
                return;
              }
              this.validationResults(bookingDetails);
              return;
            }
            if (this.paymentcard.selectedPaymentOption === 'PAYFLEX') {
              this.storage.setItem('bookingDetails', JSON.stringify(bookingDetails), 'session');
              // this.isLoading = false;
              // this.paymentcard.selectedCard = null;
              this.triggerPeachCheckOutApI();
              return;
            }
            return;
          }
          this.validationResults(bookingDetails);
          if (bookingDetails.errors) {
             this.googleTagManagerServiceService.pushFlight_PaymentFailEvent();
             this.googleTagManagerServiceService.pushGTMFlight_BookingFailEvent();
            const { category, action, message } = this.errorMappingServiceService.mapError(bookingDetails?.errors);
            const err_Obj = { category: category, action: action, description: message };
            this.BookApiError = err_Obj;
            this.paymentcard.BookApiError = err_Obj;
             this.triggerIterableEvents(this.BookApiError);
            if (this.country == 'ABSA' && this.BookApiError.category == 'paymentfailures') {
              this.BookApiError.description =
                'We couldn’t process your payment. Please verify your card details or use a different card';
            }
            // Don't show payment/validation failures on a modal for ABSA, only show the failure message on the page
            if (
              this.country !== 'ABSA' ||
              (err_Obj.category !== 'paymentfailures' && err_Obj.category !== 'validationfailures')
            ) {
              $('#payment_failed_Modal').modal('show');
            }
            // For ABSA, when there are no payment errors by errors were returned, show the default error message.
            if (this.country === 'ABSA' && !this.paymentcard.paymentErrors) {
              this.paymentcard.paymentErrors = {
                msg: 'Your card type is not supported. Please use a different card.',
                img: 'placeholder',
              };
            }

            if (this.paymentcard.BookApiError.category !== 'unknown' || this.BookApiError !== 'unknown') {
              return;
            }
          }
        },
        (error) => {
          if (error) {
            if (error.error) {
              this.googleTagManagerServiceService.pushFlight_PaymentFailEvent();
              this.googleTagManagerServiceService.pushGTMFlight_BookingFailEvent();
               this.triggerIterableEvents('bookingFailed');
               this.triggerIterableEvents('paymentfailures');
              if (this.paymentcard.selectedPaymentOption == 'EFT') {
                $('#payment_failed_Modal').modal('show');
                this.paymentcard.paymentErrors = null;
              }
              this.paymentcard.paymentErrors = null;
              let errorObj = {
                msg:
                  this.country == 'ABSA'
                    ? 'Oh no, your booking is failed. Please try again.'
                    : 'Oh no, your booking is failed. Please try again.',
                img: `/assets/icons/Icon/Negative-scenarios/cannot_process_booking_icon.svg`,
              };
              this.paymentcard.paymentErrors = errorObj;
              this.paymentcard.invalid_card = false;
              this.isLoading = false;
            }
          }
        }
      );
    } else {
      this.isLoading = false;
      this.scrollToError();
    }
  }
  validationResults(bookingDetails: any) {
    if (bookingDetails.validationResults) {
      this.googleTagManagerServiceService.pushFlight_PaymentFailEvent();
      this.googleTagManagerServiceService.pushBookValidationResponseEvent();
      this.triggerIterableEvents('validationfailures');
      this.paymentcard.invalidVoucher = false;
      const paxNameValidation = checkPaxValidationErrors(bookingDetails);
      if (paxNameValidation && paxNameValidation.nameLengthValid == false) {
        this.paxNamelengthError = true;
        this.paymentcard.paxNamelengthError = true;
        $('#payment_failed_Modal').modal('show');
      }
      this.paymentcard.paymentErrors = null;
      this.paymentcard.paymentErrors = paymentValidations(bookingDetails, this.appSessionService);
      if (this.paymentcard.paymentErrors) {
        this.paymentcard.invalidCvv = false;
        this.scrollToError();
        return this.paymentcard.paymentErrors;
      } else if (
        bookingDetails.validationResults &&
        bookingDetails.validationResults.paymentDetailsValidationResults.invalidFields.cvvValid == false
      ) {
        this.paymentcard.cvv.nativeElement.focus();
        this.paymentcard.paymentErrors = null;
        return (this.paymentcard.invalidCvv = true);
      } else if (
        bookingDetails.validationResults.paymentDetailsValidationResults.invalidFields.voucherCodeValid == false
      ) {
        this.paymentcard.invalidVoucher = true;
      } else if (
        bookingDetails.validationResults &&
        bookingDetails.validationResults.paymentDetailsValidationResults.invalidFields.paymentMethodValid == false
      ) {
        this.paymentcard.paymentErrors = null;
        return $('#payment_failed_Modal').modal('show');
      }
    }
  }

  formIframeUrl(obj: any) {
    var newOnj = {};
    for (var i = 0; i < obj.length; i++) {
      if (obj[i].key != 'TARGET_URL') {
        var g = obj[i];
        newOnj[g.key] = g.value;
      }
    }

    var qs = Object.keys(newOnj)
      .map(function (key) {
        return key + '=' + newOnj[key];
      })
      .join('&');

    // print query string
    return `https://pay.ozow.com/?${qs}`;
  }
  ngOnDestroy() {
    if (this.isBrowser) {
      window.removeEventListener('message', this.handleIframeMessage);
    }
    this.countDown?.unsubscribe();
    $('#payment_failed_Modal').modal('hide');
    $('#vocher_product').modal('hide');
    $('#investecrewards_modal').modal('hide');
    $('#paymentOptionsNotSelected_Modal').modal('hide');
    $('#iframeTimeout_Modal').modal('hide');
  }
  get3dTargetURL(data: any, opt: string) {
    const obj: any = {};
    let Url: string = '';
    for (let i = 0; i < data.length; i++) {
      if (data[i].key == 'TARGET_URL') {
        Url = data[i].value;
        this.targetUrl = data[i].value;
      } else {
        if (opt == '3D_enable' || opt == 'IPAY' || opt == 'redirect_enable' || opt == 'PAYSTACK') {
          const dataval = data[i];
          obj[dataval.key] = dataval.value;
          this.three3DIframe = true;
        }
      }
    }
    if (opt == 'MOBICRED') {
      location.assign(Url);
      this.parsePaymentObj['bookingRequestData'] = this.bookingResp.data;
    } else {
      this.showIframe = true;
      this.three3DLoad = true;
      this.threeDparams = obj;
      this.parsePaymentObj['bookingRequestData'] = this.bookingResp.data;

      setTimeout(() => {
        if (this.isBrowser && this.three3DIframe) {
          document.getElementById('submitIframe').click();
        }
      }, 2000);
    }
    this.storage.removeItem('bookAPIRequestData');
    this.storage.setItem('bookAPIRequestData', JSON.stringify(this.parsePaymentObj), 'session');
  }
  onSubmit(event: any) {
    event.target.submit();
    this.three3DLoad = false;
    if (
      this.selected_Payment_option &&
      this.selected_Payment_option != 'IPAY' &&
      this.selected_Payment_option != 'PAYSTACK'
    ) {
      setTimeout(() => {
        this.counter = 300;
        this.countDown = timer(0, 1000).subscribe(() => {
          if (this.isRedirectgatewayLoaded) {
            this.countDown.unsubscribe();
            this.counter = 0;
            $('#iframeTimeout_Modal').modal('hide');
          } else if (this.counter > 0) {
            --this.counter;
          } else {
            this.countDown.unsubscribe();
            this.payment3DsTimeOut();
          }
        });
      }, 1000);
    }
  }

  selectedProductVocher(data: any) {
    this.parsePaymentObj['voucherProduct'] = data;
    $('#vocher_product').modal('hide');
    this.isLoading = true;
    this.bookFlight(this.parsePaymentObj);
  }
  isRedirectenable() {
    this.paymentMethods = JSON.parse(this.storage.getItem('paymentMethods', 'session'));
    if (!this.paymentMethods) {
      this.router.navigate([''], { queryParamsHandling: 'preserve' });
    } else if (this.paymentMethods?.paymentOptions) {
      for (let i = 0; i < this.paymentMethods.paymentOptions.length; i++) {
        if (this.paymentMethods.paymentOptions[i].paymentOptionGroup === 'CC') {
          this.reDirect_enable = this.paymentMethods.paymentOptions[i].isRedirectGateway;
        }
      }
    }
  }
  /*to check enable voucher or not */
  isCouponsCampaign() {
    if(!this.isBrowser) return;
    return (window.location.href.includes('cheapflightsza') ||
      window.location.href.includes('GoogleFSZA') ||
      window.location.href.includes('skyscanzats') ||
      !this.iframeWidgetService.isFrameWidget()) &&
      !this.iframeWidgetService.isFrameWidget() &&
      !window.location.href.includes('absarewards') &&
      !window.location.href.includes('oldmutual')
      ? false
      : true;
  }
  //** To trigger GatewayPaymentBookFlight when user exceeded 120s timeout  */
  payment3DsTimeOut() {
    let bookApiPayload = this.parsePaymentObj;
    delete bookApiPayload['paymentReturnURL'];
    bookApiPayload.gatewayPostResponseParameters = null;
    let redirectGateAuth: any = null;
    this.gatewayAuthLoading = true;
    if (bookApiPayload.selectedPaymentMethod.paymentOptionName == 'MOBICRED') {
      redirectGateAuth = null;
      delete bookApiPayload['billingDetails'];
      delete bookApiPayload['ignoreDuplicateBookings'];
      delete bookApiPayload['selectedPaymentMethod'];
      delete bookApiPayload['voucherData'];
      delete bookApiPayload['paymentData'];
    }
    this.paymentService.GatewayPaymentBookFlight(bookApiPayload, redirectGateAuth).subscribe(
      (data: any) => {
        let bookingInfo = data;
        this.gatewayAuthLoading = false;
        this.storage.setItem('redirectGateWayResponse', JSON.stringify(bookingInfo), 'session');
        this.storage.setItem('redirectGatewayLoaded', 'loaded', 'session');
        if (bookingInfo.bookingInformation || (bookingInfo.transactionID !== null && bookingInfo.granted)) {
          if (bookingInfo.bookingInformation) {
            this.storage.setItem('bookingDetails', JSON.stringify(bookingInfo), 'session');
          } else if (bookingInfo.transactionID !== null && bookingInfo.granted) {
            let bookApiRes = JSON.parse(this.storage.getItem('bookingDetails', 'session'));
            bookApiRes['transactionId'] = bookingInfo.transactionID;
            this.storage.setItem('bookingDetails', JSON.stringify(bookApiRes), 'session');
          }

          /*
           ** checking if the normal flow or the iframe
           */
          this.router.navigate(['/payments/bookingConfirm'], { queryParamsHandling: 'preserve' });
          this.resetVoucherInfo();
        }
        if (bookingInfo.errors) {
          this.isError(bookingInfo.errors);
        }
      },
      (error) => {
        if (error) {
          this.gatewayAuthLoading = false;
          if (error.error) {
            this.isError(error.error);
          }
        }
      }
    );
  }
  isError(errors: any) {
    if (errors) {
      $('#iframeTimeout_Modal').modal('show');
      this.triggerIterableEvents('bookingFailed');
      this.triggerIterableEvents('paymentfailures');
      /**here we are remove navigate to payment page just we are displaying timeout pop-up
        * this.showIframe = false;
        if(!sessionStorage.getItem('paymentDeeplinkData')){
          this.router.navigate(['/payments'], { queryParamsHandling: 'preserve' });
        }
        */
    }
  }
  ngAfterViewInit() {
    this.cdRef.detectChanges();
  }
  /** To check 3Ds redirected or not  */
  get isRedirectgatewayLoaded() {
    return this.storage.getItem('redirectGatewayLoaded', 'session');
  }
  retryPayment() {
    $('#iframeTimeout_Modal').modal('hide');
    this.showIframe = false;
    if (!this.storage.getItem('paymentDeeplinkData', 'session')) {
      this.router.navigate(['/payments'], { queryParamsHandling: 'preserve' });
    }
  }

  scrollToError() {
    const el = this.paymentcard.elementRef.nativeElement.querySelector('#errorMsg');
    el?.scrollIntoView({ behavior: 'auto', block: 'start' });
  }
  /**Show and hide coupons section*/
  showCouponSection() {
    return (
      this.apiService.extractCountryFromDomain() !== 'IB' &&
      // this.isCouponsCampaign() && // enable this if needs to add the restriction for iframes and sources
      !this.paymentDeeplinkData
    );
  }

  /**Showing the OTP content */
  showOTPContent() {
    const paymentOption = this?.selected_Payment_option;
    return Boolean(
      paymentOption &&
        paymentOption != 'IPAY' &&
        paymentOption != 'PAYSTACK' &&
        paymentOption?.supplierCashOverride == false
    );
  }

  /**Closing fare breakup when clickig the outside */
  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    const clickedInside = this.bookingSummary?.el?.nativeElement?.contains(event.target);
    if (!clickedInside) {
      const modal = this.el?.nativeElement?.querySelector('#fareBreakdown');
      if (modal && (this.responsiveService.screenWidth == 'sm' || this.responsiveService.screenWidth == 'md')) {
        this.bookingSummary?.closeFareBreakdown();
      }
    }
  }

  /**Restting the Voucher amount data for the next booking*/
  resetVoucherInfo() {
    this.bookingService.changeVoucherInfo(null);
  }
  /**here we are trigger peach checkout API for get checkoutId & entityId for display peach form for BNPL */
  triggerPeachCheckOutApI() {
    if(!this.isBrowser) return;
    this.peachCheckoutData = null;
    this.isLoading = true;
    this.targetUrl = null;
    const redirectUrl = `${window.location.origin}/website-services/api/redirect-callback/redirect-gateway`;
    let bookingRef = this.storage.getItem('paymentMethods', 'session')
      ? JSON.parse(this.storage.getItem('paymentMethods', 'session'))?.tccReference
      : null;
    this.paymentService
      .getPeachCheckoutIdforBNPL(this.bookingResp?.fareBreakdown?.totalAmount, redirectUrl, bookingRef)
      .subscribe(
        (res: any) => {
          if (res) {
            this.isLoading = false;
            this.peachCheckoutData = {
              checkoutId: res.checkoutId,
              entityId: res.entityId,
            };
            let checkoutFormUrl = `${window.location.origin}/payments/peach-checkout-form?checkoutId=${res.checkoutId}&entityId=${res.entityId}&checkoutJs=${res.checkoutJs} `;
            this.targetUrl = this._sanitizationService.bypassSecurityTrustResourceUrl(checkoutFormUrl);
            this.showPeachCheckoutForm = true;
            this.showPeachCheckoutLoader = true;
            setTimeout(() => {
              this.showPeachCheckoutLoader = false;
            }, 5000);
          }
        },
        (error: any) => {
          this.isLoading = false;
          this.showPeachCheckoutForm = false;
        }
      );
  }
  @HostListener('window:message', ['$event'])
  onMessage(event: MessageEvent): void {
    // Step 1: Verify the origin for security
    // Step 2: Check message data structure
    if (event?.data?.bookingReference && event?.data?.status == 'success') {
      let bookApiRes = JSON.parse(this.storage.getItem('bookingDetails', 'session'));
      bookApiRes['transactionId'] = event.data.merchantTransactionId;
      this.storage.setItem('bookingDetails', JSON.stringify(bookApiRes), 'session');
      this.router.navigate(['/payments/bookingConfirm'], { queryParamsHandling: 'preserve' });
    } else if (event?.data?.bookingReference && event?.data?.status !== 'success') {
      this.router.navigate(['/payments/bookingConfirm'], { queryParamsHandling: 'preserve' });
    }
  }
  /**To based on Book API error we can navigate to respective page */
  flight_results() {
    this.queryStringAffid.reIntiateNewSearch();
  }
  navigateToTravelerPage() {
    this.router.navigate(['/booking/flight-details'], { queryParamsHandling: 'preserve' });
  }
  close_Payment_failed_Modal() {
    this.isLoading = false;
    this.showPeachCheckoutForm = false;
  }
  getCredentials() {
    let credentials: any = null;
    if (this.storage.getItem('credentials', 'session')) {
      credentials = JSON.parse(this.storage.getItem('credentials', 'session'));
    } else if (this.storage.getItem('credentials', 'local')) {
      credentials = JSON.parse(this.storage.getItem('credentials', 'local'));
    }
    return credentials;
  }
  /** here we are trigger momentum family API to get details of travellimits based on limeits we are passing affid to API
   * here once everythin is working fine then modify the method */
  trigger_MM_FamilyAPI() {
    let sessionId: any = null;
    if (this.sessionService.getSessionId()) {
      sessionId = this.sessionService.getSessionId();
    } else {
      this.activatedRoute.queryParams.subscribe((params) => {
        sessionId = params['session_id'];
        if (sessionId) {
          this.sessionService.setSessionId(sessionId);
        }
      });
    }
    this.momentumApiService.getFamilyComposition(sessionId).subscribe(
      (response: any) => {
        // Transform the response for traveler list
        // const convertedResponse = this.transformResponse(response);
        const convertedResponse = this.momentumApiService.transformResponse(
          response.data?.familyCompositionMultiplyResponse
        );
        const mappedContact_MMObject = this.momentumApiService.createContact_MMObject(
          response.data?.familyCompositionMultiplyResponse
        );

        const mmfResponseObj = this.momentumApiService.transformMmfResponse(response);
        const familyCompositionMultiplyResponse = response?.data?.familyCompositionMultiplyResponse;
        // Fetch credentials from storage
        let credentials = this.getCredentials();

        // Update credentials with family composition data
        credentials = {
          ...credentials,
          data: {
            ...response,
            ...mmfResponseObj.data,
            ...mappedContact_MMObject,
            ...familyCompositionMultiplyResponse,
            travellerList: convertedResponse.travellerList,
            isCredentialsUpdated: true,
          },
        };

        // Update session storage
        this.getUserData();
        this.sessionService.updateSessionData('credentials', credentials);
        this.update_mmfTravellerData(credentials.data.travellerList);
        /**here we again checking user have spent limits or not based on spent limits allo user to make booking else navigate to home page */
        let tripSelected: any = null;
        if (this.storage.getItem('flightsearchInfo', 'session')) {
          tripSelected = JSON.parse(this.storage.getItem('flightsearchInfo', 'session'))?.tripType;
        }
        const userAffId = this.momentumApiService.affIdAsPerSpendLimits(
          this.meiliIntegrationService.getTierInfo()?.activeCode,
          true,
          tripSelected
        );
        /**here if user dont have any spent limits affid includes 0 so we are checking affid includes 0 or not  */
        if (userAffId?.includes(0)) {
          this.showError('Your available discounts have changed so we can\'t continue with your checkout. Please restart your search and try again.');
          return;
        }
      },
      (error: any) => {
        this.showError('Something went wrong. please try again ');
      }
    );
  }
  /**To display error pop-up with generic component */
  showError(errMsg: any): void {
    const popupData: ErrorPopupData = {
      header: 'Error Occurred',
      imageUrl: 'assets/icons/Icon/Negative-scenarios/dummy_error_icon.svg',
      message: errMsg,
      buttonText: 'okay',
      showHeader: false,
      showImage: true,
      showButton: true,
      showButton2: false,
      onButtonClick: () => {
        this.router.navigate(['/'], { queryParamsHandling: 'preserve' });
      },
    };

    this.dialog.open(ErrorPopupComponent, {
      width: '300px',
      data: popupData,
    });
  }
  /**here get User profile data to get saved card payment list  */
  getUserData() {
    let credentials = this.getCredentials();
    this.myaccountService.getUserData(credentials?.data?.token).subscribe((res: any) => {
      if (res.data) {
        credentials.data['paymentCardList'] = res?.data?.paymentCardList;
        this.sessionService.updateSessionData('credentials', credentials);
      }
    });
  }
/**here we are updating  mmfTravellerData to update spent limits based on family API response to check spentlimits*/
  update_mmfTravellerData(travellerList:any){
    const sessionTravellerList = travellerList;
    const mmfTravellerData = this.storage.getItem('mmfTravellerData', 'session') ? JSON.parse(this.storage.getItem('mmfTravellerData', 'session')) : [];
    if(sessionTravellerList.length > 0 && mmfTravellerData.length > 0){
      let updatedmmfTraveller = mmfTravellerData.map((traveller:any) => (traveller = sessionTravellerList.find((a:any) => a.clientNumber == traveller.clientNumber) || traveller, traveller));
      this.storage.setItem('mmfTravellerData', JSON.stringify(updatedmmfTraveller), 'session');
    }
  };
  
  /**To get the voucher code from app-coupons-info component */
  getVoucherCode(data: any) {
    this.voucherCode = data?.vouchers[0]?.redemptionCode;
  }
  triggerIterableEvents(param: any) {
    const eventsSharedData = this.getEventsSharedDataInfo();
    if (param === 'supplierfailures') {
      this.googleTagManagerServiceService.pushFlightSoldOutEvent(eventsSharedData);
    } else if (param === 'paymentfailures') {
      this.googleTagManagerServiceService.pushFlight_PaymentFail_OR_SuccessEvent('Flight_PaymentFail', eventsSharedData);
    } else if (param === 'validationfailures') {
      this.googleTagManagerServiceService.pushValidation_RequestEvent(eventsSharedData);
    }else if(param === 'bookingFailed'){
      this.googleTagManagerServiceService.pushFlight_BookingFailEvent(eventsSharedData);
    }
  }
  /**here we are constructing the common data for payment events  */
  getEventsSharedDataInfo(){
    const sharedData = getEventsSharedData();
    const itinResponse = sharedData.itinResponse;
    const flightResultsData = sharedData.flightResultsData;
    const searchInfoData = sharedData.searchInfoData;
     let addMoreData = {
      coupon: this.voucherCode,
      totalAmount : this.bookingSummary?.totalPrice ?? 0,
      paymentGatewayData : this.paymentGatewayObj,
      vatInfo : this.paymentcard?.requireVat ?? false,
      threeDEnabled : Boolean(this.bookingResp.redirectGatewayBookingResponse || this.bookingResp.threeDSecureParameters)
    };
    const additionalDataInfo = {...addMoreData,...sharedData.additionalDataInfo}
      return {itinResponse,flightResultsData,searchInfoData,additionalDataInfo}
  }
}

