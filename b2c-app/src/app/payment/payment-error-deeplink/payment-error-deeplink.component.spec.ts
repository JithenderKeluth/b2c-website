import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentErrorDeeplinkComponent } from './payment-error-deeplink.component';

describe('PaymentErrorDeeplinkComponent', () => {
  let component: PaymentErrorDeeplinkComponent;
  let fixture: ComponentFixture<PaymentErrorDeeplinkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PaymentErrorDeeplinkComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentErrorDeeplinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
