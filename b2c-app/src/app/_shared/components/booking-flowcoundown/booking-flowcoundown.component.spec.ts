import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookingFlowCountdownComponent } from './booking-flowcoundown.component';

describe('BookingFlowCountdownComponent', () => {
  let component: BookingFlowCountdownComponent;
  let fixture: ComponentFixture<BookingFlowCountdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BookingFlowCountdownComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BookingFlowCountdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
