import {
    Component,
    EventEmitter,
    Input,
    OnInit,
    Output,
} from '@angular/core';

@Component({
    selector: 'app-class-selector',
    templateUrl: './class-selector.component.html',
    styleUrls: ['./class-selector.component.scss'],
})
export class ClassSelectorComponent implements OnInit {
    options = [
        { display: 'Economy', value: 'ECONOMY' },
        { display: 'Premium', value: 'PREMIUM' },
        { display: 'Business', value: 'BUSINESS' },
        { display: 'First', value: 'FIRST' }
    ];
    selectedOption = 'ECONOMY';

    @Input() applyButtonTitle = 'Apply';
    @Output() apply = new EventEmitter<string>();
    @Output() close = new EventEmitter<void>();

    applySelection() {
        this.apply.emit(this.selectedOption);
    }

    closeModal() {
        this.close.emit();
    }

    ngOnInit(): void {
    }
}
