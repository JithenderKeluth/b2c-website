import { Component, OnInit } from '@angular/core';

declare const $sherpa: any;
@Component({
  selector: 'app-travel-restrictions',
  templateUrl: './travel-restrictions.component.html',
  styleUrls: ['./travel-restrictions.component.scss'],
})
export class TravelRestrictionsComponent implements OnInit {
  ngOnInit(): void {
    this.loadScript();
    setTimeout(() => {
      this.loadTravelRestrictions();
    }, 1000);
  }

  public loadScript() {
    const url = 'https://sdk.joinsherpa.io/widget.js?appId=spIwMTk4OD';
    const node = document.createElement('script');
    node.src = url;
    node.type = 'text/javascript';
    node.async = true;
    const bodyElement = document.getElementsByTagName('body')[0];
    bodyElement.appendChild(node);
  }

  public loadTravelRestrictions() {
    if ($sherpa) {
      $sherpa.V2.createElement('trip').mount('#sherpa-trip-element');
    }
  }
}
