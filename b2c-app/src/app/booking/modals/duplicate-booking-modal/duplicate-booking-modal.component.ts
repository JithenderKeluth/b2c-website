import { Component, Input, OnInit, EventEmitter, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '@app/general/services/api/api.service';
import { UniversalStorageService } from '@app/general/services/universal-storage.service';
declare let $: any;
@Component({
  selector: 'app-duplicate-booking-modal',
  templateUrl: './duplicate-booking-modal.component.html',
  styleUrls: ['./duplicate-booking-modal.component.scss'],
})
export class DuplicateBookingModalComponent implements OnInit {
  @Input() duplicateBookingInfo: any = null;
  duplicateBookingpaymentLink: any = null;
  @Output() continuePayment = new EventEmitter<boolean>();
  constructor(private router: Router, private activatedRoute: ActivatedRoute, public apiService: ApiService, private storage: UniversalStorageService) {}
  countryDomain: string = 'ZA';
  ngOnInit(): void {
    this.countryDomain = this.apiService.extractCountryFromDomain();
  }
  /**here we are going to naviage find-itinerary page for pay duplicate booking and taking payment URL from Payment methods API response  */
  payExistingBooking() {
    this.storage.removeItem('paymentMethods');
    this.duplicateBookingpaymentLink = this.duplicateBookingInfo?.PaymentLinkURL;
    // this.duplicateBookingpaymentLink = 'https://beta.travelstart.co.za/find-itinerary?uuid=cfe94159-af85-4a72-9c44-427684712c76&cpysource=tszaweb';
    const paymentLink_Keys: any = {};
    const parsedUrl = new URL(this.duplicateBookingpaymentLink);
    /**here we are store products & queryparams upto traveller page what we have bcoz if user pay for old booking.
     *  In that case  products and queryparams will be update wit deeplinks values so if user come back to traveller page.
     *  again then we can update products& queryparams with old traveller page products & queryparams within the addons-component & booking-view component
     */
    if (this.storage.getItem('products', 'session')) {
      let products = JSON.parse(this.storage.getItem('products', 'session'));
      this.storage.setItem('travellerPageproducts', JSON.stringify(products), 'session');
    }
    let queryparams = this.storage.getItem('queryStringParams', 'session')
      ? JSON.parse(this.storage.getItem('queryStringParams', 'session'))
      : {};
    this.storage.setItem('travellerPagequeryStringParams', JSON.stringify(queryparams), 'session');
    parsedUrl.searchParams.forEach((value, key) => {
      paymentLink_Keys[key] = value;
    });
    let queryparamStrings = { ...paymentLink_Keys };
    this.router.navigate(['/find-itinerary'], {
      queryParams: queryparamStrings,
      relativeTo: this.activatedRoute,
    });
  }
  continueSameBooking() {
    this.continuePayment.emit(true);
  }
  OnDestroy() {
    $('#duplicateBooking').modal('hide');
  }
}
