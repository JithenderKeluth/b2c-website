import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SrpMwebHeaderComponent } from './srp-mweb-header.component';

describe('SrpMwebHeaderComponent', () => {
  let component: SrpMwebHeaderComponent;
  let fixture: ComponentFixture<SrpMwebHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SrpMwebHeaderComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SrpMwebHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
