import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VocherproductComponent } from './vocherproduct.component';

describe('VocherproductComponent', () => {
  let component: VocherproductComponent;
  let fixture: ComponentFixture<VocherproductComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VocherproductComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VocherproductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
