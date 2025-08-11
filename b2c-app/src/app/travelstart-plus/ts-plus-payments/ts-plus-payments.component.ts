import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { PeachPaymentsService } from '../service/peach-payments.service';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from '@app/general/services/api/api.service';
import { UniversalStorageService } from '@app/general/services/universal-storage.service';
import { isPlatformBrowser } from '@angular/common';
@Component({
  selector: 'app-ts-plus-payments',
  templateUrl: './ts-plus-payments.component.html',
  styleUrls: ['./ts-plus-payments.component.scss'],
})
export class TsPlusPaymentsComponent implements OnInit {
  checkoutId: string;
  shopperResultUrl = 'ts-plus/Processing-Subscription';
  public nextYearDate: Date;
  public currency: string = 'ZAR';
  public amount: number = 2340;
  public credentials: any;
  public email: string;
  isLoading: boolean = false;
  isRenew: boolean = false;
  isBrowser: boolean;

  constructor(
    private paymentService: PeachPaymentsService,
    private _snackBar: MatSnackBar,
    private router: Router,
    public apiService: ApiService,
    private route: ActivatedRoute,
    private storage: UniversalStorageService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    const today = new Date();
    this.nextYearDate = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());
    this.amount = this.apiService?.getEnvironment() !== 'live' ? 1 : 2340;
    this.isBrowser = isPlatformBrowser(this.platformId);
     this.isRenew = this.checkSubscriptionRenewal();
  }

  ngOnInit(): void {
    this.appendPeachCustomJs();
    this.currency = this.storage.getItem('currencycode', 'session');
      this.getTsPLUSAmountData();
    if (this.storage.getItem('credentials', 'session')) {
      this.credentials = JSON.parse(this.storage.getItem('credentials', 'session'));
      this.email = this.credentials?.data?.contactInfo.email;
    } else if (this.storage.getItem('credentials', 'local')) {
      this.credentials = JSON.parse(this.storage.getItem('credentials', 'local'));
      this.email = this.credentials?.data?.contactInfo.email;
    }
    /*if we want use peach checkoutId we can enable it and disable this.prepareCheckout() method
        this.prepareCheckouts(this.credentials?.data?.username);
    */
   setTimeout(() => {
    this.prepareCheckouts(this.credentials?.data?.username);
   }, 2000);
   
   // this.prepareCheckout();
    this.storage.removeItem('openedModal', 'session');
    this.nextYearDate = this.extendExpirationDate(this.credentials?.data?.subscriptionResponse?.expirationDate);
  }

  public prepareCheckouts(email: string) {
    this.isLoading = true;
    this.paymentService.getCheckout(this.amount, this.currency, 'DB', email, this.isRenew).subscribe((response: any) => {
      this.checkoutId = response?.id;

      if (this.checkoutId) {
        this.isLoading = false;
        this.createPaymentForm();
      }

      // Register in TsPlus Logs
      this.paymentService.generateTokenLogs(this.amount, this.currency, 'DB', email, response).subscribe((res) => {});
    });
  }

  // public prepareCheckout() {
  //   this.isLoading = true;
  //   this.paymentService.getCheckOutId(this.currency, this.amount, this.email, this.isRenew).subscribe(
  //     (res: any) => {
  //       this.checkoutId = res?.checkoutId;
  //       if (this.checkoutId) {
  //         this.isLoading = false;
  //         this.createPaymentForm();
  //       }
  //       // Register in TsPlus Logs
  //       this.paymentService.generateTokenLogs(this.amount, this.currency, 'DB', this.email, res).subscribe((res) => {});
  //     },
  //     (error) => {
  //       this._snackBar.open(
  //         'Oops! Something went wrong while we were working on your request. Please give it another shot. If the problem persists, reach out to us for help. Sorry for the inconvenience, and thanks for your patience!'
  //       );
  //       setTimeout(() => {
  //         this._snackBar.dismiss();
  //         const route = this.isRenew ? '/ts-plus/ts-plus-renewal' : '/ts-plus/ts-plus-benefits';
  //         this.router.navigate([route], { queryParamsHandling: 'preserve' });
  //       }, 8000);
  //     }
  //   );
  // }

  public createPaymentForm() {
    if(!this.isBrowser) return;
    const script = document.createElement('script');
    script.src = `https://eu-prod.oppwa.com/v1/paymentWidgets.js?checkoutId=${this.checkoutId}`;
    document.body.appendChild(script);
  }
  appendPeachCustomJs() {
    if(!this.isBrowser) return;
    const scriptEl = window.document.createElement('script');
    scriptEl.src = 'https://www.travelstart.com/assets/js/peach-customization.js';
    document.body.appendChild(scriptEl);
  }

  /**
   * Checks if the URL contains 'subscription=renew' in the query parameters.
   * @returns boolean
   */
  checkSubscriptionRenewal(): boolean {
    const subscriptionParam = this.route.snapshot.queryParamMap.get('subscription');
    return subscriptionParam === 'renew';
  }

  extendExpirationDate(expirationDate: number): Date {
    const expiration = new Date(expirationDate);
    const nextYearDate = new Date(expiration.getFullYear() + 1, expiration.getMonth(), expiration.getDate());
    return nextYearDate;
  }
  getTsPLUSAmountData(){
    this.paymentService.getTSPLUSAmount().subscribe((data:any)=>{
      if(data){
         // Default amount
        this.amount = data.subscriptionAmount;

        // Check if it's a renewal case
        // If renewal, override with renewal amount
        if (this.isRenew) {
          this.amount = data.subscriptionRenewalAmount;
        }

        console.log('Final subscription amount:', this.amount);
      }
    },(error:any)=>{
        console.error('Failed to load subscription config:', error);
        this.isRenew = this.checkSubscriptionRenewal();
        if (this.isRenew) {
          this.amount = 1999;

        }
    })
  }
}
