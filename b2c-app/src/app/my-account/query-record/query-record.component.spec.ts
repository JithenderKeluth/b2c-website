import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QueryRecordComponent } from './query-record.component';

describe('QueryRecordComponent', () => {
  let component: QueryRecordComponent;
  let fixture: ComponentFixture<QueryRecordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [QueryRecordComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QueryRecordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
