import { Component } from '@angular/core';

@Component({
  selector: 'app-traveller-page-loader',
  templateUrl: './traveller-page-loader.component.html',
  styleUrls: ['./traveller-page-loader.component.scss'],
})
export class TravellerPageLoaderComponent {
  public animation = 'pulse';
  constructor() {}
  // Generate Fake Object Array
  generateFake(count: number): Array<number> {
    const indexes = [];
    for (let i = 0; i < count; i++) {
      indexes.push(i);
    }
    return indexes;
  }
}
