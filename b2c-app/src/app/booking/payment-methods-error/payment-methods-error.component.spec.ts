import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentMethodsErrorComponent } from './payment-methods-error.component';

describe('PaymentMethodsErrorComponent', () => {
  let component: PaymentMethodsErrorComponent;
  let fixture: ComponentFixture<PaymentMethodsErrorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PaymentMethodsErrorComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentMethodsErrorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
