import {Component, Input, OnInit} from '@angular/core';
import {  numInputNoChars } from '@app/flights/utils/odo.utils';
import { ApiService } from '@app/general/services/api/api.service';
import { initTawkScript } from '@app/general/utils/tawkscript';
import { responsiveService } from '@app/_core';
import { NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { CustomDateParser } from '@app/general/utils/CustomDateParser';
import { UniversalStorageService } from '@app/general/services/universal-storage.service';

declare const $: any;
const getMonth = (idx: any) => {
  const objDate = new Date();
  objDate.setDate(1);
  objDate.setMonth(idx - 1);
  const locale = 'en-us';
  const month = objDate.toLocaleString(locale, { month: 'short' });
  return month;
};
@Component({
  selector: 'app-contact-us-form',
  templateUrl: './contact-us-form.component.html',
  styleUrls: ['./contact-us-form.component.scss', './../../../theme/country_selection.scss'],
  providers: [{ provide: NgbDateParserFormatter, useClass: CustomDateParser }],
})
export class ContactUsFormComponent implements OnInit {
  public requests = true;
  public travelAlerts = false;
  public faq = false;
  public chatToUs = false;
  public tsCountry: any;
  public successMsg = false;
  public contactUsApiErrors: any = null;
  public cancellationCategoryError = false;
  public showTrAlerts = false;
  public isPaxNameDuplicted = false;
  public selectedTab: any = 'existBooking';
  public activeTab: string;
  months = Array(12)
    .fill(0)
    .map((_i, idx) => getMonth(idx + 1));
  public countrydata: any;
  public countryName: any;
  public countryCode: string;
  public isLoading = false;
  public centerlizedJsonInfo: any = null;
  show_WhatsAppWidget: boolean = false;
  constructor(
    public apiService: ApiService,
    public responsiveservice: responsiveService,
    private storage: UniversalStorageService
  ) {}

  @Input() hideTopBar = false;

  ngOnInit(): void {
    this.activeTab = this.selectedTab;
    this.tsCountry = this.apiService.extractCountryFromDomain();
    this.getCenterlizedData();
  }
  scroll(el: HTMLElement) {
    el.scrollIntoView({ behavior: 'smooth' });
  }

  goToRequest(param: string) {
    this.requests = false;
    this.travelAlerts = false;
    this.faq = false;
    this.chatToUs = false;
    switch (param) {
      case 'request':
        this.requests = true;
        break;
      case 'chat':
        this.chatToUs = true;
        break;
      case 'tAlert':
        this.travelAlerts = true;
        break;
      case 'frequentQuestions':
        this.faq = true;
        break;
      default:
        break;
    }
  }
  ngOnDestroy() {
    $('#query_failed_Modal').modal('hide');
    $('#query_success_Modal').modal('hide');
  }
  /**This method for open tawk chat  */
  openTawkWidget() {
    initTawkScript(this.apiService.extractCountryFromDomain(), false);
  }

  // allows users to type only numbers
  onlyNumberKey(event: any) {
    return numInputNoChars(event);
  }
  /**her to get whatsApp link based on user info */
  getWhatsAppLink() {
    return this.apiService.isTS_PLUSUser() ? 'TsPluswhatsAppLink' : 'whatsAppLink';
  }
  /**To get centerlized Data to display whatsapp based on S3 content we are enable and disable whatsapp */
  getCenterlizedData() {
    const centerlizedInfo: any = JSON.parse(this.storage.getItem('appCentralizedInfo', 'session'));
    if (centerlizedInfo) {
      this.centerlizedJsonInfo = centerlizedInfo;
      this.show_WhatsAppWidget = Boolean(
        this.centerlizedJsonInfo?.whatsAppWidgetDomains?.length > 0 &&
          this.centerlizedJsonInfo?.whatsAppWidgetDomains?.includes(this.tsCountry)
      );
    } else {
      this.show_WhatsAppWidget = false;
    }
  }
}
