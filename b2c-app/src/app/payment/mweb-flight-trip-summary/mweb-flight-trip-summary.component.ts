import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { DatePipe, formatDate } from '@angular/common';
import { getTravellerType } from '@app/booking/utils/traveller.utils';
import { getBookRef } from '../utils/payment-utils';
import { UniversalStorageService } from '@app/general/services/universal-storage.service';

@Component({
  selector: 'app-mweb-flight-trip-summary',
  templateUrl: './mweb-flight-trip-summary.component.html',
  styleUrls: ['./mweb-flight-trip-summary.component.scss'],
})
export class MwebFlightTripSummaryComponent implements OnInit {
  public flightsearchInfo: any;
  public bookingRef: string;
  @Input() showIframe = false;

  constructor(private ngbDateParserFormatter: NgbDateParserFormatter, private datePipe: DatePipe, private storage: UniversalStorageService) {}

  ngOnInit(): void {
    this.flightsearchInfo = JSON.parse(this.storage.getItem('flightsearchInfo', 'session'));
    this.bookingRef = getBookRef();  
  }

  getPassengers(travellers: number, param: string) {
    return getTravellerType(travellers, param);
  }

  getTravelDate(trDate: any) {
    let formattedDate: any;
    if (typeof trDate == 'object') {
      let date = this.ngbDateParserFormatter.format(trDate);
      formattedDate = this.datePipe.transform(date, 'd MMM yyyy');
    } else {
      formattedDate = this.datePipe.transform(trDate, 'd MMM yyyy');
    }
    return formattedDate;
  }
  ngOnChanges(changes: SimpleChanges) {
    for (let property in changes) {
      if (property === 'showIframe') {
        this.showIframe = changes[property].currentValue;
      }
    }
  }
}
