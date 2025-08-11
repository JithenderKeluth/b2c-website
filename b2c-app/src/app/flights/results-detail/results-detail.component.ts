import { Component, Inject, Input, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BackNavigationEvent } from '@app/_shared/components/back-button/back-navigation.event';
import _ from 'lodash';
declare const $: any;
@Component({
  selector: 'app-results-detail',
  templateUrl: './results-detail.component.html',
  styleUrl: './results-detail.component.scss'
})
export class ResultsDetailComponent implements OnInit {

  itinerary?: any; // Itinerary for a specific flight from the search results page (SRP)
  flightsearchInfo?: any; // Summary data from search results page (SRP) including arrival and departure airports
  flightslist?: {
    airlineNames?: {[code: string]: any},
    airportInfos: {
      iataCode: string,
      city: string,
      airport: string
      }[],
  }; // Lookup values from the search results page (SRP)

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<ResultsDetailComponent>
  ) {
    this.itinerary = this.itinerary ?? data?.itinerary;
    this.flightslist = this.flightslist ?? data?.flightslist;
  }

  ngOnInit(): void {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      this.flightsearchInfo = JSON.parse(sessionStorage.getItem('flightsearchInfo'));
    }
  }

  onBack(event: BackNavigationEvent) {
    event.preventDefault(); // Stop the default browser back navigation
    this.dialogRef.close();
  }

  onConfirm() {
    if (this.itinerary) {
      $('#more_Flights').modal('hide');
      this.dialogRef.close(this.itinerary);
    }
  }

  getJourneyDestination(idx: number): any {
    // One-way / Onward flight
    if (idx === 0) {
      return this.flightsearchInfo?.itineraries[0]?.arr_city;
    }

    // Return flight
    if (idx === 1) {
      return this.flightsearchInfo?.itineraries[0]?.dept_city;
    }

    // Multi-city
    return this.flightsearchInfo[idx - 1]?.arr_city;
  }

  getJourneyDepartureDateTime(odo: { segments: any[] }): Date | undefined {
    const departureDateTime = _.first(odo.segments.map(x => x.departureDateTime));
    if (!departureDateTime) {
      return undefined;
    }

    return new Date(departureDateTime);
  }

  getJourneyStops(odo: { segments: any[] }): string {
    const stops = odo.segments.length > 0 ? odo.segments.length - 1 : 0;

    if (stops == 0) return 'Direct';
    else if (stops == 1) return `${stops} Stop`;
    else return `${stops} Stops`;
  }

  getJourneyDuration(odo: { duration: number }): string | undefined {
    if (!odo.duration) {
      return undefined;
    }

    return this.formatDuration(odo.duration);
  }

  getAirlineName(code: string): any | undefined {
    if (!this.flightslist?.airlineNames) {
      return undefined;
    }

    return this.flightslist.airlineNames[code];
  }

  getFlightNumber(segment: any): string | undefined {
    return segment.flightNumber;
  }

  getAirportInfo(code: string): any | undefined {
    if (!this.flightslist?.airportInfos) {
      return undefined;
    }

    return _.first(this.flightslist.airportInfos.filter(x => x.iataCode == code));
  }

  calculateLayover(arrivalTime: string, departureTime: string): string {
    const arrival = new Date(arrivalTime);
    const departure = new Date(departureTime);

    const diffMs = departure.getTime() - arrival.getTime();

    return this.formatDuration(diffMs);
  }

  formatDuration(ms: number): string {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const mins = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}h ${mins}min`;
  }

}
