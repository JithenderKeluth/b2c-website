import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FsHeaderComponent } from './fs-header.component';

describe('FsHeaderComponent', () => {
  let component: FsHeaderComponent;
  let fixture: ComponentFixture<FsHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FsHeaderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FsHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
