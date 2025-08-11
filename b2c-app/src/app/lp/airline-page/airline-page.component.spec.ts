import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AirlinePageComponent } from './airline-page.component';

describe('AirlinePageComponent', () => {
  let component: AirlinePageComponent;
  let fixture: ComponentFixture<AirlinePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AirlinePageComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AirlinePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
