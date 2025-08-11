import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgDomesticOfflineCardComponent } from './ng-domestic-offline-card.component';

describe('NgDomesticOfflineCardComponent', () => {
  let component: NgDomesticOfflineCardComponent;
  let fixture: ComponentFixture<NgDomesticOfflineCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NgDomesticOfflineCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NgDomesticOfflineCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
