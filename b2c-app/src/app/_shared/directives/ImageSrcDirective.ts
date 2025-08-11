import { Directive, ElementRef, AfterViewInit } from '@angular/core';
import { AppSessionService } from './../session/app-session.service';

@Directive({
  selector: '[ImageSrc]',
})
export class ImageSrcDirective implements AfterViewInit {
  constructor(private el: ElementRef, private appSessionService: AppSessionService) {}

  ngAfterViewInit() {
    const user = this.appSessionService.user();

    if (!user || !user.userName || !this.el.nativeElement.src) {
      return; // Exit if user or src is not available
    }

    const baseSrc = this.el.nativeElement.src.split('assets/')[1];
    if (!baseSrc) return;

    let cdnBase = 'https://cdn1.travelstart.com/assets/';
    switch (user.userName) {
      case 'Investec':
        cdnBase += 'investec-assets/';
        break;
      case 'gigm':
        cdnBase += 'gigm-assets/';
        break;
      case 'clubhub':
        cdnBase += 'clubhub-assets/';
        break;
      case 'momentum':
        cdnBase += 'momentum-assets/';
        break;
      case 'Absa':
        cdnBase += 'absa-assets/';
        break;
      case 'standardbank':
        cdnBase += 'standardbank-assets/';
        break;
      default:
        // no extra path
        break;
    }

    this.el.nativeElement.src = cdnBase + baseSrc;
  }
}
