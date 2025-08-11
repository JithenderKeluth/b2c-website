import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MulticityFlightResultsComponent } from './multicity-flight-results.component';

describe('MulticityFlightResultsComponent', () => {
  let component: MulticityFlightResultsComponent;
  let fixture: ComponentFixture<MulticityFlightResultsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MulticityFlightResultsComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MulticityFlightResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
