import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CouponsInfoComponent } from './coupons-info.component';

describe('CouponsInfoComponent', () => {
  let component: CouponsInfoComponent;
  let fixture: ComponentFixture<CouponsInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CouponsInfoComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CouponsInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
