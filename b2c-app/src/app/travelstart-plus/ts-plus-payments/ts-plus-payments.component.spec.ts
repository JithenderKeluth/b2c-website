import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TsPlusPaymentsComponent } from './ts-plus-payments.component';

describe('TsPlusPaymentsComponent', () => {
  let component: TsPlusPaymentsComponent;
  let fixture: ComponentFixture<TsPlusPaymentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TsPlusPaymentsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TsPlusPaymentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
