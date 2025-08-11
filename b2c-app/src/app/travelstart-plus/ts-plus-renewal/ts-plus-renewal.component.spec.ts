import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TsPlusRenewalComponent } from './ts-plus-renewal.component';

describe('TsPlusRenewalComponent', () => {
  let component: TsPlusRenewalComponent;
  let fixture: ComponentFixture<TsPlusRenewalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TsPlusRenewalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TsPlusRenewalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
