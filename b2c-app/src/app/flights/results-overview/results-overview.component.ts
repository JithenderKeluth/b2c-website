import { Component, Input, OnInit, EventEmitter, Output } from '@angular/core';
import { ApiService } from '@app/general/services/api/api.service';
import { SearchService } from '../service/search.service';
import { UniversalStorageService } from '@app/general/services/universal-storage.service';

@Component({
  selector: 'app-results-overview',
  templateUrl: './results-overview.component.html',
  styleUrl: './results-overview.component.scss',
})
export class ResultsOverviewComponent implements OnInit {
  @Input() flightslist: any;
  @Output() isShowSearch: EventEmitter<boolean> = new EventEmitter();
  @Output() modifyClicked: EventEmitter<void> = new EventEmitter();

  region?: string;
  flightsearchInfo?: any;

  constructor(
    private apiService: ApiService,
    private searchService: SearchService,
    private storage: UniversalStorageService,
  ) {}

  ngOnInit(): void {
    this.region = this.apiService.extractCountryFromDomain();
    this.flightsearchInfo = JSON.parse(this.storage.getItem('flightsearchInfo', 'session'));
    this.searchService.currentsearch.subscribe((data: any) => {
      if (data) {
        this.flightsearchInfo = JSON.parse(this.storage.getItem('flightsearchInfo', 'session'));
      }
    });
  }

  createDate({ day, month, year }: { day?: number; month?: number; year?: number }): Date | undefined {
    if (day >= 1 && month >= 1 && year >= 1) {
      return new Date(year, month - 1, day);
    }

    return undefined;
  }

   onModifyClick(): void {
    this.modifyClicked.emit();
  }
}
