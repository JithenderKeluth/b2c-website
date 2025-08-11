import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddTravellersComponent } from './add-travellers.component';

describe('AddTravellersComponent', () => {
  let component: AddTravellersComponent;
  let fixture: ComponentFixture<AddTravellersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddTravellersComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddTravellersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
