import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlightCardWhitelabelAlphaComponent } from './flight-card-whitelabel-alpha.component';

describe('FlightCardWhitelabelAlphaComponent', () => {
  let component: FlightCardWhitelabelAlphaComponent;
  let fixture: ComponentFixture<FlightCardWhitelabelAlphaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FlightCardWhitelabelAlphaComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlightCardWhitelabelAlphaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
