import { Component, OnInit } from '@angular/core';
import { ApiService } from '@app/general/services/api/api.service';
import { responsiveService } from '@app/_core/services/responsive.service';

@Component({
  selector: 'app-travel-app',
  templateUrl: './travel-app.component.html',
  styleUrls: ['./travel-app.component.scss'],
})
export class TravelAppComponent implements OnInit {
  public tsCountry: any;

  constructor(private apiService: ApiService, public responseService: responsiveService) {}

  ngOnInit(): void {
    this.tsCountry = this.apiService.extractCountryFromDomain();
  }
}
