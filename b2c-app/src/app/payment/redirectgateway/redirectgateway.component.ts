import { Component, OnInit, Inject, PLATFORM_ID, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { PaymentService } from '../service/payment.service';
import { AppSessionService } from '@app/_shared/session/app-session.service';
import { GoogleTagManagerServiceService } from '@app/_core/tracking/services/google-tag-manager-service.service';
import { ErrorMappingServiceService } from '@core/services/error-mapping-service.service';
import { UniversalStorageService } from '@app/general/services/universal-storage.service';
import { ApiService } from '../../general/services/api/api.service';
import { getEventsSharedData } from '../utils/payment-utils';
declare const $: any;

@Component({
  selector: 'app-redirectgateway',
  templateUrl: './redirectgateway.component.html',
  styleUrls: ['./redirectgateway.component.scss'],
})
export class RedirectgatewayComponent implements OnInit, OnDestroy {
  country: string;
  bookApiPayload: any;
  redirectGatewayAuth: any = null;
  isLoading = true;
  currentLocation: any;
  errorMsg: boolean = false;
  hostName: string = '';
  BookApiError: any = null;
  bookingResp: any = null;
  private isBrowser: boolean;

  constructor(
    private route: ActivatedRoute,
    private paymentService: PaymentService,
    public apiSessionService: AppSessionService,
    private googleTagManagerService: GoogleTagManagerServiceService,
    private errorMappingServiceService: ErrorMappingServiceService,
    private storage: UniversalStorageService,
    public apiService: ApiService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.country = apiService.extractCountryFromDomain();
  }

  ngOnInit(): void {
    if (!this.isBrowser) return;

    this.hostName = window.location.hostname.replace('www.', '');
    this.currentLocation = window.location.href;
    this.isRedirected();

    if (window.parent !== window && window.parent.postMessage) {
      window.parent.postMessage({ type: 'CLOSE_TIMEOUT_MODAL' }, '*');
    }

    if (this.bookpayload) {
      this.bookApiPayload = JSON.parse(this.bookpayload);
    }
    this.bookingResp = JSON.parse(this.storage.getItem('bookingDetails', 'session'));

    if (!this.storage.getItem('redirectGatewayLoaded', 'session')) {
      setTimeout(() => {
        this.storage.setItem('redirectGatewayLoaded', 'loaded', 'session');
        this.proceedPayment();
      }, 5000);
    } else {
      this.storage.setItem('redirectGatewayLoaded', 'loaded', 'session');
      this.triggerModal('payment_failed_Modal');
    }
  }

  proceedPayment() {
    delete this.bookApiPayload['paymentReturnURL'];
    this.bookApiPayload.gatewayPostResponseParameters = this.redirectGatewayAuth
      ? JSON.parse(this.redirectGatewayAuth)
      : null;

    let redirectGateAuth: any = null;
    if (this.bookApiPayload.selectedPaymentMethod.paymentOptionName === 'MOBICRED') {
      redirectGateAuth = this.currentLocation?.split('redirectGatewayAuth=')[1] || null;
      delete this.bookApiPayload['billingDetails'];
      delete this.bookApiPayload['ignoreDuplicateBookings'];
      delete this.bookApiPayload['selectedPaymentMethod'];
      delete this.bookApiPayload['voucherData'];
      delete this.bookApiPayload['paymentData'];
    }

    this.paymentService.GatewayPaymentBookFlight(this.bookApiPayload, redirectGateAuth).subscribe(
      (data: any) => {
        this.storage.setItem('redirectGateWayResponse', JSON.stringify(data), 'session');
        if (data.bookingInformation || (data.transactionID && data.granted)) {
          this.storage.setItem('bookingDetails', JSON.stringify(data), 'session');
          this.sendRedirectMessage('/payments/bookingConfirm');
        } else if (data.errors) {
          this.isError(data.errors);
        }
      },
      (error) => {
        if (error?.error) this.isError(error.error);
      }
    );
  }

  isRedirected() {
    if (this.currentLocation.includes('redirectgateway?redirectGatewayAuth')) {
      this.route.queryParams.subscribe((param) => {
        this.redirectGatewayAuth = param.redirectGatewayAuth;
      });

      if (
        this.redirectGatewayAuth &&
        /(cancel=true|Status=Cancelled|Status=Error|Status=Abandoned)/.test(this.currentLocation)
      ) {
        this.isError('');
      }
    }
  }

  isError(errors: any) {
    const { category, action, message } = this.errorMappingServiceService.mapError(errors);
    this.BookApiError = { category, action, description: message };

    this.triggerIterableEvents(this.BookApiError);

    const paymentMethod = this.bookApiPayload?.selectedPaymentMethod?.paymentOptionName;
    const bookingInfo = JSON.parse(this.storage?.getItem('bookingDetails', 'session') || '{}')?.bookingInformation;

    if (
      this.BookApiError?.category === 'paymentfailures' &&
      paymentMethod !== 'CC' &&
      paymentMethod !== 'CC_3D' &&
      paymentMethod !== 'DC_3D' &&
      paymentMethod !== 'CC_3D_INS' &&
      paymentMethod !== 'CC_INS' &&
      bookingInfo
    ) {
      this.sendRedirectMessage('/payments/bookingConfirm');
    } else {
      this.triggerModal('payment_failed_Modal');
    }
  }

  triggerModal(id: string) {
    if (!this.isBrowser) return;

    setTimeout(() => {
      const modalEl = document.getElementById(id);
      if (modalEl) {
        requestAnimationFrame(() => {
          $(modalEl).modal('show');
        });
      }
    }, 500);
  }


  sendRedirectMessage(path: string) {
    if (this.isBrowser && window.parent !== window) {
      window.parent.postMessage({ type: 'REDIRECT_PARENT', path }, '*');
    } else {
      window.location.pathname = path;
    }
  }

  dismissModal() {
    this.sendRedirectMessage('/payments');
  }

  navigateToPaymentpage() {
    const booking = JSON.parse(this.storage.getItem('bookingDetails', 'session') || '{}');
    if (booking?.bookingInformation) {
      this.sendRedirectMessage('/payments/bookingConfirm');
    } else {
      this.sendRedirectMessage('/payments');
    }
  }

  flight_results() {
    this.sendRedirectMessage('/flights/results');
  }

  ngOnDestroy() {
    if (this.isBrowser) $('#payment_failed_Modal').modal('hide');
  }

  get bookpayload() {
    return this.storage.getItem('bookAPIRequestData', 'session');
  }

  triggerIterableEvents(param: any) {
      const eventsSharedData = this.getEventsSharedDataInfo();
      if (param === 'supplierfailures') {
        this.googleTagManagerService.pushFlightSoldOutEvent(eventsSharedData);
      } else if (param === 'paymentfailures') {
        this.googleTagManagerService.pushFlight_PaymentFail_OR_SuccessEvent('Flight_PaymentFail', eventsSharedData,this.bookingResp);
      } else if (param === 'validationfailures') {
        this.googleTagManagerService.pushValidation_RequestEvent(eventsSharedData);
      }else if(param === 'bookingFailed'){
        this.googleTagManagerService.pushFlight_BookingFailEvent(eventsSharedData,this.bookingResp);
      }
    }
    /**here we are constructing the common data for payment events  */
    getEventsSharedDataInfo(){
    const sharedData:any = getEventsSharedData();
    const itinResponse = sharedData.itinResponse;
    const flightResultsData = sharedData.flightResultsData;
    const searchInfoData = sharedData.searchInfoData;
      let addMoreData = {
      vatInfo :  false,
      threeDEnabled : true
    };
    const additionalDataInfo = {...addMoreData,...sharedData.additionalDataInfo}
      return {itinResponse,flightResultsData,searchInfoData,additionalDataInfo}
  }
}
