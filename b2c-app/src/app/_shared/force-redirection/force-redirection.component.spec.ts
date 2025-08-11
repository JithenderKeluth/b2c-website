import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ForceRedirectionComponent } from './force-redirection.component';

describe('ForceRedirectionComponent', () => {
  let component: ForceRedirectionComponent;
  let fixture: ComponentFixture<ForceRedirectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ForceRedirectionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ForceRedirectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
