import { Component, OnInit } from '@angular/core';
import { PaymentService } from './../service/payment.service';
import { UniversalStorageService } from '@app/general/services/universal-storage.service';

@Component({
  selector: 'app-wallet-vouchers',
  templateUrl: './wallet-vouchers.component.html',
  styleUrls: ['./wallet-vouchers.component.scss'],
})
export class WalletVouchersComponent implements OnInit {
  vouchers: any = {}; // Holds parsed voucher data
  selectedVoucher: { voucherId: number; type: string } | null = null; // Tracks the selected voucher
  regionalityType: string = 'INTERNATIONAL'; // Set the type you want to filter by (INTERNATIONAL or DOMESTIC)

  constructor(private paymentService: PaymentService, private storage: UniversalStorageService) {}

  ngOnInit(): void {
    this.getVouchersList();
  }

  getVouchersList() {
    let credentials =
      JSON.parse(this.storage.getItem('credentials', 'local')) || JSON.parse(this.storage.getItem('credentials', 'session'));
    const token = credentials?.data?.token;
    this.paymentService.getWalletVouchersList(token).subscribe((data: any) => {
      // Filter vouchers based on the regionalityType
      this.vouchers.flightVouchers = data.data.wallet.loyaltyVoucherBalances[0].loyaltyFlightVoucherBalance.loyaltyVoucherList.filter(
        (v: any) => v.regionalityType === this.regionalityType
      );

      // Preselect the first voucher
      if (this.vouchers.flightVouchers.length > 0) {
        this.selectedVoucher = {
          voucherId: this.vouchers.flightVouchers[0].voucherId,
          type: 'Flight',
        };

        // Validate the preselected voucher
        this.validateVoucher(this.selectedVoucher.voucherId);
      }
    });
  }

  // Handle voucher selection and deselection
  onVoucherSelected(voucherId: number) {
    if (this.selectedVoucher && this.selectedVoucher.voucherId === voucherId) {
      // Deselect the voucher if it's already selected
      this.selectedVoucher = null;
    } else {
      // Select a new voucher and validate it
      this.selectedVoucher = { voucherId, type: 'Flight' };
      this.validateVoucher(voucherId);
    }

    console.log('Selected Voucher:', this.selectedVoucher);
  }

  // Method to validate the voucher via REST API
  validateVoucher(voucherId: number) {
    console.log('selected Voucher:', voucherId);

    // this.paymentService.validateWalletVoucher().subscribe((data)=>{

    // })
    // // Replace with your actual API endpoint and method
    // const apiUrl = `https://yourapi.com/voucher/validate/${voucherId}`;

    // this.http.get(apiUrl).subscribe(
    //   (response) => {
    //     console.log('Voucher validated successfully:', response);
    //     // Handle success response here
    //   },
    //   (error) => {
    //     console.error('Error validating voucher:', error);
    //     // Handle error case
    //   }
    // );
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
}
