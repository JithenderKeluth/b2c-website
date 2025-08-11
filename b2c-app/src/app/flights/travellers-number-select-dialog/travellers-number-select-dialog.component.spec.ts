import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TravellersNumberSelectDialogComponent } from './travellers-number-select-dialog.component';

describe('TravellersNumberSelectDialogComponent', () => {
  let component: TravellersNumberSelectDialogComponent;
  let fixture: ComponentFixture<TravellersNumberSelectDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TravellersNumberSelectDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TravellersNumberSelectDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
