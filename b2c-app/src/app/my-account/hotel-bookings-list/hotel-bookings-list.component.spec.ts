import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HotelBookingsListComponent } from './hotel-bookings-list.component';

describe('HotelBookingsListComponent', () => {
  let component: HotelBookingsListComponent;
  let fixture: ComponentFixture<HotelBookingsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HotelBookingsListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HotelBookingsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
