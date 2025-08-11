import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MemberDealsBenefitsComponent } from './member-deals-benefits.component';

describe('MemberDealsBenefitsComponent', () => {
  let component: MemberDealsBenefitsComponent;
  let fixture: ComponentFixture<MemberDealsBenefitsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MemberDealsBenefitsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MemberDealsBenefitsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
