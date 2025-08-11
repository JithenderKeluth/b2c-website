import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RedirectgatewayComponent } from './redirectgateway.component';

describe('RedirectgatewayComponent', () => {
  let component: RedirectgatewayComponent;
  let fixture: ComponentFixture<RedirectgatewayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RedirectgatewayComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RedirectgatewayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
