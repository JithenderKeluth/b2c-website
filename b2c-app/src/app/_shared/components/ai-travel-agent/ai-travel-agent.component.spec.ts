import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AiTravelAgentComponent } from './ai-travel-agent.component';

describe('AiTravelAgentComponent', () => {
  let component: AiTravelAgentComponent;
  let fixture: ComponentFixture<AiTravelAgentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AiTravelAgentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AiTravelAgentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
