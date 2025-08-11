import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TbiFareComponent } from './tbi-fare.component';

describe('TbiFareComponent', () => {
  let component: TbiFareComponent;
  let fixture: ComponentFixture<TbiFareComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TbiFareComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TbiFareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
