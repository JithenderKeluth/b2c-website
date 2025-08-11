import { MeiliIntegrationService } from '@app/general/services/meili-integration.service';

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UniversalStorageService } from '@app/general/services/universal-storage.service';

@Component({
  selector: 'app-member-details',
  templateUrl: './member-details.component.html',
  styleUrls: ['./member-details.component.scss'],
})
export class MemberDetailsComponent implements OnInit {
  constructor(private router:Router,private meiliService : MeiliIntegrationService, private storage: UniversalStorageService) {}
  activeIndex: number | null = null;
  members_data: any;
  primaryMemberName:any = null;
  ngOnInit(): void {
    this.members_data = JSON.parse(this.storage.getItem('credentials', 'session'))?.data;
    let primaryTraveler = this.meiliService.getPrimaryUser();
    this.primaryMemberName = primaryTraveler != undefined && primaryTraveler != null ? (primaryTraveler?.personName?.givenName + ' ' + primaryTraveler?.personName?.surname) : (this.members_data?.members[0].firstName + ' '+ this.members_data.members[0].surname) 
  }

  toggleAccordion(index: number): void {
    this.activeIndex = this.activeIndex === index ? null : index;
  }

  
}
