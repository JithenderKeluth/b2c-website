import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlightsLoaderComponent } from './flights-loader.component';

describe('FlightsLoaderComponent', () => {
  let component: FlightsLoaderComponent;
  let fixture: ComponentFixture<FlightsLoaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FlightsLoaderComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlightsLoaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
