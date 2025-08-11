import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { DatePipe } from '@angular/common';
import { SearchService } from '../service/search.service';
import { Router } from '@angular/router';
import { responsiveService } from '@app/_core';
import { getTravellerType } from '@app/booking/utils/traveller.utils';
import { UniversalStorageService } from '@app/general/services/universal-storage.service';
import {ApiService} from "@app/general/services/api/api.service";
declare const $: any;

@Component({
  selector: 'app-srp-mweb-header',
  templateUrl: './srp-mweb-header.component.html',
  styleUrls: ['./srp-mweb-header.component.scss'],
})
export class SrpMwebHeaderComponent implements OnInit {
  public flightsearchInfo: any;
  public collapsedHandler: string = '';
  public isSwitchToDeptFlight: boolean = false;
  @Input() flightslist: any;
  @Input() switchDomFilght: boolean;
  @Output() isShowSearch: EventEmitter<boolean> = new EventEmitter();
  @Output('switchDomFilghts') switchDomFilghts: EventEmitter<any> = new EventEmitter();
  region: string;

  constructor(
    private ngbDateParserFormatter: NgbDateParserFormatter,
    private datePipe: DatePipe,
    private apiService: ApiService,
    private searchService: SearchService,
    private router: Router,
    private responsiveservice: responsiveService,
    private storage: UniversalStorageService
  ) {}

  ngOnInit(): void {
    this.region = this.apiService.extractCountryFromDomain() || 'ZA'
    this.flightsearchInfo = JSON.parse(this.storage.getItem('flightsearchInfo', 'session'));
    this.searchService.currentsearch.subscribe((data: any) => {
      if (data) {
        this.flightsearchInfo = JSON.parse(this.storage.getItem('flightsearchInfo', 'session'));
      }
    });
  }

  getPassengers(travellers: number, param: string) {
    return getTravellerType(travellers, param);
  }

  getDeptDate(deptDate: any) {
    let departureDate: any;
    if (typeof deptDate == 'object') {
      let date = this.ngbDateParserFormatter.format(deptDate);
      departureDate = this.datePipe.transform(date, 'd MMM yyyy');
    } else {
      departureDate = this.datePipe.transform(deptDate, 'd MMM yyyy');
    }
    return departureDate;
  }

  handleCollapse(param: string, tripType: string) {
    if (param === 'filters') {
      $('#res_sorting').collapse('hide');
      $('#res_Modify').collapse('hide');
    } else if (param === 'sort') {
      $('#res_filters').collapse('hide');
      $('#res_Modify').collapse('hide');
    } else if (param == 'modify') {
      if (this.responsiveservice.screenWidth == 'sm' || this.responsiveservice.screenWidth == 'md') {
        this.isShowSearch.emit(true);
        $('#res_filters').collapse('hide');
        $('#res_sorting').collapse('hide');
        return;
      } else {
        this.router.navigate(['']);
      }
    }
  }

  switchPaths() {
    if (this.switchDomFilght) {
      this.isSwitchToDeptFlight = true;
      this.switchDomFilghts.emit();
    } else {
      this.router.navigate(['/'],{ queryParamsHandling: 'preserve' });
    }
  }
}
