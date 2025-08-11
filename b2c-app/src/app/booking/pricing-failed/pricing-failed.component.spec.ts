import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PricingFailedComponent } from './pricing-failed.component';

describe('PricingFailedComponent', () => {
  let component: PricingFailedComponent;
  let fixture: ComponentFixture<PricingFailedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PricingFailedComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PricingFailedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
