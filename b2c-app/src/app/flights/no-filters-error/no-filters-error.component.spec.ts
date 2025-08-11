import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NoFiltersErrorComponent } from './no-filters-error.component';

describe('NoFiltersErrorComponent', () => {
  let component: NoFiltersErrorComponent;
  let fixture: ComponentFixture<NoFiltersErrorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NoFiltersErrorComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NoFiltersErrorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
