import {
    Component,
    EventEmitter,
    Input,
    OnInit,
    Output,
} from '@angular/core';
import { CabinClass } from './../../../flights/models/cabin-class.model';

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
    selectedOption = '';
    cabinClass:any;

    @Input() applyButtonTitle = 'Apply';
    @Output() apply = new EventEmitter<string>();
    @Output() close = new EventEmitter<void>();
    @Input() selectedClass :any;
    applySelection() {
        this.apply.emit(this.selectedOption);
    }

    closeModal() {
         this.selectedOption = '';
        this.close.emit();
    }

    ngOnInit(): void {
        if(this.selectedClass?.value) this.selectedOption = this.selectedClass?.value;
    }
}
