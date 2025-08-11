import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SbViewNotificationComponent } from './sb-view.component';

describe('SbViewNotificationComponent', () => {
  let component: SbViewNotificationComponent;
  let fixture: ComponentFixture<SbViewNotificationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SbViewNotificationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SbViewNotificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
