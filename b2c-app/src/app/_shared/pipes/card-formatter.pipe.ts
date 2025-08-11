import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'cardFormatter',
})
export class CardFormatterPipe implements PipeTransform {
  transform(valueToSupress: string, unSuppressedCount = 0): string {
    if (valueToSupress) {
      return (valueToSupress = valueToSupress.match(new RegExp('.{1,4}', 'g')).join(' '));
      // const suppressedCount = valueToSupress.length - unSuppressedCount;
      // const valueToRemainUnsuppressed =
      // valueToSupress.substring(suppressedCount, valueToSupress.length);

      // return Array(suppressedCount + 1).join('*') + valueToRemainUnsuppressed; // suppressedCount + 1: since join will a string of length "suppressedCount"
    }
  }
}
