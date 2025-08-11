import { ComponentFixture, TestBed } from '@angular/core/testing';

import { B2bMeiliWidgetComponent } from './b2b-meili-widget.component';

describe('B2bMeiliWidgetComponent', () => {
  let component: B2bMeiliWidgetComponent;
  let fixture: ComponentFixture<B2bMeiliWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ B2bMeiliWidgetComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(B2bMeiliWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
