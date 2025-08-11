import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';

@Component({
  selector: 'app-submission-success-modal',
  templateUrl: './submission-success-modal.component.html',
  styleUrls: ['./submission-success-modal.component.scss']
})
export class SubmissionSuccessModalComponent {
  constructor(
    public dialogRef: MatDialogRef<SubmissionSuccessModalComponent>,
    private router: Router
  ) {}

  onClose() {
    this.dialogRef.close();
    this.router.navigate(['/']);
  }
} 