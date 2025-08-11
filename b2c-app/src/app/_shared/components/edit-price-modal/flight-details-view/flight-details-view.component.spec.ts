import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlightDetailsViewComponent } from './flight-details-view.component';

describe('FlightDetailsViewComponent', () => {
  let component: FlightDetailsViewComponent;
  let fixture: ComponentFixture<FlightDetailsViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FlightDetailsViewComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlightDetailsViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
