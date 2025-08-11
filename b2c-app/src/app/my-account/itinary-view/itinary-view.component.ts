import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Odo } from '@app/flights/models/results/odo.model';
import { SearchResults } from '@app/flights/models/results/search-results.model';
import { SearchService } from '@app/flights/service/search.service';
import { getBaggageInfo, getCitiesNames, getTime } from '@app/flights/utils/odo.utils';
import { GetLapoverTime, getLayoverLabels } from '@app/flights/utils/search-results-itinerary.utils';
import { MyAccountServiceService } from '../my-account-service.service';
import { getStorageData } from '@app/general/utils/storage.utils';
import { modifyProduct_Desc } from '@app/payment/utils/payment-utils';
import { UniversalStorageService } from '@app/general/services/universal-storage.service';
import { ApiService } from '../../general/services/api/api.service';

@Component({
  selector: 'app-itinary-view',
  templateUrl: './itinary-view.component.html',
  styleUrls: ['./itinary-view.component.scss', './../../../theme/myAccount.scss'],
})
export class ItinaryViewComponent implements OnInit {
  public bookingInformation: any;
  public flightsResultsResponse: SearchResults;
  credentials: any;
  viewResultData: any;
  deptCity: any;
  arrCity: any;
  itineraryId: any;
  userAgent: any;
  query_recordId: any;
  tripType: any;
  queries: any = [];
  showBtn: boolean = false;
  queryBtn: any = [];
  showQry: any = [];
  qIds: any;
  selectIndex: number;
  todayDate = new Date();
  allTickets: any;
  ticketId = new Map<string, string>();
  flight_route = new Map<string, string>();
  loading: boolean = false;
  country: string;
  
  constructor(
    private router: ActivatedRoute,
    private myAccountService: MyAccountServiceService,
    private location: Location,
    private _snackBar: MatSnackBar,
    private route: Router,
    private searchService: SearchService,
    apiService: ApiService,
    private storage: UniversalStorageService
  ) {
    this.route.routeReuseStrategy.shouldReuseRoute = () => false;
    this.country = apiService.extractCountryFromDomain();
  }

  ngOnInit(): void {
    if (this.storage.getItem('credentials', 'session')) {
      this.credentials = JSON.parse(this.storage.getItem('credentials', 'session'));
    } else if (this.storage.getItem('credentials', 'local')) {
      this.credentials = JSON.parse(this.storage.getItem('credentials', 'local'));
    }
    this.router.queryParams.subscribe((x) => {
      this.itineraryId = x.Id;
      this.deptCity = x.dept_city;
      this.arrCity = x.arr_city;
      this.tripType = x.triptype;
      if (x.query_record) {
        this.query_recordId = x.query_record;
      } else {
        this.query_recordId = null;
      }
      if (JSON.parse(x.query).length != 0) {
        this.qIds = JSON.parse(x.query);
        this.getQueries(JSON.parse(x.query));
      }
    });
    this.searchService.langValue.subscribe((val: any) => {
      this.userAgent = this.myAccountService.countrydata;
    });
    this.getItinerary(this.itineraryId);
    this.bookingInformation = JSON.parse(this.storage.getItem('bookingDetails', 'session'));
    this.flightsResultsResponse = JSON.parse(getStorageData('flightResults'));
  }

  public getCityName(param: string) {
    return getCitiesNames(param, this.flightsResultsResponse.airportInfos);
  }

  public getLayoverTime(odo: Odo) {
    //return getDurationDays(odo) + ' days
    return GetLapoverTime(odo.bookingFlightSegmentList);
  }

  public getBaggage(id: number, param: string) {
    return getBaggageInfo(id, param, this.flightsResultsResponse.baggageAllowanceInfos);
  }
  public getBaggageDesc(baggageDescription: any) {
    if(this.country === 'ABSA' && this.isHandBaggage(baggageDescription)) {
      return baggageDescription.replace('hand baggage', '');
    }

    if (baggageDescription && this.isHandBaggage(baggageDescription)) {
      return baggageDescription.replace('h', 'H');
    } else {
      return baggageDescription;
    }
  }

  public isHandBaggage(baggageDescription: string): boolean {
    return baggageDescription.includes('hand baggage');
  }

  // formate time from minutes
  public getTimeInHours(ms: number) {
    let time = ms * 60000;
    return getTime(time);
  }
  getAllTickets() {
    this.myAccountService.getAllTicketsByEmail(this.credentials.data.contactInfo.email).subscribe((data: any) => {
      if (!data.code) {
        this.allTickets = data;
        this.qIds = [];
        this.allTickets.forEach((x: any) => {
          x['bookingRef'] = x.subject.split('- ')[1];
          this.ticketId.set(x.bookingRef, x.id);
          if (x.bookingRef == this.viewResultData.tccReference) {
            this.qIds.push(this.ticketId.get(x.bookingRef));
          }
        });
        if (this.qIds.length != 0) {
          this.getQueries(this.qIds);
        } else {
          this.getQueries(this.query_recordId);
        }
      }
    });
  }
  getItinerary(itineraryId: any) {

    const data = {
      userAgent: this.userAgent,
    };

    this.myAccountService.getItineraryData(itineraryId, data).subscribe((data: any) => {
      this.viewResultData = data?.data?.resultItinerary;
      this.viewResultData.airReservationList.forEach((itin: any) => {
        itin.originDestinationOptionsList.forEach((a: any) => {
          if (this.queryBtn.length == 0) {
            this.queryBtn.push({
              dept_city: a.bookingFlightSegmentList[0].departureAirport,
              arr_city: a.bookingFlightSegmentList[a.bookingFlightSegmentList.length - 1].arrivalAirport,
            });
          }

          a.bookingFlightSegmentList.forEach((x: any) => {
            this.flight_route.set(
              x.operatingAirlineCode + x.flightNumber,
              x.departureAirport + ' - ' + x.arrivalAirport
            );
          });
        });
      });

      this.getAllTickets();
    });
  }
  goToProfile() {
    this.location.back();
  }
   

  manageBookings(index: number, mainIndex: number) {
    this.route.navigate(['/my-account/manage-booking'], {
      queryParams: {
        Id: this.itineraryId,
        onlyView: 'manage',
        reference: this.viewResultData.tccReference,
        mainIndex: mainIndex,
        index: index,
        query: JSON.stringify(this.qIds),
      },
      queryParamsHandling: 'merge',
    });
  }
  queryRecord(index: number, mainIndex: number) {
    this.route.navigate(['/my-account/manage-booking'], {
      queryParams: {
        Id: this.itineraryId,
        onlyView: 'viewQuery',
        reference: this.viewResultData.tccReference,
        mainIndex: mainIndex,
        index: index,
        query: JSON.stringify(this.qIds),
      },
      queryParamsHandling: 'merge',
    });
  }
  getQueries(queryIds: any) {
    if (queryIds) {
      queryIds.forEach((x: any) => {
        this.myAccountService.getTicketInfoById(x).subscribe((data: any) => {
          if (!data.code) {
            this.queries.push(data);
          }
        });
      });
    }
  }
  getQueryBtn(dept_city: any, arr_city: any, index: number): any {
    const isPresent = this.queries.some(function (el: any) {
      return (
        el.description_text.includes(dept_city + ' to ' + arr_city) ||
        el.description_text.includes('I request to change details for the passengers')
      );
    });
    return isPresent;
  }
  get showBtns(): boolean {
    if (
      this.viewResultData.bookingStatus == 'Failed' ||
      this.viewResultData.bookingStatus == 'Cancelled' ||
      this.viewResultData.bookingStatus == 'Pending' ||
      (this.viewResultData.bookingStatus == 'Paid' && this.viewResultData.createdDateTime < this.todayDate)
    ) {
      return false;
    } else {
      return true;
    }
  }
  /**To resending the ticket to the user through email*/
  resendingEticket() {
    this.loading = true;
    let ticketData = {
      email: this.viewResultData.contactInfo.email,
      surname: this.viewResultData.contactInfo.personName.surname,
    };
    this.myAccountService.resendTicket(ticketData, this.viewResultData.tccReference).subscribe((data: any) => {
      if (!data.errors) {
        this._snackBar.open(data.statusMessage, '');
        this.loading = false;
        setTimeout(() => {
          this._snackBar.dismiss();
        }, 3000);
      }
    });
  }
  public getLayoverTxt(odo: Odo) {
    return getLayoverLabels(odo.bookingFlightSegmentList);
  }
  getMinusVal(amount: any) {
    return Math.abs(amount);
  }
  /**To change product decsription for voucher bcoz within the response we are get vochercode as well */
  productDesc(productDescription: any) {
    // return productDescription;
    return modifyProduct_Desc(productDescription);
  }
}
