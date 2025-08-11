import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomNumberPickerComponent } from './custom-number-picker.component';

describe('CustomNumberPickerComponent', () => {
  let component: CustomNumberPickerComponent;
  let fixture: ComponentFixture<CustomNumberPickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomNumberPickerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomNumberPickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
