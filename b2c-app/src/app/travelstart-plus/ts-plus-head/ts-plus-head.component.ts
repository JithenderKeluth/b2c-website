import { Component, OnInit, Inject, PLATFORM_ID, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CredentialsService } from '@app/auth/credentials.service';
import { Location } from '@angular/common';
import { SearchService } from '@app/flights/service/search.service';
import { AuthenticationService } from '@app/auth/authentication.service';
import { ApiService } from '@app/general/services/api/api.service';
import { GoogleTagManagerServiceService } from '@core/tracking/services/google-tag-manager-service.service';
import { PeachPaymentsService } from '../service/peach-payments.service';
import { UniversalStorageService } from '@app/general/services/universal-storage.service';
import { isPlatformBrowser } from '@angular/common';

declare const $: any;

@Component({
  selector: 'app-ts-plus-head',
  templateUrl: './ts-plus-head.component.html',
  styleUrls: ['./ts-plus-head.component.scss'],
})
export class TsPlusHeadComponent implements OnInit, OnDestroy {
  public userName: string;
  public credentials: any;
  public isTravelstartPlus: boolean = true;
  public enteredButton = false;
  public isMatMenuOpen = false;
  public saveLocalStorage: boolean = false;

  isBrowser: boolean = false;

  constructor(
    public router: Router,
    public credentialsService: CredentialsService,
    public location: Location,
    private searchService: SearchService,
    private authenticationService: AuthenticationService,
    public apiService: ApiService,
    private googleTagManagerServiceService: GoogleTagManagerServiceService,
    private peachpaymentService: PeachPaymentsService,
    private storage: UniversalStorageService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);

    if (this.isBrowser) {
      window.history.pushState(null, null, window.location.href);
      window.onpopstate = function () {
        window.history.go(1);
      };
    }
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      this.credentials = JSON.parse(this.storage.getItem('credentials', 'session'))?.data;
    }
  }

  goToBack() {
    const subscriptionType = this.storage.getItem('tsSubscriptionType', 'session');
    const currentUrl = this.router.url;
    const isRenewal = subscriptionType === 'renewal';
    const isPaymentsPage = currentUrl.includes('ts-plus-payments');
    const isBenefitsPage = currentUrl.includes('ts-plus-benefits');
    const username = this.credentials?.username;

    if (isPaymentsPage) {
      this.peachpaymentService.paymentFailedStatusLogs(username).subscribe(() => {
        if (this.isBrowser) {
          window.location.href = isRenewal ? '/ts-plus/ts-plus-renewal' : '/ts-plus/ts-plus-benefits';
        }
      });
    } else if (isBenefitsPage) {
      if (this.isBrowser) {
        window.location.href = '/';
      }
    }
  }

  signUser() {
    if (
      this.router.url.includes('ts-plus-benefits') ||
      this.router.url.includes('ts-plus-renewal')
    ) {
      if (this.isBrowser) {
        $('#loginModal').modal('hide');
      }

      if (!this.credentialsService.isAuthenticated()) {
        if (this.isBrowser) {
          $('#loginModal').modal('show');
        }
      } else if (this.apiService.isTS_PLUSUser()) {
        if (this.isBrowser) {
          $('#subscribed_modal').modal('show');
        }
      } else if (
        this.credentialsService.isAuthenticated() &&
        !this.apiService.isTS_PLUSUser() &&
        this.credentials?.status !== 'PENDING'
      ) {
        this.googleTagManagerServiceService.upGradetoTSplus(this.credentials?.username);
        this.router.navigate(['/ts-plus/ts-plus-payments'], { queryParamsHandling: 'preserve' });
      }
    }

    this.searchService.changeloginModalOutSideClick(true);
  }

  getUserName() {
    if (this.isBrowser && this.storage.getItem('credentials', 'session')) {
      this.credentials = JSON.parse(this.storage.getItem('credentials', 'session'))?.data;
      this.userName = this.credentials?.firstName;
      return this.userName;
    } else if (this.isBrowser && this.storage.getItem('credentials', 'local')) {
      this.credentials = JSON.parse(this.storage.getItem('credentials', 'local'))?.data;
      this.userName = this.credentials?.firstName;
      return this.userName;
    } else {
      return null;
    }
  }

  ngOnDestroy() {
    if (this.isBrowser) {
      $('#loginModal').modal('hide');
      $('#account_activate').modal('hide');
      $('#subscribed_modal').modal('hide');
    }
  }

  goToMyAccount() {
    this.router.navigate(['/my-account']);
  }

  logout() {
    this.storage.removeItem('googleUserDetails');
    this.storage.removeItem('credentials');
    this.authenticationService.logout();
    this.searchService.updateUserCredentials(null);
    this.router.navigate(['/'], { queryParamsHandling: 'preserve' });
  }

  showAccountActivateModal() {
    if (this.isBrowser) {
      $('#loginModal').modal('hide');
    }
  }
}
