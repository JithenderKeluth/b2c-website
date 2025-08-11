
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UntypedFormControl, Validators } from '@angular/forms';
import { BookingService } from '../services/booking.service';
import { GoogleTagManagerServiceService } from './../../_core/tracking/services/google-tag-manager-service.service';
import { voucherInfo, contactData } from './../models/vocuher-info';
import { PaymentService } from './../../payment/service/payment.service';
import { ApiService } from '@app/general/services/api/api.service';
import { SessionService } from '../../general/services/session.service';
import {  Subscription } from 'rxjs';
import { UniversalStorageService } from '../../general/services/universal-storage.service';
@Component({
  selector: 'app-coupons-info',
  templateUrl: './coupons-info.component.html',
  styleUrls: ['./coupons-info.component.scss'],
})
export class CouponsInfoComponent implements OnInit {
  vouchers: any = {}; // Holds parsed voucher data
  selectedVoucher: { voucherId: number; voucherCode: string; type: string } | null = null; // Tracks the selected voucher
  regionalityType: string = 'INTERNATIONAL'; // Set the type you want to filter by (INTERNATIONAL or DOMESTIC)
  walletId: string;
  currency: string;

  voucherCode = new UntypedFormControl('', [Validators.required]);
  paymentInfo: any;
  credentials: any;
  voucherResponse: any;
  invalidVoucher = false;
  invalidVoucherCode = true;
  voucherAmount: any;
  voucherAmountData: any;
  totalAmount: number;
  submitVoucherCode = false;
  voucherCodeApplied = false;
  sessionSubscription : Subscription;
  bookingAmountValue : number = 0;
  bookingSummaryAmt: number;
  processingFee: number;
  @Input() set bookingAmount(amount: number) {
      this.bookingAmountValue = 0;
      if (amount || amount == 0) {
        this.bookingAmountValue = amount;
      }
    }

  country: string;
  @Output() voucherCodeInfo: EventEmitter<any> = new EventEmitter();
  constructor(
    private bookingService: BookingService,
    private googleTagManagerServiceService: GoogleTagManagerServiceService,
    private paymentService: PaymentService,
    public apiService: ApiService,
    private sessionService :SessionService,
    private storage: UniversalStorageService
  ) {
    this.country = apiService.extractCountryFromDomain();
  }

  ngOnInit(): void {
    this.getUserCredentials();
    this.regionalityType = JSON.parse(this.storage.getItem('flightResults', 'session'))?.isIntl ? 'INTERNATIONAL' : 'DOMESTIC';
    this.currency = this.storage.getItem('currencycode', 'session') || 'ZAR';
    this.bookingService.currentTotalAmount.subscribe((value: number) => {
      this.totalAmount = value;
    });
    this.sessionSubscription = this.sessionService.userLoggedInfo.subscribe((data:any)=>{
      this.getUserCredentials();
    });

    if (this.storage.getItem('bookingSummaryAmt', 'session')) {
      this.bookingSummaryAmt = JSON.parse(this.storage.getItem('bookingSummaryAmt', 'session') ?? '');
    }

    this.paymentService.currentProcessingfee.subscribe((data) => {
      if (data) {
        this.processingFee = data?.processingFee ?? 0;
      }
    });
  }

  getUserCredentials() {
    this.credentials = null;
    this.credentials = this.sessionService.getUserCredentials();
    if (this.credentials?.data.isTSPlusSubscriptionActive) {
      const centralInfo = JSON.parse(this.storage.getItem('appCentralizedInfo', 'session'));
      const showWalletInfo = centralInfo?.wallet[this.apiService.extractCountryFromDomain()]?.enable_wallet;
      if (showWalletInfo) {
        this.getVouchersList();
      }
    }else{
      this.vouchers = {};
      this.clearVoucherCode();
    }
  }
  clearVoucherCode() {
    this.voucherCode.reset();
    this.voucherCodeApplied = false;
    this.submitVoucherCode = false;
    this.bookingService.changeVoucherData(0);
    this.bookingService.changeVoucheramount(0);
    this.storage.removeItem('voucherAmount');
    this.selectedVoucher = null;
    this.invalidVoucher = false;
    this.bookingService.changeVoucherInfo(null);
  }

  getVoucherCurrencyCode(value: any) {
    switch (value) {
      case 'ZAR': {
        return 'R';
      }
      case 'NAD': {
        return 'N$';
      }
      case 'NGN': {
        return ' ₦';
      }
      case 'AED': {
        return 'Dhs';
      }
      case 'EGP': {
        return 'E£';
      }
      case 'KES': {
        return 'KSh';
      }
      case 'TZS': {
        return 'TSh';
      }
      case 'BWP': {
        return 'P';
      }
      case 'MAD': {
        return 'dh';
      }
      case 'KWD': {
        return 'KD';
      }
      case 'SAR': {
        return 'SR';
      }
      case 'BHD': {
        return 'BD';
      }
      case 'OMR': {
        return 'bz';
      }
      case 'QAR': {
        return 'QR';
      }
      case 'TRY': {
        return '₺';
      }
      default: {
        return value;
      }
    }
  }

  voucherChange() {
    this.invalidVoucherCode = false;
    this.invalidVoucher = false;
    this.voucherCodeApplied = false;
  }

  applyVoucherCode() {
    this.submitVoucherCode = true;
    if (this.voucherCode.invalid) {
      this.handleInvalidVoucher();
      return;
    } else {
      const voucherData = this.buildVoucherData();

      this.bookingService.validateVoucherCode(voucherData).subscribe(
        (res) => {
          this.handleVoucherValidationResponse(res);
        },
        (error) => {
          this.handleVoucherValidationError(error);
        }
      );
    }
  }

  handleInvalidVoucher() {
    this.invalidVoucher = false;
  }

  buildVoucherData() {
    const contactInfo = JSON.parse(this.storage.getItem('contactInfo', 'session'));
    const priceInfo = JSON.parse(this.storage.getItem('priceData', 'session'));
    const voucherData = new voucherInfo();
    voucherData.code = this.voucherCode.value;
    voucherData.email = contactInfo.email;
    voucherData.mobileNo = contactInfo.phone;
    voucherData.contactDetails = new contactData();
    voucherData.contactDetails.mobileCode = '91';
    voucherData.data = priceInfo.data;

    if (this.credentials) {
      voucherData.businessLoggedOnToken = this.credentials.data.token;
    } else {
      voucherData.businessLoggedOnToken = null;
    }

    return voucherData;
  }

  handleVoucherValidationResponse(res: any) {
    this.voucherResponse = res;
    if (this.voucherResponse.voucherValid) {
      this.handleValidVoucher();
      this.voucherCodeInfo.emit(res);
    } else {
      this.handleInvalidVoucherCode();
    }
  }

  handleValidVoucher() {
    this.voucherCodeApplied = true;
    this.invalidVoucher = false;
    this.voucherResponse.vouchers.forEach((x: any) => {
      this.voucherAmount = x.amount;
      this.voucherAmountData = `${this.getVoucherCurrencyCode(x.currencyCode)}${x.amount}`;
      this.invalidVoucherCode = false;
    });

    this.updateSessionStorageAndService();
  }

  handleInvalidVoucherCode() {
    this.bookingService.changeVoucheramount(0);
    this.invalidVoucher = true;
    this.submitVoucherCode = false;
    this.voucherCodeApplied = false;
    this.storage.removeItem('voucherAmount');
    this.bookingService.changeVoucherInfo(null);
  }

  handleVoucherValidationError(error: any) {
    if (error?.error) {
      this.invalidVoucher = true;
      this.submitVoucherCode = false;
    }
  }

  updateSessionStorageAndService() {
    this.storage.removeItem('voucherAmount');
    this.storage.setItem('voucherAmount', JSON.stringify(this.voucherAmountData), 'session');
    this.bookingService.changeVoucheramount(this.voucherAmount);
    this.bookingService.changeVoucherInfo(this.voucherResponse['data']);
    this.googleTagManagerServiceService.pushVoucherData(this.totalAmount, this.voucherCode.value, this.voucherAmount);
  }

  getVouchersList() {
    const token = this.credentials?.data?.token;
    this.paymentService.getWalletVouchersList(token).subscribe((data: any) => {
      /**here Filter vouchers based on the regionalityType */
      let reginalityVouchers: any = [];
      let nonReginalityVouchers: any = [];
      if (data?.data?.wallet?.loyaltyVoucherBalances[0]?.loyaltyFlightVoucherBalance?.loyaltyVoucherList.length > 0) {
        reginalityVouchers = data?.data?.wallet?.loyaltyVoucherBalances[0]?.loyaltyFlightVoucherBalance?.loyaltyVoucherList?.filter(
          (v: any) => v.regionalityType === this.regionalityType
        );
        /**here we are extract non-reginality(refund or concellation) vouchers */
        nonReginalityVouchers = data?.data?.wallet?.loyaltyVoucherBalances[0]?.loyaltyFlightVoucherBalance?.loyaltyVoucherList?.filter(
          (v: any) => v.regionalityType === null
        );
      }

      /**here remove same amount vouchers if have same amount for diiferent vouchers we are consider one voucher  only*/
      if (reginalityVouchers?.length > 0) {
        reginalityVouchers = Array.from(
          reginalityVouchers.reduce((m: any, t: any) => m.set(t.amount, t), new Map()).values()
        );
      }

      this.vouchers.flightVouchers = [...reginalityVouchers, ...nonReginalityVouchers];
      this.walletId = data.data?.wallet?.walletId;
      // we have only one voucher Preselect the the voucher
      if (this.vouchers.flightVouchers.length == 1) {
        this.walletId = data.data?.wallet?.walletId;
        this.selectedVoucher = {
          voucherId: this.vouchers.flightVouchers[0].voucherId,
          voucherCode: this.vouchers.flightVouchers[0].voucherCode,
          type: 'Flight',
        };

        // Validate the preselected voucher
        this.validateVoucher(this.selectedVoucher.voucherId, this.selectedVoucher.voucherCode);
      }
    });
  }

  updateBkgInfoWithWalletData(): void {
    const bookingInfo = this.storage.getItem('bookingInfo', 'session');
    if (bookingInfo) {
      const parsedBookingInfo = JSON.parse(bookingInfo);
      parsedBookingInfo.WalletData = {
        walletId: this.walletId || null,
        token: this.credentials?.data?.token || null,
      };
      this.storage.setItem('bookingInfo', JSON.stringify(parsedBookingInfo), 'session');
    } else {
      console.warn('No booking information found in session storage.');
    }
  }

  // Handle voucher selection and deselection
  onVoucherSelected(voucherId: number, voucherCode: string) {
    if (this.selectedVoucher && this.selectedVoucher.voucherId === voucherId) {
      // Deselect the voucher if it's already selected
      this.selectedVoucher = null;
      // this.validateVoucher(0, '');
      this.handleInvalidVoucherCode();
      this.voucherResponse = null;
    } else {
      // Select a new voucher and validate it
      this.selectedVoucher = { voucherId, voucherCode, type: 'Flight' };
      this.validateVoucher(voucherId, voucherCode);
    }
  }

  // Method to validate the voucher via REST API
  validateVoucher(voucherId: number, voucherCode: string) {
    const contactInfo = JSON.parse(this.storage.getItem('contactInfo', 'session'));
    const priceInfo = JSON.parse(this.storage.getItem('priceData', 'session'));
    const paymentInfo = JSON.parse(this.storage.getItem('paymentMethods', 'session'));

    const reqPayLoad = {
      data: priceInfo.data,
      paymentdata: paymentInfo.data,
      code: voucherCode,
      walletId: this.walletId,
      currency: this.currency,
      market: this.apiService.extractCountryFromDomain(),
      contactDetails: contactInfo,
    };

    this.paymentService.validateWalletVoucher(reqPayLoad).subscribe(
      (res) => {
        this.handleVoucherValidationResponse(res);
        this.updateBkgInfoWithWalletData();
      },
      (error) => {
        this.handleVoucherValidationError(error);
      }
    );
  }

  // Calculate savings based on the selected voucher
  calculateSavings(): number {
    let savings = 0;
    if (this.selectedVoucher && this.selectedVoucher.type === 'Flight') {
      const flightVoucher = this.vouchers.flightVouchers.find(
        (v: any) => v.voucherId === this.selectedVoucher.voucherId
      );
      if (flightVoucher) {
        savings += flightVoucher.amount;
      }
    }
    return savings;
  }
  ngOnDestroy(){
    this.sessionSubscription.unsubscribe();
  }
}
