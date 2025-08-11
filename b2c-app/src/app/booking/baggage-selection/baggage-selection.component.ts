import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { bagageDescLabel, baggageDesc, baggageItin, getCheckedBaggageValue, isCheckedbaggageAvl, isHandBag } from '../utils/products.utils';
import { getCitiesNames } from '@app/flights/utils/odo.utils';
import { getStorageData } from '@app/general/utils/storage.utils';
import { UniversalStorageService } from '@app/general/services/universal-storage.service';
import { ApiService } from '../../general/services/api/api.service';

@Component({
  selector: 'app-baggage-selection',
  templateUrl: './baggage-selection.component.html',
  styleUrls: ['./baggage-selection.component.scss'],
})
export class BaggageSelectionComponent implements OnInit {
  @Input() pricedResult_data: any;
  enableCheckedBaggage: boolean = false;
  isBaggageSelected: boolean = false;
  baggageItinerary: any = [];
  @Output() checkedBaggage: EventEmitter<any> = new EventEmitter<any>();
  flightsResultsResponse: any;
  country: string;

  constructor(apiService: ApiService, private storage: UniversalStorageService) { 
    this.country = apiService.extractCountryFromDomain();
  }

  ngOnInit(): void {
    this.flightsResultsResponse = JSON.parse(getStorageData('flightResults'));
    if (this.storage.getItem('baggageInfo', 'session')) {
      const baggageData = JSON.parse(this.storage.getItem('baggageInfo', 'session'));
      this.enableCheckedBaggage = baggageData.isEnable;
      this.isBaggageSelected = baggageData.isSelected;
      this.baggageItinerary = baggageData.baggageItin;
    } else {
      this.enableCheckedBaggage = this.isShowCheckedBaggage();
      this.getBaggageItin();
    }
  }
  /*
   *checks if the flights has checked baggage
   */
  isShowCheckedBaggage() {
    return isCheckedbaggageAvl(this.pricedResult_data);
  }

  selectCheckedBaggage(param: boolean) {
    this.checkedBaggage.emit(param);
    this.isBaggageSelected = param;
    let baggageData: any = null;
    if (this.storage.getItem('baggageInfo', 'session')) {
      baggageData = JSON.parse(this.storage.getItem('baggageInfo', 'session'));
      baggageData['isSelected'] = this.isBaggageSelected;
      baggageData['isEnable'] = this.enableCheckedBaggage;
      baggageData['baggageItin'] = this.baggageItinerary;
    } else {
      baggageData = {
        isSelected: this.isBaggageSelected,
        isEnable: this.enableCheckedBaggage,
        baggageItin: this.baggageItinerary,
        checkInBaggageData: [],
      };
    }
    this.storage.removeItem('baggageInfo', 'session');
    this.storage.setItem('baggageInfo', JSON.stringify(baggageData), 'session');
  }

  get priceData() {
    return this.pricedResult_data ? this.pricedResult_data : null;
  }

  /**here we are getting the baggage Itinerary */
  getBaggageItin() {
    let baggageData = baggageItin(this.priceData);
    if (baggageData.length > 1) {
      baggageData.forEach((data: any, index: number) => {
        let nextIndex = index + 1;
        if (
          baggageData[nextIndex] &&
          baggageData[index].odoList[baggageData[index].odoList.length - 1].segments[
            baggageData[index].odoList[baggageData[index].odoList.length - 1].segments.length - 1
          ].destCode == baggageData[nextIndex].odoList[0].segments[0].origCode
        ) {
          baggageData[index]['isReturn'] = true;
          baggageData.pop();
        }
      });
      this.baggageItinerary = baggageData;
    } else {
      this.baggageItinerary = baggageItin(this.priceData);
    }
  }
  public getCityName(param: string) {
    return getCitiesNames(param, this.flightsResultsResponse.airportInfos);
  }
  public baggageDes(bag: any) {
    return baggageDesc(bag);
  }
  handBag(bag: any) {
    return isHandBag(bag);
  }
  bagageDesc(bag: any) {
    return bagageDescLabel(bag);
  }
  getCheckedbaggageData() {
    return getCheckedBaggageValue(this.pricedResult_data);
  }
}
