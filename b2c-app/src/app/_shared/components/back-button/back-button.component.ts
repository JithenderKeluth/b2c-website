import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import { Location } from '@angular/common';
import {Router} from '@angular/router';
import { BackNavigationEvent } from './back-navigation.event';

@Component({
  selector: 'app-back-button',
  templateUrl: './back-button.component.html',
  styleUrls: ['./back-button.component.scss']
})
export class BackButtonComponent implements OnInit {

  @Input() isTextWhite = false;
  @Input() navigationLink = '';
  @Input() hideArrow = false;
  @Output() onBack = new EventEmitter<BackNavigationEvent>();

  constructor(private location: Location,
              private router: Router) { }

  ngOnInit(): void {
  }

  goBack(): void {
    const navEvent = new BackNavigationEvent();
    this.onBack.next(navEvent);

    // Allow listeners to prevent the default navigation behavior, e.g. to close a dialog
    if (navEvent.defaultPrevented) {
      return;
    }

    if(this.navigationLink) {
      this.router.navigate([this.navigationLink], {queryParamsHandling: 'preserve', replaceUrl: true});
    } else {
      this.location.back();
    }
  }
}
