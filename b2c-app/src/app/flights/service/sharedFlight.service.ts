import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { flightHandler } from './../models/flightHandler';

@Injectable({
  providedIn: 'root'
})
export class SharedFlightService {

  private selectedFlight = new BehaviorSubject<any>(null);
  public selectedFlight$ = this.selectedFlight.asObservable();
  updateSelectedFlight(data: any) {
    this.selectedFlight.next(data);
  }

  private selectedItin = new BehaviorSubject<any>(null);
  public selectedItin$ = this.selectedItin.asObservable();
  updateSelectedItin(data: any) {
    this.selectedItin.next(data);
  }

  private activeFlightSubject: BehaviorSubject<number> = new BehaviorSubject<number>(-1);
  public activeFlightSubject$ = this.activeFlightSubject.asObservable();
  setActiveFlight(id: number): void {
    this.activeFlightSubject.next(id);
  }

  private flightHandlers = new BehaviorSubject<flightHandler>(null);
  public flightHandlers$ = this.flightHandlers.asObservable();
  updateFlightHandlers(data: any) {
    this.flightHandlers.next(data);
  }

  private viewFilghtDetails = new BehaviorSubject(false);
  public  viewDetails = this.viewFilghtDetails.asObservable();
  viewSelectedFlightDetails(data:boolean){
    this.viewFilghtDetails.next(data);
  }

  private isFiltersShow = new BehaviorSubject<boolean>(false);
  public isFiltersShow$ = this.isFiltersShow.asObservable();
  toggleFilters(val:boolean){
    this.isFiltersShow.next(val);
  }

  public selectedDomesticFlight = new BehaviorSubject(null);
  public  selectedDomFlight = this.selectedDomesticFlight.asObservable();
  changeSelectedDomesticFlight(value:any){
     this.selectedDomesticFlight.next(value);
  }

  private showFlightDetailsPopup: any = false;
  setFlightDetailsPopup(param: any) {
    this.showFlightDetailsPopup = param;
  }
  getFlightDetailsPopup() {
    return this.showFlightDetailsPopup;
  }
  /**for B2B send data to edit-price-modal */
  private editpriceModalData = new BehaviorSubject<any>(null);
  public editpriceModalData$ = this.editpriceModalData.asObservable();
  editpriceModalValue(val: any) {
    this.editpriceModalData.next(val);
  }

  private showTabAnimate = new BehaviorSubject(false);
  public showAnimation = this.showTabAnimate.asObservable();
  closeTabFade(data: any) {
    this.showTabAnimate.next(data);
  }

}
