import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeDifferenceModalComponent } from './time-difference-modal.component';

describe('TimeDifferenceModalComponent', () => {
  let component: TimeDifferenceModalComponent;
  let fixture: ComponentFixture<TimeDifferenceModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TimeDifferenceModalComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TimeDifferenceModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
