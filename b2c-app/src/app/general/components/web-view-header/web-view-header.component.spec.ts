import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WebViewHeaderComponent } from './web-view-header.component';

describe('WebViewHeaderComponent', () => {
  let component: WebViewHeaderComponent;
  let fixture: ComponentFixture<WebViewHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WebViewHeaderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WebViewHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
