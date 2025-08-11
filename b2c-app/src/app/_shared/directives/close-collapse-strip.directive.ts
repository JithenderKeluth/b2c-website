import { Directive, ElementRef, HostListener } from '@angular/core';
import { responsiveService } from '@app/_core';

@Directive({
  selector: '[appCloseCollapseStrip]',
})
export class CloseCollapseStripDirective {
  constructor(private el: ElementRef, private responsiveservice: responsiveService) {}
  @HostListener('document:click', ['$event.target'])
  public onClick(targetElement: any) {
    if (
      document.activeElement.tagName == 'INPUT' &&
      this.el.nativeElement &&
      this.el.nativeElement.classList.contains('show') &&
      (this.responsiveservice.screenWidth == 'sm' || this.responsiveservice.screenWidth == 'md')
    ) {
      this.el.nativeElement.classList.remove('show');
    }
  }
}
