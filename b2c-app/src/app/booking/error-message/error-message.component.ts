import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SessionUtils } from '@app/general/utils/session-utils';
import { SessionStorageService } from 'ngx-webstorage';
import { UniversalStorageService } from '@app/general/services/universal-storage.service';
import { ApiService } from '../../general/services/api/api.service';
@Component({
  selector: 'app-error-message',
  templateUrl: './error-message.component.html',
  styleUrls: ['./error-message.component.scss'],
})
export class ErrorMessageComponent implements OnInit {
  private cid: string;
  public country: string;
  constructor(
    private router: Router,
    private sessionStorageService: SessionStorageService,
    private sessionUtils: SessionUtils,
    private activatedRoute: ActivatedRoute,
    public apiservice: ApiService,
    private storage: UniversalStorageService
  ) {
    this.country = this.apiservice.extractCountryFromDomain();
  }
  ngOnInit(): void {  }

  /**Making the user to navigating to SRP and hitting the SEARCH API again to get new results */
  newSearch() {
    this.storage.removeItem('flightResults');
    this.sessionStorageService.clear(SessionUtils.CORRELATION_ID);
    this.storage.removeItem('correlationId');
    this.cid = this.sessionUtils.getCorrelationId();
    const qparams = JSON.parse(this.storage.getItem('queryStringParams', 'session')) || {};
    let paramStrings = { ...qparams };
    paramStrings['correlation_id'] = this.cid;
    if (qparams) {
      this.storage.removeItem('queryStringParams');
      this.storage.setItem('queryStringParams', JSON.stringify(paramStrings), 'session');
    }
    this.router.navigate(['/flights/results'], {
      queryParams: paramStrings,
      relativeTo: this.activatedRoute,
      queryParamsHandling: 'merge',
    });
  }
}
