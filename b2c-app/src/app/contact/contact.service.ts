import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CONTACT_US_FORM_FIELDS } from '@app/general/services/api/api-paths';
import { ApiService } from '@app/general/services/api/api.service';
@Injectable({
  providedIn: 'root'
})
export class ContactService {

  constructor(private httpClient:HttpClient,
    private apiService:ApiService
  ) { }

   getContactUsFormCategories(org:any){
     let Url = `${this.apiService.getContactUsKeysPath()}${org}-${CONTACT_US_FORM_FIELDS}`;
     return this.httpClient.get(Url);
  }
}
