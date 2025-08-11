import { Component, Input } from '@angular/core';
import { BookingService } from '@app/booking/services/booking.service';

@Component({
  selector: 'app-no-filters-error',
  templateUrl: './no-filters-error.component.html',
  styleUrls: ['./no-filters-error.component.scss'],
})
export class NoFiltersErrorComponent {
  @Input() domesticFlights: any;
  constructor(private bookingService: BookingService) {}

  resetFilters() {
    this.bookingService.changeresetFilters(true);
  }
}
