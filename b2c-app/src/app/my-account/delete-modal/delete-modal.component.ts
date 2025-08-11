import { Component, Inject, OnInit } from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import { MyAccountServiceService } from '@app/my-account/my-account-service.service';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { SearchService } from '@app/flights/service/search.service';
import { SessionService } from '../../general/services/session.service';
import { UniversalStorageService } from '@app/general/services/universal-storage.service';

interface IDeleteModalData {
  dataId: string;
  type: 'card' | 'traveller';
  title: string;
  content: string;

}

@Component({
  selector: 'app-delete-modal',
  templateUrl: './delete-modal.component.html',
  styleUrls: ['./delete-modal.component.scss'],
})
export class DeleteModalComponent implements OnInit {
  modalData: IDeleteModalData;
  credentials: any;
  saveLocalStorage: boolean;

  userAgent: any;
  isLoading = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<DeleteModalComponent>,
    private myAccountService: MyAccountServiceService,
    private _snackBar: MatSnackBar,
    private searchService: SearchService,
    private sessionService: SessionService,
    private storage: UniversalStorageService
  ) {
    this.modalData = data;
  }

  ngOnInit(): void {
    if (this.storage.getItem('credentials', 'local')) {
      this.saveLocalStorage = true;
      this.credentials = JSON.parse(this.storage.getItem('credentials', 'local'));
    } else if (this.storage.getItem('credentials', 'session')) {
      this.saveLocalStorage = false;
      this.credentials = JSON.parse(this.storage.getItem('credentials', 'session'));
    }
    this.searchService.langValue.subscribe((val: any) => {
      this.userAgent = this.myAccountService.countrydata;
    });
  }

  closeModal() {
    this.dialogRef.close();
  }

  deleteCard() {
    const tokenData = {
      token: this.credentials.data.token,
      userAgent: this.userAgent,
    };
    this.myAccountService.deletepaymentCard(this.modalData.dataId, tokenData).subscribe((res: any) => {
      if (res.result == 'OK' && res.code == 200) {
        this.credentials = res;
        //store data in session storage & local storage
        this.sessionService.setStorageDataInSession(res, this.saveLocalStorage)

        this.dialogRef.close();
        this._snackBar.open('Payment Card Deleted Successfully', '');
        setTimeout(() => {
          this._snackBar.dismiss();
        }, 3000);
      }
    });
  }

  deleteTraveller() {
    const tokenData = {
      token: this.credentials.data.token,
      userAgent: this.userAgent,
    };
    this.myAccountService.deleteTraveller(this.modalData.dataId, tokenData).subscribe((res: any) => {
      if (res.result === 'OK' && res.code === 200) {
        //store data in session storage & local storage
        this.sessionService.setStorageDataInSession(res, this.saveLocalStorage)
        this.dialogRef.close();
        this._snackBar.open('Traveller Deleted Successfully', '');
        setTimeout(() => {
          this._snackBar.dismiss();
        }, 3000);
      }
    });
  }

  confirm() {
    this.isLoading = true;
    switch (this.modalData.type) {
      case 'card':
        this.deleteCard();
        break;
      case 'traveller':
        this.deleteTraveller();
        break;
      default:
        this.dialogRef.close();
        break;
    }
  }
}
