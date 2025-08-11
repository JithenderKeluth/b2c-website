import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeatNotSelectedModalComponent } from './seat-not-selected-modal.component';

describe('SeatNotSelectedModalComponent', () => {
  let component: SeatNotSelectedModalComponent;
  let fixture: ComponentFixture<SeatNotSelectedModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SeatNotSelectedModalComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SeatNotSelectedModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
