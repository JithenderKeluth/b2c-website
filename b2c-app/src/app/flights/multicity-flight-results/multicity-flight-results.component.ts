import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  ViewChildren,
  QueryList,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import { SearchData } from '../models/search/search-data.model';
import { NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { Travellers } from '../models/travellers';
import { UniversalStorageService } from '@app/general/services/universal-storage.service';

@Component({
  selector: 'app-multicity-flight-results',
  templateUrl: './multicity-flight-results.component.html',
  styleUrls: ['./multicity-flight-results.component.scss'],
})
export class MulticityFlightResultsComponent implements OnInit {
  public flights_search_info: any = new SearchData();
  @Output() showSearch: EventEmitter<boolean> = new EventEmitter();
  @Output() searchFlights: EventEmitter<boolean> = new EventEmitter();
  public show_multicity_layout: boolean = false;
  public travellers = new Travellers();
  public totalPassengers: number;
  public showLeftIcon: boolean;
  public showRightIcon: boolean = true;
  public showSeparator: boolean;
  public rightCount: number = 3;
  public leftCount: number;
  @ViewChild('itenaryContent', { read: ElementRef }) public itenaryContent: ElementRef<any>;

  constructor(private ngbDateParserFormatter: NgbDateParserFormatter, private storage: UniversalStorageService) {}

  ngOnInit(): void {
    this.flights_search_info = JSON.parse(this.storage.getItem('flightsearchInfo', 'session'));

    this.travellers = new Travellers(
      this.flights_search_info.travellers.adults,
      this.flights_search_info.travellers.children,
      this.flights_search_info.travellers.infants
    );
    this.totalPassengers = this.travellers.getCount();

    this.dateConversion();
  }

  showSearch_page() {
    this.showSearch.emit(true);
    this.show_multicity_layout = true;
  }
  searchFlightsAgain() {
    this.searchFlights.emit(true);
  }

  dateConversion() {
    for (let i = 0; i < this.flights_search_info.itineraries.length; i++) {
      if (typeof this.flights_search_info.itineraries[i].dept_date === 'object') {
        this.flights_search_info.itineraries[i].dept_date = this.ngbDateParserFormatter.format(
          this.flights_search_info.itineraries[i].dept_date
        );
      } else {
        this.flights_search_info.itineraries[i].dept_date = this.flights_search_info.itineraries[i].dept_date;
      }
    }
  }

  public scrollRight(event: any): void {
    this.rightCount = this.rightCount + 1;
    if (this.rightCount == this.flights_search_info.itineraries.length) {
      this.showRightIcon = false;
    }
    this.itenaryContent.nativeElement.scrollTo({
      left: this.itenaryContent.nativeElement.scrollLeft + 300,
      behavior: 'smooth',
    });
    this.showLeftIcon = true;
  }
  public scrollLeft(): void {
    this.showRightIcon = true;
    this.rightCount = this.rightCount - 1;
    if (this.rightCount == 3) {
      this.showLeftIcon = false;
    }
    this.itenaryContent.nativeElement.scrollTo({
      left: this.itenaryContent.nativeElement.scrollLeft - 300,
      behavior: 'smooth',
    });
  }
}
