import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlightRoutesComponent } from './flight-routes.component';

describe('FlightRoutesComponent', () => {
  let component: FlightRoutesComponent;
  let fixture: ComponentFixture<FlightRoutesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FlightRoutesComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlightRoutesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
