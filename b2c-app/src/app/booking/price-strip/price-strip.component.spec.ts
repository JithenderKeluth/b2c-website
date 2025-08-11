import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PriceStripComponent } from './price-strip.component';

describe('PriceStripComponent', () => {
  let component: PriceStripComponent;
  let fixture: ComponentFixture<PriceStripComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PriceStripComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PriceStripComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
