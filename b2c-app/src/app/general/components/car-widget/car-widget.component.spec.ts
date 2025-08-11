import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarWidgetComponent } from './car-widget.component';

describe('CarWidgetComponent', () => {
  let component: CarWidgetComponent;
  let fixture: ComponentFixture<CarWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CarWidgetComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CarWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
