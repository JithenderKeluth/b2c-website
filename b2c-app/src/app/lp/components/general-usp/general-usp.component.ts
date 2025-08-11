import { CMSService } from './../../cms.service';
import { Component } from '@angular/core';

@Component({
  selector: 'lp-general-usp',
  templateUrl: './general-usp.component.html',
  styleUrls: ['./general-usp.component.scss'],
})
export class GeneralUspComponent {
  contactLink: string;
  constructor(private cmsService: CMSService) {}
  followLink(path: string) {
    this.cmsService.followLink(path);
  }
}
