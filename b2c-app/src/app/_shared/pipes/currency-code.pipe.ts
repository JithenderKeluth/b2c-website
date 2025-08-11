import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'currencyCode',
})
export class CurrencyCodePipe implements PipeTransform {
  transform(value: any): any {
    switch (value) {
      case 'ZAR': {
        return 'R';
      }
      case 'NAD': {
        return 'N$';
      }
      case 'NGN': {
        return '₦';
      }
      case 'AED': {
        return 'AED';
      }
      case 'EGP': {
        return 'E£';
      }
      case 'KES': {
        return 'KSh';
      }
      case 'TZS': {
        return 'TSh';
      }
      case 'BWP': {
        return 'P';
      }
      case 'MAD': {
        return 'dh';
      }
      case 'KWD': {
        return 'KD';
      }
      case 'SAR': {
        return 'SR';
      }
      case 'BHD': {
        return 'BD';
      }
      case 'OMR': {
        return 'bz';
      }
      case 'QAR': {
        return 'QAR';
      }
      case 'TRY': {
        return '₺';
      }
      default: {
        return value;
      }
    }
  }
}
