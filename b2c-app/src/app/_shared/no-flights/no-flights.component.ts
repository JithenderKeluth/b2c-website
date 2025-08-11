import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-no-flights',
  templateUrl: './no-flights.component.html',
  styleUrls: ['./no-flights.component.scss']
})
export class NoFlightsComponent  {

  public showFiltersErrorMsg: boolean;
  @Input() public showFlightsError = false;
  @Output() public searchFlightAgain: EventEmitter<boolean> = new EventEmitter();


  constructor(private router: Router) {}

  homePage() {
    this.router.navigate(['/'], { queryParamsHandling: 'preserve' });
  }
  searchAgain(){
   this.searchFlightAgain.emit(true);
  }

}
