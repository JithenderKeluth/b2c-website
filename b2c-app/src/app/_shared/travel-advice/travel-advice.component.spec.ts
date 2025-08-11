import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TravelAdviceComponent } from './travel-advice.component';

describe('TravelAdviceComponent', () => {
  let component: TravelAdviceComponent;
  let fixture: ComponentFixture<TravelAdviceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TravelAdviceComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TravelAdviceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
