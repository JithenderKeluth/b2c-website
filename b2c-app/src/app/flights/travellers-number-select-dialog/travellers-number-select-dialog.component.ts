import { Component, Inject } from '@angular/core';
import { CustomNumberPickerComponent } from '@shared/components/custom-number-picker/custom-number-picker.component';
import { SharedModule } from '@shared';
import {
  MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA,
  MatLegacyDialogRef as MatDialogRef,
} from '@angular/material/legacy-dialog';
import { NgIf } from '@angular/common';

interface PassengerLimits {
  max: number;
  min: number;
}

@Component({
  selector: 'app-travellers-number-select-dialog',
  standalone: true,
  imports: [CustomNumberPickerComponent, SharedModule, NgIf],
  templateUrl: './travellers-number-select-dialog.component.html',
  styleUrl: './travellers-number-select-dialog.component.scss',
})
export class TravellersNumberSelectDialogComponent {
  maxPassengers: number;

  totalAdults: number;
  totalYoungAdults: number;
  totalChildren: number;
  totalInfants: number;

  adultLimits: PassengerLimits = { max: 9, min: 1 };
  youngAdultLimits: PassengerLimits = { max: 8, min: 0 };
  childLimits: PassengerLimits = { max: 8, min: 0 };
  infantLimits: PassengerLimits = { max: 8, min: 0 };

  constructor(
    @Inject(MAT_DIALOG_DATA) data: any,
    public dialogRef: MatDialogRef<TravellersNumberSelectDialogComponent>
  ) {
    this.adultLimits = data?.adultLimits || { max: 9, min: 1 };
    this.youngAdultLimits = data?.youngAdultLimits || { max: 8, min: 0 };
    this.childLimits = data?.childLimits || { max: 8, min: 0 };
    this.infantLimits = data?.infantLimits || { max: 8, min: 0 };
    this.maxPassengers = data?.maxPassengers || 9;
    this.totalAdults = data?.totalAdults || 0;
    this.totalYoungAdults = data?.totalYoungAdults || 0;
    this.totalChildren = data?.totalChildren || 0;
    this.totalInfants = data?.totalInfants || 0;
  }

  get totalPassengers(): number {
    return this.totalAdults + this.totalYoungAdults + this.totalChildren + this.totalInfants;
  }

  canAddPassengers(): boolean {
    return this.totalPassengers < this.maxPassengers;
  }

  isInfantCountInValid() {
    return Boolean(this.totalInfants > this.totalAdults);
  }
  isAdultCountInValid(){
     return this.totalAdults == 0 && (this.totalYoungAdults > 0 ||  this.totalChildren  > 0 || this.totalInfants > 0) ;
  }
  isFormInValid() {
    return this.isInfantCountInValid() || this.isAdultCountInValid();
  }

  closeDialog(e: Event) {
    e.preventDefault();
    this.dialogRef.close();
  }

  save() {
    const result = {
      totalAdults: this.totalAdults,
      totalYoungAdults: this.totalYoungAdults,
      totalChildren: this.totalChildren,
      totalInfants: this.totalInfants,
    };
    if(this.totalAdults > 0 ) this.dialogRef.close(result);
  }
}
