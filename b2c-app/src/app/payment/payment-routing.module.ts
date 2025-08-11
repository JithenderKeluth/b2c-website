import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PaymentViewComponent } from './payment-view/payment-view.component';
import { BookingConfirmationComponent } from './booking-confirmation/booking-confirmation.component';

import { WalletViewComponent } from './wallet-view/wallet-view.component';
import { WalletDepositComponent } from './wallet-deposit/wallet-deposit.component';
import { PeachCheckoutFormComponent } from './peach-checkout-form/peach-checkout-form.component';

const routes: Routes = [
  {
    path: '',
    component: PaymentViewComponent,
  },
  {
    path: 'wallet-pay',
    component: WalletViewComponent,
  },
  {
    path: 'Add-money',
    component: WalletDepositComponent,
  },
  {
    path: 'eft',
    component: PaymentViewComponent,
  },

  {
    path: 'bookingConfirm',
    component: BookingConfirmationComponent,
  },
  {
    path: 'peach-checkout-form',
    component: PeachCheckoutFormComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PaymentRoutingModule {}
