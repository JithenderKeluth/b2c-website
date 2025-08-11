import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../general/services/api/api.service';

@Component({
  selector: 'app-no-flights',
  templateUrl: './no-flights.component.html',
  styleUrls: ['./no-flights.component.scss']
})
export class NoFlightsComponent  {

  public showFiltersErrorMsg: boolean;
  @Input() public showFlightsError = false;
  @Output() public searchFlightAgain: EventEmitter<boolean> = new EventEmitter();
  userDomain : any = null;

  constructor(private router: Router,
    public apiService : ApiService
  ) {
    this.userDomain = this.apiService.extractCountryFromDomain();
  }

  homePage() {
    this.router.navigate(['/'], { queryParamsHandling: 'preserve' });
  }
  searchAgain(){
   this.searchFlightAgain.emit(true);
  }

}
