import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { CredentialsService } from '@app/auth/credentials.service';
import { ApiService } from '@app/general/services/api/api.service';
import { MyAccountServiceService } from '@app/my-account/my-account-service.service';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { UniversalStorageService } from '@app/general/services/universal-storage.service';
import { isPlatformBrowser } from '@angular/common';
import { PeachPaymentsService } from '../service/peach-payments.service';
declare const $: any;
@Component({
  selector: 'app-ts-plus-renewal',
  templateUrl: './ts-plus-renewal.component.html',
  styleUrls: ['./ts-plus-renewal.component.scss', './../ts-plus-benefits/ts-plus-benefits.component.scss'],
})
export class TsPlusRenewalComponent implements OnInit {
  public credentials: any;
  public userName: any;
  public renewalAmount: number = 1999;
  isBrowser: boolean;
  constructor(
    public router: Router,
    public credentialsService: CredentialsService,
    public apiService: ApiService,
    private myacountService: MyAccountServiceService,
    private _snackBar: MatSnackBar,
    private storage: UniversalStorageService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private peachService : PeachPaymentsService
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    this.storage.removeItem('openedModal');
    this.credentials = JSON.parse(this.storage.getItem('credentials', 'session'))?.data;
    this.userName = this.credentials?.username;
    this.signUser();
    this.storage.setItem('tsSubscriptionType', 'renewal', 'session');
    this.getRenewalAmount();
  }

  signUser() {
    this.credentials = JSON.parse(this.storage.getItem('credentials', 'session'))?.data;
    this.userName = this.credentials?.username;
    if(this.isBrowser){
      $('#loginModal').modal('hide');
      if (!this.credentialsService.isAuthenticated()) {
        $('#loginModal').modal('show');
      } else {
        this.getUserData();
      }
    }
  }

  renew_Subscription() {
    if (!this.credentialsService.isAuthenticated()) {
      return this.signUser();
    }else if(this.apiService.isTS_PLUSUser() && this.isBrowser){
       $('#subscribed_modal').modal('show');
    }
    else if (this.allowToTSPlusRenewal()) {
      this.router.navigate(['/ts-plus/ts-plus-payments'], { queryParams: { subscription: 'renew' } });
    } else {
      this._snackBar.open('Oops! You have not subscribed as a Travelstart Plus user. Please subscribe.');
      setTimeout(() => {
        this._snackBar.dismiss();
        this.router.navigate(['/ts-plus/ts-plus-benefits']);
      }, 6000);
    }
  }

  ngOnDestroy() {
    if(!this.isBrowser) return;
    $('#loginModal').modal('hide');
    $('#account_activate').modal('hide');
    $('#subscribed_modal').modal('hide');
  }
  getUserData() {
    this.myacountService.getUserData(this.credentials?.token).subscribe((res: any) => {
      if (res.data) {
        this.credentials = res?.data;
        this.userName = this.credentials?.username;
        this.storage.removeItem('credentials');
        this.storage.setItem('credentials', JSON.stringify(res), 'session');
      }
    });
  }
  
  /**here we are checking user is TSPlus Subscriber but subscription active status is false then only we are allow to renewal */
    allowToTSPlusRenewal(){
      return Boolean(this.credentials?.isTSPlusSubscriber && !this.credentials?.isTSPlusSubscriptionActive);
    }
    getRenewalAmount(){
      this.peachService.getTSPLUSAmount().subscribe((res:any)=>{
        if(res){
           this.renewalAmount = res.subscriptionRenewalAmount;
        }
      },(error: any) => {
        console.error('Failed to load subscription config:', error);
        this.renewalAmount = 1999; 
      }
    )
    }
}
