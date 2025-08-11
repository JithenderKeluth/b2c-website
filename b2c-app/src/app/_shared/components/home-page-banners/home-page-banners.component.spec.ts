import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomePageBannersComponent } from './home-page-banners.component';

describe('HomePageBannersComponent', () => {
  let component: HomePageBannersComponent;
  let fixture: ComponentFixture<HomePageBannersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HomePageBannersComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HomePageBannersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
