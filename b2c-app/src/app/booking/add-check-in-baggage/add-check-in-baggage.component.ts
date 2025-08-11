import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { getCitiesNames } from '@app/flights/utils/odo.utils';
import { BookingService } from '../services/booking.service';
import { getBaggageFee } from '../utils/traveller.utils';
import { isHandBag, bagageDescLabel } from '../utils/products.utils';
import { getStorageData } from '@app/general/utils/storage.utils';
import { UniversalStorageService } from '@app/general/services/universal-storage.service';
import { ApiService } from '../../general/services/api/api.service';

@Component({
  selector: 'app-add-check-in-baggage',
  templateUrl: './add-check-in-baggage.component.html',
  styleUrls: ['./add-check-in-baggage.component.scss'],
})
export class AddCheckInBaggageComponent implements OnInit {
  pricedResult_data: any = null;
  @Input() travellerList: any;
  adultBaggage: any = [];
  childBaggage: any = [];
  allBaggage: any = [];
  totalBaggageData: any = [];
  baggageAssignedPaxList: any = [];
  flightsResultsResponse: any;
  isOutBoundbaggageAvl = false;
  isInBoundbaggageAvl = false;
  country: string;

  @Output() BaggageAmount: EventEmitter<any> = new EventEmitter(null);
  constructor(private bookingService: BookingService, apiService: ApiService, private storage: UniversalStorageService) {
    this.country = apiService.extractCountryFromDomain();
  }

  ngOnInit(): void {
    this.flightsResultsResponse = JSON.parse(getStorageData('flightResults'));
    this.pricedResult_data = JSON.parse(this.storage.getItem('priceData', 'session'));
    if (
      this.storage.getItem('baggageInfo', 'session') &&
      JSON.parse(this.storage.getItem('baggageInfo', 'session'))?.checkInBaggageData?.length > 0
    ) {
      this.baggageAssignedPaxList = JSON.parse(this.storage.getItem('baggageInfo', 'session'))?.checkInBaggageData;
      this.getbaggageVal();
    } else {
      this.getBaggageData();
      this.getPaxData();
    }
    setTimeout(() => {
      this.assignPaxNames(this.travellerList);
    }, 1500);
    this.bookingService.currentTravellersDataInfo.subscribe((data: any) => {
      if (data?.travellersList?.length > 0) {
        this.assignPaxNames(data?.travellersList);
      }
    });
    this.updateTotalBaggageData();
  }
  /**To extract Individual baggage from API response based on paxType */
  getBaggageData() {
    if (this.pricedResult_data?.baggageOptions?.allBaggage?.length !== 0) {
      this.pricedResult_data.baggageOptions.allBaggage.forEach((x: any, index: number) => {
        if (x?.paxType === 'ADT') {
          this.adultBaggage.push(x);
        } else if (x?.paxType === 'CHD') {
          this.childBaggage.push(x);
        } else {
          this.allBaggage.push(x);
        }
      });
    }
  }
  /**To Assign  baggage to pax based on pax type  */
  assignBaggageToPax(paxType: string, index: number) {
    if (this.adultBaggage.length > 0 && (paxType === 'ADULT' || paxType === 'YOUNGADULT')) {
      this.assignBaggage(this.getUpdatebag(this.adultBaggage, index), index);
    } else if (this.childBaggage.length > 0 && paxType === 'CHILD') {
      this.assignBaggage(this.getUpdatebag(this.childBaggage, index), index);
    } else {
      this.assignBaggage(this.getUpdatebag(this.allBaggage, index), index);
    }
  }
  assignBaggage(baggage: any, paxIndex: number) {
    let newBag = {
      paxId: paxIndex,
      paxName: 'Passenger' + paxIndex,
      baggageData: baggage,
    };
    this.baggageAssignedPaxList.push(newBag);
  }
  public getCityName(param: string) {
    return getCitiesNames(param, this.flightsResultsResponse.airportInfos);
  }
  selectedBaggage(mainIndex: number, paxIndex: number, bagIndex: number, event: any) {
    this.totalBaggageData[mainIndex].baggageValue[paxIndex].baggageData[bagIndex].preSelected = event;
    this.getbaggageVal();
  }
  /**To update passenger name with traveller form value */
  assignPaxNames(travellerList: any) {
    if (travellerList?.length > 0 && this.baggageAssignedPaxList.length > 0) {
      travellerList.forEach((x: any, index: number) => {
        if (this.baggageAssignedPaxList[index] && x.firstName !== '' && x.lastName !== '') {
          this.baggageAssignedPaxList[index].paxName = x.firstName + ' ' + x.lastName;
        } else if (this.baggageAssignedPaxList[index] && (x.firstName === '' || x.lastName === '')) {
          this.baggageAssignedPaxList[index].paxName = 'Passenger' + (index + 1);
        }
      });
    }
  }
  /**To get selected baggage amount and pass to fare Info */
  getbaggageVal() {
    let baggageFee = getBaggageFee(this.baggageAssignedPaxList);
    this.bookingService.changeBaggage(baggageFee);
    this.BaggageAmount.emit(baggageFee);
  }
  /**To get pax details from traveller component and set baggage data */
  getPaxData() {
    let travellers = this.pricedResult_data?.travellers;
    let travellerData: any = [];
    if (travellers) {
      if (travellers.adults !== 0) {
        for (let m = 1; m <= travellers.adults; m++) {
          travellerData.push(this.getpax('ADULT', m));
        }
      }
      if (travellers.youngAdults !== 0) {
        for (let m = 1; m <= travellers.youngAdults; m++) {
          travellerData.push(this.getpax('YOUNGADULT', m));
        }
      }
      if (travellers.children !== 0) {
        for (let j = 1; j <= travellers.children; j++) {
          travellerData.push(this.getpax('CHILD', j));
        }
      }
      if (travellers.infants !== 0) {
        for (let k = 1; k <= travellers.infants; k++) {
          travellerData.push(this.getpax('INFANT', k));
        }
      }
      if (travellerData.length > 0) {
        this.baggageAssignedPaxList = [];
        travellerData.forEach((x: any, index: number) => {
          if (x.paxType != 'INFANT') {
            this.assignBaggageToPax(x.paxType, index + 1);
          }
        });
      }
    }
  }
  getpax(pax_Type: any, paxIndex: number) {
    let pax = {
      paxType: pax_Type,
      paxId: paxIndex,
    };
    return pax;
  }
  /**update each baggage with pax index    */
  getUpdatebag(baggage: any, index: number) {
    let bag: any = [];
    baggage.forEach((x: any) => {
      bag.push(this.getBaggage(x, index));
    });
    return bag;
  }
  /**To append extra param to baggage object */
  getBaggage(data: any, index: number) {
    let baggageData = {
      id: data.id,
      preSelected: data.preSelected,
      description: data.description,
      amount: data.amount,
      direction: data.direction,
      currencyCode: data.currencyCode,
      bagId: data.direction + index,
    };
    return baggageData;
  }
  /**To construct baggage data for inbound and outbound */
  updateTotalBaggageData() {
    this.isOutBoundbaggageAvl = this.pricedResult_data?.baggageOptions?.allBaggage?.some(
      (x: any) => x.direction == 'OUTBOUND'
    );
    this.isInBoundbaggageAvl = this.pricedResult_data?.baggageOptions?.allBaggage?.some(
      (x: any) => x.direction == 'INBOUND'
    );
    if (this.isOutBoundbaggageAvl) {
      this.totalBaggageData = [];
      this.totalBaggageData.push({
        itinDirection: 'OUTBOUND',
        baggageValue: this.baggageAssignedPaxList,
      });
    }
    if (this.isInBoundbaggageAvl) {
      this.totalBaggageData.push({
        itinDirection: 'INBOUND',
        baggageValue: this.baggageAssignedPaxList,
      });
    }
  }
  handBag(bag: any) {
    return isHandBag(bag);
  }
  bagageDesc(bag: any) {
    return bagageDescLabel(bag);
  }
}
