import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeBenefitsTilesComponent } from './home-benefits-tiles.component';

describe('HomeBenefitsTilesComponent', () => {
  let component: HomeBenefitsTilesComponent;
  let fixture: ComponentFixture<HomeBenefitsTilesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HomeBenefitsTilesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeBenefitsTilesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
