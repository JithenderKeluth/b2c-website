import { Component, Inject } from '@angular/core';
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';

export interface ErrorPopupData {
  header?: string;
  imageUrl?: string;
  message: string;
  buttonText?: string;
  button2Text?: string;
  showHeader?: boolean;
  showImage?: boolean;
  showButton?: boolean;
  showButton2?: boolean;
  onButtonClick?: () => void;
  onButton2Click?: () => void;
}

@Component({
  selector: 'app-error-popup',
  templateUrl: './error-popup.component.html',
  styleUrls: ['./error-popup.component.scss']
})
export class ErrorPopupComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ErrorPopupData,
    private dialogRef: MatDialogRef<ErrorPopupComponent>
  ) {}

  handleButtonClick(): void {
    if (this.data.onButtonClick) {
      this.data.onButtonClick();
    }
    this.dialogRef.close();
  }

  handleButton2Click(): void {
    if (this.data.onButton2Click) {
      this.data.onButton2Click();
    }
    this.dialogRef.close();
  }
}
