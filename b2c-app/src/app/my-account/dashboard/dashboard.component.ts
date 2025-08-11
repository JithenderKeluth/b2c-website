import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '@app/general/services/api/api.service';
import { UniversalStorageService } from '@app/general/services/universal-storage.service';
import {responsiveService} from "@core";
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  private isBrowser: boolean;
  constructor(private router: Router, private apiService: ApiService, public responsiveService: responsiveService, 
  private storage: UniversalStorageService, @Inject(PLATFORM_ID) private platformId: Object) { 
    this.isBrowser = isPlatformBrowser(this.platformId);
  }
  tabVal: any;
  routeUrl: any;
  selected: any;
  isTsPlusUser: boolean = false;
  tsCountry: any = null;
  centralInfo: any;
  showWalletInfo: boolean;
  ngOnInit(): void {
    this.tsCountry = this.apiService.extractCountryFromDomain();
    if(this.isBrowser){
      this.routeUrl = window.location.pathname;
      this.centralInfo = JSON.parse(this.storage.getItem('appCentralizedInfo', 'session'));
      this.selectTab();
      if (this.routeUrl === '/my-account') {
        this.getTab('My Profile');
      } else if (this.routeUrl === '/my-account/dashboard') {
        this.getTab('My Bookings');
      } else if (this.routeUrl === '/my-account/dashboards') {
        this.getTab(this.tabVal);
      } else if (this.routeUrl === '/my-account/wallet') {
        this.getTab('Wallet');
      }
    }
    this.isTsPlusUser = this.apiService.isTS_PLUSUser();
    this.showWalletInfo = this.centralInfo?.wallet[this.tsCountry]?.enable_wallet;
  }

  getTab(parm: any) {
    if (!this.isBrowser) return;
    this.tabVal = parm;
    if (parm !== 'My Profile' && this.routeUrl === '/my-account') {
      this.router.navigate(['/my-account/dashboards'], { queryParamsHandling: 'preserve' });
    }
    this.storage.setItem('selectTab', JSON.stringify(parm), 'session');
    this.selectTab();
  }
  public selectTab() {
    if (!this.isBrowser) return;
    if (this.storage.getItem('selectTab', 'session')) {
      this.tabVal = JSON.parse(this.storage.getItem('selectTab', 'session'));
    }
    this.routeUrl = window.location.pathname;
  }
}
