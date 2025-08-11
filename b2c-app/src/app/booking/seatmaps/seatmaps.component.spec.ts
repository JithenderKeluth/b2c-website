import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeatmapsComponent } from './seatmaps.component';

describe('SeatmapsComponent', () => {
  let component: SeatmapsComponent;
  let fixture: ComponentFixture<SeatmapsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SeatmapsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SeatmapsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
