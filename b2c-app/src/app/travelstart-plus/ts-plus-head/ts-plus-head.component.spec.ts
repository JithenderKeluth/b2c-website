import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TsPlusHeadComponent } from './ts-plus-head.component';

describe('TsPlusHeadComponent', () => {
  let component: TsPlusHeadComponent;
  let fixture: ComponentFixture<TsPlusHeadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TsPlusHeadComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TsPlusHeadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
