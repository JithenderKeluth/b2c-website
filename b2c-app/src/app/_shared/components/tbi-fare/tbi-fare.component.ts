import { Component, Input, SimpleChanges } from '@angular/core';
@Component({
  selector: 'app-tbi-fare',
  templateUrl: './tbi-fare.component.html',
  styleUrls: ['./tbi-fare.component.scss']
})
export class TbiFareComponent  {
  @Input() airline: any;
  @Input() odoList:any;
  selectedOdoList:any;
  constructor() { }
  ngOnChanges(changes: SimpleChanges) {
    if (changes['odoList']) {
      this.selectedOdoList = this.odoList;
    }
  }
}
