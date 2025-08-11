import { Component, Input } from '@angular/core';
declare let $: any;
@Component({
  selector: 'app-wallet-history',
  templateUrl: './wallet-history.component.html',
  styleUrls: ['./wallet-history.component.scss'],
})
export class WalletHistoryComponent {
  @Input() set walletData(val: any) {
    if (val) {
      this.rows = val;
    } else {
      this.rows = [];
    }
  }
  filterVal: any = [];
  public count = 100;
  public pageSize = 3;
  public limit = 5;
  public offset = 0;
  public selected: any;
  rowsData: any = [];
  rows: any = [];
  temp: any = [];
  dltUser: any;
  editUser: any;
  previewData: any = null;
  constructor() {}

  public onPage(event: any): void {
    this.count = event.count;
    this.pageSize = event.pageSize;
    this.limit = event.limit;
    this.offset = event.offset;
  }

  preview(data: any) { 
    this.previewData = data;
    $('#preview_Modal').modal('show');
  }
}
