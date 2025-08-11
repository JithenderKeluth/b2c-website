import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TsPlusProcessSubscriptionComponent } from './ts-plus-process-subscription.component';

describe('TsPlusProcessSubscriptionComponent', () => {
  let component: TsPlusProcessSubscriptionComponent;
  let fixture: ComponentFixture<TsPlusProcessSubscriptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TsPlusProcessSubscriptionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TsPlusProcessSubscriptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
