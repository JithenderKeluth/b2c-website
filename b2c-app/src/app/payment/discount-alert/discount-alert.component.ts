import { Component, Inject } from '@angular/core';
import {
  MatLegacyDialogRef as MatDialogRef,
  MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA
} from '@angular/material/legacy-dialog';

export interface DiscountDialogData {
  currencyCode: string;
  totalPrice: number;
  selectedDiscount: any;
  discountDisplayName: string;
  bestDiscountDisplayName: string;
  bestDiscountData: any;
  discount: {
    availableDiscounts: { percentage: number; amount: number }[];
  };
}

@Component({
  selector: 'app-discount-alert',
  templateUrl: './discount-alert.component.html',
  styleUrls: ['./discount-alert.component.scss'] // ✅ fixed typo
})
export class DiscountAlertComponent {

  constructor(
    public dialogRef: MatDialogRef<DiscountAlertComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DiscountDialogData
  ) {}

  private get validDiscount() {
    return this.data?.discount?.availableDiscounts?.find(d => d.percentage > 0);
  }

  get discountPercent(): number | undefined {
    return this.validDiscount?.percentage;
  }

  get discountedAmount(): number | undefined {
    return this.validDiscount ? this.data.totalPrice + this.validDiscount.amount : undefined;
  }

  bestDiscountPersentage(): number | undefined {
    return this.validDiscount?.percentage;
  }

  cancel(): void {
    this.dialogRef.close();
  }

  confirm(): void {
    this.dialogRef.close(true);
  }

}
