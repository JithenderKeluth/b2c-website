import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResultsDetailComponent } from './results-detail.component';

describe('ResultsDetailComponent', () => {
  let component: ResultsDetailComponent;
  let fixture: ComponentFixture<ResultsDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ResultsDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResultsDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
