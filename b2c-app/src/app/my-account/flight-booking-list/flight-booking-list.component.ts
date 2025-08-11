import { GoogleTagManagerServiceService } from '@app/_core/tracking/services/google-tag-manager-service.service';
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';
import { ApiService } from '@app/general/services/api/api.service';
import { responsiveService } from './../../_core/services/responsive.service';
import { Router } from '@angular/router';
import { SearchService } from '@app/flights/service/search.service';
import { NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { MyAccountServiceService } from '@app/my-account/my-account-service.service';
import { Component, ElementRef, OnInit, Renderer2,Inject, PLATFORM_ID } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { UniversalStorageService } from '@app/general/services/universal-storage.service';
import { LocationService } from '../../general/services/locations/location.service';
import { myAccountEventData } from '../utils/my-account.utils';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-flight-booking-list',
  templateUrl: './flight-booking-list.component.html',
  styleUrls: ['./flight-booking-list.component.scss','./../../../theme/data-table-customization.scss']
})
export class FlightBookingListComponent implements OnInit {
  public temp: any = [];
  rows: any = [];
  rowsData: any = [];
  credentials: any;
  selected: any = '';
  displayMonths = 1;
  navigation = 'select';
  showWeekNumbers = false;
  outsideDays = 'visible';
  placement = 'top-right';
  fromDate = new UntypedFormControl('');
  toDate = new UntypedFormControl('');
  searchAll = new UntypedFormControl('');
  minDate: any;
  maxDate: any;
  startDate: any;
  endDate: any;
  rowHeight: number = 65;
  filterVal: any = [];
  dateFilterData: any = [];
  noBookings: boolean = false;
  saveLocalStorage: boolean = false;
  currentDate = new Date();
  userAgent: any;
  allTickets: any = [];
  ticketCreated = new Map<string, string>();
  ticketId = new Map<string, string>();
  load: boolean = false;
  gotoQuery: boolean = false;
  qIds: any = [];
  qId: any;
  isMobile: boolean = false;
  tsCountry :any = null;
  selectedTab:any = null;
  isBrowser : boolean;
  locationCodeToCityNameMap = new Map<string, string>();
  constructor(
    private myAccountService: MyAccountServiceService,
    private ngbDateParserFormatter: NgbDateParserFormatter,
    private route: Router,
    private searchService: SearchService,
    public responsiveService: responsiveService,
    private renderer: Renderer2,
    private el: ElementRef,
    private apiService: ApiService,
    private storage: UniversalStorageService,
    private locationService: LocationService,
    private googleTagManagerService : GoogleTagManagerServiceService,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  ngOnInit(): void {
    this.tsCountry = this.apiService.extractCountryFromDomain();
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.selectSort('Upcoming');
    this.selectTab('Flights')
    let credentials = JSON.parse(this.storage.getItem('credentials', 'session'));
    this.userAgent = this.myAccountService.countrydata;
    if (this.storage.getItem('credentials', 'local')) {
      this.saveLocalStorage = true;
      this.credentials = JSON.parse(this.storage.getItem('credentials', 'local'));
    } else if (this.storage.getItem('credentials', 'session')) {
      this.saveLocalStorage = false;
      this.credentials = JSON.parse(this.storage.getItem('credentials', 'session'));
    }

    if (this.credentials && this.credentials.data) {
      this.searchService.langValue.subscribe((val: any) => {
        this.userAgent = this.myAccountService.countrydata;
      });
      this.getRecords();
      /** if we need to get all freshdesk tickets
       * this.getAllTickets();
       */
    }
    if (this.responsiveService.screenWidth == 'sm') {
      this.isMobile = true;
    } else {
      this.isMobile = false;
    }
    this.loadMeiliScript();
  }

  showColumn({ row, column, value }: { row: any; column: any; value: any }) {}

  updateFilter(val: any) {
    const value = val.toString().toLowerCase().trim();
    
    if (value.length > 3) {
      this.triggerSearchBookingEvent(value);
      this.rows = this.filterVal;
      const count = this.rows.length;
      // get the key names of each column in the dataset
      const keys = Object.keys(this.temp[0]);
      // assign filtered matches to the active datatable
      let data = this.temp?.filter((item: any) => {
        // iterate through each row's column data
        for (let i = 0; i < count; i++) {
          // check for a match
          if ((item[keys[i]] && item[keys[i]].toString().toLowerCase().indexOf(value) !== -1) || !value) {
            // found match, return true to add to result set
            return true;
          }
        }
      });
      //this.filterVal=data;
      this.rows = data;
    } else if (!value) {
      if (this.dateFilterData.length == 0) {
        this.rows = this.filterVal;
      } else if (this.dateFilterData.length != 0) {
        this.rows = this.dateFilterData;
      }
    }
    this.rowValue(this.rows);
    // get the amount of columns in the table
  }
  ngAfterViewInit() {
    this.fromDate.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        tap(() => {
          if (
            this.fromDate.value != null ||
            (this.fromDate.value != '' && this.toDate.value != null) ||
            this.toDate.value != ''
          ) {
            this.sortbyDates(this.fromDate.value, this.toDate.value);
          }
        })
      )
      .subscribe();
    this.toDate.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        tap(() => {
          if (
            this.toDate.value != null ||
            (this.toDate.value != '' && this.fromDate.value != null) ||
            this.fromDate.value != ''
          ) {
            this.sortbyDates(this.fromDate.value, this.toDate.value);
          }
        })
      )
      .subscribe();
  }
  public sortbyDates(fromDate: any, toDate: any) {
    this.dateFilterData = [];
    this.rows = this.filterVal;
    if (typeof fromDate === 'object') {
      this.startDate = this.ngbDateParserFormatter.format(fromDate);
    }
    if (typeof toDate === 'object') {
      this.endDate = this.ngbDateParserFormatter.format(toDate);
    }
    if (this.startDate && this.endDate) {
      const startDate = new Date(this.startDate);
      const endDate = new Date(this.endDate);
      this.rows = this.filterVal?.filter(function (a: any) {
        return new Date(a.departDate) >= startDate && new Date(a.departDate) <= endDate;
      });
    }
    this.dateFilterData = this.rows;
    this.rowValue(this.rows);
  }
  public selectSort(paramId: string): void {
    this.selected = paramId;
    this.searchAll.reset();
    if (paramId != 'All' && paramId !== 'Upcoming' && paramId !== 'Paid' && this.temp.length > 0) {
      const val = paramId.toString().toLowerCase().trim();
      // get the amount of columns in the table
      this.rows = this.rowsData;
      const count = this.rows.length;
      // get the key names of each column in the dataset
      const keys = Object?.keys(this.temp[0]);
      // assign filtered matches to the active datatable
      let data = this.temp?.filter((item: any) => {
        // iterate through each row's column data
        for (let i = 0; i < count; i++) {
          // check for a match
          if ((item[keys[i]] && item[keys[i]].toString().toLowerCase().indexOf(val) !== -1) || !val) {
            // found match, return true to add to result set
            return true;
          }
        }
      });
      this.filterVal = data;
      this.rows = this.filterVal;
      this.rowValue(this.rows);
    } else if (paramId == 'Upcoming' && this.temp?.length > 0) {
      let todaydate = new Date(this.currentDate);
      let upComingData = this.temp?.filter(function (a: any) {
        return new Date(a.departDate) >= todaydate;
      });
      let upComingDataSort = upComingData?.filter(
        (x: any) => x.bookingStatus == 'Pending' || x.bookingStatus == 'Paid'
      );
      this.filterVal = upComingDataSort;
      this.rows = this.filterVal;
    } else if (paramId == 'Paid') {
      let todaydate = new Date(this.currentDate);
      let pastData = this.temp?.filter(function (a: any) {
        return new Date(a.departDate) <= todaydate;
      });
      this.filterVal = pastData;
      this.rows = this.filterVal;
    } else if (paramId == 'All') {
      this.filterVal = this.rowsData;
      this.rows = this.filterVal;
    }
  }
  isActive(item: any) {
    return this.selected === item;
  }

  viewBooking(event: any) {
    if (event.type == 'click') {
      if (event.row.raisedTickets && this.gotoQuery) {
        this.route.navigate(['/my-account/query-record'], {
          queryParams: {
            Id: this.ticketId.get(event.row.tccReference),
          },
          queryParamsHandling: 'merge',
        });
      } else {
        this.route.navigate(['/my-account/view-booking'], {
          queryParams: {
            Id: event.row.itineraryId,
            dept_city: event.row.departAirport,
            arr_city: event.row.arrivalAirport,
            query_record: this.ticketId.get(event.row.tccReference),
          },
          queryParamsHandling: 'merge',
        });
      }
    }
  }

  public rowValue(data: any) {
    // if(data.length==0){
    //   $('#DeleteTraveller_Modal').modal('show');
    // }
  }

  get showError(): boolean {
    return this.rows?.length === 0;
  }
  // get all freshdesk ticket if we have
  getAllTickets() {
    if (this.credentials) {
      this.myAccountService.getAllTicketsByEmail(this.credentials.data.contactInfo.email).subscribe((data: any) => {
        if (!data.code) {
          this.allTickets = data;
          this.queryRecordData();
        }
      });
    }
  }

  // To DO If directly go to query record
  // viewQuery(id:any,tccReference:any){
  //   this.route.navigate(['/my-account/manage-booking'],{
  //     queryParams:{
  //       Id:id,
  //       queryId:this.ticketId.get(tccReference)
  //     }
  //   })
  // }
  viewItinary(row: any) {
    this.qIds = [];
    this.allTickets.forEach((x: any) => {
      this.ticketId.set(x.bookingRef, x.id);
      if (x.bookingRef == row.tccReference) {
        this.qIds.push(this.ticketId.get(x.bookingRef));
      }
    });
    this.route.navigate(['/my-account/view-booking'], {
      queryParams: {
        Id: row.itineraryId,
        dept_city: this.tsCountry === 'ABSA' ? this.getCityName(row.departAirport) : row.departAirport,
        arr_city: this.tsCountry === 'ABSA' ? this.getCityName(row.arrivalAirport) : row.arrivalAirport,
        query_record: this.ticketId.get(row.tccReference),
        triptype: row.trip,
        query: JSON.stringify(this.qIds),
      },
      queryParamsHandling: 'merge',
    });
  }
  
  // get all booking list data
  getRecords() {

    const payload = {
      userAgent: this.userAgent,
    };


    this.myAccountService
      .getMyBookings(payload)
      .subscribe((responseBody: any) => {
        if ( responseBody?.code == 200 && responseBody?.data?.resultItinerarySummaryList?.length !== 0) {
          this.rows = responseBody?.data?.resultItinerarySummaryList;
          this.rowsData = responseBody?.data?.resultItinerarySummaryList;
          this.rows?.sort((a: any, b: any) => {
            return <any>new Date(b.createdDateTime) - <any>new Date(a.createdDateTime);
          });

          if(this.tsCountry === 'ABSA') {
            this.rows.forEach((row: { departAirport: string; arrivalAirport: string; }) => {
              this.setCityName(row.departAirport);
              this.setCityName(row.arrivalAirport);
            });
          }

          /** perform check this booking has previous freshdesk tickets
           * this.queryRecordData();
           */
          this.temp = this.rows;
          this.filterVal = this.rows;
          this.noBookings = false;
          this.selectSort('Upcoming');
          this.load = true;
        } else {
          this.noBookings = true;
        }
      });
  }
  // check this booking has previous freshdesk tickets or not
  queryRecordData() {
    if (this.rows.length != 0 && this.allTickets.length != 0) {
      this.allTickets.forEach((x: any) => {
        x['bookingRef'] = x.subject.split('- ')[1];
        this.ticketCreated.set(x.bookingRef, x.status);
        this.ticketId.set(x.bookingRef, x.id);
      });
      this.rows.forEach((y: any) => {
        y['raisedTickets'] = this.ticketCreated.get(y.tccReference);
      });
    }
  }
  goToHome() {
    if(this.isBrowser && typeof window !== 'undefined' && this.tsCountry === 'SB'){
      window.location.href = window.location.origin;
    }else{
    this.route.navigate([''], { queryParamsHandling: 'preserve' });
    }
  }

  loadMeiliScript() {
    const script = this.renderer.createElement('script');
    script.type = 'text/javascript';
    script.src = this.apiService.getMeiliBookingManagerUrl();
    script.defer = true;
    this.renderer.appendChild(this.el.nativeElement, script);
  }
  selectTab(param :any){
    this.selectedTab = param;
  }

  getCityName(locationCode: string): string {
    return this.locationCodeToCityNameMap.get(locationCode) ?? '';
  }

  setCityName(locationCode: string) {
    if(this.locationCodeToCityNameMap.has(locationCode))
      return;

    // To prevent multiple calls for the same location while we're busy retrieving the location name
    this.locationCodeToCityNameMap.set(locationCode, '');

    const location = this.fetchCityName(locationCode);
    location
      .then((city) => {
        this.locationCodeToCityNameMap.set(locationCode, city);
      })
      .catch(() => {
        //If location service is down, then default to the locationCode
        this.locationCodeToCityNameMap.set(locationCode, locationCode);
      });
  }

  async fetchCityName(locationCode: string): Promise<string> {
    const response = await this.locationService.fetchLocationInformation(locationCode, 'airport');
    return response.city;
  }
  triggerSearchBookingEvent(searchValue:string){
    const eventData = myAccountEventData(searchValue);
    this.googleTagManagerService.pushSearchBookingEvent(eventData);
  }
}
