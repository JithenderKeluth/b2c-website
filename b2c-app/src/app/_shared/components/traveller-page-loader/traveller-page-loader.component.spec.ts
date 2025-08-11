import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TravellerPageLoaderComponent } from './traveller-page-loader.component';

describe('TravellerPageLoaderComponent', () => {
  let component: TravellerPageLoaderComponent;
  let fixture: ComponentFixture<TravellerPageLoaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TravellerPageLoaderComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TravellerPageLoaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
