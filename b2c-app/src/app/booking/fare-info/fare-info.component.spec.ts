import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FareInfoComponent } from './fare-info.component';

describe('FareInfoComponent', () => {
  let component: FareInfoComponent;
  let fixture: ComponentFixture<FareInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FareInfoComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FareInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
