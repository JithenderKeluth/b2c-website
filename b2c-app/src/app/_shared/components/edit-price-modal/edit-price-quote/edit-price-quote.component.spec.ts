import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditPriceQuoteComponent } from './edit-price-quote.component';

describe('EditPriceQuoteComponent', () => {
  let component: EditPriceQuoteComponent;
  let fixture: ComponentFixture<EditPriceQuoteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditPriceQuoteComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditPriceQuoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
