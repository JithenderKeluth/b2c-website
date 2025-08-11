import {
  Component,
  OnInit,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  ElementRef,
  ChangeDetectorRef,
  ViewEncapsulation,
  HostListener,
  OnDestroy,
  Inject, PLATFORM_ID
} from '@angular/core';
import { UntypedFormArray, UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { TripType } from '../models/trips';
import { Trips } from '../models/trips';
import { DatePipe, isPlatformBrowser } from '@angular/common';
import { SearchService } from '../service/search.service';
import { SearchData } from '../models/search/search-data.model';
import { getDatePrice, getDefaultAirports, locationWarning } from '../utils/search-data.utils';
import { CabinClass } from '../models/cabin-class.model';
import { Travellers } from '../models/travellers';
import { NavigationService } from '../../general/services/navigation.service';
import { NgbDate, NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { I18nService } from '../../i18n/i18n.service';
import { responsiveService } from '../../_core/services/responsive.service';
import { DeepLinkService } from '../../general/deeplinks/deep-link.service';
import { CustomDateParser } from '../../general/utils/CustomDateParser';
import { BookingService } from '../../booking/services/booking.service';
import { MatLegacyAutocompleteTrigger as MatAutocompleteTrigger } from '@angular/material/legacy-autocomplete';
import { SessionStorageService } from 'ngx-webstorage';
import { SessionUtils } from '../../general/utils/session-utils';
import { checkAirlineParam } from '../utils/search-results-itinerary.utils';
import { removeStorageData } from '@app/general/utils/storage.utils';
import { ApiService } from '@app/general/services/api/api.service';
import { CredentialsService } from '@app/auth/credentials.service';
import { MeiliIntegrationService } from './../../general/services/meili-integration.service';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { ErrorPopupComponent, ErrorPopupData } from './../../_shared/components/error-popup/error-popup.component';
import { MomentumApiService } from './../../general/services/momentum-api.service';
import { AbsaAuthService } from './../../general/services/absa-auth.service';
import { UniversalStorageService } from '../../general/services/universal-storage.service';
import Swal from 'sweetalert2';

export interface flight {
  airports: string;
}
declare const $: any;
@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],

  providers: [{ provide: NgbDateParserFormatter, useClass: CustomDateParser }],
  encapsulation: ViewEncapsulation.None,
})
export class SearchComponent implements OnInit, OnDestroy {
  @Output() freshSearch: EventEmitter<void> = new EventEmitter<void>();
  @Output() userSelectedData: EventEmitter<any> = new EventEmitter<any>();
  @Output() flightsdata: EventEmitter<any> = new EventEmitter<any>();
  @Output() showMulicity_data = new EventEmitter<boolean>();
  @Output() flightResults_bg = new EventEmitter<boolean>();
  @ViewChild('dpToDate') DptoDate: ElementRef;
  @ViewChild('datepicker1') datepicker1: ElementRef;
  @Input() showCross_icon = false;
  @Input() disableSearch = false;
  public searchData: any = new SearchData();
  public travellers = new Travellers();
  public cabinClass: CabinClass = new CabinClass('Economy', 'ECONOMY');
  public showMask = true;
  public lastAirportDept: any;
  public lastAirportArrival: any;
  public cabinClassSelected: string;

  public return_mindate: Date;
  public maxDate: Date;
  public tripType: any;
  public tripTypes_List: Trips[] = TripType;
  public tripSel: any = {};
  public tripSelected: string;
  public tripSelectedString: string;
  public isLoading = false;
  public errorMsg: string;
  public isReady = false;
  public filteredOptions: Observable<flight[]>[] = [];
  public myForm: UntypedFormGroup;
  public normalizedSearchDataInfo: any;
  public submitted = false;
  public dept_city_load = false;
  public arr_city_load = false;
  public currentDepartureIndex: number;
  public currentArrivalIndex: number;
  public isValidPaxSelected: boolean = true;
  public loading = false;
  public paxCount: any;
  public passengerCabinClass: any;
  public myFormData: any;
  activeButton: string = 'flights';

  public minDate = {
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    day: new Date().getDate(),
  };
  public ngbmaxDate = {
    year: new Date().getFullYear() + 1,
    month: new Date().getMonth() + 1,
    day: new Date().getDate(),
  };
  public oneWayMinDate = {
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    day: new Date().getDate(),
  };

  @ViewChild('datepicker') private picker: any;
  @ViewChild('d') private onewaypicker: any;
  dynamicDatepicker: any;
  displayMonths = 2;
  navigation = 'select';
  showWeekNumbers = false;
  get itenariesForm(): UntypedFormArray {
    return this.myForm.controls['itineraries'] as UntypedFormArray;
  }
  country: any;
  public hoveredDate: NgbDate | null = null;
  public fromDate: any;
  public toDate: any;
  public autoClose = false;
  indexids: any;
  clearAll = false;
  tripVal: string;
  showApplybtn = false;
  isMobile = false;
  controlIndex: any = 0;
  controlType: any = null;
  showWidget = false;
  loadContent: any = null;
  dateWidgetData: any = {};
  public sendEvent: EventEmitter<any> = new EventEmitter();
  @ViewChild('paxInfo') paxInfo: ElementRef;
  @ViewChild('classInfo') classInfo: ElementRef;
  price_calendar_res: any = [];
  price_loading = false;
  isPaxCollapsed = false;
  isClassCollapsed = false;
  region: string = 'ZA';

  private subscriptions: Subscription[] = [];
  private cid: string;
  private isAlertTriggered: boolean = false;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private fb: UntypedFormBuilder,
    private router: Router,
    private datePipe: DatePipe,
    private searchService: SearchService,
    private deepLinkService: DeepLinkService,
    private ngbDateParserFormatter: NgbDateParserFormatter,
    private bookingService: BookingService,
    private cdref: ChangeDetectorRef,
    private i18Service: I18nService,
    public responsiveservice: responsiveService,
    private sessionStorageService: SessionStorageService,
    private navService: NavigationService,
    private sessionUtils: SessionUtils,
    private activatedRoute: ActivatedRoute,
    private apiService: ApiService,
    public credentialsService: CredentialsService,
    private momentumApiService: MomentumApiService,
    private meiliIntegrationService: MeiliIntegrationService,
    private dialog: MatDialog,
    private absaAuthService: AbsaAuthService,
    private storage: UniversalStorageService
  ) {
    this.maxDate = new Date();
    this.return_mindate = new Date();
    if (this.i18Service.language) {
      this.country = this.i18Service.language.split('-')[1] || '';
    }
    if (this.filteredOptions.length === 0) {
      this.filteredOptions = getDefaultAirports(this.country || '');
    }

    const flightData = JSON.parse(this.storage.getItem('flightsearchInfo', 'session') || '{}');
    this.tripSelected = (flightData && flightData.tripType) ? flightData.tripType : 'return';
    this.cabinClass = flightData && flightData.cabinClass ? flightData.cabinClass : new CabinClass('Economy', 'ECONOMY');

    this.createForm();
    this.tripTypes_List = TripType;
    this.getSelectedItineraries();
  }

  ngOnInit() {
    this.handleAbsaAutoLogin(0); /* Handles the ABSA auto-login process.*/
    this.showMask = false;
    this.region = this.apiService.extractCountryFromDomain() || 'ZA';
    const pax = JSON.parse(this.storage.getItem('travellers', 'session') || '{}');
    if (pax) {
      this.travellers = new Travellers(pax.adults, pax.youngAdults, pax.children, pax.infants);
    }
    const langValueSubscription = this.searchService.langValue.subscribe((val: any) => {
      this.country = this.i18Service.language?.split('-')[1] || '';
    });
    this.subscriptions.push(langValueSubscription);
    const currentCountrySubscription = this.searchService.currentCountry.subscribe((x: any) => {
      if (x === true) {
        this.storage.removeItem('flightsearchInfo');
        this.createForm();
        this.fromDate = null;
        this.toDate = null;
        this.searchService.changeCountry(false);
      }
    });
    this.subscriptions.push(currentCountrySubscription);

    this.onresize();

    // Optionally, send a response back to the parent
    const response = { isSearchTriggered: false };
    if (isPlatformBrowser(this.platformId)) {
      if (window?.parent && typeof window.parent.postMessage === 'function') {
        window.parent.postMessage(JSON.stringify(response), '*');
      }
    }
  }

  ngOnDestroy(): void {
    // Unsubscribe from subscriptions to prevent memory leaks
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  private showAbsaLoginErrorPopup(): void {
    // After 2 retries, show alert with retry option
    const errorMessage = 'Please try again later.';
    const popupHtml = `
    <div class="responsive-heading">
      <h1 class="error-fail-heading">Something went wrong</h1>
    </div>
    <div class="responsive-content">
      <p>Don't worry, we're working on it. <br />Please try again later.</p>
      <p>Tip: Make sure you're connected to Wifi or have data when using Absa Rewards Travel.</p>
    </div>
  `;

    Swal.fire({
      iconHtml:
        '<img src="./assets/icons/absa_icons/Success.svg" alt="Login Error" style="margin-bottom: 45px; margin-top: 45px;">',
      customClass: {
        container: 'padding: none',
      },
      html: popupHtml,
      padding: '50px 25px',
      text: errorMessage,
      confirmButtonColor: '#F0325A',
      confirmButtonText: 'Done',
    }).then((result) => {
      if (result.isConfirmed) {
        this.router.navigateByUrl('/absa-complete-journey');
      }
    });
  }

  /**
   * Handles the ABSA auto-login process.
   * Shows a loader, checks for ABSA country and session credentials,
   * and attempts to fetch session ID and log the user in.
   */
  handleAbsaAutoLogin(retryCount: number = 0): void {
    // Check if the user is coming from an ABSA domain
    const isAbsa = this.apiService.extractCountryFromDomain() === 'ABSA';

    // Check if the user is already logged in (credentials stored)
    const hasCredentials = this.storage.getItem('credentials', 'session') !== null;

    // Proceed only if ABSA user and not logged in
    if (isAbsa && !hasCredentials) {
      // Show loader while login is in progress
      this.loading = true;

      // Try to fetch session ID and auto-login
      this.absaAuthService
        .fetchSessionId()
        .catch((err) => {
          // Log error and notify user
          console.error('ABSA login failed:', err);

          if (retryCount < 2) {
            // Retry silently without alert
            this.handleAbsaAutoLogin(retryCount + 1);
          } else {
            this.showAbsaLoginErrorPopup();
          }
        })
        .finally(() => {
          this.loading = false;
        });
    }
  }

  toggleSideNav(index: number, type: any, content: any) {
    this.controlIndex = index;
    this.controlType = type;
    this.loadContent = content;
    this.showWidget = true;
    this.navService.setShowNav(true);
  }

  public onresize() {
    const getMobileStatusSubscription = this.responsiveservice.getMobileStatus().subscribe((isMobile) => {
      if (this.responsiveservice.screenWidth === 'sm' || this.responsiveservice.screenWidth === 'md') {
        // window.open("https://m.travelstart.com/", "_self");
        this.isMobile = true;
        this.ngbmaxDate = {
          year: new Date().getFullYear() + 1,
          month: new Date().getMonth() + 2,
          day: new Date().getDate(),
        };
        this.displayMonths = 12;
      } else {
        this.isMobile = false;
        this.displayMonths = 2;
      }
    });
    this.subscriptions.push(getMobileStatusSubscription);
  }
  public showMultiCityData() {
    this.showMulicity_data.emit(true);
  }

  public openCalender(event: any, datepicker: any, index: number) {
    if (
      this.responsiveservice.screenWidth !== 'sm' &&
      this.responsiveservice.screenWidth !== 'md' &&
      this.itenariesForm.controls[index].get('dept_date') &&
      !this.itenariesForm.controls[index].get('dept_date').value
    ) {
      this.dynamicDatepicker = datepicker;
      return;
    }
  }
  disableDate() {
    return false;
  }
  /* this hostlistener  for close traveller Dialog when click on out side of dialog box */
  @HostListener('document:click', ['$event.target'])
  public onClick(targetElement: any) {
    if (
      this.paxInfo?.nativeElement?.classList.contains('show') &&
      !this.paxInfo?.nativeElement?.contains(targetElement)
    ) {
      this.closeTravellersDialog('close');
    }

    if (
      this.classInfo?.nativeElement?.classList.contains('show') &&
      !this.classInfo?.nativeElement?.contains(targetElement)
    ) {
      this.closeClassDialog('close');
    }
  }
  closeTravellersDialog(param: string) {
    if (param === 'apply' && this.paxCount) {
      this.travellers = new Travellers(
        this.paxCount.adults,
        this.paxCount.youngAdults,
        this.paxCount.children,
        this.paxCount.infants,
      );
      this.storage.setItem('travellers', JSON.stringify(this.paxCount), 'session');
    }
    if (param === 'apply') {
      if (this.passengerCabinClass) {
        this.cabinClass = new CabinClass(this.passengerCabinClass.display, this.passengerCabinClass.value);
      }
    }
    const bodyElement = document.getElementById('pax');
    if (bodyElement) {
      bodyElement.classList.remove('show');
      this.sendEvent.emit(this.travellers);
      this.togglePaxCollapse();
    }
  }

  closeClassDialog(param: string, selectedClass?: string) {
    if (param === 'apply' && selectedClass) {
      this.onChange(selectedClass);
    }

    const bodyElement = document.getElementById('classSelector');
    if (bodyElement) {
      bodyElement.classList.remove('show');
      this.sendEvent.emit(this.travellers);
      this.toggleClassCollapse();
    }
  }

  togglePaxCollapse() {
    this.isPaxCollapsed = !this.isPaxCollapsed;
  }

  toggleClassCollapse() {
    this.isClassCollapsed = !this.isClassCollapsed;
  }

  public getCabinClass(param: CabinClass) {
    this.passengerCabinClass = param;
  }

  public savePax(pax: any): void {
    this.paxCount = pax;
  }

  public saveMmfPax(pax: any): void {
    this.paxCount = pax;
    this.closeTravellersDialog('apply');
  }
  showApplyBtn(param: any) {
    this.showApplybtn = !param;
  }
  public exchangeCities(event: any, index: number) {
    if (this.itenariesForm?.controls[index]) {
      const dept_city = this.itenariesForm.controls[index]?.get('dept_city')?.value;
      const arr_city = this.itenariesForm.controls[index]?.get('arr_city')?.value;
      if (dept_city && arr_city) {
        this.itenariesForm.controls[index]?.get('dept_city')?.setValue(arr_city);
        this.itenariesForm.controls[index]?.get('arr_city')?.setValue(dept_city);
      }
    }
  }

  public createForm() {
    this.myForm = this.fb.group({
      date: [{ value: '', disabled: true }, [Validators.required]],
      cabinClass: this.cabinClass,
      travellers: this.travellers,
      itineraries: (() => {
        if (!this.storage.getItem('flightsearchInfo', 'session')) {
          return this.initItineraries();
        } else {
          return this.assignItineraries();
        }
      })(),
    });
    this.ManageNameControl(0);
    // this.ManageNameControl(1)
    this.isReady = true;
  }
  public initItineraries() {
    const formArray = this.fb.array([]);

    for (let i = 0; i < 1; i++) {
      formArray.push(
        this.fb.group({
          dept_city: ['', [Validators.required]],
          arr_city: ['', [Validators.required]],
          dept_date: ['', [Validators.required]],
          arr_date: [''],
        }),
      );
    }
    return formArray;
  }

  public assignItineraries() {
    let deptDate: any;
    let arrivalDate: any;
    let multiDeptDate: any;
    this.fromDate = null;
    this.toDate = null;
    const flightSearchInfo = this.storage.getItem('flightsearchInfo', 'session');
    if (flightSearchInfo) {
      const flightData = JSON.parse(flightSearchInfo);
      if (this.clearAll === true) {
        const formArray = this.fb.array([]);
        for (let i = 0; i < 1; i++) {
          formArray.push(
            this.fb.group({
              dept_city: ['', [Validators.required]],
              arr_city: ['', [Validators.required]],
              dept_date: ['', [Validators.required]],
              arr_date: [''],
            }),
          );
        }
        return formArray;
      } else {
        if (flightData.itineraries?.length) {
          const formArray = this.fb.array([]);
          if (typeof flightData.itineraries[0].dept_date !== 'object') {
            deptDate = this.ngbDateParserFormatter.parse(
              this.datePipe.transform(flightData.itineraries[0].dept_date, 'dd-MM-yyyy'),
            );
          } else {
            deptDate = flightData.itineraries[0].dept_date;
          }
          if (typeof flightData.itineraries[0].arr_date !== 'object') {
            arrivalDate = this.ngbDateParserFormatter.parse(
              this.datePipe.transform(flightData.itineraries[0].arr_date, 'dd-MM-yyyy'),
            );
          } else {
            arrivalDate = flightData.itineraries[0].arr_date;
          }
          this.fromDate = deptDate;
          if (arrivalDate) {
            this.toDate = arrivalDate;
          }
          if (flightData.tripType === 'oneway' || this.tripSel?.value === 'oneway') {
            formArray.push(
              this.fb.group({
                dept_city: [flightData.itineraries[0].dept_city, [Validators.required]],
                arr_city: [flightData.itineraries[0].arr_city, [Validators.required]],
                dept_date: [deptDate, [Validators.required]],
                arr_date: [flightData.itineraries[0].arr_date],
              }),
            );
          } else if (flightData.tripType === 'return' || this.tripSel?.value === 'return') {
            formArray.push(
              this.fb.group({
                dept_city: [flightData.itineraries[0].dept_city, [Validators.required]],
                arr_city: [flightData.itineraries[0].arr_city, [Validators.required]],
                dept_date: [deptDate, [Validators.required]],
                arr_date: [arrivalDate],
              }),
            );
          } else {
            for (let i = 0; i < flightData.itineraries.length; i++) {
              if (typeof flightData.itineraries[i].dept_date !== 'object') {
                multiDeptDate = this.ngbDateParserFormatter.parse(
                  this.datePipe.transform(flightData.itineraries[i].dept_date, 'dd-MM-yyyy'),
                );
              } else {
                multiDeptDate = flightData.itineraries[i].dept_date;
              }
              formArray.push(
                this.fb.group({
                  dept_city: [flightData.itineraries[i].dept_city, [Validators.required]],
                  arr_city: [flightData.itineraries[i].arr_city, [Validators.required]],
                  dept_date: [multiDeptDate, [Validators.required]],
                  arr_date: [flightData.itineraries[i].arr_date],
                }),
              );
            }
          }
          return formArray;
        }
      }
    }
    return this.initItineraries();
  }

  public ManageNameControl(index: number) {
    const arrayControl = this.myForm.get('itineraries') as UntypedFormArray;
    if (arrayControl && arrayControl.controls[index]) {
      const control = arrayControl.controls[index];
      control.get('dept_city')?.valueChanges.subscribe(() => {
        this.dept_city_load = false;
      });
      control.get('arr_city')?.valueChanges.subscribe(() => {
        this.arr_city_load = false;
      });
    }
  }
  public onKeypressEvent(event: any, index: number, controlName: string) {
    if (event.target.value.length >= 3) {
      if (controlName === 'dept_city') {
        this.currentDepartureIndex = index;
        this.dept_city_load = true;
      } else if (controlName === 'arr_city') {
        this.currentArrivalIndex = index;
        this.arr_city_load = true;
      }

      const getAirportsSubscription = this.searchService.getAirports(event).subscribe((data: any) => {
        if (data) {
          this.dept_city_load = false;
          this.arr_city_load = false;
          this.filteredOptions = data;
        } else if (data === undefined) {
          this.errorMsg = data['Error'];
          this.filteredOptions = [];
          this.dept_city_load = false;
          this.arr_city_load = false;
        } else {
          this.errorMsg = '';
        }
      });
      this.subscriptions.push(getAirportsSubscription);
    } else {
      this.currentArrivalIndex = index;
      this.arr_city_load = false;
      this.dept_city_load = false;
      this.filteredOptions = getDefaultAirports(this.country || '');
    }
  }
  public getAirportValue(option: any) {
    return option?.code + ' ' + option?.city;
  }

  public displayFn(state: any) {
    if (state?.code) {
      // return state['code'] + ' ' + state['city']; should be verified
      return `${state?.city} (${state?.code})`;
    }
  }
  getMinDate(index: number) {
    let returnDate: any;
    if (index === 0) {
      returnDate = this.oneWayMinDate;
    } else {
      const controls = this.myForm?.get('itineraries')?.['controls'];
      if (controls?.[index - 1]?.value?.dept_date) {
        let formattedDate = controls[index - 1].value.dept_date;
        returnDate = { year: formattedDate.year, month: formattedDate.month, day: formattedDate.day };
      } else {
        returnDate = this.minDate;
      }
    }
    return returnDate;
  }
  public addNewItineraries() {
    const controls = this.myForm.get('itineraries') as UntypedFormArray;

    const lastIndex = controls.length - 1;
    const lastGroup = controls.at(lastIndex) as UntypedFormGroup;

    const isValid =
      lastGroup.get('dept_city')?.valid &&
      lastGroup.get('arr_city')?.valid &&
      lastGroup.get('dept_date')?.valid;

    if (
      isValid &&
      controls.length < 6 &&
      !this.compareDeptArrCity(lastIndex)
    ) {
      const formGroup = this.fb.group({
        dept_city: ['', Validators.required],
        arr_city: ['', Validators.required],
        dept_date: ['', Validators.required],
        arr_date: [''],
      });
      controls.push(formGroup);
    } else if (controls.length < 6) {
      this.addItineraries();
    }

    this.ManageNameControl(controls.length - 1);
  }

  public removeItineraries(i: number) {
    const controls = <UntypedFormArray>this.myForm.controls['itineraries'];
    controls.removeAt(i);
  }

  public onDateChange(newDate: Date) {}

  public getSelectedItineraries() {
    this.tripSel = TripType.find((Item) => Item.value === this.tripSelected) || TripType[0];
    this.tripSelectedString = JSON.stringify(this.tripSel);
    if (this.tripSel?.name === 'Multi-city') {
      if (this.storage.getItem('flightsearchInfo', 'session')) {
        this.createForm();
        //to set the values to the departure,arrival and deptarture dates when changing the tabs
        if (this.myFormData?.length) {
          this.itenariesForm.controls[0]?.get('dept_city')?.setValue(this.myFormData[0]?.dept_city || '');
          this.itenariesForm.controls[0]?.get('arr_city')?.setValue(this.myFormData[0]?.arr_city || '');
          this.itenariesForm.controls[0]?.get('dept_date')?.setValue(this.myFormData[0]?.dept_date || null);
          this.compareDates(0, this.myFormData[0]?.dept_date);
        }
      }
    } else if (this.tripSel?.name !== 'Multi-city' && this.itenariesForm?.length > 0) {
      const controls = <UntypedFormArray>this.myForm.controls['itineraries'];
      while (controls.length > 1) {
        controls.removeAt(1);
      }
    } else if (this.storage.getItem('flightsearchInfo', 'session')) {
      this.createForm();
    }
  }

  // compare two search cities and if two are same , error will get in home page
  compareDeptArrCity(index: number) {
    const arrCity = this.itenariesForm?.controls[index]?.get('arr_city')?.value;
    const deptCity = this.itenariesForm?.controls[index]?.get('dept_city')?.value;
    if (arrCity && deptCity && arrCity.code === deptCity.code) {
      return true;
    }
    return false;
  }
  // country based error
  countrySelectionError(index: number) {
    const deptCity = this.itenariesForm?.controls[index]?.get('dept_city')?.value;
    const arrCity = this.itenariesForm?.controls[index]?.get('arr_city')?.value;
    if (deptCity?.code && arrCity?.code) {
      return locationWarning(deptCity.code);
    }
    return null;
  }

  public onItineraryChange(trip: Trips) {
    this.searchService.changeItineraryValue(trip.value);
    this.dept_city_load = false;
    this.arr_city_load = false;
    this.submitted = false;
    if ((this.tripSel && this.tripSel.value === 'oneway') || this.tripSel?.value === 'return') {
      this.myFormData = this.myForm.value.itineraries;
    }
    this.getSelectedItineraries();
    const controls = <UntypedFormArray>this.myForm.controls['itineraries'];
    for (let i = 0; i <= controls.length; i++) {
      const deptDate = this.itenariesForm?.controls[i]?.get('dept_date')?.value;
      if (deptDate) {
        this.minDate = {
          year: deptDate.year || new Date().getFullYear(),
          month: deptDate.month || new Date().getMonth() + 1,
          day: deptDate.day || new Date().getDate(),
        };
      }
      this.setArrDateValidations(i);
    }
  }

  //Todo if we need enable clear all
  // public clearAllItineraries() {
  //   this.clearAll=true;
  //   this.createForm();
  // }

  public async searchFlights(tripSelected: Trips, index?: number) {
    /**  Here for momentum, we are checking whether the passenger is selected or not
     *   If the user selects the pax, but the pax list doesn't have adult pax, then we display this popup message and do not allow the booking flow
     */
    if (this.region === 'MM') {
      const paxList = this.storage.getItem('mmfTravellerData', 'session');
      if ((paxList && !this.searchService.isAdultPaxSelected(JSON.parse(paxList))) || !paxList) {
        $('#noAdultsModal').modal('show');
        return;
      }
    }
    this.deepLinkService.changeIsPriceDeepLink(false);
    this.bookingService.changeresetFilters(false);
    this.searchService.changeNewSearch(false);
    this.storage.removeItem('deepLinkRequest');
    this.flightResults_bg.emit(false);
    this.submitted = true;
    let params = checkAirlineParam();
    if (params) {
      this.storage.removeItem('queryStringParams');
      this.storage.setItem('queryStringParams', JSON.stringify(params), 'session');
    }
    if (
      typeof this.itenariesForm.controls[this.itenariesForm.controls.length - 1]?.get('dept_city')?.value !== 'object'
    ) {
      return;
    } else if (
      this.itenariesForm.controls[this.itenariesForm.controls.length - 1]?.get('arr_city')?.value &&
      typeof this.itenariesForm.controls[this.itenariesForm.controls.length - 1]?.get('arr_city')?.value !== 'object'
    ) {
      return;
    } else if (
      (this.itenariesForm.controls[this.itenariesForm.controls.length - 1]?.get('arr_city')?.value &&
        this.itenariesForm.controls[this.itenariesForm.controls.length - 1]?.get('dept_city')?.value &&
        this.itenariesForm.controls[this.itenariesForm.controls.length - 1]?.get('arr_city')?.value?.code ===
          this.itenariesForm.controls[this.itenariesForm.controls.length - 1]?.get('dept_city')?.value?.code) ||
      this.itenariesForm.controls[this.itenariesForm.controls.length - 1]?.get('arr_city')?.value ===
        this.itenariesForm.controls[this.itenariesForm.controls.length - 1]?.get('dept_city')?.value
    ) {
      return;
    } else {
      this.flightSearch_cities(tripSelected, index);
    }
  }

  showError(errMsg: any, tripSelected: Trips, index: any): void {
    const popupData: ErrorPopupData = {
      header: 'Error Occurred',
      imageUrl: 'assets/icons/Icon/Negative-scenarios/dummy_error_icon.svg',
      message: errMsg,
      buttonText: 'Continue with booking',
      button2Text: 'Cancel',
      showHeader: false,
      showImage: true,
      showButton: true,
      showButton2: true,
      onButtonClick: () => {
        this.isAlertTriggered = !this.isAlertTriggered;
        this.triggerFlightSearch();
      },
      onButton2Click: () => {},
    };

    this.dialog.open(ErrorPopupComponent, {
      width: '300px',
      data: popupData,
    });
  }

  ngAfterContentChecked() {
    this.cdref.detectChanges();
  }

  getMinFromDate() {
    const flightSearchInfo = this.storage.getItem('flightsearchInfo', 'session');
    if (flightSearchInfo) {
      const flightData = JSON.parse(flightSearchInfo);
      if (!this.fromDate && flightData?.itineraries?.length) {
        this.fromDate = flightData.itineraries[0].dept_date;
      }
    }
  }
  getReturnMinDate() {
    return this.fromDate ? this.fromDate : this.minDate;
  }
  onDateSelection(date: NgbDate | null, datepicker: any, control: string) {
    if (!date) return;
    
    if (control === 'dpToDate' && !this.fromDate) {
      const flightSearchInfo = this.storage.getItem('flightsearchInfo', 'session');
      if (flightSearchInfo) {
        const flightData = JSON.parse(flightSearchInfo);
        if (flightData?.itineraries?.length) {
          this.fromDate = flightData.itineraries[0].dept_date;
        } else {
          this.fromDate = date;
        }
      }
    }
    
    if (!this.fromDate && !this.toDate) {
      this.fromDate = date;
      if (this.DptoDate?.nativeElement) {
        this.DptoDate.nativeElement.focus();
      }
      this.minDate = date;
      if (this.isMobile) {
        datepicker?.close();
      }
    } else if (this.fromDate && !this.toDate && date && (date.after(this.fromDate) || date.equals(this.fromDate))) {
      this.toDate = date;
      datepicker?.close();
    } else if (this.fromDate && this.toDate && control === 'dpFromDate') {
      if (date.after(this.toDate)) {
        this.toDate = null;
        if (this.DptoDate?.nativeElement) {
          this.DptoDate.nativeElement.focus();
        }
        if (this.isMobile) {
          datepicker?.close();
        }
      } else {
        datepicker?.close();
      }
      this.fromDate = date;
      this.minDate = this.minDate;
    } else if (this.fromDate && this.toDate && control === 'dpToDate') {
      this.toDate = date;
      datepicker?.close();
    } else if (this.fromDate && !this.toDate && control === 'dpFromDate') {
      this.fromDate = date;
      if (this.DptoDate?.nativeElement) {
        this.DptoDate.nativeElement.focus();
      }
      this.minDate = date;
    }

    if (this.itenariesForm?.controls[0]) {
      this.itenariesForm.controls[0].get('dept_date')?.setValue(this.fromDate);
      this.itenariesForm.controls[0].get('arr_date')?.setValue(this.toDate);
    }
  }

  isHovered(date: any) {
    if (
      this.fromDate &&
      !this.toDate &&
      this.hoveredDate &&
      date.after(this.fromDate) &&
      date.before(this.hoveredDate)
    ) {
      this.DptoDate.nativeElement.focus();
    }
    return (
      this.fromDate && !this.toDate && this.hoveredDate && date.after(this.fromDate) && date.before(this.hoveredDate)
    );
  }
  isInside(date: any) {
    return this.toDate && date.after(this.fromDate) && date.before(this.toDate);
  }
  isRange(date: NgbDate) {
    return (
      date.equals(this.fromDate) ||
      (this.toDate && date.equals(this.toDate)) ||
      this.isInside(date) ||
      this.isHovered(date)
    );
  }

  clearItenary(index: number, type: any) {
    this.filteredOptions = getDefaultAirports(this.country);
    if (this.responsiveservice.screenWidth === 'sm' || this.responsiveservice.screenWidth === 'md') {
      let indexId = type + index.toString();
      const element = document.getElementById(indexId);
      if (element) {
        element.blur();
      }
      this.toggleSideNav(index, type, 'location');
    } else {
      if (type === 'dept_city' && this.itenariesForm?.controls[index]?.get('dept_city')?.value) {
        this.lastAirportDept = this.itenariesForm.controls[index]?.get('dept_city')?.value;
        this.itenariesForm.controls[index].get('dept_city')?.setValue('');
      }
      if (type === 'arr_city' && this.itenariesForm?.controls[index]?.get('arr_city')?.value) {
        this.lastAirportArrival = this.itenariesForm.controls[index]?.get('arr_city')?.value;
        this.itenariesForm.controls[index].get('arr_city')?.setValue('');
      }
    }
  }

  showItenary(index: number, type: any) {
    const deptCity = this.itenariesForm?.controls[index]?.get('dept_city');
    const arrCity = this.itenariesForm?.controls[index]?.get('arr_city');
    
    if (deptCity) {
      const deptValue = deptCity.value;
      if (!deptValue || (deptValue && typeof deptValue !== 'object')) {
        deptCity.setValue(this.lastAirportDept);
      }
    }
    
    if (arrCity) {
      const arrValue = arrCity.value;
      if (!arrValue || (arrValue && typeof arrValue !== 'object')) {
        arrCity.setValue(this.lastAirportArrival);
      }
    }
  }

  autoValue(index: number, type: any, inputType?: any) {
    this.dept_cityAutoValue(index, type, inputType);
    this.arr_cityAutoValue(index, type, inputType);
    if (type === 'arr_date') {
      const indexId = 'dept_date' + index.toString();
      const element = document.getElementById(indexId);
      if (!this.itenariesForm?.controls[index]?.get('dept_date')?.value) {
        if (element) {
          element.blur();
        }
        this.picker?.close();
      }
    }
  }

  dept_cityAutoValue(index: number, type: any, inputType?: any) {
    if (type === 'dept_city') {
      const deptCity = this.itenariesForm?.controls[index]?.get('dept_city')?.value;
      const arrCity = this.itenariesForm?.controls[index]?.get('arr_city')?.value;
      
      if (deptCity && !arrCity) {
        const indexId = 'arr_city' + index.toString();
        const element = document.getElementById(indexId);
        if (element) {
          element.focus();
        }
        if (deptCity.code === arrCity?.code && inputType) {
          this.ArrMatFocused(inputType, false);
        } else if (inputType) {
          this.filteredOptions = getDefaultAirports(this.country);
          this.ArrMatFocused(inputType, true);
        }
      } else {
        const indexId = type + index.toString();
        const element = document.getElementById(indexId);
        if (element) {
          element.blur();
        }
      }
    }
  }

  arr_cityAutoValue(index: number, type: any, inputType?: any) {
    if (type === 'arr_city') {
      const indexId = 'dept_date' + index.toString();
      const deptCity = this.itenariesForm?.controls[index]?.get('dept_city')?.value;
      const arrCity = this.itenariesForm?.controls[index]?.get('arr_city')?.value;
      const deptDate = this.itenariesForm?.controls[index]?.get('dept_date')?.value;
      
      if (
        deptCity?.code !== arrCity?.code &&
        !locationWarning(deptCity?.code || '') &&
        !deptDate
      ) {
        if (inputType) {
          this.ArrMatFocused(inputType, false);
        }
        const element = document.getElementById(indexId);
        if (element) {
          element.focus();
        }
        if (!this.isMobile && this.tripSelected === 'return') {
          this.picker?.open();
        } else if (this.tripSelected !== 'return') {
          if (this.dynamicDatepicker) {
            this.dynamicDatepicker.open();
          }
        }
        this.getPriceCalendar(index);
      } else {
        const indexId = type + index.toString();
        const element = document.getElementById(indexId);
        if (element) {
          element.blur();
        }
      }
    }
  }

  setminDate() {
    this.minDate = {
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      day: new Date().getDate(),
    };
  }

  onewayDateSelection(date: any, datepicker: any, index: number) {
    datepicker?.close();
    this.fromDate = date;
    this.compareDates(index, date);
    this.itenariesForm?.controls[index]?.get('dept_date')?.setValue(this.fromDate);
    if (this.fromDate && this.toDate) {
      this.datevalue();
    }
  }
  /**compare the dates in the multicity search*/
  compareDates(index: number, _date: any) {
    const controls = <UntypedFormArray>this.myForm.controls['itineraries'];
    for (let i = index + 1; i < controls.length; i++) {
      const currentDeptDate = this.itenariesForm?.controls[index]?.get('dept_date')?.value;
      const nextDeptDate = this.itenariesForm?.controls[i]?.get('dept_date')?.value;
      
      if (
        this.tripSelected === 'multi' &&
        currentDeptDate &&
        nextDeptDate
      ) {
        const d1 = `${currentDeptDate.year}-${currentDeptDate.month}-${currentDeptDate.day}`;
        const d2 = `${nextDeptDate.year}-${nextDeptDate.month}-${nextDeptDate.day}`;
        if (new Date(d1).getTime() > new Date(d2).getTime()) {
          this.itenariesForm?.controls[i]?.get('dept_date')?.setValue(null);
        }
      }
    }
  }

  getType(val: any) {
    return typeof val === 'object' ? false : true;
  }
  searchModify() {
    this.searchService.changeSearchVal(true);
    if (this.responsiveservice.screenWidth === 'sm' || this.responsiveservice.screenWidth === 'md') {
      $('#res_Modify').collapse('hide');
    }
  }
  selectCityVal(city: any) {
    if (this.controlIndex !== undefined && this.controlType) {
      this.itenariesForm?.controls[this.controlIndex]?.get(this.controlType)?.setValue(city);
    }
    this.closeSideNav();
  }
  /* oneway /multi type  open date widget for small devices */

  nonRountripDatepicker(datepicker: any, index: number, type: any) {
    if (this.responsiveservice.screenWidth === 'sm' || this.responsiveservice.screenWidth === 'md') {
      const indexId = type + index.toString();
      const element = document.getElementById(indexId);
      if (element) {
        element.blur();
      }
      this.setDatewidget(index, type);
      this.toggleSideNav(index, type, 'date');
    } else {
      datepicker?.open();
    }
    this.getPriceCalendar(index);
  }
  /* return type  open date widget for small devices */

  roundTripDatepicker(datepicker: any, index: number = 0, type?: string) {
    if (this.responsiveservice.screenWidth === 'sm' || this.responsiveservice.screenWidth === 'md') {
      const indexId = type + index.toString();
      const element = document.getElementById(indexId);
      if (element) {
        element.blur();
      }
      this.setDatewidget(index, type);

      this.toggleSideNav(index, type, 'date');
    } else {
      datepicker?.open();
      if (type === 'arr_date') {
        this.getMinFromDate();
        this.autoValue(index, type);
      } else {
        this.setminDate();
      }
    }
    this.getPriceCalendar(index);
  }
  /* send form details to date widget component */
  setDatewidget(index: number, control: any) {
    this.dateWidgetData['formValue'] = this.itenariesForm.value;
    this.dateWidgetData['currentIndex'] = index;
    this.dateWidgetData['trip'] = this.tripSelected;
    this.dateWidgetData['control'] = control;
    this.dateWidgetData['cabin'] = this.cabinClass.value;
  }
  /*set the date widget data to form */
  selectDateVal(dateval: any) {
    if (this.dateWidgetData.trip === 'return') {
      if (this.controlIndex !== undefined) {
        this.itenariesForm?.controls[this.controlIndex]?.get('dept_date')?.setValue(dateval.fromDate);
        this.itenariesForm?.controls[this.controlIndex]?.get('arr_date')?.setValue(dateval.toDate);
      }
      this.fromDate = dateval.fromDate;
      this.minDate = dateval.fromDate;
      this.toDate = dateval.toDate;
      if (!this.toDate) {
        setTimeout(() => {
          this.roundTripDatepicker(this.datepicker1, 0, 'arr_date');
        }, 500);
      }
      if (
        this.fromDate &&
        this.toDate &&
        ((this.dateWidgetData?.control === 'arr_date' && this.toDate.before(this.fromDate)) ||
          (this.dateWidgetData?.control === 'dept_date' && this.fromDate.after(this.toDate)))
      ) {
        this.itenariesForm?.controls[0]?.get('arr_date')?.setValue(null);
        this.toDate = null;
      }
    } else {
      if (this.controlIndex !== undefined && this.controlType) {
        this.itenariesForm?.controls[this.controlIndex]?.get(this.controlType)?.setValue(dateval.fromDate);
      }
      this.fromDate = dateval.fromDate;
      this.minDate = dateval.fromDate;
      if (this.fromDate && this.toDate) {
        this.datevalue();
      }
    }
    this.closeSideNav();
  }

  closeSideNav() {
    this.loadContent = null;
    this.dateWidgetData = {};
  }
  /* extract the date value */
  datevalue() {
    let startDate: string | undefined;
    let endDate: string | undefined;
    
    if (typeof this.fromDate === 'object') {
      startDate = this.ngbDateParserFormatter.format(this.fromDate);
    } else {
      startDate = this.fromDate;
    }
    
    if (typeof this.toDate === 'object') {
      endDate = this.ngbDateParserFormatter.format(this.toDate);
    } else {
      endDate = this.toDate;
    }
    
    const date1 = startDate;
    const date2 = endDate;
    
    if (date1 && date2 && date1 > date2) {
      this.itenariesForm?.controls[0]?.get('arr_date')?.setValue(null);
      this.toDate = null;
    }
  }
  ArrMatFocused(matTrg: MatAutocompleteTrigger, isopen: boolean) {
    if (isopen) {
      setTimeout(() => {
        matTrg.openPanel();
      });
    } else {
      setTimeout(() => {
        matTrg.closePanel();
      });
    }
  }
  getPriceCalendar(index: number) {
    this.price_calendar_res = [];
    const deptCity = this.itenariesForm?.controls[index]?.get('dept_city')?.value;
    const arrCity = this.itenariesForm?.controls[index]?.get('arr_city')?.value;
    
    if (deptCity?.code !== arrCity?.code) {
      this.price_loading = true;
      const depature = deptCity?.code || '';
      const arrival = arrCity?.code || '';
      const isRoundTrip = Boolean(this.tripSelected === 'return');
      const getPricewithCalendarSubscription = this.searchService
        .getPricewithCalendar(depature, arrival, isRoundTrip, this.cabinClass.value)
        .subscribe((val: any) => {
          this.price_loading = false;
          this.price_calendar_res = val?.results || [];
        });
      this.subscriptions.push(getPricewithCalendarSubscription);
    }
  }
  getDatepriceData(date: any) {
    return getDatePrice(date, this.price_calendar_res);
  }
  public flightSearch_cities(tripSelected: Trips, index: number = 0) {
    this.storage.removeItem('flightsearchInfo');
    this.showMask = true;
    this.searchData = {
      tripType: this.tripSelected || '',
      cabinClass: this.cabinClass,
      travellers: this.travellers,
      itineraries: this.myForm.value.itineraries,
      country: this.country || '',
    };
    this.getTravellersCount();
    if (this.searchData.itineraries.length === 1 && this.searchData.tripType === 'multi') {
      this.searchData.tripType = 'oneway';
    }
    if (this.itenariesForm?.controls[index] && tripSelected?.value === 'oneway') {
      this.storeSearchInfo(index);
      return;
    }
    if (tripSelected?.value === 'multi') {
      const controls = <UntypedFormArray>this.myForm.controls['itineraries'];
      for (let i = 0; i <= controls.length; i++) {
        this.storeSearchInfo(i);
      }
    }
    if (tripSelected?.value === 'return' && this.itenariesForm?.controls[index]?.get('arr_date')?.value) {
      this.storeSearchInfo(index);
    }
  }

  public storeSearchInfo(index: number) {
    this.setArrDateValidations(index);
    if (
      this.itenariesForm?.valid &&
      this.itenariesForm?.controls[index]?.get('dept_city')?.value &&
      this.itenariesForm?.controls[index]?.get('arr_city')?.value &&
      this.itenariesForm?.controls[index]?.get('dept_date')?.value
    ) {
      this.storage.setItem('flightsearchInfo', JSON.stringify(this.searchData), 'session');
      if (this.region === 'MM' && !this.isAlertTriggered) {
        const userAffId = this.momentumApiService.affIdAsPerSpendLimits(
          this.meiliIntegrationService.getTierInfo()?.activeCode || '',
          true,
          this.searchData.tripType,
        );
        if (userAffId?.includes(0)) {
          this.showError(
            'You are not eligible for a discount on this flight booking. Please check the applicable offers or proceed without a discount.',
            this.searchData.tripType,
            index,
          );
          return;
        }
      }
      this.triggerFlightSearch();
    }
  }
  triggerFlightSearch() {
    this.storage.removeItem('appCentInfo');
    this.sessionStorageService.clear(SessionUtils.CORRELATION_ID);
    this.storage.removeItem('correlationId');
    this.cid = this.sessionUtils.getCorrelationId();
    removeStorageData('flightResults');
    this.storage.removeItem('selectedFlight');
    this.storage.removeItem('selectedDomesticFlight');
    const qparams = JSON.parse(this.storage.getItem('queryStringParams', 'session') || '{}');
    let paramStrings = { ...qparams };
    paramStrings['correlation_id'] = this.cid;
    this.updateB2BParentUrl();
    this.flightsdata.emit(this.searchData);
    const params = checkAirlineParam();
    if (params) {
      this.storage.removeItem('queryStringParams');
      this.storage.setItem('queryStringParams', JSON.stringify(params), 'session');
    }

    checkAirlineParam()
      ? this.router.navigate(['/flights/results'], {
          relativeTo: this.activatedRoute,
          queryParams: params,
          queryParamsHandling: 'merge',
        })
      : this.router.navigate(['/flights/results'], {
          queryParams: paramStrings,
          relativeTo: this.activatedRoute,
          queryParamsHandling: 'merge',
        });
    this.searchModify();
    this.freshSearch.emit();
  }

  addItineraries() {
    const controls = <UntypedFormArray>this.myForm.controls['itineraries'];
    const lastControl = controls[controls.length - 1];
    
    if (lastControl?.get('dept_city')?.invalid) {
      const index = 'dept_city' + (controls.length - 1).toString();
      const element = document.getElementById(index);
      if (element) {
        element.focus();
      }
      return;
    }
    
    if (lastControl?.get('arr_city')?.invalid) {
      const index = 'arr_city' + (controls.length - 1).toString();
      const element = document.getElementById(index);
      if (element) {
        element.focus();
      }
      return;
    }
    
    if (lastControl?.get('dept_date')?.invalid) {
      const index = 'dept_date' + (controls.length - 1).toString();
      const element = document.getElementById(index);
      if (element) {
        element.focus();
        if (lastControl.get('dept_date')?.invalid && this.tripSelected !== 'return') {
          if (this.dynamicDatepicker) {
            this.dynamicDatepicker.open();
          }
        }
      }
      return;
    }
  }

  onChange(param: string) {
    this.cabinClassSelected = param;
    if (this.cabinClassSelected === 'BUSINESS') {
      this.cabinClass = new CabinClass('Business', this.cabinClassSelected);
    } else if (this.cabinClassSelected === 'FIRST') {
      this.cabinClass = new CabinClass('First', this.cabinClassSelected);
    } else if (this.cabinClassSelected === 'PREMIUM') {
      this.cabinClass = new CabinClass('Premium', this.cabinClassSelected);
    } else {
      this.cabinClass = new CabinClass('Economy', this.cabinClassSelected);
    }
    // this.cabinClassObj.emit(this.cabinClass);
  }
  setArrDateValidations(index: number) {
    if (this.searchData.tripType !== 'return' && this.itenariesForm?.controls[index]) {
      const arrDate = this.itenariesForm.controls[index].get('arr_date');
      if (arrDate) {
        arrDate.setValidators(null);
        arrDate.updateValueAndValidity();
      }
    }
  }
  /**Hiding the Auto complete for no values in the search */
  closeAutoComplete(index: number) {
    if (
      !this.itenariesForm.controls[index]?.get('dept_city')?.value ||
      !this.itenariesForm?.controls[index]?.get('arr_city')?.value
    ) {
      this.filteredOptions = getDefaultAirports(this.country);
    }
  }
  /**To update B2B url with search correlationId  */
  updateB2BParentUrl() {
    if (!isPlatformBrowser(this.platformId)) return;
    window.parent.postMessage({ type: 'updateCorrelationId', correlationId: this.cid }, '*');
  }
  /**Close the Multi city routes  */
  closeMultiCity() {
    return Boolean(
      this.showCross_icon &&
        this.tripVal === 'multi' &&
        this.tripSelected === 'multi' &&
        this.responsiveservice.screenWidth !== 'sm' &&
        this.responsiveservice.screenWidth !== 'md',
    );
  }

  getUsername(): string | null {
    let username: string | null = null;
    const googleUserDetails = this.storage.getItem('googleUserDetails', 'session');
    if (googleUserDetails) {
      const googleLoginUserData = JSON.parse(googleUserDetails);
      if (googleLoginUserData) {
        username = googleLoginUserData.firstName;
      }
    } else if (this.credentialsService?.credentials?.data) {
      const credentials = this.credentialsService.credentials.data;
      username = credentials ? credentials.firstName : null;
    }
    return username;
  }

  getTravellersCount() {
    const credentials = this.storage.getItem('credentials', 'session');
    if (credentials) {
      const userDetails = JSON.parse(credentials);
      if (userDetails?.data?.travellerList) {
        const pax = [...userDetails.data.travellerList];
        const passengers = pax.filter((passengers: any) => passengers.paxSelected);
        const adultList = pax.filter((adult: any) => adult.paxType == 'ADULT');
        const childList = pax.filter((child: any) => child.paxType == 'CHILD');
        const youngAdultList = pax.filter((youngAdult: any) => youngAdult.paxType == 'YOUNGADULT');
        const infantsList = pax.filter((infants: any) => infants.paxType == 'INFANT');
      }
    }
  }
}
