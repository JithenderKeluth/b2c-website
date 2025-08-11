import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FareBreakdownComponent } from './fare-breakdown.component';

describe('FareBreakdownComponent', () => {
  let component: FareBreakdownComponent;
  let fixture: ComponentFixture<FareBreakdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FareBreakdownComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FareBreakdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
