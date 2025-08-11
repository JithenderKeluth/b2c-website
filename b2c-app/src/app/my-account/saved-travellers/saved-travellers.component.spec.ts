import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SavedTravellersComponent } from './saved-travellers.component';

describe('SavedTravellersComponent', () => {
  let component: SavedTravellersComponent;
  let fixture: ComponentFixture<SavedTravellersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SavedTravellersComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SavedTravellersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
