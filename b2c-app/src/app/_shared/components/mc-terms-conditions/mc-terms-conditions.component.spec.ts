import { ComponentFixture, TestBed } from '@angular/core/testing';

import { McTermsConditionsComponent } from './mc-terms-conditions.component';

describe('McTermsConditionsComponent', () => {
  let component: McTermsConditionsComponent;
  let fixture: ComponentFixture<McTermsConditionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [McTermsConditionsComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(McTermsConditionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
