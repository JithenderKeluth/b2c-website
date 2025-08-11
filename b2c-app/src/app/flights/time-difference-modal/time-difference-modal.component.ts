import { Component, EventEmitter, Input, OnInit, Output, OnDestroy } from '@angular/core';
import { getCitiesNames } from '../utils/odo.utils';
import { getStorageData } from '@app/general/utils/storage.utils';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-time-difference-modal',
  templateUrl: './time-difference-modal.component.html',
  styleUrls: ['./time-difference-modal.component.scss'],
})
export class TimeDifferenceModalComponent implements OnInit, OnDestroy {
  @Output() continueEvent: EventEmitter<boolean> = new EventEmitter();
  @Input() public domesticSelectedFlight: EventEmitter<any>;
  @Input() public showtimeHoursDiffMsg: EventEmitter<any>;

  public selectDomesticFlights: any;
  public flightslist: any = [];
  public showTimeGapMsg: boolean = false;

  private domesticFlightSub: Subscription;
  private showTimeDiffSub: Subscription;

  constructor() { }

  ngOnInit(): void {
    if (this.domesticSelectedFlight) {
      this.domesticFlightSub = this.domesticSelectedFlight.subscribe((data: any) => {
        const stored = getStorageData('flightResults');
        if (stored) {
          this.flightslist = JSON.parse(stored);
        }
        this.selectDomesticFlights = data;
      });
    }

    if (this.showtimeHoursDiffMsg) {
      this.showTimeDiffSub = this.showtimeHoursDiffMsg.subscribe((data: any) => {
        this.showTimeGapMsg = data;
      });
    }
  }

  continue() {
    this.continueEvent.emit(true);
  }

  public getCityName(param: string) {
    return getCitiesNames(param, this.flightslist.airportInfos);
  }

  ngOnDestroy() {
    if (this.domesticFlightSub) {
      this.domesticFlightSub.unsubscribe();
    }
    if (this.showTimeDiffSub) {
      this.showTimeDiffSub.unsubscribe();
    }
  }
}
