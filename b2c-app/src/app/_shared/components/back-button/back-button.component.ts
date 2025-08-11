import {Component, Input, OnInit} from '@angular/core';
import { Location } from '@angular/common';
import {Router} from '@angular/router';

@Component({
  selector: 'app-back-button',
  templateUrl: './back-button.component.html',
  styleUrls: ['./back-button.component.scss']
})
export class BackButtonComponent implements OnInit {

  @Input() isTextWhite = false;
  @Input() navigationLink = '';
  constructor(private location: Location,
              private router: Router) { }

  ngOnInit(): void {
  }

  goBack(): void {
    if(this.navigationLink) {
      this.router.navigate([this.navigationLink], {queryParamsHandling: 'preserve', replaceUrl: true});
    } else {
      this.location.back();
    }
  }
}
