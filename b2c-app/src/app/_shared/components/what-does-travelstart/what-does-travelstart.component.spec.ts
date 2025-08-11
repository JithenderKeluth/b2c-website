import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WhatDoesTravelstartComponent } from './what-does-travelstart.component';

describe('WhatDoesTravelstartComponent', () => {
  let component: WhatDoesTravelstartComponent;
  let fixture: ComponentFixture<WhatDoesTravelstartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WhatDoesTravelstartComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WhatDoesTravelstartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
