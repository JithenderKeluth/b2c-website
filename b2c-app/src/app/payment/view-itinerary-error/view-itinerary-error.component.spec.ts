import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewItineraryErrorComponent } from './view-itinerary-error.component';

describe('ViewItineraryErrorComponent', () => {
  let component: ViewItineraryErrorComponent;
  let fixture: ComponentFixture<ViewItineraryErrorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ViewItineraryErrorComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewItineraryErrorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
