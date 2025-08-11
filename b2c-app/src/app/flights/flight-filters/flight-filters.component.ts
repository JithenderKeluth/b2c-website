import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { groupBy, cloneDeep } from 'lodash';
import { AirlineModel } from './../models/airlineModel.model';
import { getCitiesNames } from '../utils/odo.utils';
import { shouldShowPerPersonPrice } from '../utils/search-data.utils';
import { FilterServiceService } from './../../flights/service/filter-service.service';
import { createUserVal } from './../models/UserValType';
import { SharedFlightService } from '../service/sharedFlight.service';
import { BookingService } from '@app/booking/services/booking.service';
import { responsiveService } from '@core/services/responsive.service';
import { getAirlineParam } from '../utils/search-results-itinerary.utils';
import { getStorageData } from '@app/general/utils/storage.utils';
import { ApiService } from '../../general/services/api/api.service';
import { UniversalStorageService } from '../../general/services/universal-storage.service';

@Component({
  selector: 'app-flight-filters',
  templateUrl: './flight-filters.component.html',
  styleUrls: ['./flight-filters.component.scss'],
})
export class FlightFiltersComponent implements OnInit {
  /* for price range slider */
  public _minPrice: number = 0;
  public _maxPrice: number = 1440;

  public dptSelect: any = [];
  public flightsearchInfo: any;

  public _numStops: any;
  public _airLineList: any;
  public _arrNumStop: any;
  public checkedBaggageList: any = [];
  public noBaggageList: any = [];
  public handBaggageList: any = [];

  public currency_Code: string = 'ZAR';
  public noOfRes: number = 0;
  public flightsfilterResults: any = [];
  public stopModelList: any = [];

  public UserVal: any;
  public outBoundUserVal: any;
  public inBoundUserVal: any;

  inboundItineraries: any = [];
  outboundItineraries: any = [];

  public _cabinClass: any;
  public flightsearchResponse: any;
  public maxAirlines: number = 5;
  public searchText: string = '';
  public isDomesticFlights = false;
  public onwardItinLength: number = 0;
  public returnItinLength: number = 0;
  public dept_selected: any;

  public selectedTimeSegmentIdx: number = 0;
  is_Filters_Selected: boolean = false;
  public is_deptSelected: boolean;
  doFilterResults: any = [];
  flightSearchData: any;
  alineAmountArray: any = [];
  outBoundAirlineCodes: any = [];
  inBoundAirlineCodes: any = [];

  @Output() filterEvent = new EventEmitter<string>();
  @Output() noFiltersRes: EventEmitter<boolean> = new EventEmitter();
  @Output() isFiltersSelected: EventEmitter<boolean> = new EventEmitter();
  showJourneyAirline: string = 'onWard';
  showTabContent = false;
  showBaggageChecked = false;
  public deepLinkParams: any;
  public filteredFlights: any;
  country: string;
  selectedFilterOption: string = 'airline';

  constructor(
    private filterServiceService: FilterServiceService,
    private sharedFlightService: SharedFlightService,
    private bookingService: BookingService,
    public responsiveService: responsiveService,
    public apiService: ApiService,
    private storage: UniversalStorageService
  ) {
    this.country = apiService.extractCountryFromDomain();
  }

  ngOnInit() {
    this.showTabContent = false;
    this.flightsearchResponse = JSON.parse(getStorageData('flightResults'));
    this.flightSearchData = JSON.parse(this.storage.getItem('flightsearchInfo', 'session'));
    this.getSelecteDpt();
    this.initFilters(); // step1: initialize

    this.maxAirlines = this.flightsearchResponse?.airlineModelList;
    this.initData();
    this.show_HideAnimation();
    this.checkCurrentResetFilters();
    this.outBoundUserVal = cloneDeep(this.inBoundUserVal);
  }

  // Method to update flight results data
  updateData(newData: any) {
    this.filterServiceService.setFlightData(newData);
  }

  // Step1: Initialize the filters
  initFilters() {
    this.UserVal = createUserVal(this._minPrice, this._maxPrice, this.dptSelect);
    this.outBoundUserVal = createUserVal(this._minPrice, this._maxPrice, this.dptSelect);
    this.inBoundUserVal = createUserVal(this._minPrice, this._maxPrice, this.dptSelect);
  }

  // ** step2: initialize the filter labels */
  public initData(): void {
    if (this.flightsearchResponse) {
      if (
        this.flightsearchResponse?.outboundItineraries?.length > 0 &&
        this.flightsearchResponse?.inboundItineraries?.length > 0
      ) {
        // initialize the domestic flights
        this.outboundItineraries = this.flightsearchResponse.outboundItineraries;
        this.inboundItineraries = this.flightsearchResponse.inboundItineraries;

        this.outBoundAirlineCodes = this.extractAirlineCodes(this.outboundItineraries);
        this.inBoundAirlineCodes = this.extractAirlineCodes(this.inboundItineraries);

        this.flightsfilterResults = this.flightsearchResponse.outboundItineraries.concat(
          this.flightsearchResponse.inboundItineraries
        );
        if (
          this.flightsearchResponse.outboundItineraries.length &&
          this.flightsearchResponse.inboundItineraries.length
        ) {
          this.noOfRes = this.flightsearchResponse.outboundItineraries.length;
        }
        this.onwardItinLength = this.flightsearchResponse.outboundItineraries.length;
        this.returnItinLength = this.flightsearchResponse.inboundItineraries.length;
        this.currency_Code = this.flightsearchResponse.outboundItineraries[0].currencyCode;
        this.isDomesticFlights = true;
      } else if (this.flightsearchResponse.itineraries?.length > 0) {
        this.flightsfilterResults = this.flightsearchResponse.itineraries;
        this.currency_Code = this.flightsearchResponse.itineraries[0].currencyCode;
        this.isDomesticFlights = false;
        this.noOfRes = this.flightsearchResponse.itineraries.length;
      }
      this.getBaggageInfos(this.flightsearchResponse);
    }

    this._maxPrice = 0;
    this._minPrice = 0;
    this._numStops = 0;
    this._airLineList = [];
    this._cabinClass = [];
    const _custStops = [];
    const groupByStops = [];

    // Loops flight data, and get Max number of stops, air line lists.
    for (let i = 0; i < this.flightsfilterResults.length; i++) {
      const result = this.flightsfilterResults[i];
      this._maxPrice = this.finder(Math.max, this.flightsfilterResults, 'amount');
      this._minPrice = this.finder(Math.min, this.flightsfilterResults, 'amount');
      this.UserVal.priceLow = this._minPrice;
      this.UserVal.priceHigh = this._maxPrice;

      for (let j = 0; j < result.odoList.length; j++) {
        const segment = result.odoList[j];

        this._numStops = Math.max(this._numStops, segment.segments.length - 1);

        for (let k = 0; k < segment.segments.length; k++) {
          const segLegs = segment.segments[k];

          if (this._airLineList.indexOf(segLegs.airlineCode) === -1) {
            if (this.UserVal.airLine === '') this.UserVal.airLine = segLegs.airlineCode;
            this._airLineList.push(segLegs.airlineCode);
          }

          if (this._cabinClass.indexOf(segLegs.cabinClass) === -1) {
            if (this.UserVal.airLine === '') this.UserVal.cabinClass = segLegs.cabinClass;
            this._cabinClass.push(segLegs.cabinClass);
          }
        }
      }
    }

    this._arrNumStop = [];
    for (let i = 1; i < this._numStops + 1; i++) this._arrNumStop.push(i);
    for (let i = 0; i < this._airLineList; i++) this.UserVal.airLine[this._airLineList[i]] = false;
    for (let i = 0; i < this._cabinClass; i++) this.UserVal.cabinClass[this._cabinClass[i]] = false;

    this.getFlightsCount();
    this.getQueryString();
  }

  isValidAirline(journeyType: string, airlineCode: string): boolean {
    const airlineCodes = journeyType === 'onWard' ? this.outBoundAirlineCodes : this.inBoundAirlineCodes;
    return airlineCodes.includes(airlineCode);
  }

  extractAirlineCodes(flights: any[]): string[] {
    const airlineCodesSet = new Set<string>();
    flights.forEach((flight) => {
      flight.odoList.forEach((odo: any) => {
        odo.segments.forEach((segment: any) => {
          airlineCodesSet.add(segment.airlineCode);
        });
      });
    });

    return Array.from(airlineCodesSet);
  }

  // step3: this method gives the airline list and the stops list and their count
  private getFlightsCount() {
    const airlineModelList = [];
    this.stopModelList = [];
    const _SRPResponseController = [];
    const totalStopsList = [];
    let _numstops = 0;

    const i = 0;
    for (let iti in this.flightsfilterResults) {
      const flightResult = this.flightsfilterResults[iti];
      const discountVal = Math.floor(flightResult?.fareBreakdown?.discountAmount);
      for (let j = 0; j < flightResult.odoList.length; j++) {
        const segment = flightResult.odoList[j];

        let airlineModel = new AirlineModel();
        let airlinePrice: number = 0;
        if (shouldShowPerPersonPrice(this.flightSearchData)) {
          airlinePrice = flightResult.ppsAmount;
        } else {
          airlinePrice = flightResult.amount;
        }
        airlineModel.id = flightResult.id;

        if (this.apiService.extractCountryFromDomain() == 'MM') {
          
          airlineModel.amount = airlinePrice - discountVal;
        } else {
          airlineModel.amount = airlinePrice;
        }

        const airlineInfos = this.flightsearchResponse.airlineInfos;
        airlineModel.airlineCode = segment.segments[0].airlineCode; // Update to consider all segments
        airlineModel.currencycode = flightResult.currencyCode;
        const stop = segment.segments.length - 1;
        const stopsObj = {
          stops: stop,
          amount: flightResult.amount,
          ppsAmount: flightResult.ppsAmount,
          currencycode: flightResult.currencyCode,
        };
        totalStopsList.push(stopsObj);
        for (let airlineName in airlineInfos) {
          if (segment.segments[0].airlineCode === airlineInfos[airlineName].code) {
            airlineModel.flightsCount = i;
            airlineModel.airlineName = airlineInfos[airlineName].name;
            break;
          }
        }
        airlineModelList.push(airlineModel);
      }
    }

    const stopsMap = groupBy(totalStopsList, 'stops');

    for (let i = 0; i < Object.keys(stopsMap).length; i++) {
      const firstRoundLoop = Object.keys(stopsMap)[i];
      stopsMap[Object.keys(stopsMap)[i]].sort((a, b) => a.amount - b.amount);

      const stopModel = {
        stops: 0,
        amount: 0,
        currencycode: 0,
        flightsCount: 0,
      };

      for (let j = 0; j < firstRoundLoop.length; j++) {
        let stopsPrice: number = 0;
        if (shouldShowPerPersonPrice(this.flightSearchData)) {
          stopsPrice = stopsMap[Object.keys(stopsMap)[i]][j].ppsAmount;
        } else {
          stopsPrice = stopsMap[Object.keys(stopsMap)[i]][j].amount;
        }
        stopModel.stops = stopsMap[Object.keys(stopsMap)[i]][j].stops;
        stopModel.amount = stopsPrice;
        stopModel.currencycode = stopsMap[Object.keys(stopsMap)[i]][j].currencycode;
        stopModel.flightsCount = stopsMap[Object.keys(stopsMap)[i]].length;
      }
      this.stopModelList.push(stopModel);
    }

    const amountMap = groupBy(airlineModelList, 'airlineCode');
    let alineModelList = [];
    for (let i = 0; i < Object.keys(amountMap).length; i++) {
      const firstRoundLoop = Object.keys(amountMap)[i];
      this.alineAmountArray = [];

      amountMap[Object.keys(amountMap)[i]].sort((a, b) => a.amount - b.amount);

      const almodel = {
        airlineCode: '',
        id: 0,
        amount: 0,
        currencycode: 0,
        airlineName: '',
        flightsCount: 0,
      };

      for (let j = 0; j < firstRoundLoop.length; j++) {
        if (amountMap[Object.keys(amountMap)[i]][j]) {
          almodel.airlineCode = amountMap[Object.keys(amountMap)[i]][j].airlineCode;
          almodel.id = amountMap[Object.keys(amountMap)[i]][j].id;
          almodel.amount = this.getAlineAmount(amountMap[Object.keys(amountMap)[i]][j]);
          almodel.currencycode = amountMap[Object.keys(amountMap)[i]][j].currencycode;
          almodel.airlineName = amountMap[Object.keys(amountMap)[i]][j].airlineName;
          almodel.flightsCount = amountMap[Object.keys(amountMap)[i]].length;
        }
      }
      alineModelList.push(almodel);
    }
    if (this.flightsearchResponse) {
      this.flightsearchResponse.airlineModelList = alineModelList.sort((a: any, b: any) => a.amount - b.amount);
      const newMap = groupBy(this.flightsfilterResults, 'amount');
      this.flightsearchResponse.itineraryMap = newMap;
      _SRPResponseController.push(this.flightsearchResponse);
    }
  }

  // initialize the baggage list
  getBaggageInfos(flightsearchResponse: any) {
    const withNoBaggage = flightsearchResponse.baggageAllowanceInfos.filter(
      (info: any) => info.type === 'CHECKED' && info.description === 'No baggage allowance'
    );
    const withBaggage = flightsearchResponse.baggageAllowanceInfos.filter(
      (info: any) => info.type === 'CHECKED' && info.description !== 'No baggage allowance'
    );
    this.noBaggageList = this.removeDuplicateBags(withNoBaggage);
    this.checkedBaggageList = this.removeDuplicateBags(withBaggage);
  }

  // remove duplicates from baggage list
  removeDuplicateBags(bagsList: any) {
    // Step 1: Extract all correspondingSegmentIdList arrays
    const segmentIdLists = bagsList.map((info: any) => info.correspondingSegmentIdList);

    // Step 2: Flatten the arrays into a single array
    const combinedSegmentIdList = [].concat(...segmentIdLists);

    // Step 3: Remove duplicates by creating a Set and converting it back to an array
    const uniqueSegmentIds = Array.from(new Set(combinedSegmentIdList));

    return combinedSegmentIdList;
  }

  // main method to apply the filters
  public onDoFilter(direc?: string) {
    let UserVal: any = {};
    if (direc === 'inBound') {
      UserVal = this.inBoundUserVal;
    } else if (direc === 'outBound') {
      UserVal = this.outBoundUserVal;
    } else if (direc === 'bndFlights') {
      UserVal = this.UserVal;
    }
    let idx = this.selectedTimeSegmentIdx;
    const filterResult: any = [];
    const stop = Number(UserVal.stop);
    let stopList = [];
    let airLineList = [];
    let cabinClassList = [];

    // Checks what stops are checked.
    const stps = Object.keys(UserVal.stop);
    for (let i = 0; i < stps.length; i++) {
      if (!UserVal.stop[stps[i]]) continue;
      this.is_Filters_Selected = true;
      stopList.push(stps[i]);
    }
    // Checks what air lines are checked.
    const keys = Object.keys(UserVal.airLine);
    for (let i = 0; i < keys.length; i++) {
      if (!UserVal.airLine[keys[i]]) continue;
      airLineList.push(keys[i]);
      this.is_Filters_Selected = true;
    }

    // Checks what cabin class are checked.
    const cabinClasskeys = Object.keys(UserVal.cabinClass);
    for (let i = 0; i < cabinClasskeys.length; i++) {
      if (!UserVal.cabinClass[cabinClasskeys[i]]) continue;
      cabinClassList.push(cabinClasskeys[i]);
      this.is_Filters_Selected = true;
    }

    // if none of them is checked, whole air line list will be regarded as checked.
    if (stopList.length === 0) {
      stopList = this._arrNumStop;
    }

    if (airLineList.length === 0) {
      airLineList = this._airLineList;
    }

    if (cabinClassList.length === 0) {
      cabinClassList = this._cabinClass;
    }

    // assign the flights to be filterd here
    let flightsToBeParsed = [];

    if (direc === 'inBound') {
      flightsToBeParsed = this.flightsearchResponse.inboundItineraries;
    } else if (direc === 'outBound') {
      flightsToBeParsed = this.flightsearchResponse.outboundItineraries;
    } else if (direc === 'bndFlights') {
      flightsToBeParsed = this.flightsearchResponse.itineraries;
    }

    this.is_deptSelected = UserVal.dptSelects.some(
      (x: any) => x.d_earlyMorning == true || x.d_morning == true || x.d_afternoon == true || x.d_evening == true
    );

    // For filters
    for (let i = 0; i < flightsToBeParsed.length; i++) {
      const result = flightsToBeParsed[i];

      // Check itinerary price
      // let priceStr = result.amount;
      // if (priceStr < UserVal.priceLow || priceStr > UserVal.priceHigh) continue;

      const odoList_Array = [];
      let tempCarrierVar = false; //added needs to be verified
      let tempClassVar = false;
      const tempStopVar = false;
      // Depart time filters begins here
      if (this.is_deptSelected) {
        this.is_Filters_Selected = true;
        const isValidDepartTime: boolean = this.validateTimeFilters(UserVal, result);
        if (isValidDepartTime) {
          continue;
        }
      }
      for (let j = 0; j < result.odoList.length; j++) {
        const odoList = result.odoList[j]; // flight data

        if (!this.checkStopsByFilter(UserVal, result)) {
          continue;
        }
        odoList_Array.push(odoList);
        const segment_Array = [];

        for (let k = 0; k < odoList.segments.length; k++) {
          const segment = odoList.segments[k];
          segment_Array.push(segment);

          if (airLineList.indexOf(odoList.segments[0].airlineCode) >= 0) {
            if (!tempCarrierVar) {
              tempCarrierVar = true;
            } else {
              continue;
            }
          }

          // added lines of code to remove the duplicate records of cabin class specific
          if (airLineList.indexOf(segment.cabinClass) >= 0) {
            if (!tempClassVar) {
              tempClassVar = true;
            } else {
              continue;
            }
          }

          // Check AirLine
          if (airLineList.indexOf(odoList.segments[0].airlineCode) === -1) continue;

          // Check cabin class
          if (cabinClassList.indexOf(segment.cabinClass) === -1) continue;

          // baggage Filters
          /**for domestic filter we are reverse the name in html file */
          if (UserVal.checkedBaggage && UserVal.noCheckedBaggage) {
            this.is_Filters_Selected = true;
            const idExists = this.checkedBaggageList.includes(segment.ID) || this.noBaggageList.includes(segment.ID);
            if (!idExists) {
              continue;
            }
          } else if (UserVal.checkedBaggage && !UserVal.noCheckedBaggage) {
            const idExists = this.checkedBaggageList.includes(segment.ID);
            this.is_Filters_Selected = true;
            if ((!idExists && direc == 'bndFlights') || (idExists && direc !== 'bndFlights')) {
              continue;
            }
          } else if (UserVal.noCheckedBaggage && !UserVal.checkedBaggage) {
            const idExists1 = this.noBaggageList.includes(segment.ID);
            this.is_Filters_Selected = true;
            if ((!idExists1 && direc == 'bndFlights') || (idExists1 && direc !== 'bndFlights')) {
              continue;
            }
          }

          filterResult.push(result);
        }
      }
    }
    if (flightsToBeParsed) {
      //  flightsResponse      flightsToBeParsed
      return filterResult;
    } else {
      this.noOfRes = filterResult.length;
      this.doFilterResults = [];
      this.doFilterResults = filterResult;
    }
  }

  checkStopsByFilter(UserVal: any, result: any) {
    const stop0 = UserVal.stop['0'];
    const stop1 = UserVal.stop['1'];
    const stop2 = UserVal.stop['2'];
    let isValidstopfilter = true;
    if ((stop0 && stop1 && stop2) || (!stop0 && !stop1 && !stop2)) {
      isValidstopfilter = result.odoList.every((odoList: any) => odoList.segments.length <= 5);
    } else if (stop0 && !stop1 && !stop2) {
      isValidstopfilter = result.odoList.every((odoList: any) => odoList.segments.length === 1);
    } else if (!stop0 && stop1 && stop2) {
      isValidstopfilter = result.odoList.every((odoList: any) => odoList.segments.length > 1);
    } else if (!stop0 && stop1 && !stop2) {
      isValidstopfilter = result.odoList.every((odoList: any) => odoList.segments.length === 2);
    } else if (stop0 && !stop1 && stop2) {
      isValidstopfilter = result.odoList.every(
        (odoList: any) => odoList.segments.length === 1 || odoList.segments.length > 2
      );
    } else if (stop0 && (stop1 || stop2)) {
      isValidstopfilter = result.odoList.every((odoList: any) => odoList.segments.length <= 2);
    } else if (!stop0 && !stop1 && stop2) {
      isValidstopfilter = result.odoList.every((odoList: any) => odoList.segments.length > 2);
    }
    return isValidstopfilter;
  }

  validateTimeFilters(UserVal: any, result: any) {
    let listOdoList = [];
    let userSelectionInfo: any = [];
    const resultData = result;
    /**here we are consider selected time filter index values */
    UserVal.dptSelects.forEach((x: any, index: number) => {
      let isDptSelected = Object.values(x).some((val) => val === true);
      if (isDptSelected) {
        userSelectionInfo.push(index);
      }
    });
    /**here we are consider filter odolist in itinerary based on selected time filter index and get depature time for first segemnt of odolist  */
    for (let m of userSelectionInfo) {
      const odoList = resultData?.odoList[m];
      const dptSelects = UserVal.dptSelects[m];
      const departTime = this.getDepartureTime(odoList, m);
      let isValidTime: any = false;
      const timeRanges = [
        { range: [0, 360], selections: [dptSelects.d_earlyMorning] },
        { range: [360, 720], selections: [dptSelects.d_morning] },
        { range: [720, 1080], selections: [dptSelects.d_afternoon] },
        { range: [1080, 1440], selections: [dptSelects.d_evening] },
        { range: [0, 720], selections: [dptSelects.d_earlyMorning, dptSelects.d_morning] },
        { range: [0, 1080], selections: [dptSelects.d_earlyMorning, dptSelects.d_morning, dptSelects.d_afternoon] },
        {
          range: [0, 1440],
          selections: [dptSelects.d_earlyMorning, dptSelects.d_morning, dptSelects.d_afternoon, dptSelects.d_evening],
        },
        { range: [360, 1080], selections: [dptSelects.d_morning, dptSelects.d_afternoon] },
        { range: [1080, 1440], selections: [dptSelects.d_afternoon, dptSelects.d_evening] },
        { range: [720, 1440], selections: [dptSelects.d_morning, dptSelects.d_afternoon, dptSelects.d_evening] },
        {
          range: [0, 0],
          selections: [dptSelects.d_earlyMorning, dptSelects.d_morning, dptSelects.d_afternoon, dptSelects.d_evening],
        },
      ];
      isValidTime = timeRanges.some(
        (range) =>
          departTime >= range.range[0] &&
          departTime <= range.range[1] &&
          range.selections.every((selection) => selection)
      );
      listOdoList.push(isValidTime);
    }
    /**here we can remove if above filter logic is working fine
     *     for (let k = 0; k < result.odoList.length; k++) {
      const odoList = result.odoList[k];
      const dptSelects = UserVal.dptSelects[k];
      const departTime = this.getDepartureTime(odoList, k);
      const timeRanges = [
        { range: [0, 360], selections: [dptSelects.d_earlyMorning] },
        { range: [360, 720], selections: [dptSelects.d_morning] },
        { range: [720, 1080], selections: [dptSelects.d_afternoon] },
        { range: [1080, 1440], selections: [dptSelects.d_evening] },
        { range: [0, 720], selections: [dptSelects.d_earlyMorning, dptSelects.d_morning] },
        { range: [0, 1080], selections: [dptSelects.d_earlyMorning, dptSelects.d_morning, dptSelects.d_afternoon] },
        {
          range: [0, 1440],
          selections: [dptSelects.d_earlyMorning, dptSelects.d_morning, dptSelects.d_afternoon, dptSelects.d_evening],
        },
        { range: [360, 1080], selections: [dptSelects.d_morning, dptSelects.d_afternoon] },
        { range: [1080, 1440], selections: [dptSelects.d_afternoon, dptSelects.d_evening] },
        { range: [720, 1440], selections: [dptSelects.d_morning, dptSelects.d_afternoon, dptSelects.d_evening] },
        {
          range: [0, 0],
          selections: [dptSelects.d_earlyMorning, dptSelects.d_morning, dptSelects.d_afternoon, dptSelects.d_evening],
        },
      ];

      const isValidTime = timeRanges.some(
        (range) =>
          departTime >= range.range[0] &&
          departTime <= range.range[1] &&
          range.selections.every((selection) => selection)
      );

      if (!isValidTime) {
        listOdoList.push(odoList);
        continue;
      } else {
        break;
      }
    }
    return result.odoList.length === listOdoList.length ? true : false;
     */
    /**here we are consider All odolists are satisfied with selected time filters or not in itinerary  */
    let isValid_OdoList = listOdoList.every((v: any) => v === true);
    return !isValid_OdoList;
  }

  getDepartureTime(result: any, idx: number): number {
    return this.calculateDepartureTime(result?.segments[0]?.departureDateTime);
  }

  calculateDepartureTime(dateTime: string): number {
    const departTimeStr = new Date(dateTime).toTimeString();
    const arr = departTimeStr.split(':');
    return Number(arr[0]) * 60 + Number(arr[1]);
  }

  applyFilters(param: any) {
    this.hideShowTab();
  }

  public parseDptTime(t0: string, t1: string, t2: string, idx: number, direc: string): void {
    this.dept_selected = t0;
    // departLow
    const deptL = t1.split(':');
    const departLow = Number(deptL[0]) * 60 + Number(deptL[1]);

    // departHigh
    const deptH = t2.split(':');
    const departHigh = Number(deptH[0]) * 60 + Number(deptH[1]);

    if (direc === 'inBound') {
      this.inBoundUserVal.departLow = departLow;
      this.inBoundUserVal.departHigh = departHigh;
    } else if (direc === 'outBound') {
      this.outBoundUserVal.departLow = departLow;
      this.outBoundUserVal.departHigh = departHigh;
    } else if (direc === 'bndFlights') {
      this.UserVal.departLow = departLow;
      this.UserVal.departHigh = departHigh;
    }
    this.selectedTimeSegmentIdx = idx;
    this.startPushFilter(this, direc);
  }

  public toggleDisplayDiv(param: string): void {
    this.hideShowTab();
  }

  public resetAllFilters() {
    this.hideShowTab();
    this.is_Filters_Selected = false;
    this.getSelecteDpt();
    this.initFilters();
    if (this.isDomesticFlights) {
      this.startPushFilter(this, 'inBound');
      this.startPushFilter(this, 'outBound');
    } else {
      this.startPushFilter(this, 'bndFlights');
    }
  }

  public startPushFilter(param1: any, param2?: string): void {
    this.is_Filters_Selected = false;
    let filteredData: any;
    if (param2 === 'inBound') {
      this.inboundItineraries = this.onDoFilter(param2);
      filteredData = {
        outboundItineraries: this.outboundItineraries,
        inboundItineraries: this.inboundItineraries,
      };
      this.returnItinLength = this.inboundItineraries.length;
      this.filterEvent.emit(filteredData);
    } else if (param2 === 'outBound') {
      this.outboundItineraries = this.onDoFilter(param2);
      filteredData = {
        outboundItineraries: this.outboundItineraries,
        inboundItineraries: this.inboundItineraries,
      };
      this.onwardItinLength = this.outboundItineraries.length;
      this.filterEvent.emit(filteredData);
    } else if (param2 === 'bndFlights') {
      filteredData = this.onDoFilter(param2);
      this.noOfRes = filteredData.length;
      this.filterEvent.emit(filteredData);
    }
    if (filteredData?.inboundItineraries?.length == 0 || filteredData?.outboundItineraries?.length == 0) {
      this.noOfRes = 0;
    }
    this.isFiltersSelected.emit(this.is_Filters_Selected);
    if (!this.noOfRes) {
      this.noFiltersRes.emit(true);
    } else {
      this.noFiltersRes.emit(false);
    }
    this.filteredFlights = filteredData;
  }

  updateAnotherBaggage(param: any, userValue: any) {
    if (param == 'checkedBaggage') {
      userValue.noCheckedBaggage = false;
    } else if (param == 'nocheckedBaggage') {
      userValue.checkedBaggage = false;
    }
  }
  public getStop(num: number) {
    if (num === 0) {
      return this.country === 'SB' ? 'Direct' : 'Non Stop';
    } else if (num === 1) {
      return 'Stop';
    } else if (num > 1) {
      return 'Stops';
    }
  }

  public isActive(item: string) {
    // return this.selectedFilter === item;
  }

  showMoreAirlines(airlinesList: any) {
    // this.maxAirlines =  airlinesList;
  }

  public getCityName(param: string) {
    return getCitiesNames(param, this.flightsearchResponse.airportInfos);
  }

  hideAirlines() {
    this.maxAirlines = 5;
  }

  public getSelecteDpt() {
    this.dptSelect = [];
    if (
      this.flightsearchResponse &&
      this.flightsearchResponse.itineraries &&
      this.flightsearchResponse.itineraries[0]
    ) {
      for (let i = 0; i < this.flightsearchResponse.itineraries[0].odoList.length; i++) {
        let obj = { d_earlyMorning: false, d_morning: false, d_afternoon: false, d_evening: false };
        this.dptSelect.push(obj);
      }
    } else if (
      this.flightsearchResponse &&
      this.flightsearchResponse.outboundItineraries &&
      this.flightsearchResponse.outboundItineraries[0]
    ) {
      for (let i = 0; i < this.flightsearchResponse.outboundItineraries[0].odoList.length; i++) {
        let obj = { d_earlyMorning: false, d_morning: false, d_afternoon: false, d_evening: false };
        this.dptSelect.push(obj);
      }

      for (let i = 0; i < this.flightsearchResponse.inboundItineraries[0].odoList.length; i++) {
        let obj = { d_earlyMorning: false, d_morning: false, d_afternoon: false, d_evening: false };
        this.dptSelect.push(obj);
      }
    }
  }

  /*
   ** Supporting methods for filters section
   */
  private finder(cmp: any, arr: any, attr: string) {
    let val = arr[0][attr];
    for (let i = 1; i < arr.length; i++) {
      val = cmp(val, arr[i][attr]);
    }
    return val;
  }

  getAlineAmount(value: any) {
    if (value) {
      this.alineAmountArray.push(value);
      if (this.alineAmountArray.length > 1) {
        return this.alineAmountArray.reduce((a: any, b: any) => Math.min(a.amount, b.amount));
      } else {
        return this.alineAmountArray[0].amount;
      }
    }
  }
  showAirlines(journeyType: string) {
    this.showTabContent = true;
    this.showJourneyAirline = journeyType;
  }

  hideShowTab() {
    this.showTabContent = false;
  }

  show_HideAnimation() {
    this.sharedFlightService.showAnimation.subscribe((value: any) => {
      if (value?.itin_Type) {
        let itinType = value?.itin_Type == 'outBound' ? 'onWard' : 'return';
        this.showAirlines(itinType);
        // this.hideShowTab();
      }
    });
  }

  /**checks the airline in deep link and filters the results based on that airline*/
  getQueryString() {
    if (this.storage.getItem('queryStringParams', 'session')) {
      this.deepLinkParams = JSON.parse(this.storage.getItem('queryStringParams', 'session'));
      if (getAirlineParam() && this.deepLinkParams?.airline) {
        if (this.isDomesticFlights) {
          this.inBoundUserVal.airLine[this.deepLinkParams.airline] = true;
          this.startPushFilter(this, 'inBound');
          this.outBoundUserVal.airLine[this.deepLinkParams.airline] = true;
          this.startPushFilter(this, 'outBound');
          if (
            this.filteredFlights.inboundItineraries.length === 0 ||
            this.filteredFlights.outboundItineraries.length === 0
          ) {
            let selectedDomFlight = {
              inboundItineraries: this.flightsearchResponse?.inboundItineraries[0],
              outboundItineraries: this.flightsearchResponse?.outboundItineraries[0],
            };
            this.sharedFlightService.changeSelectedDomesticFlight(selectedDomFlight);
          }
        } else {
          this.UserVal.airLine[this.deepLinkParams.airline] = true;
          this.startPushFilter(this, 'bndFlights');
        }
      }
    }
  }

  checkCurrentResetFilters() {
    this.bookingService.currentresetFilters.subscribe((data: any) => {
      if (data) {
        this.resetAllFilters();
        this.noFiltersRes.emit(false);
      }
    });
  }
}
