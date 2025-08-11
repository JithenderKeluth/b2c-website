import { Component, Input, OnInit } from '@angular/core';
import { shouldShowPerPersonPrice } from '@app/flights/utils/search-data.utils';
import { S3_BUCKET_PATH } from '@app/general/services/api/api-paths';
import { HttpClient } from '@angular/common/http';
import { UniversalStorageService } from '@app/general/services/universal-storage.service';

@Component({
  selector: 'app-bnpl-message',
  templateUrl: './bnpl-message.component.html',
  styleUrls: ['./bnpl-message.component.scss'],
})
export class BnplMessageComponent implements OnInit {
  @Input() amount!: number;
  @Input() currency!: string;
  @Input() isBundled: boolean;
  isIntl: boolean = false;
  numberOfInstallments: number = 0;
  transactionLimit: number = 0;
  public flightSearchData: any;
  isPPSAmount: boolean = false;
  centralData: any = {};

  constructor(private httpClient: HttpClient, private storage: UniversalStorageService) {}

  ngOnInit(): void {
    this.flightSearchData = JSON.parse(this.storage.getItem('flightsearchInfo', 'session'));
    this.isIntl = JSON.parse(this.storage.getItem('flightResults', 'session'))?.isIntl;
    this.isPPSAmount = this.showPerson_Price();
    const centData = JSON.parse(this.storage.getItem('appCentralizedInfo', 'session'));
    if (centData) {
      this.centralData = centData;
      this.transactionLimit = this.centralData?.bnpl?.capAmount;
      this.numberOfInstallments = this.centralData?.bnpl?.numberOfInstallments;
    } 
  }

  get installmentAmount(): any {
    return Math.round(this.amount / this.numberOfInstallments);
  }

  showPerson_Price() {
    return shouldShowPerPersonPrice(this.flightSearchData);
  }
}
