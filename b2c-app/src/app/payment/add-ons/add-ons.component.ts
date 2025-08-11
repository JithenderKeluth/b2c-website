import { Component, OnInit } from '@angular/core';
import { BookingService } from '@app/booking/services/booking.service';
import { updateProducts } from '@app/booking/utils/products.utils';
import { UniversalStorageService } from '@app/general/services/universal-storage.service';

@Component({
  selector: 'app-add-ons',
  templateUrl: './add-ons.component.html',
  styleUrls: ['./add-ons.component.scss'],
})
export class AddOnsComponent implements OnInit {
  panelOpenState = false;
  bookingInfo: any;
  selectedProductsArray: any[] = [];
  constructor(private bookingService: BookingService, private storage: UniversalStorageService) {}

  ngOnInit(): void {
    if (this.storage.getItem('paymentDeeplinkData', 'session')) {
      this.bookingInfo = JSON.parse(this.storage.getItem('paymentDeeplinkData', 'session'));
      if (this.storage.getItem('products', 'session')) {
        this.bookingInfo.products = JSON.parse(this.storage.getItem('products', 'session'));
      }
    }
  }

  selectProducts(event: any, product: any) {
    let selected = event.target.checked;
    updateProducts(product.id,selected);
    this.bookingService.changeProducts(JSON.parse(this.storage.getItem('products', 'session')));
    this.bookingService.changeDeeplinkProductsData(JSON.parse(this.storage.getItem('products', 'session')));
  }
  getListTitle(productId: string) {
    switch (productId) {
      case 'LIQ_POL': {
        return 'Additional services';
      }
      case 'CNC_RFD': {
        return 'Prepare for the unexpected';
      }
      case 'TVL_INI_GUA060': {
        return 'Travel protection';
      }
    }
  }
  getIcons(productId: string) {
    switch (productId) {
      case 'LIQ_POL': {
        return 'additinal-ser';
      }
      case 'CNC_RFD': {
        return 'unexpected';
      }
      case 'TVL_INI_GUA060': {
        return 'travel-protection';
      }
      default: {
        return 'unexpected';
      }
    }
  }
}
