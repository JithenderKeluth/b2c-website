import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SearchService } from '@app/flights/service/search.service';
import { NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { MyAccountServiceService } from '../my-account-service.service';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { UniversalStorageService } from '@app/general/services/universal-storage.service';
import { ApiService } from '../../general/services/api/api.service';
import { SessionUtils } from '../../general/utils/session-utils';
import { myAccountEventData } from '../utils/my-account.utils';
import { GoogleTagManagerServiceService } from '../../_core/tracking/services/google-tag-manager-service.service';
import { title } from 'process';
declare const $: any;
@Component({
  selector: 'app-edit-passenger-details',
  templateUrl: './edit-passenger-details.component.html',
  styleUrls: ['./edit-passenger-details.component.scss'],
})
export class EditPassengerDetailsComponent implements OnInit {
  itinaryData: any;
  passengerEditForm: UntypedFormGroup;
  public dobminDate = {
    year: new Date().getFullYear() - 100,
    month: new Date().getMonth() + 1,
    day: new Date().getDate(),
  };
  public dobmaxDate = {
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    day: new Date().getDate(),
  };

  credentials: any;
  itineraryId: any;
  loadPage: boolean = false;
  submitted: boolean = false;
  names: any;
  email_configid: any;
  groupid: any;
  ticketCreated: boolean = false;
  path: string[] = [];
  userAgent: any;
  queryId: any;
  queryIdsVal: any = [];
  tripType: any;
  cancelQval: any = [];
  isQueryId = new Map<string, string>();
  isShow = new Map<string, string>();
  @Input() set queryIdVal(val: any) {
    this.queryIdsVal = val;
  }
  @Input() set cancelQueryVal(val: any) {
    this.cancelQval = val;
  }
  @Output() queryCreated: EventEmitter<any> = new EventEmitter<any>();
  @Output() editTabVal: EventEmitter<any> = new EventEmitter<any>();
  selectedPassenger: boolean = false;
  passengersArray: any = [];
  view: any;
  isShowItineraryDetails: boolean = false;

  country: string;

  constructor(
    private fb: UntypedFormBuilder,
    private datePipe: DatePipe,
    private myacountService: MyAccountServiceService,
    private ngbDateParserFormatter: NgbDateParserFormatter,
    private router: ActivatedRoute,
    private route: Router,
    private _snackBar: MatSnackBar,
    private searchService: SearchService,
    private storage: UniversalStorageService,
    private apiService: ApiService,
    private sessionUtils: SessionUtils,
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
      this.userAgent = this.myacountService.countrydata;
    });
    this.router.queryParams.subscribe((x: any) => {
      this.itineraryId = x.Id;
      this.view = x.onlyView;
      // this.queryId=x.queryId;
      this.getItinerary(this.itineraryId);
    });
    this.path = this.route.url.split('/');
  }
  
  getItinerary(itineraryId: any) {

    const data = {
      userAgent: this.userAgent
    };

    this.myacountService.getItineraryData(itineraryId, data).subscribe((data: any) => {
      this.itinaryData = data.data.resultItinerary;
      this.tripType = this.itinaryData.trip;
      if (this.itinaryData) {
        this.editPassenger();
        this.getValues();
      }
    });
  }

  getValues() {
    const control = this.passengerEditForm.get('passengers') as UntypedFormArray;
    for (let i = 0; i < control.length; i++) {
      this.cancelQuery(control.value[i], i);
      this.getQuery(control.value[i], i);
    }
  }
  editPassenger() {
    this.passengerEditForm = this.fb.group({
      dept_city:
        this.itinaryData.airReservationList[0].originDestinationOptionsList[0].bookingFlightSegmentList[0]
          .departureAirport,
      arr_city:
        this.itinaryData.airReservationList[0].originDestinationOptionsList[0].bookingFlightSegmentList[
          this.itinaryData.airReservationList[0].originDestinationOptionsList[0].bookingFlightSegmentList.length - 1
        ].arrivalAirport,
      passengers: this.fb.array(
        this.itinaryData.airReservationList[0].travellerList.map((y: any) => this.setPassengers(y)),
      ),
      createdDateTime: this.itinaryData.createdDateTime,
      departureDateTime:
        this.itinaryData.airReservationList[0].originDestinationOptionsList[0].bookingFlightSegmentList[0]
          .departureDateTime,
      bookingStatus: this.itinaryData.bookingStatus,
      pnr: this.itinaryData.airReservationList[0].pnrReference,
    });
  }
  //todo  if loop with odo
  // setRoutes(data: any): FormGroup {
  //   if (data != null) {
  //     return this.fb.group({
  //       dept_city: data.bookingFlightSegmentList[0].departureAirport,
  //       arr_city: data.bookingFlightSegmentList[data.bookingFlightSegmentList.length - 1].arrivalAirport,
  //       passengers: this.fb.array(
  //         this.itinaryData.airReservationList[0].travellerList.map((y: any) => this.setPassengers(y))
  //       ),
  //     });
  //   } else {
  //     return null;
  //   }
  // }
  setPassengers(data: any): UntypedFormGroup {
    if (data != null) {
      let date = this.datePipe.transform(data.birthDate, 'MM-dd-yyyy');
      let dobDate = this.ngbDateParserFormatter.parse(this.datePipe.transform(date, 'yyyy-MM-dd'));
      let Id = data.personName.nameTitle + ' ' + data.personName.givenName + ' ' + data.personName.surname;
      return this.fb.group({
        passengerDetails: '',
        gender: new UntypedFormControl({ value: data.gender, disabled: true }),
        dob: new UntypedFormControl({ value: dobDate, disabled: true }),
        title: [data.personName.nameTitle],
        firstName: [data.personName.givenName, [Validators.required]],
        middleName: data.personName.middleName,
        surName: [data.personName.surname, [Validators.required]],
        email: data.email,
        passengerId: [Id],
        queryRecordId: '',
        isShow: false,
      });
    } else {
      return null;
    }
  }
  passengers(): UntypedFormArray {
    return this.passengerEditForm.get('passengers') as UntypedFormArray;
  }
  onItemChange(event: any, index: any) {
    if (event.value == 'gender correction') {
      this.passengers().at(index).get('gender').enable();
      this.passengers().at(index).get('dob').disable();
    } else if (event.value == 'Dob correction') {
      this.passengers().at(index).get('dob').enable();
      this.passengers().at(index).get('gender').disable();
    } else {
      this.passengers().at(index).get('gender').disable();
      this.passengers().at(index).get('dob').disable();
    }
    this.selectedPassenger = true;
    this.passengersArray.push(this.passengers().at(index).get('passengerId').value);
  }
  updatePassenger() {
    this.selectedPassenger = this.passengerEditForm.get('passengers').value.some((x: any) => x.passengerDetails != '');
    this.submitted = true;
    if (this.passengerEditForm.invalid || this.selectedPassenger == false) {
      return;
    } else {
      if (this.passengersArray.length != 0) {
        this.names = '';
        this.passengersArray.forEach((x: any) => {
          this.names = this.names.concat(x + ',');
        });
      }
      this.createChangepassengerticket();
    }
  }
  createChangepassengerticket() {
    let eventData = myAccountEventData(this.itinaryData?.tccReference);
    eventData['fareDiff'] = 0;
    eventData['payment'] = 'CC';
    this.googleTagManagerService.pushEdit_PassengerEvents('Edit_Passenger',eventData);
    let reqData = {
      bookingRef: this.itinaryData?.tccReference,
      categoryKey: 'NAME_CHANGE_REQUEST',
      correlationId: this.sessionUtils.getCorrelationId(),
      email: this.credentials.data.contactInfo.email,
      message:
        'Hi team, I request to change details for the passengers ' + this.names.slice(0, this.names.length - 1) + '.',
      title: this.itinaryData?.airReservationList?.[0]?.travellerList?.[0]?.personName?.nameType,
      name: this.itinaryData?.airReservationList?.[0]?.travellerList?.[0]?.personName?.givenName,
      surname: this.itinaryData?.airReservationList?.[0]?.travellerList?.[0]?.personName?.surname,
    };
    this.searchService.contactEnquiry(reqData).subscribe(
      (data: any) => {
        this._snackBar.open('Thanks! We will be in touch soon.');
      },
      (error) => {
        if (error) {
          if (error.error) {
            this._snackBar.open('Something went wrong. Please try again. ');
          }
        }
      },
    );
    setTimeout(() => {
      this._snackBar.dismiss();
    }, 5000);
  }

  queryRecord(id: number) {
    this.router.queryParams.subscribe((x) => {
      this.route.navigate(['/my-account/manage-booking'], {
        queryParams: {
          Id: x.Id,
          onlyView: 'viewQuery',
          tab: 'editPassenger',
          reference: x.tccReference,
          mainIndex: x.mainIndex,
          index: x.index,
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

  cancelQuery(passenger: any, index: any) {
    if (this.cancelQval.length != 0) {
      this.cancelQval.forEach((x: any) => {
        if (x.description_text.includes(passenger.passengerId)) {
          this.passengers().at(index).get('isShow').setValue(true);
          this.passengers().at(index).get('queryRecordId').setValue('1');
          // control.removeAt(Index);
        }
      });
    }
  }
  getQuery(passenger: any, index: number) {
    if (this.queryIdsVal && this.queryIdsVal.length != 0) {
      this.queryIdsVal.forEach((x: any) => {
        if (x.description_text.includes(passenger.passengerId)) {
          this.passengers().at(index).get('queryRecordId').setValue(x.id);
          this.passengers().at(index).get('passengerDetails').setValue('');
          this.passengers().at(index).get('passengerDetails').disable();
        }
      });
    }
  }
  viewQuery(queryId: any) {
    $('#EditqueryRecord_Modal').modal('show');
    this.queryId = queryId;
  }
  viewMobileQuery(queryId: any) {
    this.route.navigate(['/my-account/query-record'], {
      queryParams: {
        id: queryId,
      },
      queryParamsHandling: 'merge',
    });
  }

  get showCancelBtn(): boolean {
    if (this.passengerEditForm) {
      const control = this.passengerEditForm.get('passengers') as UntypedFormArray;
      const result = control.value.every((e: any) => e.queryRecordId != '');
      if (this.view === 'manage') {
        return result;
      } else {
        return true;
      }
    }
    return false;
  }

  ngAfterViewChecked() {
    // your code to update the model
    if (this.passengerEditForm) {
      let control = this.passengerEditForm.get('passengers') as UntypedFormArray;

      this.editTabVal.emit(control.value);
    }
  }
  ngOnDestroy() {
    $('#EditqueryRecord_Modal').modal('hide');
    this._snackBar.dismiss();
  }
}
