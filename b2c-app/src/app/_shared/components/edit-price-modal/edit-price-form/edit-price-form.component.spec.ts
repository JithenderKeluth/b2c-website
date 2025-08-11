import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditPriceFormComponent } from './edit-price-form.component';

describe('EditPriceFormComponent', () => {
  let component: EditPriceFormComponent;
  let fixture: ComponentFixture<EditPriceFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditPriceFormComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditPriceFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
