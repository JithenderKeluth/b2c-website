import { Component, OnInit } from '@angular/core';
import { IframeWidgetService } from './../../general/services/iframe-widget.service';
import { ApiService } from '@app/general/services/api/api.service';

@Component({
  selector: 'app-payments-footer',
  templateUrl: './payments-footer.component.html',
  styleUrls: ['./payments-footer.component.scss'],
})
export class PaymentsFooterComponent implements OnInit {
  public router_path: any;
  public countryValue: any;
  public show3DSecure: boolean = false;
  constructor(public iframeWidgetService: IframeWidgetService, private apiService: ApiService) {}

  ngOnInit(): void {
    this.countryValue = this.apiService.extractCountryFromDomain();
  }
  showIataSecured() {
    if (this.countryValue === 'ZW' || this.countryValue === 'BW' || this.countryValue === 'NA') {
      this.show3DSecure = true;
      return false;
    } else {
      this.show3DSecure = false;
      return true;
    }
  }
  getPresentYear() {
    return new Date().getFullYear();
  }
}
