import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PeachCheckoutFormComponent } from './peach-checkout-form.component';

describe('PeachCheckoutFormComponent', () => {
  let component: PeachCheckoutFormComponent;
  let fixture: ComponentFixture<PeachCheckoutFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PeachCheckoutFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PeachCheckoutFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
