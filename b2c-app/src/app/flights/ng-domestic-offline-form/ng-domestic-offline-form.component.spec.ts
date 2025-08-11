import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgDomesticOfflineFormComponent } from './ng-domestic-offline-form.component';

describe('NgDomesticOfflineFormComponent', () => {
  let component: NgDomesticOfflineFormComponent;
  let fixture: ComponentFixture<NgDomesticOfflineFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NgDomesticOfflineFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NgDomesticOfflineFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
