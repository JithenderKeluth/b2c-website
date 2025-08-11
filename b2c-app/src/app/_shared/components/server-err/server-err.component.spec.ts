import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServerErrComponent } from './server-err.component';

describe('ServerErrComponent', () => {
  let component: ServerErrComponent;
  let fixture: ComponentFixture<ServerErrComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ServerErrComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ServerErrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
