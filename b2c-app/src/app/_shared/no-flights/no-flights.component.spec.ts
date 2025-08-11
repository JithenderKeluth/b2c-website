import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NoFlightsComponent } from './no-flights.component';

describe('NoFlightsComponent', () => {
  let component: NoFlightsComponent;
  let fixture: ComponentFixture<NoFlightsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NoFlightsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NoFlightsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
