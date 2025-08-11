import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeiliEmbedComponent } from './meili-embed.component';

describe('MeiliEmbedComponent', () => {
  let component: MeiliEmbedComponent;
  let fixture: ComponentFixture<MeiliEmbedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MeiliEmbedComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MeiliEmbedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
