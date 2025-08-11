import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductsNotSelectedModalComponent } from './products-not-selected-modal.component';

describe('ProductsNotSelectedModalComponent', () => {
  let component: ProductsNotSelectedModalComponent;
  let fixture: ComponentFixture<ProductsNotSelectedModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProductsNotSelectedModalComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductsNotSelectedModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
