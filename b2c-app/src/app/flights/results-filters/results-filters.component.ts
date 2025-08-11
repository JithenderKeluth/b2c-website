import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-results-filters',
  templateUrl: './results-filters.component.html',
  styleUrl: './results-filters.component.scss',
})
export class ResultsFiltersComponent implements OnInit, OnChanges {
  @Input() itineraries?: any;

  totalResults?: number;

  ngOnInit(): void {
    if (Array.isArray(this.itineraries)) {
      this.totalResults = this.itineraries.length;
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (Array.isArray(changes.itineraries.currentValue)) {
      this.totalResults = changes.itineraries.currentValue.length;
    }
  }
}
