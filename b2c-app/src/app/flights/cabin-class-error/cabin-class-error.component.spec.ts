import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CabinClassErrorComponent } from './cabin-class-error.component';

describe('CabinClassErrorComponent', () => {
  let component: CabinClassErrorComponent;
  let fixture: ComponentFixture<CabinClassErrorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CabinClassErrorComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CabinClassErrorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
