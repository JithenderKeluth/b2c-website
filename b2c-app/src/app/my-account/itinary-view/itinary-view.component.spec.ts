import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItinaryViewComponent } from './itinary-view.component';

describe('ItinaryViewComponent', () => {
  let component: ItinaryViewComponent;
  let fixture: ComponentFixture<ItinaryViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ItinaryViewComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ItinaryViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
