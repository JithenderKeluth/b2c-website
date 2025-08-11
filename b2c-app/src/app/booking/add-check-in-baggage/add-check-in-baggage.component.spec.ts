import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddCheckInBaggageComponent } from './add-check-in-baggage.component';

describe('AddCheckInBaggageComponent', () => {
  let component: AddCheckInBaggageComponent;
  let fixture: ComponentFixture<AddCheckInBaggageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddCheckInBaggageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddCheckInBaggageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
