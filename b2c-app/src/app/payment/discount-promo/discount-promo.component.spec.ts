import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiscountPromoComponent } from './discount-promo.component';

describe('DiscountPromoComponent', () => {
  let component: DiscountPromoComponent;
  let fixture: ComponentFixture<DiscountPromoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DiscountPromoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DiscountPromoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
