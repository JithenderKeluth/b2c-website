import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';

@Component({
  selector: 'app-subscription-slots-missed-modal',
  templateUrl: './subscription-slots-missed-modal.component.html',
  styleUrls: ['./subscription-slots-missed-modal.component.scss']
})
export class SubscriptionSlotsMissedModalComponent {
  constructor(
    public dialogRef: MatDialogRef<SubscriptionSlotsMissedModalComponent>,
    private router: Router
  ) {}

  onClose() {
    this.dialogRef.close();
    //this.router.navigate(['/']);
  }
} 