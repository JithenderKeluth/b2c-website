import { Location } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { SearchService } from '@app/flights/service/search.service';
import { responsiveService } from '@app/_core';
import { MyAccountServiceService } from '../my-account-service.service';
import { UniversalStorageService } from '@app/general/services/universal-storage.service';
import { ApiService } from '../../general/services/api/api.service';
import { GoogleTagManagerServiceService } from '../../_core/tracking/services/google-tag-manager-service.service';
import { myAccountEventData } from '../utils/my-account.utils';
declare const $: any;
@Component({
  selector: 'app-manage-bookings',
  templateUrl: './manage-bookings.component.html',
  styleUrls: [
    './manage-bookings.component.scss',
    './../../../theme/cancelflow_responsive.scss',
    './../../../theme/myAccount.scss',
  ],
})
export class ManageBookingsComponent implements OnInit {
  credentials: any;
  viewResultData: any;
  itineraryId: any;
  selectedReason: any = '';
  selectRefund: any;
  terms: boolean = false;
  path: string[] = [];
  selectTravellers: any = [];
  selectreason: any;
  names: any;
  sendReqInf: any;
  email_configid: string;
  groupid: string;
  ticketCreated: boolean = false;
  cancelContinue: boolean = false;
  userAgent: any;
  queryId: any = '';
  allTickets: any;
  showremain_tabs: boolean = false;
  showIndex: number;
  mainIndex: number;
  query_recordId: any = [];
  queries: any = [];
  tab: any;
  cancelQry: boolean = false;
  changeQry: boolean = false;
  changeQId: any = [];
  arr_city: any;
  dept_city: any;
  desc_txt: any;
  editQId: any = [];
  selected: any;
  querydata: any = [];
  getticketCreated = new Map<string, string>();
  ticketId = new Map<string, string>();
  qIds: any = [];
  bookingRef: any;
  view: any;
  viewTab: any;
  querycount: number = 0;
  showChangeTab: boolean = false;
  showEditTab: boolean = false;
  loadeditPage: boolean = false;
  categoryKey: string = '';

  country: string;
  
  constructor(
    private router: ActivatedRoute,
    private myAccountService: MyAccountServiceService,
    private location: Location,
    private route: Router,
    private searchService: SearchService,
    private cdRef: ChangeDetectorRef,
    public responsiveservice: responsiveService,
    private _snackBar: MatSnackBar,
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

    this.getQueryparams();
    this.path = this.route.url.split('/');
  }
  getQueryparams() {
    this.router.queryParams.subscribe((x) => {
      this.itineraryId = x.Id;
      this.mainIndex = x.mainIndex;
      this.showIndex = x.index;
      this.bookingRef = x.reference;
      this.view = x.onlyView;
      this.getItinerary(this.itineraryId);
      // if(x.query_record){
      //   this.query_recordId=x.query_record;
      // }else{
      //   this.query_recordId=null;
      // }
      if (x.query) {
        this.query_recordId = JSON.parse(x.query);
        /** to check all tickets raised tickets if any
         * this.getQueries(JSON.parse(x.query));
         */
      } else {
        this.tabVal('cancelTicket');
      }
      if (x.tab) {
        this.viewTab = x.tab;
      }
    });
  }
  getItinerary(itineraryId: any) {

    const data = {
      userAgent: this.userAgent
    };

    this.myAccountService.getItineraryData(itineraryId, data).subscribe((data: any) => {
      this.viewResultData = data.data.resultItinerary;
      if (this.viewResultData.airReservationList.length > 1) {
        this.viewResultData.airReservationList = this.viewResultData.airReservationList.splice(this.mainIndex, 1);
      }
      if (this.viewResultData) {
        this.getAllTickets();
        this.dept_city = this.viewResultData.airReservationList[0].originDestinationOptionsList[
          this.showIndex
        ].bookingFlightSegmentList[0].departureAirport;
        this.arr_city = this.viewResultData.airReservationList[0].originDestinationOptionsList[
          this.showIndex
        ].bookingFlightSegmentList[
          this.viewResultData.airReservationList[0].originDestinationOptionsList[this.showIndex]
            .bookingFlightSegmentList.length - 1
        ].arrivalAirport;
      }
    });
  }
  goToProfile() {
    this.location.back();
  }
  onSelectTraveller(event: any, traveller: any, index: number, odoList: any) {
    if (event.checked) {
      this.selectTravellers.push({
        id: traveller.travellerId + index,
        person: traveller.personName.givenName + ' ' + traveller.personName.surname,
      });
    } else if (!event.checked) {
      this.selectTravellers = this.selectTravellers.filter((x: any) => x.id !== traveller.travellerId + index);
    }
  }
  selectReason(parm: any) {
    this.selectedReason = parm;
  }
   
  SelectTermsCond(event: any) {
    this.terms = event.checked;
  }
  cancelFlight() {
    this.cancelContinue = true;
    if (this.terms && this.selectedReason !== '') {
      $('#cancelFlight_Modal').modal('show');
      this.names = '';
      this.selectTravellers.forEach((x: any) => {
        this.names = this.names.concat(x.person + ',');
      });
    }
  }

  continueCancel() {
    $('#cancelFlight_Modal').modal('hide');
    this.cancelTicket();
    // this.route.navigate([this.path[1] + '/query-record'])
  }
  getFreshDeskEmailConfig() {
    this.myAccountService.freshdeskEmailConfig().subscribe((data: any) => {
      if (!data.code) {
        data.forEach((x: any) => {
          if (x.reply_email === 'help@travelstart.com') {
            this.email_configid = x.id;
            this.groupid = x.group_id;
          }
        });
        this.createticket(this.email_configid, this.groupid);
      }
    });
  }
  createticket(email_config: any, groupId: any) {
    if (email_config && groupId) {
      let dept_city = this.viewResultData.airReservationList[0].originDestinationOptionsList[this.showIndex]
        .bookingFlightSegmentList[0].departureAirport;
      let arr_city = this.viewResultData.airReservationList[0].originDestinationOptionsList[this.showIndex]
        .bookingFlightSegmentList[
        this.viewResultData.airReservationList[0].originDestinationOptionsList[this.showIndex].bookingFlightSegmentList
          .length - 1
      ].arrivalAirport;
      const reqPayLoad = {
        description:
          'Hi team, I request to cancel flight  for these ' +
          this.selectTravellers.length +
          ' passenger(s) ' +
          this.names.slice(0, this.names.length - 1) +
          ' to trip - ' +
          dept_city +
          ' to ' +
          arr_city +
          '(' +
          this.viewResultData.tccReference +
          '). The reason is ' +
          this.selectedReason,
        subject: 'Urgent cancellation  to a booking made today - ' + this.viewResultData.tccReference,
        email: this.credentials.data.contactInfo.email,
        priority: 1,
        status: 2,
        email_config_id: email_config,
        group_id: groupId,
        type: 'Cancellation',
      };

      this.myAccountService.freshdeskCreateticket(reqPayLoad).subscribe((data: any) => {
        if (!data.code) {
          this.ticketCreated = true;
          // this.queryId = data.id;
          this.cancelQry = true;
          this.qIds.push(data);
          this.getAllTickets();
          this.getQueries(this.qIds);
          this.queryRecord(this.showIndex, data.id);
          // this.selectTravellers=null;
          // this.selectedReason='';
          // this.terms=false;
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

  getAllTickets() {
    this.myAccountService.getAllTicketsByEmail(this.credentials.data.contactInfo.email).subscribe((data: any) => {
      if (!data.code) {
        this.allTickets = data;
        this.qIds = [];
        this.allTickets.forEach((x: any) => {
          x['bookingRef'] = x.subject.split('- ')[1];
          this.ticketId.set(x.bookingRef, x.id);
          if (x.bookingRef == this.bookingRef) {
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
  queryDesc(des: any) {
    if (des && des.includes('I request to cancel flight ')) {
      this.showremain_tabs = true;
    }
  }
  tabVal(data: any) {
    this.tab = data;
    this.selected = data;
  }
  isActive(item: any) {
    return this.selected === item;
  }
  getQueries(queryIds: any) {
    if (queryIds.length != 0) {
      this.changeQId = [];
      queryIds.forEach((x: any) => {
        this.querydata = [];
        this.myAccountService.getTicketInfoById(x).subscribe((data: any) => {
          if (!data.code) {
            this.queries.push(data);
            if (this.queries.length != 0) {
              this.querydata = [];
              this.queries.forEach((x: any) => {
                if (this.viewResultData && this.viewResultData.tccReference) {
                  let route = this.dept_city + ' to ' + this.arr_city + '(' + this.viewResultData.tccReference + ')';
                  if (x.description_text.includes('I request to cancel flight') && x.description_text.includes(route)) {
                    this.querydata.push(x);
                    // this.queryId = x.id;
                    this.cancelQry = true;
                    this.desc_txt = x.description_text;
                    this.querydata = Array.from(
                      this.querydata.reduce((m: any, t: any) => m.set(t.id, t), new Map()).values()
                    );
                    this.tabVal('cancelTicket');
                  }

                  if (
                    x.description_text.includes('I request to change flight date') &&
                    x.description_text.includes(route)
                  ) {
                    this.changeQId.push(x);
                    this.changeQry = true;

                    if (this.tab !== 'cancelTicket') {
                      this.tabVal('changeDate');
                    }
                  }
                  if (x.description_text.includes(' I request to change details for the passengers')) {
                    this.editQId.push(x);

                    if (this.tab !== 'changeDate' && this.tab !== 'cancelTicket') {
                      this.tabVal('editPassenger');
                    }
                  }
                  if (this.view == 'manage') {
                    this.tabVal('cancelTicket');
                  }
                  if (this.viewTab) {
                    this.tabVal(this.viewTab);
                  }
                }
              });
            }
          }
        });
      });
      this.editQId = Array.from(this.querydata.reduce((m: any, t: any) => m.set(t.id, t), new Map()).values());
      this.changeQId = Array.from(this.querydata.reduce((m: any, t: any) => m.set(t.id, t), new Map()).values());
    } else {
      this.tabVal('cancelTicket');
      // this.isActive('cancelTicket');
    }
  }
  getQuery(firstName: any, lastName: any, Itin1: any, Itin2: any) {
    let data: any;
    this.querydata.forEach((x: any) => {
      let route = firstName + ' ' + lastName;
      if (x.description_text.includes(route)) {
        data = x.id;
      }
    });
    return data;
  }
  viewRecord(queryId: any) {
    this.queryId = null;
    this.queryId = queryId;
    $('#queryRecord_Modal').modal('show');
  }
  viewmobileRecord(queryId: any) {
    this.route.navigate(['/my-account/query-record'], {
      queryParams: {
        id: queryId,
      },
      queryParamsHandling: 'merge',
    });
  }
  get showTabsVal(): boolean {
    let data = false;

    if (
      (this.viewResultData &&
        this.viewResultData.airReservationList[0].travellerList.length == this.querydata.length) ||
      (this.viewResultData && this.viewResultData.airReservationList[0].travellerList.length <= this.querydata.length)
    ) {
      data = true;
    } else {
      this.querydata.forEach((x: any) => {
        if (this.viewResultData) {
          if (
            x.description_text.includes(
              this.viewResultData.airReservationList[0].travellerList.length + ' passenger(s)'
            )
          ) {
            data = true;
          }
        }
      });
    }
    return data;
  }

  ngAfterViewInit() {
    this.cdRef.detectChanges();

    setTimeout(() => {
      this.loadeditPage = true;
    }, 2000);
  }
  ngAfterViewChecked() {
    // your code to update the model
    this.cdRef.detectChanges();
  }
  editVal(data: any) {
    this.querydata.forEach((x: any) => {
      data.map((y: any, index: number) => {
        if (x.description_text.includes(y.passengerId)) {
          data.splice(index, 1);
        }
      });
    });
    let val = data.some((z: any) => z.queryRecordId != '');
    if (this.view == 'manage' && data.length !== 0) {
      this.showEditTab = true;
    } else if (this.view === 'manage' && data.length == 0) {
      this.showEditTab = false;
    } else {
      this.showEditTab = !val;
    }
  }
  changeDateVAl(data: any) {
    this.querydata.forEach((x: any) => {
      data.map((y: any, index: number) => {
        if (x.description_text.includes(y.firstName + ' ' + y.surName)) {
          data.splice(index, 1);
        }
      });
    });
    let val = data.some((z: any) => z.queryId != '');
    if (this.view == 'manage' && data.length !== 0) {
      this.showChangeTab = true;
    } else if (this.view === 'manage' && data.length == 0) {
      this.showChangeTab = false;
    } else {
      this.showChangeTab = !val;
    }
  }
  ngOnDestroy() {
    $('#queryRecord_Modal').modal('hide');
  }
  /* create cancel ticket to TCC */
  cancelTicket() {
    const eventData = myAccountEventData(this.viewResultData.tccReference);
    this.googleTagManagerService.pushCancelEvents('Cancel_Now',eventData);
    this.myAccountService.contactEnquiry(this.getContactUsData()).subscribe((data: any) => {
      if (data.errors) {
        if (data.errors[0].errorWarningAttributeGroup) {
          this._snackBar.open(data.errors[0].errorWarningAttributeGroup.shortText, '');
          setTimeout(() => {
            this._snackBar.dismiss();
          }, 3000);
        }
      } else {
        this._snackBar.open('Thanks! We will be in touch soon.', '');
        this.googleTagManagerService.pushCancelEvents('Cancel_Now_Success',eventData);
        setTimeout(() => {
          this._snackBar.dismiss();
        }, 3000);
      }
    });
  }
  // construct userdata payload from my account service
  getContactUsData() {
    return this.myAccountService.getContactUsData(this.viewResultData, 'cancelTicket');
  }
}
