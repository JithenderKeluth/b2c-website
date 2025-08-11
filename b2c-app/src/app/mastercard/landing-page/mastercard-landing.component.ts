import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { CredentialsService } from '../../auth/credentials.service';
import { SearchService } from '../../flights/service/search.service';
import { ApiService } from '../../general/services/api/api.service';
import { MyAccountServiceService } from '../../my-account/my-account-service.service';
import { GoogleTagManagerServiceService } from '../../_core/tracking/services/google-tag-manager-service.service';
import { MatDialog } from '@angular/material/dialog';
import { SubscriptionSlotsMissedModalComponent } from '../registration/subscription-slots-missed-modal.component';
import { AuthenticationService } from '../../auth/authentication.service';
import { PeachPaymentsService } from '../../travelstart-plus/service/peach-payments.service';
import { HttpClient } from '@angular/common/http';
import { PROXY_SERVER_PATH, PROXY_BUTTERCMS_FAQ } from '../../general/services/api/api-paths';

declare const $: any;

@Component({
  selector: 'app-mastercard-landing',
  templateUrl: './mastercard-landing.component.html',
  styleUrls: ['./mastercard-landing.component.scss'],
})
export class MastercardLandingComponent implements OnInit {
  
  public faqGroup: any = [];
  public credentials: any;
  public show_WhatsAppWidget: boolean = false;
  public isLoggedIn: boolean = false;
  public isMonthlyLimitExceeded: boolean = false;

  constructor(
    public router: Router,
    public credentialsService: CredentialsService,
    public searchService: SearchService,
    public apiService: ApiService,
    private myacountService: MyAccountServiceService,
    private googleTagManagerServiceService: GoogleTagManagerServiceService,
    private title: Title,
    private metaService: Meta,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private readonly authenticationService: AuthenticationService,
    private peachPaymentService: PeachPaymentsService,
    private http: HttpClient,
  ) {}

  ngOnInit(): void {

    this.title.setTitle('Upgrade to a world of travel benefits with Mastercard');
    this.metaService.updateTag({
      name: 'description',
      content:
        'Experience 24/7 concierge service, instant travel vouchers to your wallet, red carpet upgrades and more with Ma+. Upgrade now',
    });

    this.getCenterlizedData();
    this.getButterCmsRes();
    const credentialsData = sessionStorage.getItem('credentials');
    this.credentials = credentialsData ? JSON.parse(credentialsData)?.data : null;
    if (this.credentialsService.isAuthenticated()) {
      this.isLoggedIn = true; 
    }
    this.authenticationService.isLoggedIn$.subscribe((status) => {
      this.isLoggedIn = status;
    });
    this.peachPaymentService.getMasterCardMonthlyCount().subscribe((res: any) => {
      this.isMonthlyLimitExceeded = res;
      console.log('res:', res);
      console.log('isMonthlyLimitExceeded:', this.isMonthlyLimitExceeded);
    });
    
    this.route.queryParamMap.subscribe(params => {
      const showLimit = params.get('subscription-limit') === 'true';
      if (showLimit) {
        this.dialog.open(SubscriptionSlotsMissedModalComponent, {
          disableClose: true,
          width: '350px',
          panelClass: 'custom-slots-missed-modal'
        });
      }
    });
  }

  upgradeNow() {
   
    if (this.isMonthlyLimitExceeded) {
      this.dialog.open(SubscriptionSlotsMissedModalComponent, {
        disableClose: true,
        width: '350px',
        panelClass: 'custom-slots-missed-modal'
      });
      return;
    }else{
       
      const credentialsData = sessionStorage.getItem('credentials');
      this.credentials = credentialsData ? JSON.parse(credentialsData)?.data : null;
      $('#loginModal').modal('hide');
      if (!this.credentialsService.isAuthenticated()) {
        $('#loginModal').modal('show');
      } else {
        this.getUserData().then(() => {
          setTimeout(() => {
             
            if (!this.credentials?.subscriptionResponse || 
                this.credentials?.subscriptionResponse?.subscriptionStatus !== 'ACTIVE') {
              this.googleTagManagerServiceService.upGradetoTSplus(this.credentials?.username);
              this.router.navigate(['/mastercard/registration'], { queryParamsHandling: 'preserve' });
            }else{
                $('#subscribed_modal').modal('show');
            }
          }, 1000);
        });
      }
      this.searchService.changeloginModalOutSideClick(true);
    }
    
  }

  onTsUser() {
    $('#subscribed_modal').modal('show');
  }

  getUserData(): Promise<void> {
    return new Promise((resolve) => {
      if (this.credentials?.token) {
        this.myacountService.getUserData(this.credentials.token).subscribe((res: any) => {
          if (res.data) {
            this.isLoggedIn = true;
            this.credentials = res?.data;
            // Update both localStorage and sessionStorage
            sessionStorage.removeItem('credentials');
            sessionStorage.setItem('credentials', JSON.stringify(res));
            localStorage.removeItem('credentials');
            localStorage.setItem('credentials', JSON.stringify(res));
          }
          resolve();
        });
      } else {
        resolve();
      }
    });
  }


  getButterCmsRes() {
    this.faqGroup = [];
    const url = `${PROXY_SERVER_PATH}${PROXY_BUTTERCMS_FAQ}`;
    const payload = {
      pageSlug: 'mastercard-faqs',
      locale: 'en-za'
    };
    
    this.http.post(url, payload).subscribe({
      next: (res: any) => {
        this.faqGroup = Array.isArray(res?.data) ? res.data : [];
      },
      error: (error) => {
        console.error('Error fetching FAQ data :', error);
      }
    });
  }

  // her to get whatsApp link based on user info
  getWhatsAppLink() {
    return this.apiService.isTS_PLUSUser() ? 'TsPluswhatsAppLink' : 'whatsAppLink';
  }

  // To get centerlized Data to display whatsapp based on S3 content we are enable and disable whatsapp 
  getCenterlizedData() {
    const centerlizedInfo: any = JSON.parse(sessionStorage.getItem('appCentralizedInfo') || '{}');
    if (centerlizedInfo) {
      this.show_WhatsAppWidget = Boolean(
        centerlizedInfo?.whatsAppWidgetDomains?.length > 0 &&
        centerlizedInfo?.whatsAppWidgetDomains?.includes(this.apiService.extractCountryFromDomain())
      );
    } else {
      this.show_WhatsAppWidget = false;
    }
  }

}
