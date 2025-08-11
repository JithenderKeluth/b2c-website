import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewHotelBookingDetailsComponent } from './view-hotel-booking-details.component';

describe('ViewHotelBookingDetailsComponent', () => {
  let component: ViewHotelBookingDetailsComponent;
  let fixture: ComponentFixture<ViewHotelBookingDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewHotelBookingDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewHotelBookingDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
