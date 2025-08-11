import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SessionExpiredErrorComponent } from './session-expired-error.component';

describe('SessionExpiredErrorComponent', () => {
  let component: SessionExpiredErrorComponent;
  let fixture: ComponentFixture<SessionExpiredErrorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SessionExpiredErrorComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SessionExpiredErrorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
