import { Component, OnInit } from '@angular/core';
import { PaymentService } from '@app/payment/service/payment.service';
import { UniversalStorageService } from '@app/general/services/universal-storage.service';

@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.scss'],
})
export class WalletComponent implements OnInit {
  vouchers: any = {};
  walletVouchers: any;
  walletAmount : number = 0;
  currency :any = null;
  constructor(private paymentService: PaymentService, private storage: UniversalStorageService) {}

  ngOnInit(): void {
    this.currency = this.storage.getItem('currencycode', 'session');
    this.getVouchersList();
  }

  getVouchersList() {
    let credentials =
      JSON.parse(this.storage.getItem('credentials', 'local')) || JSON.parse(this.storage.getItem('credentials', 'session'));
    const token = credentials?.data?.token;
    this.paymentService.getWalletVouchersList(token).subscribe(
      (data: any) => {
        this.walletVouchers = data?.data?.wallet;
        this.walletAmount = this.walletVouchers?.loyaltyVoucherBalances[0]?.totalVoucherBalance || 0;
        this.vouchers.flightVouchers =
        this.walletVouchers?.loyaltyVoucherBalances[0]?.loyaltyFlightVoucherBalance?.loyaltyVoucherList || [];
        this.vouchers.hotelVouchers =
        this.walletVouchers?.loyaltyVoucherBalances[0]?.loyaltyHotelVoucherBalance?.loyaltyVoucherList || [];
      },
      (error: any) => {
        if (credentials?.data?.subscriptionResponse?.wallet) {
          this.walletVouchers = credentials?.data?.subscriptionResponse?.wallet;
          const loyaltyBalances = this.walletVouchers.loyaltyVoucherBalances?.[0];
          this.walletAmount = loyaltyBalances?.totalVoucherBalance || 0;
          this.vouchers.flightVouchers = loyaltyBalances?.loyaltyFlightVoucherBalance?.loyaltyVoucherList || [];
          this.vouchers.hotelVouchers = loyaltyBalances?.loyaltyHotelVoucherBalance?.loyaltyVoucherList || [];
        }
      }
    );
  }
  /**here to check voucher validityDate with current date to get voucher is available or expired */
  checkVoucherExpiry(voucherValidity:any){
    let todayDate = new Date();
    if(new Date(voucherValidity) >= todayDate){
      return voucherValidity;
    }else{
      return 'Expired'
    }
  }
}
