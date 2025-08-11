import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditPassengerDetailsComponent } from './edit-passenger-details.component';

describe('EditPassengerDetailsComponent', () => {
  let component: EditPassengerDetailsComponent;
  let fixture: ComponentFixture<EditPassengerDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditPassengerDetailsComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditPassengerDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
