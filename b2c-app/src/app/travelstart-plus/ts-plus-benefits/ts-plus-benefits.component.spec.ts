import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TsPlusBenefitsComponent } from './ts-plus-benefits.component';

describe('TsPlusBenefitsComponent', () => {
  let component: TsPlusBenefitsComponent;
  let fixture: ComponentFixture<TsPlusBenefitsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TsPlusBenefitsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TsPlusBenefitsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
