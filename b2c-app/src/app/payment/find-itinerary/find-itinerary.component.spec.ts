import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FindItineraryComponent } from './find-itinerary.component';

describe('FindItineraryComponent', () => {
  let component: FindItineraryComponent;
  let fixture: ComponentFixture<FindItineraryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FindItineraryComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FindItineraryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
