import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BaggageSelectionComponent } from './baggage-selection.component';

describe('BaggageSelectionComponent', () => {
  let component: BaggageSelectionComponent;
  let fixture: ComponentFixture<BaggageSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BaggageSelectionComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BaggageSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
