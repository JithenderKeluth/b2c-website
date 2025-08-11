import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TravellerInfoComponent } from './traveller-info.component';

describe('TravellerInfoComponent', () => {
  let component: TravellerInfoComponent;
  let fixture: ComponentFixture<TravellerInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TravellerInfoComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TravellerInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
