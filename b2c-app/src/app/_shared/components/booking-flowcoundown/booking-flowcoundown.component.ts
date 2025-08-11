import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { BookingCountdownService } from '@app/general/utils/bookingFlowCountdown';
import { SessionUtils } from '../../../general/utils/session-utils';
import { ApiService } from '../../../general/services/api/api.service';
declare const $: any;

@Component({
  selector: 'app-booking-flowcoundown',
  templateUrl: './booking-flowcoundown.component.html',
  styleUrls: ['./booking-flowcoundown.component.scss']
})
export class BookingFlowCountdownComponent implements OnInit, OnDestroy {
  countdownValue: number = 0;
  countdownSubscription: Subscription;

  constructor(
    private bookingCountdownService: BookingCountdownService, 
    public sessionUtils: SessionUtils,
    public apiService: ApiService) { }

  ngOnInit(): void {
    this.bookingCountdownService.countdownTime$.subscribe((time:any) => {
      this.countdownValue = time;
    });

    // this.startCountdownIfNeeded();
  }

  ngOnDestroy(): void {
    // this.stopCountdown();  // disable this
  }

  startCountdownIfNeeded(): void {
    if (this.bookingCountdownService.isShowCountdownTimer()) {
      this.startCountdown();
    }
  }

  startCountdown(): void {
    this.bookingCountdownService.resetCountdown();
  }

  stopCountdown(): void {
    this.bookingCountdownService.stopBookingFlowCountdown();
  }

  countdownTimer(): string {
    const minutes: number = Math.floor(this.countdownValue / 60);
    const seconds: string = ('0' + Math.floor(this.countdownValue % 60)).slice(-2);
    return `${minutes}:${seconds}`;
  }

  isShowCountdown(): boolean {
    return this.bookingCountdownService.isShowCountdownTimer();
  }
}
