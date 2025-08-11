import { Component, EventEmitter, Output } from '@angular/core';
import { ApiService } from '@app/general/services/api/api.service';
@Component({
  selector: 'app-cabin-class-error',
  templateUrl: './cabin-class-error.component.html',
  styleUrls: ['./cabin-class-error.component.scss'],
})
export class CabinClassErrorComponent  {
  @Output() continueFlight: EventEmitter<any> = new EventEmitter<any>();
  country: string;

  constructor(apiService: ApiService) {
    this.country = apiService.extractCountryFromDomain();
  }

  continueCabinClass() {
    this.continueFlight.emit('airport');
  }
}
