import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { UniversalStorageService } from '@app/general/services/universal-storage.service';
import { isPlatformBrowser } from '@angular/common';
declare const $: any;

@Component({
  selector: 'app-ts-plus-booking-confirmation',
  templateUrl: './ts-plus-booking-confirmation.component.html',
  styleUrls: ['./ts-plus-booking-confirmation.component.scss'],
})
export class TsPlusBookingConfirmationComponent implements OnInit {
  isBrowser: boolean;
  constructor(private storage: UniversalStorageService, @Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }
  ngOnInit(): void {
    if(this.isBrowser){
      if (!this.storage.getItem('openedModal', 'session')) {
        $('#success_modal').modal('show');
      }
      this.storage.setItem('openedModal', JSON.stringify(true), 'session');
      setTimeout(() => {
        $('#success_modal').modal('hide');
      }, 3000);
      this.storage.removeItem('tsSubscriptionType');
    }
  }
}
