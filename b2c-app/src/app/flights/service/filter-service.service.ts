import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FilterServiceService {
  constructor() {}

  private flightDataSubject = new BehaviorSubject<any>(null);
  flightData$: Observable<any> = this.flightDataSubject.asObservable();

  setFlightData(data: any) {
    this.flightDataSubject.next(data);
  }
}
