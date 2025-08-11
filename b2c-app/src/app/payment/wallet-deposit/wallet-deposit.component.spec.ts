import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WalletDepositComponent } from './wallet-deposit.component';

describe('WalletDepositComponent', () => {
  let component: WalletDepositComponent;
  let fixture: ComponentFixture<WalletDepositComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WalletDepositComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WalletDepositComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
