import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SharedModule } from '@shared';

@Component({
  selector: 'app-custom-number-picker',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './custom-number-picker.component.html',
  styleUrl: './custom-number-picker.component.scss',
})
export class CustomNumberPickerComponent {
  @Input('value') selectedNumber = 0;
  @Input() min = -Infinity;
  @Input() max = Infinity;
  @Input() disableAdd = false;
  @Input() disableSubtract = false;

  @Output() valueChange = new EventEmitter<number>();

  adjustNumber(delta: number) {
    const newNumber = this.selectedNumber + delta;

    if (newNumber >= this.min && newNumber <= this.max) {
      this.selectedNumber = newNumber;
      this.valueChange.emit(this.selectedNumber);
    }
  }
}
