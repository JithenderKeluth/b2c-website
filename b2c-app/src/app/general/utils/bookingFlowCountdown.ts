import { Injectable, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, interval, Subscription } from 'rxjs';
import { takeWhile } from 'rxjs/operators';
import { ApiService } from '../services/api/api.service';
import { MomentumApiService } from '@app/general/services/momentum-api.service';
import { ActivatedRoute } from '@angular/router';
import { UniversalStorageService } from '@app/general/services/universal-storage.service';

declare const $: any;

declare global {
  interface Window {
    flutter_inappwebview?: {
      callHandler: (handlerName: string, data: any) => void;
    };
  }
}

@Injectable({
  providedIn: 'root',
})
export class BookingCountdownService implements OnDestroy {
  private countdownTime: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  countdownTime$ = this.countdownTime.asObservable();
  private countdownSubscription: Subscription | null = null;
  private countdownDuration: number = 1800; // 30 minutes
  private isSessionExtended = false;
  private readonly showTimeoutModules: string[] = [
    '/flights/results',
    '/flights/results/detail',
    '/booking/flight-details',
    '/booking/products',
    '/payments',
    '/payments/wallet-pay',
    '/',
    '/hotels',
  ];

  constructor(
    private apiService: ApiService,
    private momentumApiService: MomentumApiService,
    private activatedRoute: ActivatedRoute,
    private storage: UniversalStorageService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    if (!this.isBrowser()) return;

    const savedEndTime = this.storage.getItem('booking_Countdown_EndTime', 'session');
    if (savedEndTime) {
      const endTime = new Date(savedEndTime).getTime();
      const currentTime = new Date().getTime();
      const remainingTime = Math.floor((endTime - currentTime) / 1000);
      if (remainingTime > 0) {
        this.startBookingFlowCountdown(remainingTime);
      } else {
        this.storage.removeItem('booking_Countdown_EndTime');
      }
    }
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  private startBookingFlowCountdown(remainingTime: number): void {
    if (!this.isBrowser()) return;

    this.countdownTime.next(remainingTime);
    const endTime = new Date().getTime() + remainingTime * 1000;
    this.storage.setItem('booking_Countdown_EndTime', new Date(endTime).toISOString(), 'session');

    this.countdownSubscription = interval(1000)
      .pipe(takeWhile(() => this.countdownTime.value > 0))
      .subscribe(() => {
        const currentTime = new Date().getTime();
        const newRemainingTime = Math.floor((endTime - currentTime) / 1000);
        this.countdownTime.next(newRemainingTime);

        if (newRemainingTime <= 0) {
          this.stopBookingFlowCountdown();

          const isMomentum = this.apiService.extractCountryFromDomain() === 'MM';

          if (this.isBrowser() && typeof $ !== 'undefined') {
            $('#idleTimeOut').modal('show');
          }

          this.notifyParentApp('sessionExpired');
        }
      });
  }

  refreshTokenCall(): void {
    if (!this.isBrowser() || this.isSessionExtended) return;

    const sessionId = this.activatedRoute.snapshot.queryParams['session_id'];
    if (!sessionId) return;

    this.momentumApiService.refreshToken(sessionId).subscribe(
      () => {
        this.countdownDuration = 600;
        this.startBookingFlowCountdown(this.countdownDuration);
        this.isSessionExtended = true;
      },
      (error) => console.error('Refresh token error:', error)
    );
  }

  stopBookingFlowCountdown(): void {
    this.storage.removeItem('booking_Countdown_EndTime');
    this.countdownSubscription?.unsubscribe();
    this.countdownSubscription = null;
    this.countdownTime.next(0);
  }

  resetCountdown(): void {
    if (!this.isBrowser()) return;

    if (this.apiService.extractCountryFromDomain() !== 'MM') {
      this.stopBookingFlowCountdown();
      this.startBookingFlowCountdown(this.countdownDuration);
    } else if (
      this.apiService.extractCountryFromDomain() === 'MM' &&
      !this.storage.getItem('booking_Countdown_EndTime', 'session')
    ) {
      this.startBookingFlowCountdown(this.countdownDuration);
    }
  }

  startCountdown(): void {
    this.resetCountdown();
  }

  isShowCountdownTimer(): boolean {
    if (!this.isBrowser()) return false;

    const path = this.isBrowser() ? window.location.pathname : '';
    return (
      this.countdownTime.value > 0 &&
      ((this.apiService.extractCountryFromDomain() !== 'MM' &&
        this.showTimeoutModules.includes(path)) ||
        this.apiService.extractCountryFromDomain() === 'MM')
    );
  }

  ngOnDestroy(): void {
    // optional: keep disabled
    // this.stopBookingFlowCountdown();
  }

  private notifyParentApp(message: string) {
    const payload = { travelstartSessionExpired: 'sessionExpired' };
    this.sendDataToFlutter(payload);

    if (this.isBrowser() && window.parent) {
      window.parent.postMessage({ event: 'travelstartSessionExpired', message }, '*');
    }
  }

  public sendDataToFlutter(payload: any): void {
    if (this.isBrowser() && window.flutter_inappwebview?.callHandler) {
      window.flutter_inappwebview.callHandler('sendDataToFlutter', JSON.stringify(payload));
    }
  }
}
