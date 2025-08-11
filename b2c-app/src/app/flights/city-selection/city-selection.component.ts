import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { NavigationService } from '@app/general/services/navigation.service';
import { I18nService } from '@app/i18n';
import { SearchService } from '../service/search.service';
import { getDefaultAirports } from '../utils/search-data.utils';

@Component({
  selector: 'app-city-selection',
  templateUrl: './city-selection.component.html',
  styleUrls: ['./city-selection.component.scss'],
})
export class CitySelectionComponent implements OnInit {
  filteredOptions: any = [];
  country: any;
  city = new UntypedFormControl('');
  city_load: boolean = false;
  @Output() selectedCity: EventEmitter<any> = new EventEmitter<any>();
  constructor(
    private searchService: SearchService,
    private i18Service: I18nService,
    private navService: NavigationService
  ) {}

  ngOnInit(): void {
    this.navService.getShowNav().subscribe((val: any) => {
      this.city.reset();
      this.filteredOptions = [];
    });
    setTimeout(() => {
      if (document.getElementById('cityval')) {
        document.getElementById('cityval').focus();
      }
    }, 500);
    if (this.i18Service.language) {
      this.country = this.i18Service.language.split('-')[1];
    }
    if (this.filteredOptions.length == 0) {
      this.filteredOptions = getDefaultAirports(this.country);
    }
  }
  public onKeypressEvent(event: any) {
    if (event.target.value.length >= 3) {
      this.city_load = true;
      this.filteredOptions = [];
      this.searchService.getAirports(event).subscribe((data: any) => {
        if (data === undefined) {
          this.filteredOptions = [];
          this.city_load = false;
        }
        this.city_load = false;
        this.filteredOptions = data;
      });
    } else {
      this.city_load = false;
      this.filteredOptions = getDefaultAirports(this.country);
    }
  }
  public getAirportValue(option: any) {
    return option['code'] + ' ' + option['city'];
  }

  public displayFn(state: any) {
    if (state && state['code']) {
      return `${state['city']} (${state['code']})`;
    }
  }
  selectCity(city: any) {
    this.selectedCity.emit(city);
    this.navService.setShowNav(false);
    this.city.reset();
  }
}
