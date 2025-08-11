import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookWithTravelstartComponent } from './book-with-travelstart.component';

describe('BookWithTravelstartComponent', () => {
  let component: BookWithTravelstartComponent;
  let fixture: ComponentFixture<BookWithTravelstartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BookWithTravelstartComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BookWithTravelstartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
