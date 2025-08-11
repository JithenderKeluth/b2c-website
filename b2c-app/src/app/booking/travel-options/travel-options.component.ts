import { Component, Input, OnInit, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { updateProducts } from '../utils/products.utils';
import { BookingService } from './../services/booking.service';
import { Subscription } from 'rxjs';
import { UniversalStorageService } from '@app/general/services/universal-storage.service';

@Component({
  selector: 'app-travel-options',
  templateUrl: './travel-options.component.html',
  styleUrls: ['./travel-options.component.scss'],
})
export class TravelOptionsComponent implements OnInit, OnChanges, OnDestroy {
  selectedCategory: string;
  flexiProduct: any;
  @Input() showOptMessage: boolean = false;
  isFromMetaSource: boolean = false;
  checkboxValue: boolean = false;
  @Input() travelOptions: any;
  private productSubscription: Subscription;

  constructor(private bookingService: BookingService, private storage: UniversalStorageService) {}

  ngOnInit(): void {
    this.setTravelOptionsCategory();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes?.travelOptions?.currentValue) {
      this.travelOptions = changes?.travelOptions?.currentValue;
      this.flexiProduct = this.travelOptions.flexiProduct;
      this.isFromMetaSource = this.travelOptions.isMetaCpy_Source;
      this.selectedCategory = this.travelOptions.selectedTravelOptionsCategory;
    }
    if (changes?.showOptMessage?.currentValue) {
      this.showOptMessage = changes?.showOptMessage?.currentValue;
    }
  }

  ngOnDestroy(): void {
    if (this.productSubscription) {
      this.productSubscription.unsubscribe();
    }
  }

  setTravelOptionsCategory() {
    this.productSubscription = this.bookingService.currentProducts.subscribe((prods: any) => {
      if (prods && prods.length > 0) {
        prods.forEach((x: any) => {
          if (x.id === 'CNG_AST') {
            this.flexiProduct = x;
            if (x.initSelected) {
              this.selectedCategory = 'flexi';
              this.checkboxValue = false;
            } else if (!x.initSelected) {
              this.selectedCategory = 'basic';
            }
          }
        });
      }
    });
  }

  selectCategory(): void {
    this.selectedCategory = this.selectedCategory === 'flexi' ? 'basic' : 'flexi';
    this.updatedProducts();
  }

  updatedProducts() {
    this.selectedCategory === 'flexi' ? updateProducts('CNG_AST', true) : updateProducts('CNG_AST', false);
    this.bookingService.changeProducts(JSON.parse(this.storage.getItem('products', 'session')));
    if (this.selectedCategory === 'flexi') {
      this.checkboxValue = false;
    }
    this.updateSession();
  }

  onCheckboxChange(event: any): void {
    this.checkboxValue = event.target.checked;
    this.selectedCategory = this.checkboxValue ? 'basic' : '';
    this.updatedProducts();
    this.updateSession();
  }

  updateSession() {
    let travelOptionsOpt = JSON.parse(this.storage.getItem('travelOptionsOpt', 'session'));
    if (travelOptionsOpt) {
      travelOptionsOpt.selectedTravelOptionsCategory = this.selectedCategory;
    }
    this.storage.setItem('travelOptionsOpt', JSON.stringify(travelOptionsOpt), 'session');
  }
}
