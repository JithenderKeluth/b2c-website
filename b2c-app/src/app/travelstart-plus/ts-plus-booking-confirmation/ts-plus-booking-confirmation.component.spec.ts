import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TsPlusBookingConfirmationComponent } from './ts-plus-booking-confirmation.component';

describe('TsPlusBookingConfirmationComponent', () => {
  let component: TsPlusBookingConfirmationComponent;
  let fixture: ComponentFixture<TsPlusBookingConfirmationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TsPlusBookingConfirmationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TsPlusBookingConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
