import { DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SearchService } from '@app/flights/service/search.service';
import { MyAccountServiceService } from '../my-account-service.service';
import { NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { responsiveService } from '@app/_core';
import { UniversalStorageService } from '@app/general/services/universal-storage.service';
import { ApiService } from '../../general/services/api/api.service';
import { myAccountEventData } from '../utils/my-account.utils';
import { GoogleTagManagerServiceService } from '../../_core/tracking/services/google-tag-manager-service.service';
declare const $: any;
@Component({
  selector: 'app-change-booking-date',
  templateUrl: './change-booking-date.component.html',
  styleUrls: ['./change-booking-date.component.scss'],
})
export class ChangeBookingDateComponent implements OnInit {
  credentials: any;
  viewItinaryResultData: any;
  itineraryId: any;
  public expminDate = {
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    day: new Date().getDate(),
  };
  dynamicDatepicker: any;
  public expmaxDate = {
    year: new Date().getFullYear() + 1,
    month: new Date().getMonth() + 1,
    day: new Date().getDate(),
  };
  changDateForm: UntypedFormGroup;
  changDateArray: any = [];
  sendReqInf: any;
  names: any;
  email_configid: any;
  groupid: any;
  ticketCreated: boolean = false;
  path: string[] = [];
  changeDateval: boolean = false;
  userAgent: any;
  queryIds: any;
  queryId: any;
  mainIndex: number;
  cancelQval: any = [];
  @Input() set queryIdVal(val: any) {
    this.queryIds = val;
  }
  @Input() set cancelQueryVal(val: any) {
    this.cancelQval = val;
  }
  @Output() queryCreated: EventEmitter<any> = new EventEmitter<any>();
  @Output() changeTabVal: EventEmitter<any> = new EventEmitter<any>();
  showIndex: number;
  dateValidationval: boolean = false;
  validationVal: boolean = false;
  allTickets: any;
  qIds: any;
  ticketId = new Map<string, string>();
  view: any;
  result: any;
  changeDatevalue = new UntypedFormControl('', [Validators.required]);
  country: string;
  constructor(
    private router: ActivatedRoute,
    private myAccountService: MyAccountServiceService,
    private ngbDateParserFormatter: NgbDateParserFormatter,
    private _snackBar: MatSnackBar,
    private route: Router,
    private fb: UntypedFormBuilder,
    private datePipe: DatePipe,
    private searchService: SearchService,
    private cdRef: ChangeDetectorRef,
    public responsiveservice: responsiveService,
    private storage: UniversalStorageService,
    public apiService: ApiService,
    private googleTagManagerService : GoogleTagManagerServiceService
  ) {
    this.country = apiService.extractCountryFromDomain();
  }

  ngOnInit(): void {
    if (this.storage.getItem('credentials', 'session')) {
      this.credentials = JSON.parse(this.storage.getItem('credentials', 'session'));
    } else if (this.storage.getItem('credentials', 'local')) {
      this.credentials = JSON.parse(this.storage.getItem('credentials', 'local'));
    }
    this.searchService.langValue.subscribe((val: any) => {
      this.userAgent = this.myAccountService.countrydata;
    });
    this.router.queryParams.subscribe((x) => {
      this.itineraryId = x.Id;
      // this.queryId=x.queryId;
      this.showIndex = x.index;
      this.mainIndex = x.mainIndex;
      this.view = x.onlyView;
      this.getItinerary(this.itineraryId);
    });
    this.path = this.route.url.split('/');
  }
  getItinerary(itineraryId: any) {

    const data = {
      userAgent: this.userAgent,
    };

    this.myAccountService.getItineraryData(itineraryId, data).subscribe((data: any) => {
      this.viewItinaryResultData = data.data.resultItinerary;
      if (this.viewItinaryResultData.airReservationList.length > 1) {
        this.viewItinaryResultData.airReservationList = this.viewItinaryResultData.airReservationList.splice(
          this.mainIndex,
          1
        );
      }
      if (this.viewItinaryResultData) {
        this.changeDate();
      }
    });
  }

  onSelectTraveller(event: any, mainIndex: number, index: number) {
    if (typeof document !== 'undefined' && event.checked) {
      let indexId = 'newtravelDate' + mainIndex + index.toString();
      document.getElementById(indexId).focus();
      this.passenger(mainIndex).controls[index].get('changedate').setValidators(Validators.required);
      this.passenger(mainIndex).controls[index].get('changedate').updateValueAndValidity();
      this.dynamicDatepicker.open();
    } else if (!event.checked) {
      this.passenger(mainIndex).controls[index].get('changedate').setValue('');
      this.passenger(mainIndex).controls[index].get('changedate').setValidators(null);
      this.passenger(mainIndex).controls[index].get('changedate').updateValueAndValidity();
    }
  }
  public openCalender(datepicker: any, index: number) {
    this.dynamicDatepicker = datepicker;
    return;
  }
  dateSelection(event: any, mainIndex: number, index: number) {}
  changeFlightDate() {
    this.changDateArray = [];
    this.changeDateval = true;
    if (this.changeDateval && this.changeDatevalue.value) {
      this.changeDateRequest();
    }
    this.changDateForm.value.routeList.forEach((x: any) => {
      x.passengers.map((y: any) => {
        if (y.select == true && y.changedate) {
          this.changDateArray.push(y);
        }
      });
    });
    if (this.changDateArray.length != 0) {
      this.names = '';
      this.changDateArray.forEach((x: any) => {
        let changedDate = this.ngbDateParserFormatter.format(x.changedate);
        let changeDate = this.datePipe.transform(changedDate, 'dd-MM-yyyy');
        let deptDate = this.datePipe.transform(x.departureDateTime, 'dd-MM-yyyy');
        this.names = this.names.concat(
          x.firstName + ' ' + x.surName + '(' + deptDate + ' to ' + changeDate + ')' + ','
        );
      });
    }
  }
  // now raise a change date ticket to TCC
  changeDateRequest() {
    const eventData = myAccountEventData(this.viewItinaryResultData.tccReference);
    eventData['fareDiff'] = 0;
    eventData['payment'] = 'CC';
    this.googleTagManagerService.pushChange_DateEvents('Change_Date',eventData);
    this.myAccountService.contactEnquiry(this.getContactUsData()).subscribe((data: any) => {
      this.changeDatevalue.reset();
      this.changeDateval = false;
      if (data.errors) {
        if (data.errors[0].errorWarningAttributeGroup) {
          this._snackBar.open(data.errors[0].errorWarningAttributeGroup.shortText, '');
          setTimeout(() => {
            this._snackBar.dismiss();
          }, 3000);
        }
      } else {
        this._snackBar.open('Thanks! We will be in touch soon.', '');
        this.googleTagManagerService.pushChange_DateEvents('Change_Date_Success',eventData);
        setTimeout(() => {
          this._snackBar.dismiss();
        }, 3000);
      }
    });
  }
  freshDeskEmailConfig() {
    this.myAccountService.freshdeskEmailConfig().subscribe((data: any) => {
      if (!data.code) {
        data.forEach((x: any) => {
          if (x.reply_email === 'help@travelstart.com') {
            this.email_configid = x.id;
            this.groupid = x.group_id;
          }
        });
        this.createChangeDateticket(this.email_configid, this.groupid);
      }
    });
  }

  createChangeDateticket(email_config: any, groupId: any) {
    if (email_config && groupId) {
      let dept_city = this.viewItinaryResultData.airReservationList[0].originDestinationOptionsList[this.showIndex]
        .bookingFlightSegmentList[0].departureAirport;
      let arr_city = this.viewItinaryResultData.airReservationList[0].originDestinationOptionsList[this.showIndex]
        .bookingFlightSegmentList[
        this.viewItinaryResultData.airReservationList[0].originDestinationOptionsList[this.showIndex]
          .bookingFlightSegmentList.length - 1
      ].arrivalAirport;
      const sendReqInf = {
        description:
          'Hi team, I request to change flight date for ' +
          dept_city +
          ' to ' +
          arr_city +
          '(' +
          this.viewItinaryResultData.tccReference +
          ')' +
          'for these passengers ' +
          this.names.slice(0, this.names.length - 1) +
          '.',
        subject: 'Urgent  change to a booking made today - ' + this.viewItinaryResultData.tccReference,
        email: this.credentials.data.contactInfo.email,
        priority: 1,
        status: 2,
        email_config_id: email_config,
        group_id: groupId,
        type: 'Amendment',
      };
      this.myAccountService.freshdeskCreateticket(sendReqInf).subscribe((data: any) => {
        if (!data.code) {
          this.ticketCreated = true;
          this.queryIds.push(data);

          this.queryCreated.emit(this.queryIds);
          this.queryRecord(this.showIndex, data.id);
          // $('#changeticketResponse_Modal').modal('show');
        }
      });
    }
  }

  queryRecord(idx: number, id: number) {
    this.router.queryParams.subscribe((x) => {
      this.route.navigate(['/my-account/manage-booking'], {
        queryParams: {
          Id: x.Id,
          onlyView: 'viewQuery',
          tab: 'changeDate',
          reference: x.tccReference,
          mainIndex: x.mainIndex,
          index: idx,
          query: (() => {
            let q = JSON.parse(x.query);
            q.push(id);
            return JSON.stringify(q);
          })(),
        },
        queryParamsHandling: 'merge',
      });
    });
  }
 
  changeDate() {
    let data: any = [];
    data.push(this.viewItinaryResultData.airReservationList[0].originDestinationOptionsList[this.showIndex]);
    this.changDateForm = this.fb.group({
      routeList: this.fb.array(data.map((x: any) => this.setRoutes(x)) || []),
    });
  }
  setRoutes(data: any): UntypedFormGroup {
    if (data != null) {
      return this.fb.group({
        dept_city: data.bookingFlightSegmentList[0].departureAirport,
        arr_city: data.bookingFlightSegmentList[data.bookingFlightSegmentList.length - 1].arrivalAirport,
        departureDateTime: data.bookingFlightSegmentList[0].departureDateTime,
        passengers: this.fb.array(
          this.viewItinaryResultData.airReservationList[0].travellerList.map((y: any) => this.setPassengers(y, data))
        ),
      });
    } else {
      return null;
    }
  }
  setPassengers(data: any, itn: any): UntypedFormGroup {
    if (data != null) {
      return this.fb.group({
        firstName: data.personName.givenName,
        surName: data.personName.surname,
        email: data.email,
        select: false,
        changedate: '',
        pnr: this.viewItinaryResultData.airReservationList[0].pnrReference,
        bookingStatus: this.viewItinaryResultData.bookingStatus,
        createdDateTime: this.viewItinaryResultData.createdDateTime,
        dept_city: itn.bookingFlightSegmentList[0].departureAirport,
        arr_city: itn.bookingFlightSegmentList[itn.bookingFlightSegmentList.length - 1].arrivalAirport,
        departureDateTime: itn.bookingFlightSegmentList[0].departureDateTime,
        isShow: false,
        queryId: '',
      });
    } else {
      return null;
    }
  }
  routeList(): UntypedFormArray {
    return this.changDateForm.get('routeList') as UntypedFormArray;
  }
  passenger(empIndex: number): UntypedFormArray {
    return this.routeList().at(empIndex).get('passengers') as UntypedFormArray;
  }
  get Validation(): boolean {
    this.changDateForm.value.routeList.forEach((x: any) => {
      this.validationVal = x.passengers.some((y: any) => y.select == true);
    });
    if (!this.validationVal && this.changeDateval == true) {
      return true;
    } else {
      return false;
    }
  }
  get dateValidation(): boolean {
    this.changDateForm.value.routeList.forEach((x: any) => {
      x.passengers.map((y: any) => {
        if (y.select == true && !y.changedate) {
          this.dateValidationval = true;
        } else {
          this.dateValidationval = false;
        }
      });
    });
    return this.dateValidationval;
  }
  findCancelQuery(fName: any, sName: any, dept: any, arr: any, mainIndex: number, Index: number) {
    let data = false;
    if (this.cancelQval.length != 0) {
      this.cancelQval.forEach((x: any) => {
        let route = fName + ' ' + sName;
        if (x.description_text.includes(route)) {
          this.passenger(mainIndex).at(Index).get('isShow').setValue(true);
          this.passenger(mainIndex).at(Index).get('queryId').setValue('1');
        }
      });
    }
    return this.passenger(mainIndex).at(Index).get('isShow').value;
  }
  getQuery(firstName: any, lastName: any, Itin1: any, Itin2: any, mainIndex: number, Index: number) {
    let data: any;
    if (this.queryIds && this.queryIds.length != 0) {
      this.queryIds.forEach((x: any) => {
        let route =
          Itin1 + ' to ' + Itin2 + '(' + this.viewItinaryResultData.tccReference + ')' + 'for these passengers ';
        if (x.description_text.includes(route) && x.description_text.includes(firstName + ' ' + lastName)) {
          data = x.id;
          this.passenger(mainIndex).at(Index).get('queryId').setValue(x.id);
        }
      });
    }

    return data;
  }
  ngAfterViewInit() {
    this.cdRef.detectChanges();
  }

  viewQuery(queryId: any) {
    $('#CqueryRecord_Modal').modal('show');
    this.queryId = queryId;
  }
  viewmobileQuery(queryId: any) {
    this.route.navigate(['/my-account/query-record'], {
      queryParams: {
        id: queryId,
      },
      queryParamsHandling: 'merge',
    });
  }
  get showBtn(): boolean {
    let result = false;
    if (this.changDateForm && this.changDateForm.value) {
      result = this.changDateForm.value.routeList.every((x: any) => x.passengers.every((y: any) => y.queryId != ''));
    }
    const isManageView = this.view === 'manage';
    return isManageView ? result : true;
  }

  ngAfterViewChecked() {
    // your code to update the model
    this.cdRef.detectChanges();
    if (this.changDateForm && this.changDateForm.value) {
      this.changeTabVal.emit(this.changDateForm.value.routeList[0].passengers);
    }
  }
  ngOnDestroy() {
    $('#CqueryRecord_Modal').modal('hide');
  }
  // construct user request payload
  getContactUsData() {
    let changeDatereq =
      'Hi team, I request to change flight date to ' + this.ngbDateParserFormatter.format(this.changeDatevalue.value);
    return this.myAccountService.getContactUsData(this.viewItinaryResultData, 'changeDate', changeDatereq);
  }
}
