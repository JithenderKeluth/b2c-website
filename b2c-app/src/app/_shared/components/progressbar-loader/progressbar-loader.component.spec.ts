import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgressbarLoaderComponent } from './progressbar-loader.component';

describe('ProgressbarLoaderComponent', () => {
  let component: ProgressbarLoaderComponent;
  let fixture: ComponentFixture<ProgressbarLoaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProgressbarLoaderComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProgressbarLoaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
