import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BaggageErrorModalComponent } from './baggage-error-modal.component';

describe('BaggageErrorModalComponent', () => {
  let component: BaggageErrorModalComponent;
  let fixture: ComponentFixture<BaggageErrorModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BaggageErrorModalComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BaggageErrorModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
