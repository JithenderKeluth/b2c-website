import { Injectable } from '@angular/core';
import { PTID_CONFIG } from '../config/ptid-config';

@Injectable({
  providedIn: 'root',
})
export class PTIDService {
  private currentBrand: string = 'Travelstart';

  setBrand(brand: string): void {
    this.currentBrand = brand;
  }

  getPTID(): string {
    return PTID_CONFIG[this.currentBrand] || '';
  }
}
