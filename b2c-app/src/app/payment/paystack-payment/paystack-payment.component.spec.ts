import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaystackPaymentComponent } from './paystack-payment.component';

describe('PaystackPaymentComponent', () => {
  let component: PaystackPaymentComponent;
  let fixture: ComponentFixture<PaystackPaymentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PaystackPaymentComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PaystackPaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
