import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateTravellerComponent } from './update-traveller.component';

describe('UpdateTravellerComponent', () => {
  let component: UpdateTravellerComponent;
  let fixture: ComponentFixture<UpdateTravellerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UpdateTravellerComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdateTravellerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
