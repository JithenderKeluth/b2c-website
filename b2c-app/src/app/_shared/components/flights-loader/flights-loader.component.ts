import { Component, Input, OnInit } from '@angular/core';
@Component({
  selector: 'app-flights-loader',
  templateUrl: './flights-loader.component.html',
  styleUrls: ['./flights-loader.component.scss'],
})
export class FlightsLoaderComponent implements OnInit {
  @Input() showSkeltonLoader: boolean = false;
  @Input() tripType: string;
  @Input() destinationCity: string;
  @Input() region: string;
  public animation = 'pulse';
  ngOnInit(): void {}

  // Generate Fake Object Array
  generateFake(count: number): Array<number> {
    const indexes = [];
    for (let i = 0; i < count; i++) {
      indexes.push(i);
    }
    return indexes;
  }
}
