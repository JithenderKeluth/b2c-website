import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MwebFlightTripSummaryComponent } from './mweb-flight-trip-summary.component';

describe('MwebFlightTripSummaryComponent', () => {
  let component: MwebFlightTripSummaryComponent;
  let fixture: ComponentFixture<MwebFlightTripSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MwebFlightTripSummaryComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MwebFlightTripSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
