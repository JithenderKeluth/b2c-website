import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AddTravellersComponent } from '@app/my-account/add-travellers/add-travellers.component';
import { MyAccountServiceService } from '@app/my-account/my-account-service.service';
import { SearchService } from '@app/flights/service/search.service';
import { DeleteModalComponent } from '@app/my-account/delete-modal/delete-modal.component';
import { UniversalStorageService } from '@app/general/services/universal-storage.service';
import { ApiService } from '../../general/services/api/api.service';

declare let $: any;

@Component({
  selector: 'app-saved-travellers',
  templateUrl: './saved-travellers.component.html',
  styleUrls: ['./saved-travellers.component.scss'],
})
export class SavedTravellersComponent implements OnInit {
  credentials: any;
  saveLocalStorage: boolean;
  travellers: any;
  userAgent: any;
  country: string;

  constructor(
    public dialog: MatDialog,
    private myAccountService: MyAccountServiceService,
    private searchService: SearchService,
    apiService: ApiService,
    private storage: UniversalStorageService
  ) {
    this.country = apiService.extractCountryFromDomain();
  }

  ngOnInit(): void {
    this.setCredentialData();

    this.searchService.langValue.subscribe((val: any) => {
      this.userAgent = this.myAccountService.countrydata;
    });
  }

  setCredentialData() {
    if (this.storage.getItem('credentials', 'local')) {
      this.saveLocalStorage = true;
      this.credentials = JSON.parse(this.storage.getItem('credentials', 'local'));
    } else if (this.storage.getItem('credentials', 'session')) {
      this.saveLocalStorage = false;
      this.credentials = JSON.parse(this.storage.getItem('credentials', 'session'));
    }

    this.travellers = this.credentials.data.travellerList;
  }

  openTravellerDialog(traveller: any) {
    const dialog = this.dialog.open(AddTravellersComponent, {
      panelClass: 'fullscreen-dialog',
      data: traveller,
    });

    const $subscription = dialog.beforeClosed().subscribe((x) => {
      this.setCredentialData();
      $subscription.unsubscribe();
    });
  }

  deleteTraveller(travellerId: any) {
    const dialog = this.dialog.open(DeleteModalComponent, {
      data: {
        dataId: travellerId,
        type: 'traveller',
        title: 'Delete Traveller',
        content: 'Do you permanently want to remove this traveller from your saved traveller list?',
      },
      panelClass: 'custom-modal-delete-radius'
    });
    const $subscription = dialog.beforeClosed().subscribe((x) => {
      this.setCredentialData();
      $subscription.unsubscribe();
    });
  }
}
