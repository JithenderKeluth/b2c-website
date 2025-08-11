import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneralUspComponent } from './general-usp.component';

describe('GeneralUspComponent', () => {
  let component: GeneralUspComponent;
  let fixture: ComponentFixture<GeneralUspComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GeneralUspComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GeneralUspComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
