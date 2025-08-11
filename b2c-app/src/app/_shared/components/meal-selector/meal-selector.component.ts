import {
  Component, ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ApiService } from '@app/general/services/api/api.service';

declare const $: any;

@Component({
  selector: 'app-meal-selector',
  templateUrl: './meal-selector.component.html',
  styleUrls: ['./meal-selector.component.scss'],
})
export class MealSelectorComponent implements OnInit {
  @Input() travellerForm: FormGroup;
  @Input() travellerIndex: number;
  @Input() mealSelectionData: any[] = [];
  @Input() babyMealSelection: any[] = [];
  @Input() pricedResult_dataInfo: any;
  @Input() mealprferenceAmount: number;
  @Input() childMealPreferenceAmount: number;
  @Input() infantMealPreferenceAmount: number;
  @Input() submitButtonText = 'Apply';

  @Output() closeMealSelection = new EventEmitter<void>();
  @Output() applyMealSelectionEvent = new EventEmitter<void>();
  @Output() mealSelected = new EventEmitter<{ meal: any, index: number; }>();

  mealSelector: ElementRef;

  selectedMeal = '';
  userDomain : any = null;
  constructor(private apiService:ApiService) {
    this.userDomain = this.apiService.extractCountryFromDomain();
   }

  ngOnInit(): void {
    const currentTraveller = this.travellerForm?.value?.travellersList?.[this.travellerIndex];
    if (currentTraveller && currentTraveller.mealPreference) {
      this.selectedMeal = currentTraveller.mealPreference;
    }
    if(typeof document !== 'undefined') {
      this.mealSelector = new ElementRef(document.getElementById('mealSelector-' + this.travellerIndex));
    }
  }

  selectMeals(meal: any, index: number): void {
    this.mealSelected.emit({ meal, index });
  }

  applyMealSelection(): void {
    $('#' + this.mealSelector.nativeElement.id).collapse('hide');
    this.applyMealSelectionEvent.emit();
  }
  close(): void {
    $('#' + this.mealSelector.nativeElement.id).collapse('hide');
    this.closeMealSelection.emit();
  }
}
