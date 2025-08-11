import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Travellers } from './../models/travellers';
import { CabinClass } from './../models/cabin-class.model';
import { UniversalStorageService } from '@app/general/services/universal-storage.service';
import { ApiService } from '../../general/services/api/api.service';

@Component({
  selector: 'app-passengers',
  templateUrl: './passengers.component.html',
  styleUrls: ['./passengers.component.scss'],
})
export class PassengersComponent implements OnInit {
  public totalPassengers: number;
  public travellers = new Travellers();
  public travellersInfo = new Travellers();
  public cabinClass: CabinClass;
  public cabinClassSelected: string;
  public maxPassengerErrrMsg = false;
  public ratioErrMsg = false;
  public totalPassengersAllowed: any = {};
  public country: string;

  @Output() passengers: EventEmitter<any> = new EventEmitter<any>();
  @Output() cabinClassObj: EventEmitter<any> = new EventEmitter<any>();
  @Output() showApply: EventEmitter<any> = new EventEmitter<any>();
  @Output() closeTravellers: EventEmitter<any> = new EventEmitter<any>();
  @Input() passengerCount: EventEmitter<any>;

  constructor(public apiService: ApiService, private storage: UniversalStorageService) {
    this.country = apiService.extractCountryFromDomain();

    this.travellers = new Travellers(1,0,0,0);
    const flightData = JSON.parse(this.storage.getItem('flightsearchInfo', 'session'));
    if (!flightData) {
      this.cabinClass = new CabinClass('Economy', 'ECONOMY');
      this.cabinClassSelected = this.cabinClass.value;
    } else {
      const display = (flightData && flightData.cabinClass && typeof flightData.cabinClass.display === 'string')
        ? flightData.cabinClass.display
        : 'Economy';
      const value = (flightData && flightData.cabinClass && typeof flightData.cabinClass.value === 'string')
        ? flightData.cabinClass.value
        : 'ECONOMY';
      this.cabinClass = new CabinClass(display, value);
      this.cabinClassSelected = this.cabinClass.value;
      this.travellers = new Travellers(
        flightData.travellers.adults,
        flightData.travellers.youngAdults,
        flightData.travellers.children,
        flightData.travellers.infants
      );
    }
  }

  ngOnInit() {
    if (!this.storage.getItem('travellers', 'session')) {
      this.travellers = new Travellers();
    } else {
      const pax = JSON.parse(this.storage.getItem('travellers', 'session'));
      this.travellers = new Travellers(pax.adults,pax.youngAdults, pax.children, pax.infants);
      this.travellersInfo = new Travellers(pax.adults,pax.youngAdults,  pax.children, pax.infants);
    }
    this.totalPassengersAllowed = {
      Adults: [1, 2, 3, 4, 5, 6, 7, 8, 9],
      youngAdults: [0, 1, 2, 3, 4, 5, 6, 7, 8],
      Children: [0, 1, 2, 3, 4, 5, 6, 7, 8],
      Infants: [0, 1, 2, 3, 4, 5, 6],
    };
    this.showApply.emit(this.maxPassengerErrrMsg);
    if (this.passengerCount) {
      this.passengerCount.subscribe((val: any) => {
        this.travellers = new Travellers(val.adults, val.youngAdults, val.children, val.infants);
        this.travellersInfo = new Travellers(val.adults, val.youngAdults, val.children, val.infants);
        this.maxPassengerErrrMsg = false;
        this.ratioErrMsg = false;
        this.showApply.emit(false);
      });
    }
  }

  logAdults(el: any) {
    let adultId = el.getAttribute('data-adult-id');
    this.travellersInfo.adults = parseInt(adultId);
    if (this.travellersInfo.getCount() <= 9) {
      if (this.travellersInfo.adults >= this.travellersInfo.infants) {
        this.travellers.adults = this.travellersInfo.adults;
        this.updatePaxCount();
        this.maxPassengerErrrMsg = false;
        this.ratioErrMsg = false;
      } else {
        this.ratioErrMsg = true;
        this.maxPassengerErrrMsg = false;
        this.travellersInfo.adults = 1;
        this.travellersInfo.adults = this.travellers.adults;
      }
    } else {
      this.maxPassengerErrrMsg = true;
      this.ratioErrMsg = false;
      this.travellers.adults = this.travellersInfo.adults;
    }
    if (this.ratioErrMsg == true || this.maxPassengerErrrMsg == true) {
      this.showApply.emit(true);
    } else {
      this.showApply.emit(false);
    }
  }
  logYoungAdult(el: any) {
    let youngAdultId = el.getAttribute('data-youngAdults-id');
    this.travellersInfo.youngAdults = parseInt(youngAdultId);
    if (this.travellersInfo.getCount() <= 9) {
      if (this.travellersInfo.infants <= this.travellersInfo.adults) {
        this.travellers.youngAdults = this.travellersInfo.youngAdults;
        this.updatePaxCount();
        this.maxPassengerErrrMsg = false;
        this.ratioErrMsg = false;
      } else {
        this.ratioErrMsg = true;
        this.maxPassengerErrrMsg = false;
        this.travellersInfo.youngAdults = 0;
        this.travellersInfo.youngAdults = this.travellers.youngAdults;
      }
    } else {
      this.maxPassengerErrrMsg = true;
      this.ratioErrMsg = false;
      this.travellersInfo.youngAdults = this.travellers.youngAdults;
    }
    if (this.ratioErrMsg == true || this.maxPassengerErrrMsg == true) {
      this.showApply.emit(true);
    } else {
      this.showApply.emit(false);
    }
  }
  logChildren(el: any) {
    let childId = el.getAttribute('data-child-id');
    this.travellersInfo.children = parseInt(childId);
    if (this.travellersInfo.getCount() <= 9) {
      if (this.travellersInfo.infants <= this.travellersInfo.adults) {
        this.travellers.children = this.travellersInfo.children;
        this.updatePaxCount();
        this.maxPassengerErrrMsg = false;
        this.ratioErrMsg = false;
      } else {
        this.ratioErrMsg = true;
        this.maxPassengerErrrMsg = false;
        this.travellersInfo.children = 0;
        this.travellersInfo.children = this.travellers.children;
      }
    } else {
      this.maxPassengerErrrMsg = true;
      this.ratioErrMsg = false;
      this.travellersInfo.children = this.travellers.children;
    }
    if (this.ratioErrMsg == true || this.maxPassengerErrrMsg == true) {
      this.showApply.emit(true);
    } else {
      this.showApply.emit(false);
    }
  }

  logInfants(el: any) {
    let infantId = el.getAttribute('data-infants-id');
    this.travellersInfo.infants = parseInt(el.getAttribute('data-infants-id'));
    if (this.travellersInfo.getCount() <= 9) {
      if (this.travellersInfo.infants <= this.travellersInfo.adults) {
        this.travellers.infants = this.travellersInfo.infants;
        this.updatePaxCount();
        this.maxPassengerErrrMsg = false;
        this.ratioErrMsg = false;
      } else {
        this.ratioErrMsg = true;
        this.maxPassengerErrrMsg = false;
        this.travellers.infants = this.travellersInfo.infants;
      }
    } else {
      this.maxPassengerErrrMsg = true;
      this.ratioErrMsg = false;
      this.travellers.infants = this.travellersInfo.infants;
    }
    if (this.ratioErrMsg == true || this.maxPassengerErrrMsg == true) {
      this.showApply.emit(true);
    } else {
      this.showApply.emit(false);
    }
  }

  updatePaxCount() {
    this.travellers = new Travellers(
      this.travellers.adults,
      this.travellers.youngAdults,
      this.travellers.children,
      this.travellers.infants
    );
    this.totalPassengers = this.travellers.getCount();
    if (this.totalPassengers <= 9) {
      this.passengers.emit(this.travellers);
      this.showApply.emit(this.maxPassengerErrrMsg);
      // sessionStorage.setItem('travellers', JSON.stringify(this.travellers));
    }
  }

  // updateAdultsCount(adults: number, param: string) {
  //   this.travellers.adults = adults;
  //   this.updatePaxCount();
  // }

  // updateChildrenCount(children: number, param: string) {
  //   this.travellers.children = children;
  //   this.updatePaxCount();
  // }
  // updateInfantCount(infants: number, param: string) {
  //   this.travellers.infants = infants;
  //   this.updatePaxCount();
  // }

  onChange(param: string) {
    this.cabinClassSelected = param;
    if (this.cabinClassSelected === 'BUSINESS') {
      this.cabinClass = new CabinClass('Business', this.cabinClassSelected);
    } else if (this.cabinClassSelected === 'FIRST') {
      this.cabinClass = new CabinClass('First', this.cabinClassSelected);
    } else if (this.cabinClassSelected === 'PREMIUM') {
      this.cabinClass = new CabinClass('Premium', this.cabinClassSelected);
    } else {
      this.cabinClass = new CabinClass('Economy', this.cabinClassSelected);
    }
    this.cabinClassObj.emit(this.cabinClass);
  }

  closeModal() {
    this.closeTravellers.emit();
  }
}
