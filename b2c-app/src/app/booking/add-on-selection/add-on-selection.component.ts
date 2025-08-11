import { Component, OnInit, Input, EventEmitter, ChangeDetectorRef, Output } from '@angular/core';
import { responsiveService } from '@app/_core';
import { BookingService } from './../services/booking.service';
import { productId } from '../../general/utils/products-list';
import { updateProducts } from '../utils/products.utils';
import { IframeWidgetService } from '@app/general/services/iframe-widget.service';
import { AffiliateService } from '@app/general/services/affiliate.service';
import { UniversalStorageService } from '@app/general/services/universal-storage.service';
import { ApiService } from '../../general/services/api/api.service';

@Component({
  selector: 'app-add-on-selection',
  templateUrl: './add-on-selection.component.html',
  styleUrls: ['./add-on-selection.component.scss'],
})
export class AddOnSelectionComponent implements OnInit {
  @Input() pricedResult_data: any;
  @Input() isAddOns_Expanded: any;
  @Output() selectAlert: EventEmitter<any> = new EventEmitter<any>();
  products: {};
  otherAddons: any;
  public Add_ons1: any = [];
  public showAdd_ons: any = [];
  load: boolean = false;
  sendArr: any;
  flights_search_info: any;
  traveller_page_sms: boolean = false;
  country: string;

  constructor(
    private bookingService: BookingService,
    private cd: ChangeDetectorRef,
    private responsiveservice: responsiveService,
    private iframeWidgetService: IframeWidgetService,
    private affiliateService: AffiliateService,
    apiService: ApiService,
    private storage: UniversalStorageService
  ) {
    this.country = apiService.extractCountryFromDomain();
  }

  ngOnInit(): void {
    this.flights_search_info = JSON.parse(this.storage.getItem('flightsearchInfo', 'session'));
    if (this.storage.getItem('travellerPageproducts', 'session')) {
      let products = JSON.parse(this.storage.getItem('travellerPageproducts', 'session'));
      this.sendArr = products;
      this.storage.setItem('products', JSON.stringify(products), 'session');
    }else if (this.storage.getItem('products', 'session')) {
      this.sendArr = JSON.parse(this.storage.getItem('products', 'session'));
    } else {
      this.sendArr = this.pricedResult_data.products;
    }

    this.bookingService.currentSMSInfo.subscribe((val: boolean) => {
      this.traveller_page_sms = val;
    });

    // this.bookingService.currentProducts.subscribe((prods: any) => {
    //   if (sessionStorage.getItem('products')) {
    //     this.sendArr = JSON.parse(sessionStorage.getItem('products'));
    //     this.showAddonsVal(this.sendArr);
    //   }
    // });

    this.showAddonsVal(this.sendArr);
    this.sort_Add_Ons();
    this.load = true;
  }
  showAddonsVal(data: any) {
    if (data) {
      this.otherAddons = data.filter(
        (a: any) =>
          (a.id == 'SMS' && a.initSelected && !this.traveller_page_sms) ||
          a.id == 'MEALS' ||
          a.id == 'WHATSAPP' ||
          (a.id === 'CNG_AST' &&
            a.initSelected &&
            this.isAddOns_Expanded &&
            !this.iframeWidgetService.isB2BApp() &&
            this.affiliateService.performMetaCpySourceCheck()) ||
          a.id == null
      );
      this.Add_ons1 = data.filter((item: any) => !this.otherAddons.includes(item));
      this.showAdd_ons = this.Add_ons1;
      this.cd.detectChanges();
    }
  }

  onChangeproduct(productId: any, idx: number, param: any) {
    let selected = param;
    if (this.showAdd_ons.length > 0 && this.showAdd_ons[idx].id === productId) {
      this.showAdd_ons[idx].initSelected = param;
    }
    updateProducts(productId, selected);
    this.bookingService.changeProducts(JSON.parse(this.storage.getItem('products', 'session')));
  }
  public sort_Add_Ons() {
    this.showAdd_ons = this.showAdd_ons.sort((a: any, b: any) => b.initSelected - a.initSelected);
  }
  addonsProductDesc(desc: any) {
    if (
      this.country !== 'ABSA' &&
      this.country !== 'SB' &&
      desc.length > 90 &&
      (this.responsiveservice.screenWidth == 'sm' || this.responsiveservice.screenWidth == 'md')
    ) {
      return desc.slice(0, 90).concat('...');
    } else {
      return desc;
    }
  }

  loadProdId(prodId: any) {
    return productId.includes(prodId)
      ? `https://cdn1.travelstart.com/assets/icons/product_Icons/${prodId}.svg`
      : `https://cdn1.travelstart.com/assets/icons/default_prod_icn.svg`;
  }
}
