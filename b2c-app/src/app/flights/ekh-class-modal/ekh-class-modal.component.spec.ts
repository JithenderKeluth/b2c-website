import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EKHClassModalComponent } from './ekh-class-modal.component';

describe('EKHClassModalComponent', () => {
  let component: EKHClassModalComponent;
  let fixture: ComponentFixture<EKHClassModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EKHClassModalComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EKHClassModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
