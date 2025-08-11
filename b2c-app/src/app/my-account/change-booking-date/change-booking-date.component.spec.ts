import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeBookingDateComponent } from './change-booking-date.component';

describe('ChangeBookingDateComponent', () => {
  let component: ChangeBookingDateComponent;
  let fixture: ComponentFixture<ChangeBookingDateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ChangeBookingDateComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChangeBookingDateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
