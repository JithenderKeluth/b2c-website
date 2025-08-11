import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TravelAppComponent } from './travel-app.component';

describe('TravelAppComponent', () => {
  let component: TravelAppComponent;
  let fixture: ComponentFixture<TravelAppComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TravelAppComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TravelAppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
