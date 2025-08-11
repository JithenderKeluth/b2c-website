import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-server-err',
  templateUrl: './server-err.component.html',
  styleUrls: ['./server-err.component.scss'],
})
export class ServerErrComponent implements OnInit {
  public showFiltersErrorMsg: boolean;
  @Input() public showFlightsError = false;
  @Output() public searchFlightAgain: EventEmitter<boolean> = new EventEmitter();


  constructor(private router: Router) {}
  ngOnInit(): void {}
  homePage() {
    this.router.navigate([''], { queryParamsHandling: 'preserve' });
  }
  searchAgain(){
   this.searchFlightAgain.emit(true);
  }
}
