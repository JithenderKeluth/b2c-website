import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CuratedStaysComponent } from './curated-stays.component';

describe('CuratedStaysComponent', () => {
  let component: CuratedStaysComponent;
  let fixture: ComponentFixture<CuratedStaysComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CuratedStaysComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CuratedStaysComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
