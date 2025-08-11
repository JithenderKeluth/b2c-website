import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResultsOverviewComponent } from './results-overview.component';

describe('ResultsOverviewComponent', () => {
  let component: ResultsOverviewComponent;
  let fixture: ComponentFixture<ResultsOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResultsOverviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResultsOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
