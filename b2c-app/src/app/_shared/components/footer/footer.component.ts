import { Component, Input, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { SearchService } from '@app/flights/service/search.service';
import { IframeWidgetService } from './../../../general/services/iframe-widget.service';
import { ApiService } from '@app/general/services/api/api.service';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent implements OnInit {
  private isBrowser: boolean;
  @Input() hideFooterLinks = false;
  public router_path: any;
  public countryValue: any;
  public show3DSecure = false;
  footerLinks: any = [];
  planYourTripArray: any = [];
  partnersArray: any = [];
  needHelpArray: any = [];
  travelLabGroup = [
    { name: 'Travelstart', url: 'https://www.travelstart.co.za/' },
    { name: 'Club Travel', url: 'https://www.clubtravel.co.za/' },
    { name: 'NightsBridge', url: 'https://site.nightsbridge.com/' },
    { name: 'Hepstar', url: 'https://www.hepstar.com/' },
    { name: 'SafariNow', url: 'https://www.safarinow.com/' },
    { name: 'Flightsite', url: 'https://www.flightsite.co.za/' },
    { name: 'Glyde Pay', url: 'https://www.glydepay.io/' },
  ];
  constructor(
    private router: Router,
    private searchService: SearchService,
    public iframeWidgetService: IframeWidgetService,
    public apiService: ApiService,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.countryValue = this.apiService?.extractCountryFromDomain();
  }

  ngOnInit(): void {
    this.getFooterData();
  }
  goToContactUs() {
    this.router.navigate(['/contact-us'], { queryParamsHandling: 'preserve' });
  }
  getPresentYear() {
    return new Date().getFullYear();
  }
  showIataSecured() {
    if (this.countryValue === 'ZW' || this.countryValue === 'BW' || this.countryValue === 'NA') {
      this.show3DSecure = true;
      return false;
    } else {
      this.show3DSecure = false;
      return true;
    }
  }

  getFooterData() {
    this.footerLinks = [];
    this.searchService.getFooterLinks().subscribe((data: any) => {
      if (data?.['footer-links']) {
        this.footerLinks = data['footer-links'];
        this.processPartners();
        this.processNeedHelp();
        this.processPlanYourTrip();
      } else {
        this.resetArrays();
      }
    });
  }

  private processPartners() {
    if (this.footerLinks[1] && this.footerLinks[1].heading === 'Partners') {
      this.partnersArray = this.footerLinks[1].items;
    }
  }

  private processNeedHelp() {
    if (this.footerLinks[2] && this.footerLinks[2].heading === 'Need Help?') {
      this.needHelpArray = [...this.footerLinks[2].items].map((x: any) => {
        if (x.name === 'Contact Us') {
          x.url = '/contact-us';
        }
        if (x.name === 'help@travelstart.com' && this.countryValue === 'GO') {
          delete x.name;
        }
        return x;
      });
    }
  }

  private processPlanYourTrip() {
    if (
      this.footerLinks[0] &&
      (this.footerLinks[0].heading === 'Plan your trip' || this.footerLinks[0].heading === 'Plan Your Trip')
    ) {
      this.planYourTripArray = this.footerLinks[0].items;
      if (this.countryValue === 'ZA') {
        const corporateTravel = {
          url: 'https://www.travelstart.co.za/lp/corporate-flight-bookings',
          name: 'Corporate Travel',
        };
        this.planYourTripArray[1] = corporateTravel;
      }
    }
  }

  private resetArrays() {
    this.planYourTripArray = [];
    this.needHelpArray = [];
    this.partnersArray = [];
  }

  isShowTSPLUS() {
    return this.apiService.isShowTSPLUSLabel();
  }
  upgradeTsPlus() {
    if (!this.isBrowser) return;
    const routeUrl = this.router.serializeUrl(
      this.router.createUrlTree(['/ts-plus/ts-plus-benefits'], { queryParamsHandling: 'preserve' })
    );
    window.open(routeUrl, '_blank');
  }
}
