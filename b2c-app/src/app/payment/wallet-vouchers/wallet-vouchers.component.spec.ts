import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WalletVouchersComponent } from './wallet-vouchers.component';

describe('WalletVouchersComponent', () => {
  let component: WalletVouchersComponent;
  let fixture: ComponentFixture<WalletVouchersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WalletVouchersComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WalletVouchersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
