import { Component, OnInit } from '@angular/core';
import { ApiService } from '@app/general/services/api/api.service';

@Component({
  selector: 'app-chat-with-us',
  templateUrl: './chat-with-us.component.html',
  styleUrls: ['./chat-with-us.component.scss'],
})
export class ChatWithUsComponent implements OnInit {
  public tsCountry: any;
  constructor(public apiService: ApiService) {}

  ngOnInit(): void {
    this.tsCountry = this.apiService.extractCountryFromDomain();
  }
  getWhatsAppLink(){
    return this.apiService.isTS_PLUSUser() ? 'TsPluswhatsAppLink' : 'whatsAppLink';
  }
}
