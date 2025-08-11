import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TravelRestrictionsComponent } from './travel-restrictions.component';

describe('TravelRestrictionsComponent', () => {
  let component: TravelRestrictionsComponent;
  let fixture: ComponentFixture<TravelRestrictionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TravelRestrictionsComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TravelRestrictionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
