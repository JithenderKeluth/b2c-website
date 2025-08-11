import { Component, OnInit } from '@angular/core';
import { stayDaysCount } from '../../general/utils/my-account.utils';
import { MyAccountServiceService } from '../my-account-service.service';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { UniversalStorageService } from '@app/general/services/universal-storage.service';

declare let $: any;
@Component({
  selector: 'app-view-hotel-booking-details',
  templateUrl: './view-hotel-booking-details.component.html',
  styleUrls: ['./view-hotel-booking-details.component.scss'],
})
export class ViewHotelBookingDetailsComponent implements OnInit {
  constructor(private myAccountService: MyAccountServiceService, private _snackBar: MatSnackBar, private storage: UniversalStorageService) {}
  hotelInfo: any = null;
  paxInfo: any = null;
  currencycode: any = null;
  loading: boolean = false;
  ngOnInit(): void {
    if (this.storage.getItem('selectedHotelInfo', 'session')) {
      this.hotelInfo = JSON.parse(this.storage.getItem('selectedHotelInfo', 'session'));
      this.getPaxCount();
      console.log(this.hotelInfo);
    }
    this.currencycode = this.storage.getItem('currencycode', 'session');
  }
  getPaxCount() {
    this.paxInfo = null;
    if (this.hotelInfo?.bookedRooms?.length) {
      let paxInfo = {
        adults: 0,
        child: 0,
      };
      this.hotelInfo.bookedRooms.forEach((x: any) => {
        paxInfo.adults += x.adults;
        paxInfo.child += x.childAges.length > 0 ? x.childAges.length : 0;
      });
      this.paxInfo = paxInfo;
    }
  }
  /**to get number of days to stay */
  getStayNightsCount(fromDate: any, toDate: any) {
    return stayDaysCount(fromDate, toDate);
  }
  getTotalAmount() {
    let totalAmount = this.hotelInfo.total - this.hotelInfo.voucherAmount;
    return totalAmount > 0 ? totalAmount : 0;
  }
  cancelBooking() {
    $('#cancelBooking_Modal').modal('show');
  }
  confirmCancelBooking() {
    let reqPayload = {
      bookingId: this.hotelInfo.bookingId,
      bookingReference: this.hotelInfo.bookingReference,
    };
    this.loading = true;
    this.myAccountService.cancelHotelBooking(reqPayload, this.hotelInfo?.jwtToken).subscribe(
      (res: any) => {
        this.loading = false;
        if (res.status != 'Failed') {
          this._snackBar.open('Booking Cancelled Successfully', '');
        } else if (res?.errors.length > 0) {
          this._snackBar.open(res?.errors[0], '');
        } else {
          this._snackBar.open('Something went wrong please try again.', '');
        }
        $('#cancelBooking_Modal').modal('hide');
        setTimeout(() => {
          this._snackBar.dismiss();
        }, 5000);
      },
      (error) => {
        this.loading = false;
        this._snackBar.open('Something went wrong please try again.', '');
        $('#cancelBooking_Modal').modal('hide');
        setTimeout(() => {
          this._snackBar.dismiss();
        }, 5000);
      }
    );
  }
  ngOnDestroy() {
    $('#cancelBooking_Modal').modal('hide');
  }
}
