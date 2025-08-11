import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SearchService } from '@app/flights/service/search.service';
import { NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { responsiveService } from './../../../_core/services/responsive.service';
import { removeStorageData } from '@app/general/utils/storage.utils';
import { UniversalStorageService } from '@app/general/services/universal-storage.service';

@Component({
  selector: 'app-recent-searches',
  templateUrl: './recent-searches.component.html',
  styleUrls: ['./recent-searches.component.scss'],
})
export class RecentSearchesComponent implements OnInit {
  public recentSearchArray: any = [];
  public itinariesArray: any = [];
  public path: string[] = [];
  public todayDate = new Date();
  public flightSearch: any;
  public searchesArray: any = [];
  constructor(
    private route: Router,
    private ngbDateParserFormatter: NgbDateParserFormatter,
    private datePipe: DatePipe,
    public responsiveService: responsiveService,
    public searchService: SearchService,
    private storage: UniversalStorageService
  ) {}

  ngOnInit(): void {
    this.path = this.route.url.split('/');
    if (this.storage.getItem('flightSearchData', 'local')) {
      this.recentSearchArray = JSON.parse(this.storage.getItem('flightSearchData', 'local'));
      this.searchService.currentItineraryValue.subscribe((value) => {
        this.searchesArray = this.recentSearchArray.filter((x: any) => x.tripType == value);
        const date = this.datePipe.transform(this.todayDate, 'yyyy-MM-dd');
        this.searchesArray = this.searchesArray.filter((x: any) =>
          x.itineraries.some((y: any) => {
            return new Date(y.dept_date).getTime() > new Date(date).getTime();
          })
        );
      });
      this.flightSearch = JSON.parse(this.storage.getItem('flightsearchInfo', 'session'));
    }
  }

  getDepartureDate(deptDate: any) {
    let departureDate: any;
    if (typeof deptDate == 'object') {
      let date = this.ngbDateParserFormatter.format(deptDate);
      departureDate = this.datePipe.transform(date, 'MMM d');
    } else {
      departureDate = this.datePipe.transform(deptDate, 'MMM d');
    }
    return departureDate;
  }

  searchRoute(searchItinaries: any) {
    this.storage.removeItem('flightsearchInfo');
    removeStorageData('flightResults');
    this.storage.removeItem('travellers');
    this.storage.setItem('flightsearchInfo', JSON.stringify(searchItinaries), 'session');
    this.storage.setItem('travellers', JSON.stringify(searchItinaries.travellers), 'session');
    this.route.navigate(['/flights/results'], { queryParamsHandling: 'preserve' });
  }
}
