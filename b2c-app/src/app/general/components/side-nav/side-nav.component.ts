import { Component, OnInit, ViewEncapsulation, Input, Output, EventEmitter, Inject, PLATFORM_ID } from '@angular/core';
import { NavigationService } from './../../services/navigation.service';
import { Observable } from 'rxjs';
import { SideNavDirection } from './side-nav-direction';
import { isPlatformBrowser } from '@angular/common';
import {ApiService} from '@app/general/services/api/api.service';

@Component({
  selector: 'app-side-nav',
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class SideNavComponent implements OnInit {
  showSideNav: Observable<boolean>;

  @Input() sidenavTemplateRef: any;
  @Input() duration: number = 0.25;
  @Input() navWidth: number;
  @Input() direction: SideNavDirection = SideNavDirection.Right;
  @Output() closeNav: EventEmitter<any> = new EventEmitter<any>();
  tsCountry: string;
  constructor(private navService: NavigationService, apiService: ApiService, @Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      this.navWidth = window.innerWidth;
    }
    this.tsCountry = apiService.extractCountryFromDomain();
  }

  ngOnInit(): void {
    this.showSideNav = this.navService.getShowNav();
  }

  onSidebarClose() {
    this.navService.setShowNav(false);
    this.closeNav.emit();
  }

  getSideNavBarStyle(showNav: boolean) {
    let navBarStyle: any = {};

    navBarStyle.transition = this.direction + ' ' + this.duration + 's, visibility ' + this.duration + 's';
    if (isPlatformBrowser(this.platformId)) {
      navBarStyle.width = window.innerWidth + 'px';
      navBarStyle[this.direction] = (showNav ? 0 : window.innerWidth * -1) + 'px';
    }

    return navBarStyle;
  }
}
