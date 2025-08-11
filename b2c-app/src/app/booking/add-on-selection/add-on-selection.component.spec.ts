import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddOnSelectionComponent } from './add-on-selection.component';

describe('AddOnSelectionComponent', () => {
  let component: AddOnSelectionComponent;
  let fixture: ComponentFixture<AddOnSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AddOnSelectionComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddOnSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
