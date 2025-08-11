import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactFaqComponent } from './contact-faq.component';

describe('ContactFaqComponent', () => {
  let component: ContactFaqComponent;
  let fixture: ComponentFixture<ContactFaqComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ContactFaqComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ContactFaqComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
