import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FsFooterComponent } from './fs-footer.component';

describe('FsFooterComponent', () => {
  let component: FsFooterComponent;
  let fixture: ComponentFixture<FsFooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FsFooterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FsFooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
