import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlexiTicketTermsComponent } from './flexi-ticket-terms.component';

describe('FlexiTicketTermsComponent', () => {
  let component: FlexiTicketTermsComponent;
  let fixture: ComponentFixture<FlexiTicketTermsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FlexiTicketTermsComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlexiTicketTermsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
