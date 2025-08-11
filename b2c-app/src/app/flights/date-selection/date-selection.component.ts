import { DatePipe } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild, Inject, PLATFORM_ID } from '@angular/core';
import { NavigationService } from '@app/general/services/navigation.service';
import { CustomDateParser } from '@app/general/utils/CustomDateParser';
import { responsiveService } from '@app/_core';
import { NgbDate, NgbDateParserFormatter, NgbDatepicker, NgbDatepickerI18n } from '@ng-bootstrap/ng-bootstrap';
import { SearchService } from '../service/search.service';
import { getDatePrice } from '../utils/search-data.utils';
import { isPlatformBrowser } from '@angular/common';
import { ApiService } from '@app/general/services/api/api.service';

@Component({
  selector: 'app-date-selection',
  templateUrl: './date-selection.component.html',
  styleUrls: ['./date-selection.component.scss'],
  providers: [{ provide: NgbDateParserFormatter, useClass: CustomDateParser }],
})
export class DateSelectionComponent implements OnInit {
  displayMonths: number;
  tsCountry: string;
  price_calendar_res: any = [];
  price_loading: boolean = true;
  hoveredDate: NgbDate | null = null;
  private isBrowser: boolean;
  public minDate = {
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    day: new Date().getDate(),
  };
  public maxDate = {
    year: new Date().getFullYear() + 1,
    month: new Date().getMonth() + 1,
    day: new Date().getDate(),
  };
  fromDate: NgbDate = null;
  toDate: NgbDate | null = null;
  widgetData: any = null;
  @Input() set datefareInfo(val: any) {
    this.price_calendar_res = val;
    setTimeout(() => {
      this.price_loading = false;
    }, 1000);
  }
  @Input() set widgetInfo(value: any) {
    this.widgetData = value;
    if (this.widgetData.trip == 'return') {
      this.fromDate = this.getDates(this.widgetData.formValue[0].dept_date);
      this.toDate = this.getDates(this.widgetData.formValue[0].arr_date);
      if (this.widgetData.control == 'arr_date' && this.fromDate) {
        this.minDate = this.fromDate;
      }
    } else {
      if (this.widgetData.formValue.length > 1 && this.widgetData.currentIndex > 0) {
        this.minDate = this.getDates(this.widgetData.formValue[this.widgetData.currentIndex - 1].dept_date);
      }
      this.fromDate = this.getDates(this.widgetData.formValue[this.widgetData.currentIndex].dept_date);
      this.toDate = null;
    }
  }
  @Output() selectedDate: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild('info') elementView: ElementRef;
  @ViewChild('dp') datepicker: NgbDatepicker;
  calender_height: number = 0;

  selectedMonth: number;
  selectedYear: number;
  oldMonth: number;
  displayedMonths: number[] = [];
  displayedYears: number[] = [];

  todayDate = new NgbDate(
    new Date().getFullYear(),
    new Date().getMonth() + 1,
    new Date().getDate()
  );

  constructor(
    public ngbDateParserFormatter: NgbDateParserFormatter,
    public i18n: NgbDatepickerI18n,
    private navService: NavigationService,
    private datePipe: DatePipe,
    public responsiveservice: responsiveService,
    private searchService: SearchService,
    @Inject(PLATFORM_ID) private platformId: Object,
    apiService: ApiService,
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.tsCountry = apiService.extractCountryFromDomain();
  }

  ngOnInit(): void {
    this.displayMonths = this.tsCountry === 'SB' ? 1 : 12;
    /*focus the scroll the calender based on date */
    setTimeout(() => {
      let getLastElemIndex: number;
      if (typeof document !== 'undefined' && document.getElementsByClassName('range').length > 0) {
        if (this.widgetData.control == 'dept_date') {
          getLastElemIndex = 0;
        } else {
          getLastElemIndex = document.getElementsByClassName('range').length - 1;
        }
        document.getElementsByClassName('range')[getLastElemIndex].scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
    }, 500);
  }
  /* date selection from datepicker */
  onDateSelection(date: NgbDate) {
    if (this.widgetData.trip === 'return') {
      if (this.widgetData.control === 'dept_date') {
        this.fromDate = date;
      } else if (this.widgetData.control === 'arr_date') {
        this.toDate = date;
      }
       if (this.fromDate && this.toDate && this.widgetData.control == 'dept_date') {
        if (date.after(this.toDate)) {
          this.toDate = null;
        }
        this.fromDate = date;
      }
    } else {
      this.fromDate = date;
    }
    if (this.tsCountry !== 'SB') {
      this.dateSelected();
    }
  }
  isHover(date: NgbDate) {
    return (
      this.fromDate && !this.toDate && this.hoveredDate && date.after(this.fromDate) && date.before(this.hoveredDate)
    );
  }

  isInsideDate(date: NgbDate) {
    return this.toDate && date.after(this.fromDate) && date.before(this.toDate);
  }

  isRanged(date: NgbDate) {
    return (
      date.equals(this.fromDate) ||
      (this.toDate && date.equals(this.toDate)) ||
      this.isInsideDate(date) ||
      this.isHover(date)
    );
  }
  extractDate(date: any) {
    if (typeof date === 'object') {
      return this.ngbDateParserFormatter.format(date);
    } else {
      return date;
    }
  }
  /* send  details to search component */
  dateSelected() {
    this.navService.setShowNav(false);
    let dateObj = {
      fromDate: this.fromDate,
      toDate: this.toDate,
    };
    this.selectedDate.emit(dateObj);
  }

  nextSelection() {
    this.navService.setShowNav(false);
    let dateObj = {
      fromDate: this.fromDate,
      toDate: this.toDate,
    };
    this.selectedDate.emit(dateObj);
  }
  /* change format of date into object format */
  getDates(date: any) {
    if (typeof date !== 'object') {
      return this.ngbDateParserFormatter.parse(this.datePipe.transform(date, 'dd-MM-yyyy'));
    } else {
      return date;
    }
  }
  ngAfterViewInit() {
    if (this.fromDate) {
      this.displayedMonths = this.getMonthsByYear(this.fromDate.year);
      this.displayedYears = this.generateRange(this.minDate.year, this.maxDate.year);
    } else {
      this.displayedMonths = this.getMonthsByYear(this.datepicker.state.firstDate.year);
      this.displayedYears = this.generateRange(this.minDate.year, this.maxDate.year);

      this.getcalHeight();
      this.responsiveservice.getMobileStatus().subscribe(() => {
        this.getcalHeight();
      });
    }

    if (this.fromDate && this.widgetData.control === 'dept_date') {
      this.displayedMonths = this.getMonthsByYear(this.todayDate.year);
      this.displayedYears = this.generateRange(this.minDate.year, this.maxDate.year);
      this.tsCountry === 'SB' ? this.datepicker.navigateTo(this.fromDate) : this.datepicker.navigateTo(this.todayDate);
      this.datepicker.focus();
    } else if (this.toDate && this.widgetData.control === 'arr_date') {
      this.datepicker.navigateTo(this.toDate);
      this.datepicker.focus();
      this.displayedMonths = this.getMonthsByYear(this.toDate.year);
      this.displayedYears = this.generateRange(this.minDate.year, this.maxDate.year);
    }


    this.setSelectedDate();
  }

  getcalHeight() {
    if(!this.isBrowser) return;
    let vHeight = window.innerHeight;
    let div_height = this.elementView.nativeElement.offsetHeight;
    this.calender_height = vHeight - (div_height + 50) - 150;
  }
  getControlData(data: any) {
    if (data.control == 'dept_date' && this.tsCountry === 'SB') {
      return 'Departure Date';
    } else if (data.control == 'arr_date' && this.tsCountry === 'SB') {
      return 'Return Date';
    }

    if (data.control == 'dept_date' && this.fromDate) {
      return this.ngbDateParserFormatter.format(this.fromDate);
    } else if (data.control == 'dept_date' && !this.fromDate) {
      return 'Departure Date';
    } else if (data.control == 'arr_date' && this.toDate) {
      return this.ngbDateParserFormatter.format(this.toDate);
    } else if (data.control == 'arr_date' && !this.toDate) {
      return 'Return Date';
    }
  }
  /** here get price of day based on orgin and destination */
  getPriceCalendar(index: number) {
    this.price_calendar_res = [];
    if (
      this.widgetData.formValue[index].dept_city &&
      this.widgetData.formValue[index].arr_city &&
      this.widgetData.formValue[index].dept_city.code !== this.widgetData.formValue[index].arr_city.code
    ) {
      this.price_loading = true;
      let depature = this.widgetData.formValue[index].dept_city.code;
      let arrival = this.widgetData.formValue[index].arr_city.code;
      let isRoundTrip = Boolean(this.widgetData.trip == 'return');
      this.searchService
        .getPricewithCalendar(depature, arrival, isRoundTrip, this.widgetData.cabin)
        .subscribe((val: any) => {
          this.price_loading = false;
          this.price_calendar_res = val && val.results ? val.results : [];
        });
    }
  }
  getDatepriceData(date: any) {
    return getDatePrice(date, this.price_calendar_res);
  }

  setSelectedDate() {
    if (!this.datepicker) return;
    const { state } = this.datepicker;
    if (state) {
      this.selectedMonth = state.firstDate.month;
      this.selectedYear = state.firstDate.year;
    } else {
      this.selectedMonth = this.datepicker.calendar.getToday().month;
      this.selectedYear = this.datepicker.calendar.getToday().year;
    }
  }

  generateRange(start: number, end: number): number[] {
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  getMonthsByYear(year: number) {
    const { calendar } = this.datepicker;

    if (
      this.toDate &&
      this.toDate.year === year &&
      this.widgetData.control === 'dept_date' &&
      this.minDate.year === year
    ) {
      return calendar
        .getMonths(year)
        .filter((month: number) => month >= this.minDate.month);
    }

    if (year === this.minDate.year) {
      return calendar.getMonths(year).filter((month: number) => month >= this.minDate.month);
    } else if (year === this.maxDate.year) {
      return calendar.getMonths(year).filter((month: number) => month <= this.maxDate.month);
    } else {
      return calendar.getMonths(year);
    }
  }

  changeMonth(event: any) {
    const { state, minDate } = this.datepicker;
    const date = new NgbDate(state.firstDate.year, event, minDate.day);

    this.datepicker.navigateTo(date);
    this.setSelectedDate();
  }

  changeYear(event: any) {
    const { state, minDate } = this.datepicker;
    const date = new NgbDate(event, state.firstDate.month, minDate.day);
    this.displayedMonths = this.getMonthsByYear(date.year);

    this.datepicker.navigateTo(date);
    this.setSelectedDate();
  }

  navigate(delta: number, deltaType: 'm' | 'y') {
    const { state, calendar } = this.datepicker;
    const nextDate = calendar.getNext(state.firstDate, deltaType, delta);
    this.displayedMonths = this.getMonthsByYear(nextDate.year);
    this.datepicker.navigateTo(nextDate);
    this.setSelectedDate();
  }

  getNextButtonText() {
    if (this.widgetData.trip !== 'return') return 'Done';

    if (!this.toDate || !this.fromDate) {
      return 'Next';
    } else if (this.fromDate || this.toDate) {
      return 'Done';
    } else {
      return '';
    }
  }

  isNextDisabled() {
    if (this.widgetData.control == 'dept_date') {
      return this.fromDate == null;
    } else if (this.widgetData.control == 'arr_date') {
      return this.toDate == null;
    }
  }

  protected readonly console = console;

}
