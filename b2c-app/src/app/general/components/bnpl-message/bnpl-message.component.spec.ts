import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BnplMessageComponent } from './bnpl-message.component';

describe('BnplMessageComponent', () => {
  let component: BnplMessageComponent;
  let fixture: ComponentFixture<BnplMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BnplMessageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BnplMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
