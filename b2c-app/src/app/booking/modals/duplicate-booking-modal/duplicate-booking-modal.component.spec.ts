import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DuplicateBookingModalComponent } from './duplicate-booking-modal.component';

describe('DuplicateBookingModalComponent', () => {
  let component: DuplicateBookingModalComponent;
  let fixture: ComponentFixture<DuplicateBookingModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DuplicateBookingModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DuplicateBookingModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
