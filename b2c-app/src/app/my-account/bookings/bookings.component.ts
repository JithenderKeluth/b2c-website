import { Component, OnInit, Renderer2, ElementRef } from '@angular/core';
import { MyAccountServiceService } from './../my-account-service.service';
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { SearchService } from '@app/flights/service/search.service';
import { responsiveService } from '@app/_core/services/responsive.service';
import { ApiService } from '@app/general/services/api/api.service';
declare const $: any;
@Component({
  selector: 'app-bookings',
  templateUrl: './bookings.component.html',
  styleUrls: ['./bookings.component.scss'],
})
export class BookingsComponent implements OnInit {
  tsCountry :any = null;
  selectedTab :any = null;
  constructor(
    private route: Router,
    public responsiveService: responsiveService,
    private renderer: Renderer2,
    private el: ElementRef,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    this.tsCountry = this.apiService.extractCountryFromDomain();
    this.selectTab('Flights')
  }
  goToHome() {
    this.route.navigate([''], { queryParamsHandling: 'preserve' });
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
    if(param == 'Cars'){
      this.loadMeiliScript();
    }
  }
}
