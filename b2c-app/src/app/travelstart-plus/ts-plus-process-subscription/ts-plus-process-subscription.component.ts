import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { PeachPaymentsService } from './../service/peach-payments.service';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { GoogleTagManagerServiceService } from '@core/tracking/services/google-tag-manager-service.service';
import { ErrorHandlerService } from './../service/error-handler.service';
import peachErrCodes from './../peach-error-codes.json';
import { UniversalStorageService } from '@app/general/services/universal-storage.service';

@Component({
  selector: 'app-ts-plus-process-subscription',
  templateUrl: './ts-plus-process-subscription.component.html',
  styleUrls: ['./ts-plus-process-subscription.component.scss'],
})
export class TsPlusProcessSubscriptionComponent {
  public credentials: any;
  public errorData: any;
  public subscriptionType: string = 'upgrade';

  constructor(
    private route: ActivatedRoute,
    private paymentService: PeachPaymentsService,
    public router: Router,
    private _snackBar: MatSnackBar,
    private googleTagManagerServiceService: GoogleTagManagerServiceService,
    private errorHandlerService: ErrorHandlerService,
    private storage: UniversalStorageService
  ) {}

  ngOnInit(): void {
    this.errorData = peachErrCodes;
    this.route.queryParams.subscribe((params) => {
      const resourcePath = params['resourcePath'];
      if (resourcePath) {
        this.getPaymentStatus(resourcePath);
      }
    });
    this.subscriptionType = this.storage.getItem('tsSubscriptionType', 'session');
    this.credentials = JSON.parse(this.storage.getItem('credentials', 'session'))?.data;
  }

  private getPaymentStatus(resourcePath: string) {
    const getStatusUrl = resourcePath;
    this.paymentService.getPaymentStatus(getStatusUrl).subscribe(
      (statusResponse: any) => {
        // register for TsplusLogs
        this.paymentService
          .paymentStatusLogs(getStatusUrl, statusResponse, this.credentials?.username)
          .subscribe((res) => {});

        if (statusResponse?.result?.code) {
          const transactionSucces = this.errorHandlerService.handleErrorCode(statusResponse?.result?.code);
          if (transactionSucces === 'Transaction succeeded') {
            if (statusResponse?.id) {
              this.updateSubscription(statusResponse?.id, statusResponse?.registrationId, statusResponse?.paymentBrand);
            } else if (statusResponse?.card?.last4Digits) {
              const paymentRef = `${statusResponse.card.holder}@${statusResponse.card.last4Digits}`;
              this.updateSubscription(paymentRef, statusResponse?.registrationId, statusResponse?.paymentBrand);
            }
          } else {
            this.handleApiError(statusResponse?.result?.description, statusResponse?.result?.code);
            if (statusResponse?.id) {
              this.reverseAPayment(statusResponse.id);
            }
            this.pushTagsToGTM('Upgrade_fail', statusResponse?.id);
          }
        }
      },
      (error) => {
        this.pushTagsToGTM('Upgrade_fail');
        const errMsg =
          'Oops! Something went wrong while we were working on your request. Please give it another shot. If the problem persists, reach out to us for help (feedback@travelstart.com). Sorry for the inconvenience, and thanks for your patience!';
        this.handleApiError(errMsg);
      }
    );
  }

  pushTagsToGTM(eventName: string, paymen_ref?: string) {
    this.googleTagManagerServiceService.Upgrade_fail(eventName, this.credentials?.username, paymen_ref);
  }

  // private getPaymentStatus_peach(checkOutId: string) {
  //   this.paymentService.getCheckoutPaymentStatus(checkOutId).subscribe((statusResponse: any) => {
  //     // Process the payment status response
  //     if (statusResponse?.paymentResult?.id) {
  //       this.updateSubscription(statusResponse?.paymentResult?.registrationId, statusResponse?.paymentResult?.id);
  //     }
  //   });
  // }

  private updateSubscription(paymentId: any, registrationId: string, paymentBrand?: string) {
    // const userSessionToken =
    //   JSON.parse(this.storage.getItem('credentials', 'session'))?.data['token'] ||
    //   JSON.parse(this.storage.getItem('credentials', 'local'))?.data['token'];
    const params = {
      // token: (() => {
      //   const token = userSessionToken || null;
      //   return token;
      // })(),
      subscriptionType: this.subscriptionType,
      paymentReference: paymentId,
      cardToken: registrationId,
      userAgent: {
        deviceId: 'browser',
        application: 'Web-Chrome',
        version: 'v1',
        country: 'ZA',
        market: 'ZA',
        language: 'en',
      },
    };

    this.paymentService.updateSubscriptionStatus(params).subscribe(
      (res: any) => {
        this.googleTagManagerServiceService.pushTravelstartPlusUser(
          this.credentials?.username,
          this.credentials?.firstName,
          this.credentials?.surname,
          paymentBrand,
          paymentId
        );

        // register for TSplus logs
        this.paymentService.subscriptionStatusLogs(params, res, this.credentials?.username).subscribe((res) => {});

        this.router.navigate(['/ts-plus/subscriptionSuccess'], { queryParamsHandling: 'preserve' });
      },
      (error) => {
        this.pushTagsToGTM('Subscription_fail', paymentId);
        this.reverseAPayment(paymentId);
        const errMsg =
          'Oops! Something went wrong while we were working on your request. Please give it another shot. If the problem persists, reach out to us for help (feedback@travelstart.com). Sorry for the inconvenience, and thanks for your patience!';
        this.handleApiError(errMsg);
      }
    );
  }

  private reverseAPayment(paymentId: string) {
    this.paymentService.reverseAPayment(paymentId, 'RV').subscribe((response) => {
      this._snackBar.open(
        'Oops! Something went wrong while we were working on your request. Please give it another shot. If the problem persists, reach out to us for feedback@travelstart.com. Sorry for the inconvenience, and thanks for your patience!'
      );
      setTimeout(() => {
        this._snackBar.dismiss();
        const route = this.subscriptionType === 'renewal' ? '/ts-plus/ts-plus-renewal' : '/ts-plus/ts-plus-benefits';
        this.router.navigate([route]);
      }, 8000);
    });
  }

  handleApiError(errorMessage: string, code?: string): any {
    if (code) {
      const errCode = this.getErrorMessage(code);
      if (errCode) {
        errorMessage = errCode;
      }
    }
    this._snackBar.open(errorMessage);
    setTimeout(() => {
      this._snackBar.dismiss();
      const queryParams = this.subscriptionType === 'renewal' ? { subscription: 'renew' } : undefined;
      this.router.navigate(['/ts-plus/ts-plus-payments'], { queryParams });
    }, 8000);
  }

  // Function to get generic message based on error code and description
  getErrorMessage(code: string): string {
    const error = this.errorData.errors.find((error: any) => error.code === code);
    return error ? error.message : null;
  }
}
