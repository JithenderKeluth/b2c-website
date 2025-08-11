import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConciergeSupportComponent } from './concierge-support.component';

describe('ConciergeSupportComponent', () => {
  let component: ConciergeSupportComponent;
  let fixture: ComponentFixture<ConciergeSupportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConciergeSupportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConciergeSupportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
