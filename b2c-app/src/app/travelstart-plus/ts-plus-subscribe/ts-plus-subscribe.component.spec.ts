import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TsPlusSubscribeComponent } from './ts-plus-subscribe.component';

describe('TsPlusSubscribeComponent', () => {
  let component: TsPlusSubscribeComponent;
  let fixture: ComponentFixture<TsPlusSubscribeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TsPlusSubscribeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TsPlusSubscribeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
