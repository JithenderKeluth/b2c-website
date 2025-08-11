import { Component, OnInit } from '@angular/core';
import { ApiService } from '@app/general/services/api/api.service';

@Component({
  selector: 'app-what-does-travelstart',
  templateUrl: './what-does-travelstart.component.html',
  styleUrls: ['./what-does-travelstart.component.scss'],
})
export class WhatDoesTravelstartComponent implements OnInit {
  tsCountry: any;

  constructor(
    public apiService: ApiService,
    ) {}
  ngOnInit(): void {
    this.tsCountry = this.apiService.extractCountryFromDomain(); 
  }
}
