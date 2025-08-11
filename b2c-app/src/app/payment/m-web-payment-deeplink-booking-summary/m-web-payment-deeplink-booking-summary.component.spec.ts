import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MWebPaymentDeeplinkBookingSummaryComponent } from './m-web-payment-deeplink-booking-summary.component';

describe('MWebPaymentDeeplinkBookingSummaryComponent', () => {
  let component: MWebPaymentDeeplinkBookingSummaryComponent;
  let fixture: ComponentFixture<MWebPaymentDeeplinkBookingSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MWebPaymentDeeplinkBookingSummaryComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MWebPaymentDeeplinkBookingSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
