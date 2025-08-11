import { responsiveService } from './../../_core/services/responsive.service';
import { SearchService } from './../../flights/service/search.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MyAccountServiceService } from '../my-account-service.service';
import { ApiService } from '../../general/services/api/api.service';
import {stayDaysCount} from '../../general/utils/my-account.utils';
import { UniversalStorageService } from '@app/general/services/universal-storage.service';


@Component({
  selector: 'app-hotel-bookings-list',
  templateUrl: './hotel-bookings-list.component.html',
  styleUrls: ['./hotel-bookings-list.component.scss','./../../../theme/data-table-customization.scss']
})
export class HotelBookingsListComponent implements OnInit {
public temp: any = [];
  hotelBookings: any = null;
  rowsData: any = [];
  credentials: any;
  selected: any = '';
  rowHeight: number = 65;
  filterVal: any = [];
  userAgent: any;
  currentDate = new Date();
  noBookings: boolean = false;
  loading : boolean = true;
  authorizationData :any = null;
  centerlizedJsonData :any = null;
  constructor(
    private myAccountService: MyAccountServiceService,
    private route: Router,
    private searchService: SearchService,
    public responsiveService: responsiveService,
    private apService:ApiService,
    private storage: UniversalStorageService
  ) {}
  ngOnInit(): void {
    this.centerlizedJsonData = this.storage.getItem('appCentralizedInfo', 'session') ? JSON.parse(this.storage.getItem('appCentralizedInfo', 'session')) : null;
    this.hapiAPIAuthenticate();
    this.selectSort('All');
    let credentials = JSON.parse(this.storage.getItem('credentials', 'session'));
    this.userAgent = this.myAccountService.countrydata;
    if (this.credentials && this.credentials.data && this.credentials.data.token) {
      this.searchService.langValue.subscribe((val: any) => {
        this.userAgent = this.myAccountService.countrydata;
      });
    }
    this.storage.removeItem('selectedHotelInfo');
  }
  updateFilter(val: any) {
    const value = val.toString().toLowerCase().trim();
    if (value) {
      this.hotelBookings = this.filterVal;
      const count = this.hotelBookings.length;
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
      this.hotelBookings = data;
    } 
  }

  public selectSort(paramId: string): void {
    this.selected = paramId;
    if (paramId != 'All' && paramId !== 'Upcoming' && paramId !== 'Paid' && paramId !== 'Cancelled' && this.temp.length > 0) {
      const val = paramId.toString().toLowerCase().trim();
      // get the amount of columns in the table
      this.hotelBookings = this.rowsData;
      const count = this.hotelBookings.length;
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
      this.hotelBookings = this.filterVal;
    } else if (paramId == 'Upcoming' && this.temp?.length > 0) {
      let todaydate = new Date(this.currentDate);
      let upComingData = this.temp?.filter(function (a: any) {
        return new Date(a.checkin) >= todaydate;
      });
      this.filterVal = upComingData;
      this.hotelBookings = this.filterVal;
    } else if (paramId == 'Paid') {
      let todaydate = new Date(this.currentDate);
      let pastData = this.temp?.filter(function (a: any) {
        return new Date(a.checkin) <= todaydate;
      });
      this.filterVal = pastData;
      this.hotelBookings = this.filterVal;
    } 
    else if (paramId == 'Cancelled') {
      let cancelledData = this.temp?.filter(
        (x: any) => x.status == 'Cancelled'
      );
      this.filterVal = cancelledData;
      this.hotelBookings = this.filterVal;
    }else if (paramId == 'All') {
      this.filterVal = this.rowsData;
      this.hotelBookings = this.filterVal;
    }
  }
  isActive(item: any) {
    return this.selected === item;
  }
  get showError(): boolean {
    return this.hotelBookings?.length === 0;
  }
  goToHome() {
    this.route.navigate([''], { queryParamsHandling: 'preserve' });
  }
  viewDetails(hotelData:any){
    this.storage.removeItem('selectedHotelInfo');
    let hotelInfo = hotelData;
    hotelInfo['jwtToken'] = this.authorizationData?.jwtToken;
    this.storage.setItem('selectedHotelInfo',JSON.stringify(hotelInfo), 'session');
    this.route.navigate(['/my-account/hotel-booking-details'], { queryParamsHandling: 'preserve' });
  }
hapiAPIAuthenticate(){
  let nullValue :any = null;
  let reqData = {
    traceId: nullValue, 
    userId: nullValue, 
    userAgent: nullValue, 
    ipAddress: nullValue, 
    userRoleCaller: nullValue, 
    email: this.apService.get_HAPIAuthenticateCredentials() ? this.apService.get_HAPIAuthenticateCredentials()?.email : null, 
    password: this.apService.get_HAPIAuthenticateCredentials() ? this.apService.get_HAPIAuthenticateCredentials().password : null
  }
//   this.myAccountService.hapiAPIAuthenticate(reqData).subscribe((res:any)=>{
//     if(!res?.errors && res?.jwtToken){
//         this.authorizationData = res;
//         this.getHotelBookingList();
//     }else{
//       this.loading = false;
//       this.hotelBookings = [];
//     }
//   },
// (error:any)=>{
//       this.loading = false;
//       this.hotelBookings = [];
// })
this.getHotelBookingList();
}
getHotelBookingList(){
    this.myAccountService.getHotelBookingList().subscribe((res:any)=>{
        if(res?.bookings?.length > 0){
          this.assignHotelData(res);
        }else{
          this.assignNoBookings();
          // this.getLocalHotelBookings();
        }
    },(error)=>{
      this.assignNoBookings();
    })
}
getStayNightsCount(fromDate:any,toDate:any){
   return stayDaysCount(fromDate,toDate)
}

  /**here to get hotel bookings from local json file for temporary onlu */
 getLocalHotelBookings(){
    this.myAccountService.getLocalHotelBookings().subscribe((data:any)=>{
        this.assignHotelData(data);
    })
  }
  assignHotelData(data:any){
    this.hotelBookings = data.bookings;
    this.rowsData = data.bookings;
    this.temp = this.hotelBookings;
    this.filterVal = this.hotelBookings;
    this.noBookings = false;
    this.loading = false;
  }
  /**If we are getting error or bookings not found case we are assign data as empty  */
  assignNoBookings(){
          this.hotelBookings = [];
          this.rowsData = [];
          this.temp = this.hotelBookings;
          this.filterVal = this.hotelBookings;
          this.noBookings = false;
          this.loading = false;
  }
}
