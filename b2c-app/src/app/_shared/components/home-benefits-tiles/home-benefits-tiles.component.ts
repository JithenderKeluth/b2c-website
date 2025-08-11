import { Component, OnInit } from '@angular/core';
import { PaymentService } from '@app/payment/service/payment.service';
import { ApiService } from '@app/general/services/api/api.service';
import { Router } from '@angular/router';
import { MeiliIntegrationService } from '@app/general/services/meili-integration.service';
import { UniversalStorageService } from '@app/general/services/universal-storage.service';

@Component({
  selector: 'app-home-benefits-tiles',
  templateUrl: './home-benefits-tiles.component.html',
  styleUrls: ['./home-benefits-tiles.component.scss'],
})
export class HomeBenefitsTilesComponent implements OnInit {
  vouchers: any = {};
  walletVouchers: any;
  region: string;
  remainingBookings: any = [];
  currency: any = null;
  walletAmount: number = 0;
  benefitsList = [
    {
      icon: '../../../assets/images/ts+landing/e-sim.svg',
      label: 'eSIM',
      alt: 'e-sim',
      url: 'https://1firsty.onelink.me/64B4/TravelStartPlus',
    },
    {
      icon: '../../../assets/images/ts+landing/ai-assistant.svg',
      label: 'AI Explorer',
      alt: 'ai-assistant',
      url: 'https://www.travelstart.co.za/lp/momentum-ai-assistant',
    },
    {
      icon: '../../../assets/images/ts+landing/headphone.svg',
      label: 'Concierge',
      alt: 'concierge',
      url: 'https://api.whatsapp.com/send/?phone=%2B27820499848&text=hey+Travelstart&app_absent=0',
    },
  ];

  isBenefitsAvailable: boolean;
  centralInfo: any;
  showWalletInfo: boolean;

  constructor(
    private paymentService: PaymentService,
    private apiService: ApiService,
    private router: Router,
    private meiliService: MeiliIntegrationService,
    private storage: UniversalStorageService
  ) {}

  ngOnInit(): void {
    this.region = this.apiService.extractCountryFromDomain();
    this.currency = this.storage.getItem('currencycode', 'session');
    this.centralInfo = JSON.parse(this.storage.getItem('appCentralizedInfo', 'session'));
    this.getVouchersList();
    this.benefistTilesDisplay();
  }

  benefistTilesDisplay() {
    const tilesList = this.centralInfo.homeBenefitTiles;
    if (!tilesList || !this.benefitsList?.length) return;

    let regionTiles;
    if (this.region === 'ZA' && tilesList?.ZA?.showBenefits) {
      regionTiles = tilesList.ZA;
    } else if (this.region === 'MM' && tilesList?.MM?.showBenefits) {
      regionTiles = tilesList.MM;
    }

    if (regionTiles) {
      this.isBenefitsAvailable = true;
      this.benefitsList[0].url = regionTiles.e_sim || '';
      this.benefitsList[1].url = regionTiles.ai_assistant || '';
      this.benefitsList[2].url = regionTiles.concierge || '';
    }
  }

  getVouchersList() {
    const credentials = this.getStoredCredentials();
    const token = credentials?.data?.token;
    this.showWalletInfo = this.centralInfo?.wallet[this.region]?.enable_wallet;
    if (!this.showWalletInfo) {
      return;
    }

    this.paymentService.getWalletVouchersList(token).subscribe(
      (data: any) => {
        const walletData = data?.data?.wallet;
        if (walletData) {
          this.walletVouchers = walletData;
          const loyaltyBalances = walletData.loyaltyVoucherBalances?.[0];
          this.walletAmount = loyaltyBalances?.totalVoucherBalance || 0;
          this.currency = loyaltyBalances?.currency;
          this.vouchers.flightVouchers = loyaltyBalances?.loyaltyFlightVoucherBalance?.loyaltyVoucherList || [];
          this.vouchers.hotelVouchers = loyaltyBalances?.loyaltyHotelVoucherBalance?.loyaltyVoucherList || [];
          this.remainingBookings = this.remainingBookingBalance();
        }
      },
      (error: any) => {
        if (credentials?.data?.subscriptionResponse?.wallet) {
          this.walletVouchers = credentials?.data?.subscriptionResponse?.wallet;
          const loyaltyBalances = this.walletVouchers.loyaltyVoucherBalances?.[0];
          this.vouchers.flightVouchers = loyaltyBalances?.loyaltyFlightVoucherBalance?.loyaltyVoucherList || [];
          this.vouchers.hotelVouchers = loyaltyBalances?.loyaltyHotelVoucherBalance?.loyaltyVoucherList || [];
          this.remainingBookings = this.remainingBookingBalance();
        }
      }
    );
  }

  remainingBookingBalance() {
    const primaryUser = this.meiliService.getPrimaryUser();

    if (!primaryUser) {
      return [];
    }

    const bookingTypes = [
      {
        icon: '../../../assets/images/ts+landing/flight_default.svg',
        quantity: primaryUser.internationalTravelLimits?.numberOfInternationalFlightsRemaining || 0,
        type: 'INTL',
        alt: 'flight',
      },
      {
        icon: '../../../assets/images/ts+landing/flight_default.svg',
        quantity: primaryUser.domesticFlightLimit?.numberOfDomesticFlightsRemaining || 0,
        type: 'DOM',
        alt: 'flight',
      },
      {
        icon: '../../../assets/images/ts+landing/hotel_default.svg',
        quantity: primaryUser.accommodationLimits?.hotelDaysRemaining || 0,
        type: 'NIGHTS',
        alt: 'stays',
      },
      {
        icon: '../../../assets/images/ts+landing/cars_default.svg',
        quantity: primaryUser.carhireLimits?.carDaysRemaining || 0,
        type: 'DAYS',
        alt: 'cars',
      },
    ];

    return bookingTypes;
  }

  private getStoredCredentials(): any {
    return (
      JSON.parse(this.storage.getItem('credentials', 'local') || 'null') ||
      JSON.parse(this.storage.getItem('credentials', 'session') || 'null')
    );
  }
  navigeteToWallet() {
    this.router.navigate(['/my-account/wallet'], { queryParamsHandling: 'preserve' });
  }
  navigateToMembersPage() {
    this.router.navigate(['/members'], { queryParamsHandling: 'preserve' });
  }
}
