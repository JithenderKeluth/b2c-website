import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlightDetailsInfoComponent } from './flight-details-info.component';

describe('FlightDetailsInfoComponent', () => {
  let component: FlightDetailsInfoComponent;
  let fixture: ComponentFixture<FlightDetailsInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FlightDetailsInfoComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlightDetailsInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
