import { Component, Input } from '@angular/core';

@Component({
  selector: 'lp-footer-links',
  templateUrl: './footer-links.component.html',
  styleUrls: ['./footer-links.component.scss'],
})
export class FooterLinksComponent {
  @Input() items: {
    header?: string;
    sectionLinks?: string;
  } = {};

  constructor() {}
}
