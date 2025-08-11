import { Component, ElementRef, Input, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { numInputNoChars } from '../utils/odo.utils';
import { NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { SessionUtils } from '@app/general/utils/session-utils';
import {
  PROXY_SERVER_PATH,
  PROXY_NGOFFLINE_BOOKING
} from '@app/general/services/api/api-paths';
import { DatePipe } from '@angular/common';
import { CountryCodes } from '@app/general/utils/country-code';
import { CustomDateParser } from '@app/general/utils/CustomDateParser';
import { ApiService } from '@app/general/services/api/api.service';
import { SearchCountryField, CountryISO, PhoneNumberFormat } from 'ngx-intl-tel-input';
import { UniversalStorageService } from '@app/general/services/universal-storage.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';

declare const $: any;

@Component({
  selector: 'app-ng-domestic-offline-form',
  templateUrl: './ng-domestic-offline-form.component.html',
  styleUrls: ['./ng-domestic-offline-form.component.scss'],
  providers: [{ provide: NgbDateParserFormatter, useClass: CustomDateParser }],
})
export class NgDomesticOfflineFormComponent implements OnInit {
  public ng_offline_form: UntypedFormGroup;
  public submitng_offline_form = false;
  public countrydata: any;
  public citiesData: any;
  public minDate = {
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    day: new Date().getDate(),
  };
  public itinDetails: any;
  public flightSearchData: any;
  @ViewChild('email') email: ElementRef;
  @ViewChild('paxName') name: ElementRef;
  @ViewChild('phone') phone: ElementRef;
  @ViewChild('departure') departure: ElementRef;
  @ViewChild('arrival') arrival: ElementRef;
  @ViewChild('deptDate') deptDate: ElementRef;
  @ViewChild('returnDate') returnDate: ElementRef;
  @ViewChild('paxCount', { static: false }) paxCount: ElementRef;
  @Input() itinerary: any = [];
  @Input() selectedAirLine: any;
  public countryCode: string;
  public countryName: any;
  public loadForm = false;
  public successMsg = false;
  
  separateDialCode = true;
  SearchCountryField = SearchCountryField;
  CountryISO = CountryISO;
  PhoneNumberFormat = PhoneNumberFormat;
  preferredCountries: CountryISO[] = [CountryISO.UnitedStates, CountryISO.UnitedKingdom];
  selectedCountryCode:string = CountryISO.UnitedStates ;

  constructor(
    private fb: UntypedFormBuilder,
    private sessionUtils: SessionUtils,
    private ngbDateParserFormatter: NgbDateParserFormatter,
    private datePipe: DatePipe,
    private apiService: ApiService,
    private storage: UniversalStorageService,
    private httpClient: HttpClient,
  ) {
    this.flightSearchData = JSON.parse(this.storage.getItem('flightsearchInfo', 'session'));
  }

  ngOnInit(): void {
    this.initForm();
    this.loadForm = true;
    const userCountry = JSON.parse(this.storage.getItem('userCountry', 'session'))
      ? JSON.parse(this.storage.getItem('userCountry', 'session')).country
      : 'US';
    for (let x in CountryCodes) {
      if (CountryCodes[x].code === userCountry) {
        this.countryCode = CountryCodes[x].code;
        this.selectedCountryCode = this.countryCode;
      }
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    for (let property in changes) {
      if (property === 'itinerary') {
        this.itinerary = changes[property].currentValue;
        this.itinDetails = this.itinerary;
      }
      if (property === 'selectedAirLine') {
        this.selectedAirLine = changes[property].currentValue;
        this.citiesData = this.selectedAirLine?.airports.sort((a: any, b: any) => a?.name.localeCompare(b?.name));
      }
    }
  }

  /**Form Initialisation */
  initForm() {
    const adlt_count = 'A' + 'x' + this.flightSearchData.travellers.adults;
    const child_count =
      this.flightSearchData.travellers?.children > 0 ? 'C' + 'x' + this.flightSearchData.travellers?.children : '';
    const ydlt_count =
      this.flightSearchData.travellers?.youngAdults > 0
        ? 'Y' + 'x' + this.flightSearchData.travellers?.youngAdults
        : '';
    const infnt_count =
      this.flightSearchData.travellers?.infants > 0 ? 'I' + 'x' + this.flightSearchData.travellers?.infants : '';
    const pax_count = adlt_count + ' ' + ' ' + child_count + ' ' + ydlt_count + ' ' + infnt_count;
    const flightData = JSON.parse(this.storage.getItem('flightsearchInfo', 'session'));
    const deptCity = this.getCityName(this.itinDetails.odoList[0].segments[0].origCode);
    const arrivalCity = this.getCityName(
      this.itinDetails.odoList[this.itinDetails.odoList.length - 1].segments[
        this.itinDetails.odoList[this.itinDetails.odoList.length - 1].segments.length - 1
      ].destCode
    );
    let deptDate: any;
    let arrDate: any;
    deptDate = this.getformattedDate(flightData?.itineraries[0]?.dept_date);
    arrDate = this.getformattedDate(flightData?.itineraries[flightData?.itineraries?.length - 1]?.arr_date);
    this.ng_offline_form = this.fb.group({
      paxName: ['', [Validators.required]],
      phone: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(14)]],
      email: ['', [Validators.required, Validators.pattern('[a-zA-Z0-9.+-_]{1,}@[a-zA-Z0-9.-]{2,}[.]{1}[a-zA-Z]{2,}')]],
      departure: [deptCity, [Validators.required]],
      arrival: [arrivalCity, [Validators.required]],
      deptDate: [deptDate, [Validators.required]],
      paxCount: [pax_count],
      returnDate: [arrDate],
    });
  }

  /**submitting the form*/
  submitForm() {
    this.submitng_offline_form = true;
    if (this.ng_offline_form.invalid) {
      this.focusInput();
      return;
    } else {
      this.lambdaFnData(this.formSubmitData(), true);
      this.lambdaFnData(this.formSubmitData(), false);
      setTimeout(() => {
        this.initForm();
        this.submitng_offline_form = false;
        this.loadForm = false;
        this.successMsg = true;
      }, 1500);
      setTimeout(() => {
        this.successMsg = false;
        this.loadForm = true;
        $('#dana_air_modal').modal('hide');
      }, 3000);
    }
  }

  // allows users to type only numbers
  onlyNumberKey(event: any) {
    return numInputNoChars(event);
  }
  
  /**Assigning the form control values to the object */
  formSubmitData() {
    const deptDate = this.ngbDateParserFormatter.format(this.ng_offline_form?.get('deptDate')?.value);
    const returnDate = this.ngbDateParserFormatter.format(this.ng_offline_form?.get('returnDate')?.value);
    return {
      Pax_Name: this.ng_offline_form?.get('paxName')?.value,
      email: this.ng_offline_form?.get('email')?.value,
      Departure_city: this.ng_offline_form.get('departure').value,
      Arrival_city: this.ng_offline_form.get('arrival').value,
      Departure_date: deptDate,
      Return_date: this.flightSearchData.tripType === 'return' ? returnDate : '',
      phone: this.ng_offline_form.get('phone').value?.number,
      No_of_pax: this.ng_offline_form.get('paxCount').value,
      airlineName: this.selectedAirLine.airlineName,
      correlationId: this.sessionUtils.getCorrelationId(),
      cabin_class: this.flightSearchData?.cabinClass?.display,
    };
  }
  /**Focusing the inputs if they are invalid */
  focusInput() {
    const formControlsToFocus = [
      { controlName: 'paxName', element: this.name },
      { controlName: 'phone', element: this.phone },
      { controlName: 'email', element: this.email },
      { controlName: 'departure', element: this.departure },
      { controlName: 'arrival', element: this.arrival },
      { controlName: 'deptDate', element: this.deptDate },
      { controlName: 'returnDate', element: this.returnDate },
    ];
    for (const { controlName, element } of formControlsToFocus) {
      const control = this.ng_offline_form.get(controlName);
      if (control?.invalid) {
        element?.nativeElement.focus();
        return;
      }
    }
  }

  public async lambdaFnData(formData: any, opsBookReq: boolean) {
    const obj = {
      templates_required: opsBookReq
        ? { email: this.apiService.getEnvironment() !== 'live' ? 60 : 63 }
        : { email: this.apiService.getEnvironment() !== 'live' ? 95 : 62 },
      notif_params: opsBookReq ? formData : {},
      contact_info: {
        email: opsBookReq ? 'book4me@travelstart.com.ng' : formData.email,
      },
    };
    // const payload = {
    //   body: JSON.stringify(obj),
    // };
  
    // const command = new InvokeCommand({
    //   FunctionName: this.apiService.getOfflineBookingsURL(),
    //   Payload: new TextEncoder().encode(JSON.stringify(payload)),
    // });
  
    // try {
    //   const response = await client.send(command);
    //   const decoded = new TextDecoder().decode(response.Payload);
    // } catch (error) {
    //   console.error('Error invoking Lambda function:', error);
    // }

     
      const url = `${PROXY_SERVER_PATH}${PROXY_NGOFFLINE_BOOKING}`;
      const data: any = {
        obj:  obj,
        offlineBookingurl: this.apiService.getOfflineBookingsURL()
      };
      this.httpClient.post(url, data)
  }

  getCityName(cityCode: string) {
    const city = this.citiesData?.find((city: any) => city.code === cityCode);
    return city ? city.name : '';
  }
  /**converting the passed date in to object or string*/
  getformattedDate(travelDate: any) {
    let date: any;
    if (typeof travelDate !== 'object') {
      date = this.ngbDateParserFormatter.parse(this.datePipe.transform(travelDate, 'dd-MM-yyyy'));
    } else {
      date = travelDate;
    }
    return date;
  }
}
