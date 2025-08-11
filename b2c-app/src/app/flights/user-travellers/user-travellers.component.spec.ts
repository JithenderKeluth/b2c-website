import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserTravellersComponent } from './user-travellers.component';

describe('UserTravellersComponent', () => {
  let component: UserTravellersComponent;
  let fixture: ComponentFixture<UserTravellersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserTravellersComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserTravellersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
