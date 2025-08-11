import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MyAccountServiceService } from '@app/my-account/my-account-service.service';
import { SearchService } from '@app/flights/service/search.service';
import { DeleteModalComponent } from '@app/my-account/delete-modal/delete-modal.component';
import { AddCardComponent } from '@app/my-account/add-card/add-card.component';
import { UniversalStorageService } from '@app/general/services/universal-storage.service';

@Component({
  selector: 'app-saved-cards',
  templateUrl: './saved-cards.component.html',
  styleUrls: ['./saved-cards.component.scss'],
})
export class SavedCardsComponent implements OnInit {
  credentials: any;
  saveLocalStorage: boolean;

  cards: any;

  userAgent: any;

  constructor(
    public dialog: MatDialog,
    private myAccountService: MyAccountServiceService,
    private searchService: SearchService,
    private storage: UniversalStorageService,
  ) {}

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

    this.cards = this.credentials.data.paymentCardList;
  }

  formatCardNumber(maskedCardNumber: string): string {
    // Extract the last 4 digits
    return maskedCardNumber.slice(-4);
  }

  deleteCard(card: any) {
    const dialog = this.dialog.open(DeleteModalComponent, {
      data: {
        dataId: card.cardToken,
        type: 'card',
        title: 'Delete Card',
        content: 'Do you permanently want to remove this card from your saved card list?',
      },
    });
    const $subscription = dialog.beforeClosed().subscribe((x) => {
      this.setCredentialData();
      $subscription.unsubscribe();
    });
  }

  addCard() {
    const dialog = this.dialog.open(AddCardComponent, { data: {dialogType: 'fullscreen-dialog'} });
    const $subscription = dialog.beforeClosed().subscribe((x) => {
      this.setCredentialData();
      $subscription.unsubscribe();
    });
  }
}
