import { Component, Input } from '@angular/core';
import { CMSService } from './../../cms.service';

@Component({
  selector: 'lp-hero',
  templateUrl: './hero-component.component.html',
  styleUrls: ['./hero-component.component.scss'],
})
export class HeroComponent {
  @Input() items: {
    type?: string;
    header?: string;
    carrier?: string;
    imageURL?: string;
  } = {};
  public searchExpanded = false;

  constructor(private cmsService: CMSService) {}
  followLink(path: string) {
    this.cmsService.followLink(path);
  }

  toggleSearch() {
    this.searchExpanded = !this.searchExpanded;
  }
}
