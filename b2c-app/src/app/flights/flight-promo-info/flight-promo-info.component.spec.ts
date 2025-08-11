import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlightPromoInfoComponent } from './flight-promo-info.component';

describe('FlightPromoInfoComponent', () => {
  let component: FlightPromoInfoComponent;
  let fixture: ComponentFixture<FlightPromoInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FlightPromoInfoComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlightPromoInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
