import { Component, OnInit, Input } from '@angular/core';
import { ApiService } from './../general/services/api/api.service';
import { NavigationService } from './../general/services/navigation.service';
import { MyAccountServiceService } from './../my-account/my-account-service.service';
import { AbsaAuthService } from './../general/services/absa-auth.service';
import { BridgeService } from './../general/services/standardbank/bridge.service';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, timeout } from 'rxjs/operators';
import { of } from 'rxjs';
import { SessionService } from './../general/services/session.service';
import Swal from 'sweetalert2';
import { ChangeDetectorRef } from '@angular/core';
import { UniversalStorageService } from '@app/general/services/universal-storage.service';

@Component({
  selector: 'app-sb-view-notification',
  templateUrl: './sb-view-notification.component.html',
  styleUrl: './sb-view-notification.component.scss'
})
export class SbViewNotificationComponent implements OnInit{

  @Input() notificationMessage: string = '';
  @Input() notificationTitle: string = '';

  public region: string;
  public sbloading = false;
  sessionId: string | null = null;
  public navFrom: String;

  constructor(public apiService: ApiService, public navService: NavigationService, private myacountService: MyAccountServiceService,
    private absaAuthService: AbsaAuthService, private bridgeService: BridgeService, private router: Router, private sessionService: SessionService,
    private route: ActivatedRoute,
    private cdRef: ChangeDetectorRef,
    private storage: UniversalStorageService
  ) {
    this.region = this.apiService.extractCountryFromDomain();
  }

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      this.navFrom = new URLSearchParams(window.location.search).get('navFrom') || '';
    }
    this.initiateHandShake(); //Initiate the handshake 
  }
  

  //Initiating the handshake for StandardBank & Absa
  initiateHandShake(){
    console.log("----->>>navfrom--->>", this.navFrom);
    const isSB = this.apiService.extractCountryFromDomain() === 'SB';
    if(isSB){
      this.handleSBSAAutoLogin(0);/* Handles the SBSA auto-login process.*/
    }
    this.route.queryParams.subscribe(params => {
      const page = params['page'];
      if (page) {
        this.navigateToPage(page);
      }
    });
  }


  /**
     * Handles the SBSA auto-login process.
     * Shows a loader, checks for SBSA country and session credentials,
     * and attempts to fetch session ID and log the user in.
     */
    handleSBSAAutoLogin(retryCount: number = 0): void {

      
      //+++ tmp bypass handshake
      /*
      this.sbloading = false;
      this.cdRef.detectChanges();
      // set mock credentials or session data  if needed for downstream logic
      // sessionStorage.setItem('credentials', JSON.stringify({ user: 'test' }));
      // this.sessionService.setStorageDataInSession({ ... }, true);
      return;
      */
      // END+++
      
       
      // Check if the user is already logged in (credentials stored)
      const hasCredentials = this.storage.getItem('credentials', 'session') !== null;
   
      if (!hasCredentials) {
        this.sbloading = true;
        this.cdRef.detectChanges();
        const sessionIDFromURL = this.absaAuthService.getSessionIdFromCurrentUrl();
    
          if (sessionIDFromURL) {
            this.standardBankProxyAPICall(sessionIDFromURL);
          }else{
            if(this.bridgeService.isRunningInWebView()){
                this.getSession(); 
                this.bridgeService.getSessionId().pipe(
                  catchError((error) => {
                     this.sbloading = false;
                     this.cdRef.detectChanges();
                    console.error('❌ Error fetching sessionId:', error);
                    return of(null); // Return null or fallback
                  })
                ).subscribe((id: string | null) => {
                  if (id && id.trim() !== '') {
                    this.sessionId = id;
                    this.standardBankProxyAPICall(id);
                  } else {
                     this.sbloading = false;
                     this.cdRef.detectChanges();
                    console.warn('⚠️ Session ID not available');
                    this.showAbsaLoginErrorPopup();
                  }
                });
            }else{
              this.sbloading = false;
              this.cdRef.detectChanges();
                this.showAbsaLoginErrorPopup();
            }
            
          }
      }
    }


    private standardBankProxyAPICall(id: string) {
    console.log("sessionid--->>", id);
    this.myacountService.processStandardBankHandShake(id).subscribe({
        next: (response: any) => {
          console.log("response--->>", response);
          if (response?.partner_blob) {
            // Save tokens and user data
            
            this.sessionService.setStorageDataInSession({ data: response }, true);

            this.sbloading = false;
            this.cdRef.detectChanges();

            setTimeout(() => {
              if (this.navFrom === 'my-bookings') {
                this.navigateToPage('my-bookings');
              } else if (this.navFrom === 'contact-us') {
                this.navigateToPage('contact-us');
              }
            }, 1000);
          } else {
            this.handleError('Missing partner_token');
          }
        },
        error: (error: any) => {
          this.handleError(error?.error?.message || 'Unknown handshake error', error?.status);
        }
      });
  }

  private handleError(message: string, statusCode?: number) {
    console.warn(`❌ Handshake failed - ${statusCode || ''} ${message}`);
    this.sbloading = false;
    this.cdRef.detectChanges();
    this.showAbsaLoginErrorPopup(message);
  }

  private showAbsaLoginErrorPopup(errMessage?: String): void {
      const isSB = this.apiService.extractCountryFromDomain() === 'SB';
      // After 2 retries, show alert with retry option
      const errorMessage = 'Please try again later.';
      const popupHtml = `
      <div class="responsive-heading">
        <h1 class="error-fail-heading">Something went wrong</h1>
      </div>
      <div class="responsive-content">
        <p>Don't worry, we're working on it. <br />Please try again later.</p>
        <p>Tip: Make sure you're connected to Wifi or have data when using ${isSB ? 'Standard Bank Travel' : 'Absa Rewards Travel'} .</p>
      </div>
    `;
  
      Swal.fire({
        iconHtml:
          '<img src="./assets/icons/absa_icons/Success.svg" alt="Login Error" style="margin-bottom: 45px; margin-top: 45px;">',
        customClass: {
          container: 'padding: none',
        },
        html: popupHtml,
        padding: '50px 25px',
        text: `${errorMessage} \n ${errMessage}`,
        confirmButtonColor: isSB ? '#033ECA': '#F0325A',
        confirmButtonText: 'Done',
      }).then((result) => {
           if(isSB){
              this.bridgeService.tearDownWebView();
           }else{
              if (result.isConfirmed) {
                this.router.navigateByUrl('/absa-complete-journey');
              }
           }
        
      });
    }


  //Requesting sessionid from StandardBank
  getSession() {
    this.bridgeService.requestSessionId();
  }

  private navigateToPage(page: string): void {
    const routeMap: Record<string, string> = {
      'my-bookings': '/my-account/dashboard',
      'contact-us': '/my-account/help'
    };
    console.log("page--->>>", page);
    const targetRoute = routeMap[page];
    console.log("targetRoute--->>>", targetRoute);
    if (targetRoute) {
      this.router.navigate([targetRoute], { queryParamsHandling: 'preserve' });
    }
  }
   backButtonNavLink(): void {
      console.log('Back button clicked');
      if(this.apiService.extractCountryFromDomain() === 'SB'){
        this.bridgeService.tearDownWebView();
      }
    }
}
