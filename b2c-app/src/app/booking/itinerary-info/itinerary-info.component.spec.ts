import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItineraryInfoComponent } from './itinerary-info.component';

describe('ItineraryInfoComponent', () => {
  let component: ItineraryInfoComponent;
  let fixture: ComponentFixture<ItineraryInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ItineraryInfoComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ItineraryInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
