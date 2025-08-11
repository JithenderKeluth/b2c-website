import { Component, OnInit } from '@angular/core';
import { ApiService } from '@app/general/services/api/api.service';

@Component({
  selector: 'app-contact-faq',
  templateUrl: './contact-faq.component.html',
  styleUrls: ['./contact-faq.component.scss'],
})
export class ContactFaqComponent implements OnInit {
  public tsCountry: any;
  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.tsCountry = this.apiService.extractCountryFromDomain();
  }
}
