import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiscountAlertComponent } from './discount-alert.component';

describe('DiscountAlertComponent', () => {
  let component: DiscountAlertComponent;
  let fixture: ComponentFixture<DiscountAlertComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DiscountAlertComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DiscountAlertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
