import { DatePipe } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild, Inject, PLATFORM_ID } from '@angular/core';
import { NavigationService } from '@app/general/services/navigation.service';
import { CustomDateParser } from '@app/general/utils/CustomDateParser';
import { responsiveService } from '@app/_core';
import { NgbDate, NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { SearchService } from '../service/search.service';
import { getDatePrice } from '../utils/search-data.utils';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-date-selection',
  templateUrl: './date-selection.component.html',
  styleUrls: ['./date-selection.component.scss'],
  providers: [{ provide: NgbDateParserFormatter, useClass: CustomDateParser }],
})
export class DateSelectionComponent implements OnInit {
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
  calender_height: number = 0;
  
  constructor(
    public ngbDateParserFormatter: NgbDateParserFormatter,
    private navService: NavigationService,
    private datePipe: DatePipe,
    public responsiveservice: responsiveService,
    private searchService: SearchService,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    /*focus the scroll the calender based on date */
    setTimeout(() => {
      let getLastElemIndex: number;
      if (document.getElementsByClassName('range').length > 0) {
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
      if (this.fromDate && !this.toDate && this.fromDate.after(this.toDate)) {
        this.toDate = null;
      }
    } else {
      this.fromDate = date;
    }
    this.dateSelected();
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
  /* change format of date into object format */
  getDates(date: any) {
    if (typeof date !== 'object') {
      return this.ngbDateParserFormatter.parse(this.datePipe.transform(date, 'dd-MM-yyyy'));
    } else {
      return date;
    }
  }
  ngAfterViewInit() {
    this.getcalHeight();
    this.responsiveservice.getMobileStatus().subscribe(() => {
      this.getcalHeight();
    });
  }
  getcalHeight() {
    if(!this.isBrowser) return;
    let vHeight = window.innerHeight;
    let div_height = this.elementView.nativeElement.offsetHeight;
    this.calender_height = vHeight - (div_height + 50) - 150;
  }
  getControlData(data: any) {
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
}
