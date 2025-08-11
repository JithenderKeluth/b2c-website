import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../../general/services/api/api.service';

@Component({
  selector: 'app-server-err',
  templateUrl: './server-err.component.html',
  styleUrls: ['./server-err.component.scss'],
})
export class ServerErrComponent implements OnInit {
  public showFiltersErrorMsg: boolean;
  @Input() public showFlightsError = false;
  @Output() public searchFlightAgain: EventEmitter<boolean> = new EventEmitter();
  userDomain : any= null;

  constructor(private router: Router,
    private apiService:ApiService
  ) {
    this.userDomain = this.apiService.extractCountryFromDomain();
  }
  ngOnInit(): void {}
  homePage() {
    this.router.navigate([''], { queryParamsHandling: 'preserve' });
  }
  searchAgain(){
   this.searchFlightAgain.emit(true);
  }
}
